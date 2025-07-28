# Bell24h API Testing Script
# Run this in PowerShell to test all API endpoints

param(
  [string]$BaseUrl = "https://bell24h-v1-rmiydi1cb-vishaals-projects-892b178d.vercel.app"
)

Write-Host "🧪 Bell24h API Testing Suite" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

$testResults = @()
$passedTests = 0
$failedTests = 0

# Helper function to test API endpoints
function Test-APIEndpoint {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET",
    [string]$Body = $null,
    [int]$ExpectedStatus = 200
  )
    
  try {
    $headers = @{
      "Content-Type" = "application/json"
    }
        
    $params = @{
      Uri     = $Url
      Method  = $Method
      Headers = $headers
    }
        
    if ($Body) {
      $params.Body = $Body
    }
        
    $response = Invoke-RestMethod @params -ErrorAction Stop
    $statusCode = $response.StatusCode
        
    if ($statusCode -eq $ExpectedStatus) {
      Write-Host "✅ $Name - PASS" -ForegroundColor Green
      $script:passedTests++
      return $true
    }
    else {
      Write-Host "❌ $Name - FAIL (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor Red
      $script:failedTests++
      return $false
    }
  }
  catch {
    Write-Host "❌ $Name - ERROR: $($_.Exception.Message)" -ForegroundColor Red
    $script:failedTests++
    return $false
  }
}

# Test 1: API Health Check
Write-Host "🔍 Testing API Health..." -ForegroundColor Yellow
Test-APIEndpoint -Name "Health Check" -Url "$BaseUrl/api/health" -ExpectedStatus 200

# Test 2: Registration API
Write-Host "`n📝 Testing Registration API..." -ForegroundColor Yellow
$testEmail = "test_$(Get-Date -Format 'yyyyMMdd_HHmmss')@example.com"
$registrationBody = @{
  email       = $testEmail
  password    = "TestPassword123!"
  name        = "Test User"
  companyName = "Test Company Ltd"
} | ConvertTo-Json

Test-APIEndpoint -Name "Registration API" -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $registrationBody -ExpectedStatus 201

# Test 3: Login API
Write-Host "`n🔐 Testing Login API..." -ForegroundColor Yellow
$loginBody = @{
  email    = "demo@bell24h.com"
  password = "Demo123!"
} | ConvertTo-Json

Test-APIEndpoint -Name "Login API" -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $loginBody -ExpectedStatus 200

# Test 4: Products API
Write-Host "`n📦 Testing Products API..." -ForegroundColor Yellow
Test-APIEndpoint -Name "Products API" -Url "$BaseUrl/api/products" -ExpectedStatus 200

# Test 5: Homepage Stats API
Write-Host "`n📊 Testing Homepage Stats API..." -ForegroundColor Yellow
Test-APIEndpoint -Name "Homepage Stats API" -Url "$BaseUrl/api/homepage-stats" -ExpectedStatus 200

# Test 6: Security - SQL Injection Prevention
Write-Host "`n🔒 Testing Security (SQL Injection)..." -ForegroundColor Yellow
$sqlInjectionBody = @{
  email    = "' OR '1'='1"
  password = "test"
} | ConvertTo-Json

Test-APIEndpoint -Name "SQL Injection Prevention" -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $sqlInjectionBody -ExpectedStatus 400

# Test 7: Security - XSS Prevention
Write-Host "`n🔒 Testing Security (XSS)..." -ForegroundColor Yellow
$xssBody = @{
  email       = "test@example.com"
  password    = "password123"
  name        = "<script>alert('XSS')</script>"
  companyName = "Test Company"
} | ConvertTo-Json

Test-APIEndpoint -Name "XSS Prevention" -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $xssBody -ExpectedStatus 400

# Test 8: Performance - Response Time
Write-Host "`n⚡ Testing Performance..." -ForegroundColor Yellow
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $response = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET
  $stopwatch.Stop()
  $responseTime = $stopwatch.ElapsedMilliseconds
    
  if ($responseTime -le 2000) {
    Write-Host "✅ Performance Test - PASS (${responseTime}ms)" -ForegroundColor Green
    $script:passedTests++
  }
  else {
    Write-Host "❌ Performance Test - FAIL (${responseTime}ms - too slow)" -ForegroundColor Red
    $script:failedTests++
  }
}
catch {
  Write-Host "❌ Performance Test - ERROR: $($_.Exception.Message)" -ForegroundColor Red
  $script:failedTests++
}

# Test 9: Error Handling
Write-Host "`n🛡️ Testing Error Handling..." -ForegroundColor Yellow
$invalidBody = @{
  email    = "invalid-email"
  password = "123"
} | ConvertTo-Json

Test-APIEndpoint -Name "Invalid Data Handling" -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $invalidBody -ExpectedStatus 400

# Test 10: CORS Headers
Write-Host "`n🌐 Testing CORS Headers..." -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -Method GET
  $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    
  if ($corsHeader) {
    Write-Host "✅ CORS Headers - PASS" -ForegroundColor Green
    $script:passedTests++
  }
  else {
    Write-Host "❌ CORS Headers - FAIL (No CORS header found)" -ForegroundColor Red
    $script:failedTests++
  }
}
catch {
  Write-Host "❌ CORS Headers - ERROR: $($_.Exception.Message)" -ForegroundColor Red
  $script:failedTests++
}

# Final Summary
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "✅ Passed: $passedTests" -ForegroundColor Green
Write-Host "❌ Failed: $failedTests" -ForegroundColor Red
Write-Host "📊 Total: $($passedTests + $failedTests)" -ForegroundColor White

$passRate = [math]::Round(($passedTests / ($passedTests + $failedTests)) * 100, 1)
Write-Host "🎯 Pass Rate: $passRate%" -ForegroundColor Cyan

if ($passRate -ge 95) {
  Write-Host "🎉 EXCELLENT: APIs are ready for production!" -ForegroundColor Green
}
elseif ($passRate -ge 80) {
  Write-Host "⚠️ GOOD: APIs need minor improvements" -ForegroundColor Yellow
}
else {
  Write-Host "🚨 CRITICAL: APIs need significant fixes" -ForegroundColor Red
}

Write-Host "`n📝 Test completed at $(Get-Date)" -ForegroundColor Gray 