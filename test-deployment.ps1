# Bell24x Test Deployment Script
Write-Host "🧪 Testing Bell24x Platform..." -ForegroundColor Green

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test if server is running
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Host "✅ SUCCESS! Bell24x platform is running!" -ForegroundColor Green
    Write-Host "🌐 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
    Write-Host "🎉 Your B2B marketplace is ready!" -ForegroundColor White
  }
  else {
    Write-Host "❌ Server responded with status: $($response.StatusCode)" -ForegroundColor Red
  }
}
catch {
  Write-Host "❌ Server not responding. Please check the terminal for errors." -ForegroundColor Red
  Write-Host "💡 Try running 'npm run dev' manually" -ForegroundColor Yellow
}

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Test the homepage and features" -ForegroundColor White
Write-Host "3. When ready, deploy to Vercel" -ForegroundColor White
