# PowerShell script to check Vercel project status and DNS
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CHECKING VERCEL PROJECT STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current project
Write-Host "Current Project Status:" -ForegroundColor Yellow
Write-Host "✅ Project Name: bell24h-complete" -ForegroundColor Green
Write-Host "✅ Project ID: prj_v2mjaaTEEoSj9Qk3mrsEY1Ogu1S0" -ForegroundColor Green
Write-Host "✅ Domain: https://www.bell24h.com" -ForegroundColor Green
Write-Host ""

# Check if you have bell24h-v1 project
Write-Host "Checking for bell24h-v1 project..." -ForegroundColor Yellow
Write-Host ""
Write-Host "If you deployed to bell24h-v1 yesterday, you need to:" -ForegroundColor White
Write-Host "1. Link to the correct project" -ForegroundColor Cyan
Write-Host "2. Or redeploy to the current project" -ForegroundColor Cyan
Write-Host ""

# Check all available projects
Write-Host "Available Vercel Commands:" -ForegroundColor Yellow
Write-Host "  vercel projects list    - List all your projects" -ForegroundColor White
Write-Host "  vercel link            - Link to a different project" -ForegroundColor White
Write-Host "  vercel --prod          - Deploy to current project" -ForegroundColor White
Write-Host ""

Write-Host "DNS Configuration Check:" -ForegroundColor Yellow
Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Select your project (bell24h-complete or bell24h-v1)" -ForegroundColor Cyan
Write-Host "3. Go to Settings > Domains" -ForegroundColor Cyan
Write-Host "4. Ensure bell24h.com is properly configured" -ForegroundColor Cyan
Write-Host ""

Write-Host "Quick Fix Options:" -ForegroundColor Yellow
Write-Host "Option 1: Deploy to current project (bell24h-complete)" -ForegroundColor Green
Write-Host "  Run: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Link to bell24h-v1 project" -ForegroundColor Green
Write-Host "  Run: vercel link" -ForegroundColor White
Write-Host "  Select: bell24h-v1" -ForegroundColor White
Write-Host "  Run: vercel --prod" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue..."
