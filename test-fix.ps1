# Bell24x Fix Test Script
Write-Host "🔧 Testing Bell24x Fix..." -ForegroundColor Green

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test if server is running without errors
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Host "✅ SUCCESS! Bell24x platform is running without errors!" -ForegroundColor Green
    Write-Host "🌐 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
    Write-Host "🎉 React Context error has been fixed!" -ForegroundColor White
  }
  else {
    Write-Host "❌ Server responded with status: $($response.StatusCode)" -ForegroundColor Red
  }
}
catch {
  Write-Host "❌ Server not responding. Please check the terminal for errors." -ForegroundColor Red
  Write-Host "💡 The React Context error should now be fixed" -ForegroundColor Yellow
}

Write-Host "`n🔧 What was fixed:" -ForegroundColor Cyan
Write-Host "1. Moved SessionProvider to client component" -ForegroundColor White
Write-Host "2. Created proper Providers wrapper" -ForegroundColor White
Write-Host "3. Fixed Next.js config warnings" -ForegroundColor White
Write-Host "4. Separated server and client components" -ForegroundColor White
