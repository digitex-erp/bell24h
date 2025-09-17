# Bell24x Simple Deployment Script
Write-Host "🚀 Bell24x Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (Test-Path "package.json") {
  Write-Host "✅ Found package.json - Ready to deploy!" -ForegroundColor Green
    
  # Install dependencies
  Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
  npm install
    
  # Build project
  Write-Host "🔨 Building project..." -ForegroundColor Yellow
  npm run build
    
  Write-Host "✅ Build completed successfully!" -ForegroundColor Green
  Write-Host "🌐 Your Bell24x platform is ready!" -ForegroundColor Cyan
  Write-Host "📱 Open http://localhost:3000 to view your site" -ForegroundColor White
    
}
else {
  Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
  Write-Host "Please run this script from the bell24x-complete directory" -ForegroundColor Yellow
}
