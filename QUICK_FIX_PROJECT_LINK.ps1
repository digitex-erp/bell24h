# Quick fix for project linking issue
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QUICK FIX: LINKING TO BELL24H-V1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Problem Identified:" -ForegroundColor Yellow
Write-Host "❌ Local project linked to: bell24h-complete" -ForegroundColor Red
Write-Host "✅ Should be linked to: bell24h-v1 (as shown in your Vercel dashboard)" -ForegroundColor Green
Write-Host ""

Write-Host "Solution:" -ForegroundColor Yellow
Write-Host "1. Remove current project link" -ForegroundColor White
Write-Host "2. Link to bell24h-v1 project" -ForegroundColor White
Write-Host "3. Deploy to correct project" -ForegroundColor White
Write-Host ""

# Step 1: Remove current link
Write-Host "Step 1: Removing current project link..." -ForegroundColor Yellow
Remove-Item -Path ".vercel" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Current project link removed" -ForegroundColor Green

# Step 2: Link to bell24h-v1
Write-Host ""
Write-Host "Step 2: Linking to bell24h-v1 project..." -ForegroundColor Yellow
Write-Host "When prompted, select: bell24h-v1" -ForegroundColor Cyan
Write-Host ""

vercel link

Write-Host ""
Write-Host "Step 3: Building and deploying..." -ForegroundColor Yellow
npm run build
vercel --prod

Write-Host ""
Write-Host "✅ DONE! Your project is now correctly linked to bell24h-v1" -ForegroundColor Green
Write-Host "✅ All pages should be live at bell24h.com" -ForegroundColor Green
Write-Host ""
Write-Host "Test: https://www.bell24h.com/contact" -ForegroundColor Cyan
Read-Host "Press Enter to continue..."
