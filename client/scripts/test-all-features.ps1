# Bell24H Enterprise Features Test Script
# Comprehensive testing of wallet, escrow, and invoice discounting systems

param(
  [string]$BaseUrl = "http://localhost:3000",
  [int]$Timeout = 10000
)

# Test configuration
$TestConfig = @{
  BaseUrl = $BaseUrl
  Timeout = $Timeout
  Retries = 3
}

# Test data
$TestData = @{
  GstNumber     = "27AAPFU0939F1Z5"
  UserId        = "USER-001"
  BuyerId       = "BUYER-001"
  SellerId      = "SELLER-001"
  WalletId      = "WAL-001"
  InvoiceNumber = "INV-2024-001"
  Amount        = 750000
  Currency      = "INR"
}

# Test results tracking
$TestResults = @{
  Total   = 0
  Passed  = 0
  Failed  = 0
  Errors  = @()
  Details = @()
}

function Write-Log {
  param(
    [string]$Message,
    [string]$Type = "Info"
  )
    
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $prefix = if ($Type -eq "Error") { "[FAIL]" } elseif ($Type -eq "Success") { "[PASS]" } elseif ($Type -eq "Warning") { "[WARN]" } else { "[INFO]" }
    
  Write-Host "$prefix [$timestamp] $Message"
}

function Write-TestResult {
  param(
    [string]$TestName,
    [bool]$Success,
    $Details = $null
  )
    
  $TestResults.Total++
  if ($Success) {
    $TestResults.Passed++
    Write-Log "PASS: $TestName" "Success"
  }
  else {
    $TestResults.Failed++
    Write-Log "FAIL: $TestName" "Error"
  }
    
  if ($Details) {
    $TestResults.Details += @{
      TestName = $TestName
      Success  = $Success
      Details  = $Details
    }
  }
}

function Invoke-ApiTest {
  param(
    [string]$Endpoint,
    [string]$Method = "GET",
    $Body = $null,
    [string]$TestName
  )
    
  try {
    $uri = "$($TestConfig.BaseUrl)$Endpoint"
    $headers = @{
      "Content-Type" = "application/json"
    }
        
    $params = @{
      Uri        = $uri
      Method     = $Method
      Headers    = $headers
      TimeoutSec = ($TestConfig.Timeout / 1000)
    }
        
    if ($Body) {
      $params.Body = $Body | ConvertTo-Json -Depth 10
    }
        
    $response = Invoke-RestMethod @params -ErrorAction Stop
        
    $success = $response.success -eq $true
    Write-TestResult $TestName $success $response
    return $success
  }
  catch {
    Write-TestResult $TestName $false $_.Exception.Message
    return $false
  }
}

# Wallet System Tests
function Test-WalletSystem {
  Write-Log "Testing Wallet System..." "Info"
    
  # Test wallet creation
  $walletBody = @{
    gstNumber       = $TestData.GstNumber
    userId          = $TestData.UserId
    businessDetails = @{
      name    = "Test Business"
      type    = "Proprietorship"
      address = "Test Address"
    }
  }
    
  $walletCreated = Invoke-ApiTest "/api/wallet/create" "POST" $walletBody "Wallet Creation"
    
  # Test wallet transactions
  $transactionBody = @{
    walletId        = $TestData.WalletId
    amount          = 100000
    currency        = "INR"
    type            = "credit"
    description     = "Test transaction"
    isInternational = $false
  }
    
  $transactionProcessed = Invoke-ApiTest "/api/wallet/transactions" "POST" $transactionBody "Wallet Transactions"
    
  # Test wallet history
  $historyRetrieved = Invoke-ApiTest "/api/wallet/transactions?walletId=$($TestData.WalletId)" "GET" $null "Wallet History"
    
  return @($walletCreated, $transactionProcessed, $historyRetrieved)
}

# Escrow System Tests
function Test-EscrowSystem {
  Write-Log "Testing Escrow System..." "Info"
    
  # Test escrow validation for ₹5L+ transactions
  $escrowBody = @{
    amount        = $TestData.Amount
    currency      = $TestData.Currency
    buyerId       = $TestData.BuyerId
    sellerId      = $TestData.SellerId
    termsAccepted = $true
  }
    
  $escrowValidated = Invoke-ApiTest "/api/escrow/validate" "POST" $escrowBody "Escrow Validation (₹5L+)"
    
  # Test escrow validation for transactions below ₹5L
  $escrowBelowBody = @{
    amount        = 250000
    currency      = "INR"
    buyerId       = $TestData.BuyerId
    sellerId      = $TestData.SellerId
    termsAccepted = $false
  }
    
  $escrowBelowThreshold = Invoke-ApiTest "/api/escrow/validate" "POST" $escrowBelowBody "Escrow Validation (Below ₹5L)"
    
  return @($escrowValidated, $escrowBelowThreshold)
}

# Invoice Discounting Tests
function Test-InvoiceDiscounting {
  Write-Log "Testing Invoice Discounting System..." "Info"
    
  # Test invoice verification
  $invoiceBody = @{
    invoiceNumber  = $TestData.InvoiceNumber
    gstNumber      = $TestData.GstNumber
    buyerGstNumber = "27AAPFU0939F1Z6"
    amount         = 500000
    currency       = "INR"
    issueDate      = "2024-01-15T10:30:00Z"
    dueDate        = "2024-02-15T10:30:00Z"
    documents      = @("invoice.pdf", "purchase_order.pdf")
  }
    
  $invoiceVerified = Invoke-ApiTest "/api/invoice/verify" "POST" $invoiceBody "Invoice Verification"
    
  # Test credit assessment
  $creditBody = @{
    invoiceNumber  = "INV-2024-002"
    gstNumber      = $TestData.GstNumber
    buyerGstNumber = "27AAPFU0939F1Z7"
    amount         = 750000
    currency       = "INR"
    issueDate      = "2024-01-14T15:45:00Z"
    dueDate        = "2024-02-20T15:45:00Z"
    documents      = @("invoice.pdf", "contract.pdf")
  }
    
  $creditAssessed = Invoke-ApiTest "/api/invoice/verify" "POST" $creditBody "Credit Assessment"
    
  return @($invoiceVerified, $creditAssessed)
}

# Legal Documentation Tests
function Test-LegalDocumentation {
  Write-Log "Testing Legal Documentation System..." "Info"
    
  # Test legal notifications
  $notificationBody = @{
    userId           = $TestData.UserId
    notificationType = "terms_accepted"
    documentType     = "wallet-terms"
    termsAccepted    = $true
    emailAddress     = "test@bell24h.com"
    complianceStatus = @{
      status      = "compliant"
      lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
  }
    
  $notificationSent = Invoke-ApiTest "/api/notifications/legal" "POST" $notificationBody "Legal Notifications"
    
  # Test notification history
  $historyRetrieved = Invoke-ApiTest "/api/notifications/legal?userId=$($TestData.UserId)" "GET" $null "Notification History"
    
  return @($notificationSent, $historyRetrieved)
}

# Page Loading Tests
function Test-PageLoading {
  Write-Log "Testing Page Loading..." "Info"
    
  $pages = @(
    @{ Name = "Wallet Page"; Path = "/wallet" }
    @{ Name = "Escrow Page"; Path = "/escrow" }
    @{ Name = "Invoice Discounting Page"; Path = "/invoice-discounting" }
    @{ Name = "Wallet Terms Page"; Path = "/legal/wallet-terms" }
    @{ Name = "Escrow Agreement Page"; Path = "/legal/escrow-agreement" }
  )
    
  $results = @()
  foreach ($page in $pages) {
    try {
      $response = Invoke-RestMethod -Uri "$($TestConfig.BaseUrl)$($page.Path)" -Method GET -TimeoutSec ($TestConfig.Timeout / 1000)
      $success = $true
      Write-TestResult "$($page.Name) Loading" $success
      $results += $success
    }
    catch {
      $success = $false
      Write-TestResult "$($page.Name) Loading" $success $_.Exception.Message
      $results += $success
    }
  }
    
  return $results
}

# Performance Tests
function Test-Performance {
  Write-Log "Testing API Performance..." "Info"
    
  $endpoints = @(
    @{ Path = "/api/wallet/create"; Method = "POST"; Body = @{ test = $true } }
    @{ Path = "/api/escrow/validate"; Method = "POST"; Body = @{ test = $true } }
    @{ Path = "/api/invoice/verify"; Method = "POST"; Body = @{ test = $true } }
    @{ Path = "/api/notifications/legal"; Method = "POST"; Body = @{ test = $true } }
  )
    
  $results = @()
  foreach ($endpoint in $endpoints) {
    try {
      $startTime = Get-Date
      $response = Invoke-RestMethod -Uri "$($TestConfig.BaseUrl)$($endpoint.Path)" -Method $endpoint.Method -Body ($endpoint.Body | ConvertTo-Json) -ContentType "application/json" -TimeoutSec ($TestConfig.Timeout / 1000)
      $endTime = Get-Date
      $responseTime = ($endTime - $startTime).TotalMilliseconds
            
      $success = $responseTime -lt 3000 # 3 seconds threshold
      Write-TestResult "$($endpoint.Path) Performance" $success @{ ResponseTime = "$([math]::Round($responseTime, 2))ms" }
      $results += $success
    }
    catch {
      $success = $false
      Write-TestResult "$($endpoint.Path) Performance" $success $_.Exception.Message
      $results += $success
    }
  }
    
  return $results
}

# Main Test Runner
function Start-TestSuite {
  Write-Log "Starting Bell24H Enterprise Features Test Suite..." "Info"
  Write-Log "Base URL: $($TestConfig.BaseUrl)" "Info"
  Write-Log "Test Configuration: $($TestConfig | ConvertTo-Json)" "Info"
    
  $startTime = Get-Date
    
  try {
    # Run all test suites
    $walletResults = Test-WalletSystem
    $escrowResults = Test-EscrowSystem
    $invoiceResults = Test-InvoiceDiscounting
    $legalResults = Test-LegalDocumentation
    $pageResults = Test-PageLoading
    $performanceResults = Test-Performance
        
    # Combine all results
    $allResults = $walletResults + $escrowResults + $invoiceResults + $legalResults + $pageResults + $performanceResults
        
  }
  catch {
    Write-Log "Test suite error: $($_.Exception.Message)" "Error"
  }
    
  $endTime = Get-Date
  $totalTime = ($endTime - $startTime).TotalMilliseconds
    
  # Generate Test Report
  Write-Host ""
  Write-Host ("=" * 60)
  Write-Host "BELL24H ENTERPRISE FEATURES TEST REPORT"
  Write-Host ("=" * 60)
    
  Write-Host ""
  Write-Host "Total Test Time: $([math]::Round($totalTime, 2))ms"
  Write-Host "Test Results:"
  Write-Host "   Total Tests: $($TestResults.Total)"
  Write-Host "   Passed: $($TestResults.Passed)"
  Write-Host "   Failed: $($TestResults.Failed)"
  Write-Host "   Success Rate: $([math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 1))%"
    
  if ($TestResults.Failed -gt 0) {
    Write-Host ""
    Write-Host "Failed Tests:"
    $TestResults.Details | Where-Object { -not $_.Success } | ForEach-Object {
      Write-Host "   • $($_.TestName)"
      if ($_.Details) {
        Write-Host "     Error: $($_.Details)"
      }
    }
  }
    
  if ($TestResults.Passed -eq $TestResults.Total) {
    Write-Host ""
    Write-Host "ALL TESTS PASSED! Enterprise features are working correctly."
  }
  else {
    Write-Host ""
    Write-Host "Some tests failed. Please review the errors above."
  }
    
  Write-Host ""
  Write-Host ("=" * 60)
}

# Run tests if this script is executed directly
Start-TestSuite 