# BELL24H DEPLOYMENT FIX - AUTOMATIC
# This script will fix all your deployment issues automatically

Write-Host "🚀 FIXING BELL24H DEPLOYMENT ISSUES..." -ForegroundColor Green
Write-Host ""

# Step 1: Clean up conflicting files
Write-Host "Step 1: Removing conflicting files..." -ForegroundColor Yellow
if (Test-Path "pages\api\auth\[...nextauth].js") {
    Remove-Item "pages\api\auth\[...nextauth].js" -Force
    Write-Host "✅ Removed conflicting auth file" -ForegroundColor Green
}

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Generate Prisma client
Write-Host "Step 3: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Step 4: Test build
Write-Host "Step 4: Testing build..." -ForegroundColor Yellow
$buildResult = npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    
    # Step 5: Commit changes
    Write-Host "Step 5: Committing fixes..." -ForegroundColor Yellow
    git add .
    git commit -m "Fix: Remove conflicting files - deployment ready"
    
    # Step 6: Push to repository
    Write-Host "Step 6: Pushing to repository..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT FIX COMPLETE!" -ForegroundColor Green
    Write-Host "Your Vercel deployment should now work!" -ForegroundColor Green
    
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
