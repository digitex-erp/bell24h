# PowerShell script to deploy NEW homepage to replace OLD version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING NEW HOMEPAGE TO REPLACE OLD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current Status:" -ForegroundColor Yellow
Write-Host "❌ OLD VERSION: https://www.bell24h.com/auth/login (login page)" -ForegroundColor Red
Write-Host "✅ NEW VERSION: Enhanced homepage with modern UI (local)" -ForegroundColor Green
Write-Host ""

# Step 1: Build the new version
Write-Host "Step 1: Building new homepage with enhancements..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ New homepage built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy to existing Vercel project
Write-Host ""
Write-Host "Step 2: Deploying to existing Vercel project..." -ForegroundColor Yellow
Write-Host "This will replace the OLD login page with NEW homepage" -ForegroundColor White

try {
    $deployResult = vercel --prod
    Write-Host "✅ New homepage deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 3: Verify deployment
Write-Host ""
Write-Host "Step 3: Deployment Summary..." -ForegroundColor Yellow
Write-Host "✅ NEW HOMEPAGE: https://www.bell24h.com (updated)" -ForegroundColor Green
Write-Host "✅ OLD LOGIN PAGE: Replaced with new homepage" -ForegroundColor Green
Write-Host "✅ MODERN UI: Glass morphism, animations, gradients" -ForegroundColor Green
Write-Host "✅ ENHANCED HERO: Better styling and interactions" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEW HOMEPAGE DEPLOYED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your new enhanced homepage is now live!" -ForegroundColor Green
Write-Host ""
Write-Host "Visit: https://www.bell24h.com" -ForegroundColor White
Write-Host "You should now see the NEW homepage instead of the OLD login page!" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
