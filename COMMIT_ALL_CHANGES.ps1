# COMMIT_ALL_CHANGES.ps1
# Commit and push all deployment automation changes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMMITTING ALL CHANGES TO REPOSITORY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Add all changes
Write-Host ""
Write-Host "Step 1: Adding all changes to git..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add changes" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All changes added to git" -ForegroundColor Green

# Step 2: Check status
Write-Host ""
Write-Host "Step 2: Checking git status..." -ForegroundColor Yellow
git status

# Step 3: Commit changes
Write-Host ""
Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow

$commitMessage = @"
Complete Cursor terminal bug solution with deployment automation

- Add wrapper scripts to bypass Cursor terminal 'q' prefix bug
- Pin Vercel project to bell24h-v1 (prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS)
- Create GitHub Actions CI/CD workflow for automated deployment
- Configure Neon PostgreSQL database connection
- Set up Razorpay live payment integration
- Deploy enhanced homepage with animations and trust badges
- Deploy all admin pages (contact, privacy, terms, refund policy)
- Create comprehensive automation scripts for external PowerShell
- Add complete documentation and deployment guides
- Replace old August deployment with new enhanced features
- Configure production environment variables
- Set up background agent automation

All systems ready for deployment to www.bell24h.com
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit changes" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Changes committed successfully" -ForegroundColor Green

# Step 4: Push to repository
Write-Host ""
Write-Host "Step 4: Pushing to repository..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push changes" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Changes pushed to repository successfully" -ForegroundColor Green

# Step 5: Final status
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "COMMIT AND PUSH COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 BACKGROUND AGENT READY TO USE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 WHAT'S BEEN COMMITTED:" -ForegroundColor White
Write-Host "  ✅ Wrapper scripts (deploy-pwsh.ps1, deploy-sh)" -ForegroundColor Green
Write-Host "  ✅ Vercel project pinning (.vercel/project.json)" -ForegroundColor Green
Write-Host "  ✅ GitHub Actions workflow (.github/workflows/deploy.yml)" -ForegroundColor Green
Write-Host "  ✅ Neon database configuration" -ForegroundColor Green
Write-Host "  ✅ Enhanced homepage components" -ForegroundColor Green
Write-Host "  ✅ Razorpay integration setup" -ForegroundColor Green
Write-Host "  ✅ Admin pages deployment" -ForegroundColor Green
Write-Host "  ✅ Complete automation scripts" -ForegroundColor Green
Write-Host "  ✅ Documentation and guides" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Run: RUN_DEPLOYMENT_NOW.bat" -ForegroundColor White
Write-Host "  2. Deploy to bell24h-v1 project" -ForegroundColor White
Write-Host "  3. Verify at: https://www.bell24h.com" -ForegroundColor White
Write-Host ""
Write-Host "🎯 TARGET PROJECT: bell24h-v1 (prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS)" -ForegroundColor Green
Write-Host "🌐 DOMAIN: www.bell24h.com" -ForegroundColor Green
Write-Host ""
Write-Host "Background agent configuration saved and ready!" -ForegroundColor Green

Read-Host "Press Enter to continue..." | Out-Null
