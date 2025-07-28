# Bell24H Comprehensive Testing Suite - PowerShell Edition
# Executes all test types and generates professional reports

param(
    [string]$TestType = "all",
    [switch]$SkipSetup = $false,
    [switch]$Verbose = $false,
    [string]$OutputDir = "test-results"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    Magenta = "Magenta"
    White = "White"
}

# Test configuration
$TestConfig = @{
    BaseUrl = "http://localhost:3000"
    Timeout = 30000
    MaxRetries = 3
    ParallelWorkers = 4
}

# Function to print colored output
function Write-ColorOutput {
    param(
        [string]$Text,
        [string]$Color = "White",
        [string]$Icon = ""
    )
    
    if ($Icon) {
        Write-Host "$Icon " -NoNewline
    }
    Write-Host $Text -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "=" * 60 -Color "Cyan"
    Write-ColorOutput "🎯 $Title" -Color "Cyan"
    Write-ColorOutput "=" * 60 -Color "Cyan"
    Write-Host ""
}

function Write-Step {
    param([string]$Step)
    Write-ColorOutput $Step -Color "Blue" -Icon "📋"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput $Message -Color "Green" -Icon "✅"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput $Message -Color "Red" -Icon "❌"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput $Message -Color "Yellow" -Icon "⚠️"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput $Message -Color "Blue" -Icon "ℹ️"
}

# Test result tracking
$Global:TestResults = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    SkippedTests = 0
    StartTime = Get-Date
    EndTime = $null
    TestDetails = @()
}

function Record-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = "",
        [int]$Duration = 0
    )
    
    $Global:TestResults.TotalTests++
    
    switch ($Status.ToLower()) {
        "passed" { $Global:TestResults.PassedTests++ }
        "failed" { $Global:TestResults.FailedTests++ }
        "skipped" { $Global:TestResults.SkippedTests++ }
    }
    
    $Global:TestResults.TestDetails += @{
        Name = $TestName
        Status = $Status
        Details = $Details
        Duration = $Duration
        Timestamp = Get-Date
    }
}

function Test-Prerequisites {
    Write-Header "Prerequisites Validation"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
        Record-TestResult "Node.js Installation" "Passed" $nodeVersion
    }
    catch {
        Write-Error "Node.js not found. Please install Node.js 18+"
        Record-TestResult "Node.js Installation" "Failed" "Node.js not found"
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
        Record-TestResult "npm Installation" "Passed" $npmVersion
    }
    catch {
        Write-Error "npm not found"
        Record-TestResult "npm Installation" "Failed" "npm not found"
        return $false
    }
    
    # Check package.json
    if (Test-Path "package.json") {
        Write-Success "package.json found"
        Record-TestResult "Package.json Exists" "Passed"
    }
    else {
        Write-Error "package.json not found"
        Record-TestResult "Package.json Exists" "Failed"
        return $false
    }
    
    # Validate test setup
    Write-Step "Running test setup validation..."
    try {
        node scripts/validate-test-setup.js
        Write-Success "Test setup validation passed"
        Record-TestResult "Test Setup Validation" "Passed"
    }
    catch {
        Write-Error "Test setup validation failed"
        Record-TestResult "Test Setup Validation" "Failed" $_.Exception.Message
        return $false
    }
    
    return $true
}

function Install-TestDependencies {
    if ($SkipSetup) {
        Write-Info "Skipping dependency installation"
        return
    }
    
    Write-Header "Installing Test Dependencies"
    
    try {
        Write-Step "Installing npm dependencies..."
        npm install
        Write-Success "npm dependencies installed"
        Record-TestResult "NPM Dependencies" "Passed"
        
        Write-Step "Installing Playwright browsers..."
        npx playwright install
        Write-Success "Playwright browsers installed"
        Record-TestResult "Playwright Browsers" "Passed"
        
    }
    catch {
        Write-Error "Failed to install dependencies: $($_.Exception.Message)"
        Record-TestResult "Dependencies Installation" "Failed" $_.Exception.Message
    }
}

function Run-DependencyValidation {
    Write-Header "Dependency Validation"
    
    Write-Step "Checking npm dependencies..."
    try {
        npm ls --depth=0 > "$OutputDir/npm-dependencies.log" 2>&1
        Write-Success "npm dependency check completed"
        Record-TestResult "NPM Dependency Check" "Passed"
    }
    catch {
        Write-Warning "Some npm dependency issues detected"
        Record-TestResult "NPM Dependency Check" "Failed" $_.Exception.Message
    }
    
    Write-Step "Running security audit..."
    try {
        npm audit --audit-level moderate > "$OutputDir/security-audit.log" 2>&1
        Write-Success "Security audit completed"
        Record-TestResult "Security Audit" "Passed"
    }
    catch {
        Write-Warning "Security vulnerabilities detected - check audit log"
        Record-TestResult "Security Audit" "Failed" "Vulnerabilities found"
    }
}

function Run-UnitTests {
    Write-Header "Unit Testing"
    
    $startTime = Get-Date
    Write-Step "Running Jest unit tests..."
    
    try {
        npm run test:unit -- --coverage --verbose --reporters=default --reporters=jest-html-reporters --reporters=jest-junit > "$OutputDir/unit-tests.log" 2>&1
        $duration = (Get-Date) - $startTime
        Write-Success "Unit tests completed in $($duration.TotalSeconds) seconds"
        Record-TestResult "Unit Tests" "Passed" "All tests passed" $duration.TotalSeconds
    }
    catch {
        $duration = (Get-Date) - $startTime
        Write-Error "Unit tests failed: $($_.Exception.Message)"
        Record-TestResult "Unit Tests" "Failed" $_.Exception.Message $duration.TotalSeconds
    }
}

function Run-IntegrationTests {
    Write-Header "Integration Testing"
    
    $startTime = Get-Date
    Write-Step "Running integration tests..."
    
    try {
        npm run test:integration -- --coverage --verbose > "$OutputDir/integration-tests.log" 2>&1
        $duration = (Get-Date) - $startTime
        Write-Success "Integration tests completed in $($duration.TotalSeconds) seconds"
        Record-TestResult "Integration Tests" "Passed" "All tests passed" $duration.TotalSeconds
    }
    catch {
        $duration = (Get-Date) - $startTime
        Write-Error "Integration tests failed: $($_.Exception.Message)"
        Record-TestResult "Integration Tests" "Failed" $_.Exception.Message $duration.TotalSeconds
    }
}

function Start-DevServer {
    Write-Step "Starting development server..."
    
    # Start server in background
    $serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    $Global:ServerPID = $serverProcess.Id
    
    # Wait for server to be ready
    $maxWait = 30
    $waited = 0
    
    while ($waited -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri $TestConfig.BaseUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "Development server is running on $($TestConfig.BaseUrl)"
                return $true
            }
        }
        catch {
            Start-Sleep -Seconds 2
            $waited += 2
            Write-Host "." -NoNewline
        }
    }
    
    Write-Error "Failed to start development server within $maxWait seconds"
    return $false
}

function Stop-DevServer {
    if ($Global:ServerPID) {
        Write-Step "Stopping development server..."
        try {
            Stop-Process -Id $Global:ServerPID -Force
            Write-Success "Development server stopped"
        }
        catch {
            Write-Warning "Failed to stop development server: $($_.Exception.Message)"
        }
    }
}

function Run-E2ETests {
    Write-Header "End-to-End Testing"
    
    $serverStarted = Start-DevServer
    if (-not $serverStarted) {
        Write-Error "Cannot run E2E tests without development server"
        Record-TestResult "E2E Tests" "Failed" "Server not available"
        return
    }
    
    $startTime = Get-Date
    Write-Step "Running Playwright E2E tests..."
    
    try {
        npx playwright test --reporter=html --reporter=junit --reporter=json > "$OutputDir/e2e-tests.log" 2>&1
        $duration = (Get-Date) - $startTime
        Write-Success "E2E tests completed in $($duration.TotalSeconds) seconds"
        Record-TestResult "E2E Tests" "Passed" "All tests passed" $duration.TotalSeconds
    }
    catch {
        $duration = (Get-Date) - $startTime
        Write-Error "E2E tests failed: $($_.Exception.Message)"
        Record-TestResult "E2E Tests" "Failed" $_.Exception.Message $duration.TotalSeconds
    }
    finally {
        Stop-DevServer
    }
}

function Run-PerformanceTests {
    Write-Header "Performance Testing"
    
    $serverStarted = Start-DevServer
    if (-not $serverStarted) {
        Write-Error "Cannot run performance tests without development server"
        Record-TestResult "Performance Tests" "Failed" "Server not available"
        return
    }
    
    $startTime = Get-Date
    Write-Step "Running Lighthouse performance audit..."
    
    try {
        npx lighthouse $TestConfig.BaseUrl --output=json --output=html --output-path="$OutputDir/lighthouse" --quiet
        $duration = (Get-Date) - $startTime
        Write-Success "Performance tests completed in $($duration.TotalSeconds) seconds"
        Record-TestResult "Performance Tests" "Passed" "Lighthouse audit completed" $duration.TotalSeconds
    }
    catch {
        $duration = (Get-Date) - $startTime
        Write-Error "Performance tests failed: $($_.Exception.Message)"
        Record-TestResult "Performance Tests" "Failed" $_.Exception.Message $duration.TotalSeconds
    }
    finally {
        Stop-DevServer
    }
}

function Run-AccessibilityTests {
    Write-Header "Accessibility Testing"
    
    $serverStarted = Start-DevServer
    if (-not $serverStarted) {
        Write-Error "Cannot run accessibility tests without development server"
        Record-TestResult "Accessibility Tests" "Failed" "Server not available"
        return
    }
    
    $startTime = Get-Date
    Write-Step "Running axe-cli accessibility tests..."
    
    try {
        npx axe-cli $TestConfig.BaseUrl --save "$OutputDir/axe-results.json" --reporter json
        $duration = (Get-Date) - $startTime
        Write-Success "Accessibility tests completed in $($duration.TotalSeconds) seconds"
        Record-TestResult "Accessibility Tests" "Passed" "axe audit completed" $duration.TotalSeconds
    }
    catch {
        $duration = (Get-Date) - $startTime
        Write-Warning "Accessibility tests completed with issues - check results"
        Record-TestResult "Accessibility Tests" "Failed" $_.Exception.Message $duration.TotalSeconds
    }
    finally {
        Stop-DevServer
    }
}

function Generate-TestReport {
    Write-Header "Generating Test Reports"
    
    $Global:TestResults.EndTime = Get-Date
    $totalDuration = $Global:TestResults.EndTime - $Global:TestResults.StartTime
    
    # Calculate pass rate
    $passRate = if ($Global:TestResults.TotalTests -gt 0) {
        [math]::Round(($Global:TestResults.PassedTests / $Global:TestResults.TotalTests) * 100, 2)
    } else { 0 }
    
    # Generate summary
    $summary = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        duration = $totalDuration.TotalSeconds
        total = $Global:TestResults.TotalTests
        passed = $Global:TestResults.PassedTests
        failed = $Global:TestResults.FailedTests
        skipped = $Global:TestResults.SkippedTests
        passRate = $passRate
        details = $Global:TestResults.TestDetails
    }
    
    # Save JSON report
    $jsonReport = $summary | ConvertTo-Json -Depth 5
    $jsonPath = "$OutputDir/test-summary.json"
    $jsonReport | Out-File -FilePath $jsonPath -Encoding UTF8
    
    # Generate HTML report
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; color: #667eea; }
        .passed { border-left-color: #28a745; }
        .passed .value { color: #28a745; }
        .failed { border-left-color: #dc3545; }
        .failed .value { color: #dc3545; }
        .details { margin-top: 30px; }
        .test-item { background: white; border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-item.passed { border-left: 4px solid #28a745; }
        .test-item.failed { border-left: 4px solid #dc3545; }
        .test-item.skipped { border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Bell24H Comprehensive Test Report</h1>
        <p>Generated on: $($summary.timestamp)</p>
        <p>Total Duration: $([math]::Round($summary.duration, 2)) seconds</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">$($summary.total)</div>
        </div>
        <div class="metric passed">
            <h3>Passed</h3>
            <div class="value">$($summary.passed)</div>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <div class="value">$($summary.failed)</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div class="value">$($summary.passRate)%</div>
        </div>
    </div>
    
    <div class="details">
        <h2>Test Details</h2>
"@
    
    foreach ($test in $Global:TestResults.TestDetails) {
        $statusClass = $test.Status.ToLower()
        $icon = switch ($test.Status.ToLower()) {
            "passed" { "✅" }
            "failed" { "❌" }
            "skipped" { "⏭️" }
            default { "ℹ️" }
        }
        
        $htmlContent += @"
        <div class="test-item $statusClass">
            <h3>$icon $($test.Name)</h3>
            <p><strong>Status:</strong> $($test.Status)</p>
            <p><strong>Duration:</strong> $($test.Duration) seconds</p>
            <p><strong>Details:</strong> $($test.Details)</p>
            <p><strong>Timestamp:</strong> $($test.Timestamp)</p>
        </div>
"@
    }
    
    $htmlContent += @"
    </div>
</body>
</html>
"@
    
    $htmlPath = "$OutputDir/test-report.html"
    $htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8
    
    # Display summary
    Write-Header "Test Execution Summary"
    Write-ColorOutput "📊 Total Tests: $($Global:TestResults.TotalTests)" -Color "Blue"
    Write-ColorOutput "✅ Passed: $($Global:TestResults.PassedTests)" -Color "Green"
    Write-ColorOutput "❌ Failed: $($Global:TestResults.FailedTests)" -Color "Red"
    Write-ColorOutput "⏭️ Skipped: $($Global:TestResults.SkippedTests)" -Color "Yellow"
    Write-ColorOutput "📈 Pass Rate: $passRate%" -Color $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
    Write-ColorOutput "⏱️ Total Duration: $([math]::Round($totalDuration.TotalSeconds, 2)) seconds" -Color "Blue"
    
    Write-Host ""
    Write-Success "Reports generated:"
    Write-Info "  📄 JSON Report: $jsonPath"
    Write-Info "  🌐 HTML Report: $htmlPath"
    
    if ($Global:TestResults.FailedTests -gt 0) {
        Write-Error "Some tests failed. Please review the detailed reports."
        exit 1
    } else {
        Write-Success "All tests passed successfully! 🎉"
        exit 0
    }
}

# Main execution
function Main {
    Write-Header "Bell24H Comprehensive Testing Suite"
    Write-Info "Test Type: $TestType"
    Write-Info "Output Directory: $OutputDir"
    
    # Create output directory
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
        Write-Success "Created output directory: $OutputDir"
    }
    
    # Validate prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Error "Prerequisites validation failed. Exiting."
        exit 1
    }
    
    # Install dependencies
    Install-TestDependencies
    
    # Run tests based on type
    switch ($TestType.ToLower()) {
        "all" {
            Run-DependencyValidation
            Run-UnitTests
            Run-IntegrationTests
            Run-E2ETests
            Run-PerformanceTests
            Run-AccessibilityTests
        }
        "unit" { Run-UnitTests }
        "integration" { Run-IntegrationTests }
        "e2e" { Run-E2ETests }
        "performance" { Run-PerformanceTests }
        "accessibility" { Run-AccessibilityTests }
        "deps" { Run-DependencyValidation }
        default {
            Write-Error "Unknown test type: $TestType"
            Write-Info "Available types: all, unit, integration, e2e, performance, accessibility, deps"
            exit 1
        }
    }
    
    # Generate reports
    Generate-TestReport
}

# Error handling
trap {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
    
    # Clean up
    Stop-DevServer
    
    exit 1
}

# Execute main function
Main 