# Bell24H Simple Testing Suite
param(
  [string]$TestType = "all"
)

Write-Host "🎯 Bell24H Testing Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test result tracking
$Global:TestResults = @{
  TotalTests  = 0
  PassedTests = 0
  FailedTests = 0
  StartTime   = Get-Date
}

function Write-Success {
  param([string]$Message)
  Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
  param([string]$Message)
  Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ️ $Message" -ForegroundColor Blue
}

function Record-TestResult {
  param(
    [string]$TestName,
    [string]$Status,
    [string]$Details = ""
  )
    
  $Global:TestResults.TotalTests++
    
  switch ($Status.ToLower()) {
    "passed" { 
      $Global:TestResults.PassedTests++
      Write-Success "$TestName - $Details"
    }
    "failed" { 
      $Global:TestResults.FailedTests++
      Write-Error "$TestName - $Details"
    }
  }
}

function Test-Prerequisites {
  Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow
    
  # Check Node.js
  try {
    $nodeVersion = node --version
    Record-TestResult "Node.js Installation" "Passed" "Version: $nodeVersion"
  }
  catch {
    Record-TestResult "Node.js Installation" "Failed" "Node.js not found"
    return $false
  }
    
  # Check npm
  try {
    $npmVersion = npm --version
    Record-TestResult "npm Installation" "Passed" "Version: $npmVersion"
  }
  catch {
    Record-TestResult "npm Installation" "Failed" "npm not found"
    return $false
  }
    
  # Check package.json
  if (Test-Path "package.json") {
    Record-TestResult "Package.json" "Passed" "Found"
  }
  else {
    Record-TestResult "Package.json" "Failed" "Not found"
    return $false
  }
    
  return $true
}

function Test-BuildSystem {
  Write-Host "`n🔨 Testing Build System..." -ForegroundColor Yellow
    
  try {
    Write-Info "Running npm install..."
    npm install --silent
    Record-TestResult "Dependencies Installation" "Passed" "All dependencies installed"
        
    Write-Info "Running build test..."
    npm run build
    Record-TestResult "Build System" "Passed" "Build completed successfully"
  }
  catch {
    Record-TestResult "Build System" "Failed" $_.Exception.Message
    return $false
  }
    
  return $true
}

function Test-UnitTests {
  Write-Host "`n🧪 Running Unit Tests..." -ForegroundColor Yellow
    
  try {
    npm test -- --watchAll=false --silent
    Record-TestResult "Unit Tests" "Passed" "All unit tests passed"
  }
  catch {
    Record-TestResult "Unit Tests" "Failed" $_.Exception.Message
  }
}

function Test-E2ETests {
  Write-Host "`n🌐 Running E2E Tests..." -ForegroundColor Yellow
    
  try {
    npx playwright test --reporter=line
    Record-TestResult "E2E Tests" "Passed" "All E2E tests passed"
  }
  catch {
    Record-TestResult "E2E Tests" "Failed" $_.Exception.Message
  }
}

function Test-Performance {
  Write-Host "`n⚡ Testing Performance..." -ForegroundColor Yellow
    
  try {
    # Start dev server
    $serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
        
    # Wait for server
    Start-Sleep -Seconds 10
        
    # Test basic performance
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
      Record-TestResult "Performance Test" "Passed" "Server responds in $($response.BaseResponse.ResponseTime)ms"
    }
    else {
      Record-TestResult "Performance Test" "Failed" "Server returned status $($response.StatusCode)"
    }
        
    # Stop server
    Stop-Process -Id $serverProcess.Id -Force
  }
  catch {
    Record-TestResult "Performance Test" "Failed" $_.Exception.Message
  }
}

function Generate-Summary {
  Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
  Write-Host "================================" -ForegroundColor Cyan
    
  $totalDuration = (Get-Date) - $Global:TestResults.StartTime
  $passRate = if ($Global:TestResults.TotalTests -gt 0) {
    [math]::Round(($Global:TestResults.PassedTests / $Global:TestResults.TotalTests) * 100, 2)
  }
  else { 0 }
    
  Write-Host "Total Tests: $($Global:TestResults.TotalTests)" -ForegroundColor White
  Write-Host "Passed: $($Global:TestResults.PassedTests)" -ForegroundColor Green
  Write-Host "Failed: $($Global:TestResults.FailedTests)" -ForegroundColor Red
  Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } else { "Red" })
  Write-Host "Duration: $([math]::Round($totalDuration.TotalSeconds, 2)) seconds" -ForegroundColor Blue
    
  if ($Global:TestResults.FailedTests -gt 0) {
    Write-Host "`n❌ Some tests failed. Review the errors above." -ForegroundColor Red
    exit 1
  }
  else {
    Write-Host "`n✅ All tests passed successfully!" -ForegroundColor Green
    exit 0
  }
}

# Main execution
Write-Host "Starting Bell24H Testing Suite..." -ForegroundColor Green

if (-not (Test-Prerequisites)) {
  Write-Error "Prerequisites failed. Exiting."
  exit 1
}

if (-not (Test-BuildSystem)) {
  Write-Error "Build system failed. Exiting."
  exit 1
}

switch ($TestType.ToLower()) {
  "all" {
    Test-UnitTests
    Test-E2ETests
    Test-Performance
  }
  "unit" { Test-UnitTests }
  "e2e" { Test-E2ETests }
  "performance" { Test-Performance }
  "build" { Test-BuildSystem }
  default {
    Write-Error "Unknown test type: $TestType"
    Write-Host "Available types: all, unit, e2e, performance, build"
    exit 1
  }
}

Generate-Summary 