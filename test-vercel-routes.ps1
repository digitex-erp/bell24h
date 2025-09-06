# Vercel Routes Test Script
Write-Host "🚀 TESTING VERCEL DEPLOYMENT" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$baseUrl = "https://bell24h-v1.vercel.app"
$routes = @(
  @{Path = "/"; Name = "Homepage" },
  @{Path = "/admin"; Name = "Admin Dashboard" },
  @{Path = "/admin/analytics"; Name = "Admin Analytics" },
  @{Path = "/admin/dashboard"; Name = "Admin Dashboard Page" },
  @{Path = "/admin/launch-metrics"; Name = "Admin Launch Metrics" },
  @{Path = "/admin/leads"; Name = "Admin Leads" },
  @{Path = "/admin/monitoring"; Name = "Admin Monitoring" },
  @{Path = "/admin/rfqs"; Name = "Admin RFQs" },
  @{Path = "/admin/security"; Name = "Admin Security" },
  @{Path = "/admin/suppliers"; Name = "Admin Suppliers" },
  @{Path = "/admin/users"; Name = "Admin Users" },
  @{Path = "/services/verification"; Name = "Verification Service" },
  @{Path = "/services/rfq-writing"; Name = "RFQ Writing Service" },
  @{Path = "/services/featured-suppliers"; Name = "Featured Suppliers Service" },
  @{Path = "/leads"; Name = "Leads Page" },
  @{Path = "/supplier/leads"; Name = "Supplier Leads" },
  @{Path = "/pricing"; Name = "Pricing Page" },
  @{Path = "/about"; Name = "About Page" },
  @{Path = "/contact"; Name = "Contact Page" },
  @{Path = "/marketplace"; Name = "Marketplace Page" }
)

$results = @()
$successCount = 0
$failCount = 0

foreach ($route in $routes) {
  $url = $baseUrl + $route.Path
  Write-Host "`nTesting: $($route.Name)" -ForegroundColor Yellow
  Write-Host "URL: $url" -ForegroundColor Gray
    
  try {
    $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
      Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
      $successCount++
      $results += [PSCustomObject]@{
        Name   = $route.Name
        URL    = $url
        Status = $response.StatusCode
        Result = "✅ SUCCESS"
      }
    }
    else {
      Write-Host "⚠️  WARNING - Status: $($response.StatusCode)" -ForegroundColor Yellow
      $results += [PSCustomObject]@{
        Name   = $route.Name
        URL    = $url
        Status = $response.StatusCode
        Result = "⚠️  WARNING"
      }
    }
  }
  catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
    $results += [PSCustomObject]@{
      Name   = $route.Name
      URL    = $url
      Status = "ERROR"
      Result = "❌ FAILED"
    }
  }
}

Write-Host "`n" -NoNewline
Write-Host "================================" -ForegroundColor Green
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "📈 Success Rate: $([math]::Round(($successCount / $routes.Count) * 100, 2))%" -ForegroundColor Cyan

Write-Host "`n📋 DETAILED RESULTS:" -ForegroundColor Yellow
$results | Format-Table -AutoSize

# Save results to file
$results | Export-Csv -Path "vercel-test-results.csv" -NoTypeInformation
Write-Host "`n💾 Results saved to: vercel-test-results.csv" -ForegroundColor Cyan

if ($failCount -eq 0) {
  Write-Host "`n🎉 ALL TESTS PASSED! Vercel deployment is working perfectly!" -ForegroundColor Green
}
else {
  Write-Host "`n⚠️  Some tests failed. Check the results above." -ForegroundColor Yellow
}
# Vercel Routes Test Script
Write-Host "🚀 TESTING VERCEL DEPLOYMENT" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$baseUrl = "https://bell24h-v1.vercel.app"
$routes = @(
  @{Path = "/"; Name = "Homepage" },
  @{Path = "/admin"; Name = "Admin Dashboard" },
  @{Path = "/admin/analytics"; Name = "Admin Analytics" },
  @{Path = "/admin/dashboard"; Name = "Admin Dashboard Page" },
  @{Path = "/admin/launch-metrics"; Name = "Admin Launch Metrics" },
  @{Path = "/admin/leads"; Name = "Admin Leads" },
  @{Path = "/admin/monitoring"; Name = "Admin Monitoring" },
  @{Path = "/admin/rfqs"; Name = "Admin RFQs" },
  @{Path = "/admin/security"; Name = "Admin Security" },
  @{Path = "/admin/suppliers"; Name = "Admin Suppliers" },
  @{Path = "/admin/users"; Name = "Admin Users" },
  @{Path = "/services/verification"; Name = "Verification Service" },
  @{Path = "/services/rfq-writing"; Name = "RFQ Writing Service" },
  @{Path = "/services/featured-suppliers"; Name = "Featured Suppliers Service" },
  @{Path = "/leads"; Name = "Leads Page" },
  @{Path = "/supplier/leads"; Name = "Supplier Leads" },
  @{Path = "/pricing"; Name = "Pricing Page" },
  @{Path = "/about"; Name = "About Page" },
  @{Path = "/contact"; Name = "Contact Page" },
  @{Path = "/marketplace"; Name = "Marketplace Page" }
)

$results = @()
$successCount = 0
$failCount = 0

foreach ($route in $routes) {
  $url = $baseUrl + $route.Path
  Write-Host "`nTesting: $($route.Name)" -ForegroundColor Yellow
  Write-Host "URL: $url" -ForegroundColor Gray
    
  try {
    $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
      Write-Host "✅ SUCCESS - Status: $($response.StatusCode)" -ForegroundColor Green
      $successCount++
      $results += [PSCustomObject]@{
        Name   = $route.Name
        URL    = $url
        Status = $response.StatusCode
        Result = "✅ SUCCESS"
      }
    }
    else {
      Write-Host "⚠️  WARNING - Status: $($response.StatusCode)" -ForegroundColor Yellow
      $results += [PSCustomObject]@{
        Name   = $route.Name
        URL    = $url
        Status = $response.StatusCode
        Result = "⚠️  WARNING"
      }
    }
  }
  catch {
    Write-Host "❌ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
    $results += [PSCustomObject]@{
      Name   = $route.Name
      URL    = $url
      Status = "ERROR"
      Result = "❌ FAILED"
    }
  }
}

Write-Host "`n" -NoNewline
Write-Host "================================" -ForegroundColor Green
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "📈 Success Rate: $([math]::Round(($successCount / $routes.Count) * 100, 2))%" -ForegroundColor Cyan

Write-Host "`n📋 DETAILED RESULTS:" -ForegroundColor Yellow
$results | Format-Table -AutoSize

# Save results to file
$results | Export-Csv -Path "vercel-test-results.csv" -NoTypeInformation
Write-Host "`n💾 Results saved to: vercel-test-results.csv" -ForegroundColor Cyan

if ($failCount -eq 0) {
  Write-Host "`n🎉 ALL TESTS PASSED! Vercel deployment is working perfectly!" -ForegroundColor Green
}
else {
  Write-Host "`n⚠️  Some tests failed. Check the results above." -ForegroundColor Yellow
}
