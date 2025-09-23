# FINAL DEPLOYMENT TO BELL24H-V1 PROJECT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL DEPLOYMENT TO BELL24H-V1 PROJECT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/6] Navigating to client directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Sanika\Projects\bell24h\client"

Write-Host ""
Write-Host "[2/6] Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Check errors above." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "[3/6] Deploying to bell24h-v1 production..." -ForegroundColor Yellow
npx vercel --prod

Write-Host ""
Write-Host "[4/6] Getting deployment URL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
npx vercel ls

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Your Bell24h homepage should now be at:" -ForegroundColor White
Write-Host "https://bell24h-v1.vercel.app" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Opening the deployed site..." -ForegroundColor Yellow
Start-Process "https://bell24h-v1.vercel.app"

Write-Host ""
Write-Host "Deployment process finished!" -ForegroundColor Green
Read-Host "Press Enter to continue"
