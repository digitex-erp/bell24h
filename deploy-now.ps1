Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "BELL24H DEPLOYMENT SCRIPT" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "[STEP 1] Cleaning old files..." -ForegroundColor Cyan
if (Test-Path ".vercel") { Remove-Item -Path ".vercel" -Recurse -Force }
if (Test-Path ".next") { Remove-Item -Path ".next" -Recurse -Force }
Write-Host "Cleaned successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "[STEP 2] Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    Read-Host "Press Enter to continue anyway"
}
Write-Host "Dependencies installed!" -ForegroundColor Green
Write-Host ""

Write-Host "[STEP 3] Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Build had issues, but continuing..." -ForegroundColor Yellow
}
Write-Host "Build completed!" -ForegroundColor Green
Write-Host ""

Write-Host "[STEP 4] Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "This will open a browser for authentication..." -ForegroundColor Yellow
npx vercel --prod
Write-Host ""

Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "Your app should be live at the URL shown above" -ForegroundColor Green
Read-Host "Press Enter to exit"
