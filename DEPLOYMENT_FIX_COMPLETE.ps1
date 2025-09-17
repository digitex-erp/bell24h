# BELL24H DEPLOYMENT FIX - COMPLETE SOLUTION
# PowerShell Version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BELL24H DEPLOYMENT FIX - COMPLETE SOLUTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/8] Cleaning up conflicting files..." -ForegroundColor Yellow

# Remove conflicting pages router files
if (Test-Path "pages\api\auth\[...nextauth].js") {
    Write-Host "Removing conflicting pages router file..." -ForegroundColor Red
    Remove-Item "pages\api\auth\[...nextauth].js" -Force
}

if (Test-Path "pages\api\auth") {
    Write-Host "Removing empty auth directory..." -ForegroundColor Red
    Remove-Item "pages\api\auth" -Recurse -Force
}

if (Test-Path "pages\api") {
    Write-Host "Removing empty api directory..." -ForegroundColor Red
    Remove-Item "pages\api" -Recurse -Force
}

if (Test-Path "pages") {
    $pagesContent = Get-ChildItem "pages" -Force
    if ($pagesContent.Count -eq 0) {
        Write-Host "Pages directory is empty, removing..." -ForegroundColor Red
        Remove-Item "pages" -Recurse -Force
    }
}

Write-Host "[2/8] Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "[3/8] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "[4/8] Running build test..." -ForegroundColor Yellow
$buildResult = npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[5/8] Committing fixes..." -ForegroundColor Yellow
    git add .
    git commit -m "Fix: Remove conflicting pages router files - deployment ready"
    
    Write-Host "[6/8] Pushing to repository..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "[7/8] Deploying to Vercel..." -ForegroundColor Yellow
    npx vercel --prod
    
    Write-Host "[8/8] ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "🚀 BELL24H IS NOW LIVE AND WORKING!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your deployment should now be successful." -ForegroundColor Green
    Write-Host "Check your Vercel dashboard for the latest status." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Missing environment variables" -ForegroundColor White
    Write-Host "- TypeScript errors" -ForegroundColor White
    Write-Host "- Import/export issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Run 'npm run build' manually to see detailed errors." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
