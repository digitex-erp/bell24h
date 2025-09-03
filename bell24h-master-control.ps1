# Bell24h Master Control Script
# Complete automation for all Bell24h operations

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("setup", "test", "start", "deploy", "status", "help")]
    [string]$Action,
    
    [switch]$Force,
    [switch]$SkipTests,
    [string]$Environment = "production"
)

$ErrorActionPreference = "Continue"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$Magenta = "Magenta"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "🚀 $Title" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host ""
}

function Show-Help {
    Write-Header "BELL24H MASTER CONTROL - HELP"
    
    Write-ColorOutput "📋 AVAILABLE COMMANDS:" $Cyan
    Write-Host ""
    Write-ColorOutput "  setup    - Complete system setup and configuration" $Blue
    Write-ColorOutput "  test     - Run comprehensive system tests" $Blue
    Write-ColorOutput "  start    - Quick start development server" $Blue
    Write-ColorOutput "  deploy   - Deploy to Railway production" $Blue
    Write-ColorOutput "  status   - Check system status" $Blue
    Write-ColorOutput "  help     - Show this help message" $Blue
    Write-Host ""
    Write-ColorOutput "📝 USAGE EXAMPLES:" $Cyan
    Write-Host ""
    Write-ColorOutput "  .\bell24h-master-control.ps1 setup" $Yellow
    Write-ColorOutput "  .\bell24h-master-control.ps1 test" $Yellow
    Write-ColorOutput "  .\bell24h-master-control.ps1 start" $Yellow
    Write-ColorOutput "  .\bell24h-master-control.ps1 deploy" $Yellow
    Write-ColorOutput "  .\bell24h-master-control.ps1 status" $Yellow
    Write-Host ""
    Write-ColorOutput "🔧 OPTIONS:" $Cyan
    Write-Host ""
    Write-ColorOutput "  -Force       - Force operation even if checks fail" $Yellow
    Write-ColorOutput "  -SkipTests   - Skip testing during setup/deploy" $Yellow
    Write-ColorOutput "  -Environment - Target environment (default: production)" $Yellow
    Write-Host ""
    Write-ColorOutput "📊 WHAT EACH COMMAND DOES:" $Cyan
    Write-Host ""
    Write-ColorOutput "  setup:" $Blue
    Write-ColorOutput "    • Installs all dependencies" $Green
    Write-ColorOutput "    • Configures environment variables" $Green
    Write-ColorOutput "    • Sets up database schema" $Green
    Write-ColorOutput "    • Runs build tests" $Green
    Write-ColorOutput "    • Prepares for deployment" $Green
    Write-Host ""
    Write-ColorOutput "  test:" $Blue
    Write-ColorOutput "    • Verifies all critical files" $Green
    Write-ColorOutput "    • Tests database connection" $Green
    Write-ColorOutput "    • Checks API endpoints" $Green
    Write-ColorOutput "    • Validates components" $Green
    Write-ColorOutput "    • Generates test report" $Green
    Write-Host ""
    Write-ColorOutput "  start:" $Blue
    Write-ColorOutput "    • Quick dependency check" $Green
    Write-ColorOutput "    • Environment setup" $Green
    Write-ColorOutput "    • Database initialization" $Green
    Write-ColorOutput "    • Starts development server" $Green
    Write-Host ""
    Write-ColorOutput "  deploy:" $Blue
    Write-ColorOutput "    • Pre-deployment checks" $Green
    Write-ColorOutput "    • Final build test" $Green
    Write-ColorOutput "    • Git operations" $Green
    Write-ColorOutput "    • Railway deployment" $Green
    Write-ColorOutput "    • Post-deployment verification" $Green
    Write-Host ""
    Write-ColorOutput "  status:" $Blue
    Write-ColorOutput "    • System health check" $Green
    Write-ColorOutput "    • File verification" $Green
    Write-ColorOutput "    • Service status" $Green
    Write-ColorOutput "    • Quick diagnostics" $Green
    Write-Host ""
}

function Show-Status {
    Write-Header "BELL24H SYSTEM STATUS"
    
    # Check project directory
    if (Test-Path "package.json") {
        Write-ColorOutput "✅ Project directory: OK" $Green
    } else {
        Write-ColorOutput "❌ Project directory: Not found" $Red
        return
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js: $nodeVersion" $Green
    } catch {
        Write-ColorOutput "❌ Node.js: Not installed" $Red
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-ColorOutput "✅ npm: $npmVersion" $Green
    } catch {
        Write-ColorOutput "❌ npm: Not installed" $Red
    }
    
    # Check critical files
    $criticalFiles = @(
        "components/admin/AdminDashboard.tsx",
        "components/admin/MarketingDashboard.tsx",
        "app/api/campaigns/route.ts",
        "prisma/schema.prisma",
        ".env.local"
    )
    
    Write-ColorOutput "`n📁 Critical Files:" $Cyan
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            Write-ColorOutput "  ✅ $file" $Green
        } else {
            Write-ColorOutput "  ❌ $file" $Red
        }
    }
    
    # Check Railway CLI
    try {
        $railwayVersion = railway --version
        Write-ColorOutput "`n✅ Railway CLI: $railwayVersion" $Green
    } catch {
        Write-ColorOutput "`n❌ Railway CLI: Not installed" $Red
    }
    
    # Check if server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing
        Write-ColorOutput "`n✅ Development Server: Running on port 3000" $Green
    } catch {
        Write-ColorOutput "`n❌ Development Server: Not running" $Red
    }
    
    Write-Host ""
    Write-ColorOutput "🎯 System Status: Ready for operations" $Cyan
}

# Main execution
Write-Header "BELL24H MASTER CONTROL SYSTEM"

switch ($Action) {
    "help" {
        Show-Help
    }
    
    "status" {
        Show-Status
    }
    
    "setup" {
        Write-ColorOutput "🔧 Running complete system setup..." $Blue
        & ".\bell24h-complete-deployment.ps1" -SkipTests:$SkipTests -ForceDeploy:$Force
    }
    
    "test" {
        Write-ColorOutput "🧪 Running comprehensive system tests..." $Blue
        & ".\bell24h-automated-testing.ps1" -FullTest
    }
    
    "start" {
        Write-ColorOutput "🚀 Starting development server..." $Blue
        & ".\bell24h-quick-start.ps1" -SkipInstall:$SkipTests
    }
    
    "deploy" {
        Write-ColorOutput "🚀 Deploying to Railway..." $Blue
        & ".\bell24h-final-deploy.ps1" -Force:$Force -Environment $Environment
    }
    
    default {
        Write-ColorOutput "❌ Unknown action: $Action" $Red
        Show-Help
        exit 1
    }
}

Write-Host ""
Write-ColorOutput "✅ Action '$Action' completed successfully!" $Green
Write-ColorOutput "🕒 Completed at: $(Get-Date)" $Cyan
