# Bell24h Automated Testing Script
# Comprehensive testing of all system components

param(
    [switch]$QuickTest,
    [switch]$FullTest,
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Continue"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor $Cyan
    Write-Host "  $Title" -ForegroundColor $Cyan
    Write-Host "=" * 50 -ForegroundColor $Cyan
    Write-Host ""
}

function Test-WebEndpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode
        }
    }
}

function Test-FileExists {
    param([string]$FilePath)
    return Test-Path $FilePath
}

function Test-DatabaseConnection {
    try {
        $result = node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.\$connect().then(() => {
            console.log('SUCCESS: Database connected');
            prisma.\$disconnect();
        }).catch(err => {
            console.log('ERROR: ' + err.message);
            process.exit(1);
        });
        " 2>&1
        
        return $result -match "SUCCESS"
    } catch {
        return $false
    }
}

# Main execution
Write-Header "BELL24H AUTOMATED TESTING SUITE"

$testResults = @{
    Pages = @{}
    API = @{}
    Database = @{}
    Components = @{}
    Build = @{}
}

try {
    # Test 1: Critical Files
    Write-Header "TEST 1: CRITICAL FILES VERIFICATION"
    
    $criticalFiles = @{
        "package.json" = "Project configuration"
        "prisma/schema.prisma" = "Database schema"
        "components/admin/AdminDashboard.tsx" = "Admin dashboard"
        "components/admin/MarketingDashboard.tsx" = "Marketing dashboard"
        "app/api/campaigns/route.ts" = "Campaigns API"
        "app/api/auth/agent/login/route.ts" = "Agent login API"
        ".env.local" = "Environment configuration"
    }
    
    foreach ($file in $criticalFiles.Keys) {
        if (Test-FileExists $file) {
            Write-ColorOutput "✅ $file - $($criticalFiles[$file])" $Green
            $testResults.Components[$file] = $true
        } else {
            Write-ColorOutput "❌ $file - $($criticalFiles[$file])" $Red
            $testResults.Components[$file] = $false
        }
    }
    
    # Test 2: Build Test
    Write-Header "TEST 2: BUILD VERIFICATION"
    
    Write-ColorOutput "Running build test..." $Blue
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Build successful" $Green
        $testResults.Build["Build"] = $true
    } else {
        Write-ColorOutput "❌ Build failed" $Red
        Write-ColorOutput $buildResult $Red
        $testResults.Build["Build"] = $false
    }
    
    # Test 3: Database Connection
    Write-Header "TEST 3: DATABASE CONNECTION"
    
    if (Test-DatabaseConnection) {
        Write-ColorOutput "✅ Database connection successful" $Green
        $testResults.Database["Connection"] = $true
    } else {
        Write-ColorOutput "❌ Database connection failed" $Red
        $testResults.Database["Connection"] = $false
    }
    
    # Test 4: Web Endpoints
    Write-Header "TEST 4: WEB ENDPOINTS"
    
    $endpoints = @{
        "/" = "Homepage"
        "/admin" = "Admin Panel"
        "/api/campaigns" = "Campaigns API"
        "/api/health" = "Health Check"
    }
    
    foreach ($endpoint in $endpoints.Keys) {
        $url = "$BaseUrl$endpoint"
        $result = Test-WebEndpoint -Url $url
        
        if ($result.Success) {
            Write-ColorOutput "✅ $($endpoints[$endpoint]) - Status: $($result.StatusCode)" $Green
            $testResults.Pages[$endpoint] = $true
        } else {
            Write-ColorOutput "❌ $($endpoints[$endpoint]) - Error: $($result.Error)" $Red
            $testResults.Pages[$endpoint] = $false
        }
    }
    
    # Test 5: API Endpoints (if server is running)
    Write-Header "TEST 5: API ENDPOINTS"
    
    # Test Campaigns API
    $campaignsResult = Test-WebEndpoint -Url "$BaseUrl/api/campaigns"
    if ($campaignsResult.Success) {
        Write-ColorOutput "✅ Campaigns API - Status: $($campaignsResult.StatusCode)" $Green
        $testResults.API["Campaigns"] = $true
    } else {
        Write-ColorOutput "❌ Campaigns API - Error: $($campaignsResult.Error)" $Red
        $testResults.API["Campaigns"] = $false
    }
    
    # Test Agent Registration API
    $registerData = @{
        name = "Test Agent"
        email = "test@example.com"
        password = "test123"
        role = "AGENT"
    } | ConvertTo-Json
    
    $registerResult = Test-WebEndpoint -Url "$BaseUrl/api/auth/agent/register" -Method "POST" -Body $registerData
    if ($registerResult.Success -or $registerResult.StatusCode -eq 409) { # 409 = already exists
        Write-ColorOutput "✅ Agent Registration API - Status: $($registerResult.StatusCode)" $Green
        $testResults.API["AgentRegistration"] = $true
    } else {
        Write-ColorOutput "❌ Agent Registration API - Error: $($registerResult.Error)" $Red
        $testResults.API["AgentRegistration"] = $false
    }
    
    # Test 6: Component Tests
    Write-Header "TEST 6: COMPONENT VERIFICATION"
    
    # Check for TypeScript compilation
    try {
        $tscResult = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ TypeScript compilation successful" $Green
            $testResults.Components["TypeScript"] = $true
        } else {
            Write-ColorOutput "❌ TypeScript compilation failed" $Red
            $testResults.Components["TypeScript"] = $false
        }
    } catch {
        Write-ColorOutput "❌ TypeScript check failed" $Red
        $testResults.Components["TypeScript"] = $false
    }
    
    # Test 7: Environment Variables
    Write-Header "TEST 7: ENVIRONMENT VERIFICATION"
    
    if (Test-FileExists ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        $requiredVars = @("DATABASE_URL", "JWT_SECRET", "NEXTAUTH_SECRET")
        
        foreach ($var in $requiredVars) {
            if ($envContent -match $var) {
                Write-ColorOutput "✅ $var configured" $Green
                $testResults.Components["Env_$var"] = $true
            } else {
                Write-ColorOutput "❌ $var missing" $Red
                $testResults.Components["Env_$var"] = $false
            }
        }
    } else {
        Write-ColorOutput "❌ .env.local file not found" $Red
    }
    
    # Generate Test Report
    Write-Header "TEST RESULTS SUMMARY"
    
    $totalTests = 0
    $passedTests = 0
    
    foreach ($category in $testResults.Keys) {
        Write-ColorOutput "`n📊 $category Tests:" $Cyan
        foreach ($test in $testResults[$category].Keys) {
            $totalTests++
            if ($testResults[$category][$test]) {
                Write-ColorOutput "  ✅ $test" $Green
                $passedTests++
            } else {
                Write-ColorOutput "  ❌ $test" $Red
            }
        }
    }
    
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
    
    Write-Host ""
    Write-Host "=" * 50 -ForegroundColor $Cyan
    Write-Host "  FINAL TEST RESULTS" -ForegroundColor $Cyan
    Write-Host "=" * 50 -ForegroundColor $Cyan
    Write-Host ""
    Write-ColorOutput "📈 Overall Success Rate: $successRate% ($passedTests/$totalTests tests passed)" $Blue
    Write-Host ""
    
    if ($successRate -ge 90) {
        Write-ColorOutput "🎉 EXCELLENT! System is fully operational and ready for production!" $Green
    } elseif ($successRate -ge 80) {
        Write-ColorOutput "✅ GOOD! System is mostly functional with minor issues." $Yellow
    } elseif ($successRate -ge 70) {
        Write-ColorOutput "⚠️  FAIR! System has some issues that need attention." $Yellow
    } else {
        Write-ColorOutput "❌ POOR! System has significant issues requiring immediate attention." $Red
    }
    
    Write-Host ""
    Write-ColorOutput "🌐 Access your Bell24h platform at: $BaseUrl" $Blue
    Write-ColorOutput "👑 Admin Panel: $BaseUrl/admin" $Blue
    Write-ColorOutput "📊 Marketing Dashboard: $BaseUrl/admin (AI Marketing tab)" $Blue
    Write-Host ""
    
} catch {
    Write-ColorOutput "❌ Testing failed: $($_.Exception.Message)" $Red
    exit 1
}

Write-Host ""
Write-ColorOutput "Testing completed at: $(Get-Date)" $Cyan
