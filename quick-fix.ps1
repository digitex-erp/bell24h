Write-Host "🚀 BELL24H QUICK FIX" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\Users\Sanika\Projects\bell24h"

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Cyan

# Update PostCSS config
Write-Host "🔧 Updating PostCSS configuration..." -ForegroundColor Yellow
@"
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
"@ | Out-File -FilePath "postcss.config.js" -Encoding UTF8

Write-Host "✅ PostCSS config updated" -ForegroundColor Green

# Test build
Write-Host "🔧 Testing build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Write-Host "🌐 Visit: http://localhost:3000" -ForegroundColor Cyan
    npm run dev
} else {
    Write-Host "❌ Build failed. Trying alternative config..." -ForegroundColor Red
    
    # Try alternative config
    @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@ | Out-File -FilePath "postcss.config.js" -Encoding UTF8
    
    Write-Host "🔧 Testing with alternative config..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 BUILD SUCCESS with alternative config!" -ForegroundColor Green
        Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
        npm run dev
    } else {
        Write-Host "❌ Build still failing. Please check the error messages above." -ForegroundColor Red
    }
}
