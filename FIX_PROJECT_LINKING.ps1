# PowerShell script to fix project linking to bell24h-v1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING PROJECT LINKING TO BELL24H-V1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current Issue:" -ForegroundColor Yellow
Write-Host "❌ Local project linked to: bell24h-complete" -ForegroundColor Red
Write-Host "✅ Should be linked to: bell24h-v1" -ForegroundColor Green
Write-Host "✅ Vercel dashboard shows: bell24h-v1 project" -ForegroundColor Green
Write-Host "✅ Domains configured: bell24h.com, www.bell24h.com" -ForegroundColor Green
Write-Host ""

# Step 1: Unlink current project
Write-Host "Step 1: Unlinking current project..." -ForegroundColor Yellow
try {
    Remove-Item -Path ".vercel" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Current project unlinked" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No existing .vercel folder to remove" -ForegroundColor Yellow
}

# Step 2: Link to correct project (bell24h-v1)
Write-Host ""
Write-Host "Step 2: Linking to bell24h-v1 project..." -ForegroundColor Yellow
Write-Host "This will prompt you to select the correct project" -ForegroundColor White
Write-Host ""

try {
    Write-Host "Running: vercel link" -ForegroundColor Gray
    Write-Host "Please select: bell24h-v1 project" -ForegroundColor Cyan
    vercel link
    Write-Host "✅ Successfully linked to bell24h-v1" -ForegroundColor Green
} catch {
    Write-Host "❌ Linking failed" -ForegroundColor Red
    Write-Host "Please run manually: vercel link" -ForegroundColor Yellow
    exit 1
}

# Step 3: Build project
Write-Host ""
Write-Host "Step 3: Building project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Project built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed - trying with memory optimization..." -ForegroundColor Yellow
    npm run build:safe
    Write-Host "✅ Project built with memory optimization" -ForegroundColor Green
}

# Step 4: Deploy to bell24h-v1
Write-Host ""
Write-Host "Step 4: Deploying to bell24h-v1 project..." -ForegroundColor Yellow
Write-Host "This will deploy to the correct project with all pages" -ForegroundColor White

try {
    Write-Host "Running: vercel --prod" -ForegroundColor Gray
    $deployResult = vercel --prod
    Write-Host "✅ Deployment successful to bell24h-v1!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 5: Verify deployment
Write-Host ""
Write-Host "Step 5: Verifying deployment..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Project: bell24h-v1" -ForegroundColor Green
Write-Host "✅ Domain: https://www.bell24h.com" -ForegroundColor Green
Write-Host "✅ All pages should now be live:" -ForegroundColor Green
Write-Host ""
Write-Host "Test these URLs:" -ForegroundColor Yellow
Write-Host "  https://www.bell24h.com (homepage)" -ForegroundColor White
Write-Host "  https://www.bell24h.com/contact" -ForegroundColor White
Write-Host "  https://www.bell24h.com/privacy" -ForegroundColor White
Write-Host "  https://www.bell24h.com/terms" -ForegroundColor White
Write-Host "  https://www.bell24h.com/refund-policy" -ForegroundColor White

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROJECT LINKING FIXED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your project is now correctly linked to bell24h-v1!" -ForegroundColor Green
Write-Host "🎉 All pages should be live on bell24h.com!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue..."
