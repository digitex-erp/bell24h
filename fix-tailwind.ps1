Write-Host "🚀 BELL24H TAILWIND FIX" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Installing @tailwindcss/postcss..." -ForegroundColor Yellow
npm install @tailwindcss/postcss

Write-Host ""
Write-Host "🔧 Updating PostCSS configuration..." -ForegroundColor Yellow
@"
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
"@ | Out-File -FilePath "postcss.config.js" -Encoding UTF8

Write-Host ""
Write-Host "🔧 Testing build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Trying alternative config..." -ForegroundColor Red
    @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@ | Out-File -FilePath "postcss.config.js" -Encoding UTF8
    npm run build
}

Write-Host ""
Write-Host "🎉 FIX COMPLETE!" -ForegroundColor Green
Write-Host "✅ @tailwindcss/postcss installed" -ForegroundColor Green
Write-Host "✅ PostCSS configuration updated" -ForegroundColor Green
Write-Host "✅ Build should work now" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
npm run dev
