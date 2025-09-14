# 🚀 COPY-PASTE DEPLOYMENT SCRIPT
# Just copy and paste this entire script into PowerShell

Write-Host "🚀 BELL24H DEPLOYMENT STARTING..." -ForegroundColor Green
npm run build
Start-Process "https://vercel.com/new"
Write-Host "✅ Build complete! Vercel dashboard opened!" -ForegroundColor Green
Write-Host "📋 Next: Import 'digitex-erp/bell24h-production' and add environment variables" -ForegroundColor Yellow
