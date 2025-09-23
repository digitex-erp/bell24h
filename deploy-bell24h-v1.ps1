# DEPLOY TO CORRECT BELL24H-V1 PROJECT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING TO CORRECT BELL24H-V1 PROJECT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/8] Navigating to client directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Sanika\Projects\bell24h\client"

Write-Host ""
Write-Host "[2/8] Installing Vercel CLI globally..." -ForegroundColor Yellow
npm install -g vercel

Write-Host ""
Write-Host "[3/8] Removing any existing .vercel directory..." -ForegroundColor Yellow
if (Test-Path ".vercel") {
    Remove-Item -Recurse -Force ".vercel"
}

Write-Host ""
Write-Host "[4/8] Linking to EXISTING bell24h-v1 project..." -ForegroundColor Yellow
vercel link --project=bell24h-v1 --yes

Write-Host ""
Write-Host "[5/8] Building the project..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "[6/8] Deploying to bell24h-v1 production..." -ForegroundColor Yellow
vercel --prod --name=bell24h-v1 --yes

Write-Host ""
Write-Host "[7/8] Getting deployment URL..." -ForegroundColor Yellow
vercel ls --name=bell24h-v1

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Your Bell24h homepage should now be at:" -ForegroundColor White
Write-Host "https://bell24h-v1.vercel.app" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "[8/8] Opening the deployed site..." -ForegroundColor Yellow
Start-Process "https://bell24h-v1.vercel.app"

Write-Host ""
Write-Host "Deployment process finished!" -ForegroundColor Green
Read-Host "Press Enter to continue"
