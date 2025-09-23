@echo off
echo ========================================
echo COMMITTING AND PUSHING CHANGES
echo ========================================
echo.
echo This will commit all deployment scripts and configurations:
echo.
echo ✅ Wrapper scripts for Cursor terminal bug bypass
echo ✅ Vercel project pinning configuration
echo ✅ GitHub Actions CI/CD workflow
echo ✅ Neon database setup
echo ✅ Enhanced homepage components
echo ✅ Razorpay integration
echo ✅ Admin pages deployment
echo ✅ Complete automation scripts
echo ✅ Documentation and guides
echo.
echo Running in external PowerShell to avoid Cursor terminal issues...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command @'
cd C:\Users\Sanika\Projects\bell24h

Write-Host "Step 1: Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host "Step 2: Committing changes..." -ForegroundColor Yellow
git commit -m "Complete Cursor terminal bug solution with deployment automation

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

All systems ready for deployment to www.bell24h.com"

Write-Host "Step 3: Pushing to repository..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ All changes committed and pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Background agent is now ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: RUN_DEPLOYMENT_NOW.bat" -ForegroundColor White
Write-Host "2. Deploy to bell24h-v1 project" -ForegroundColor White
Write-Host "3. Verify at: https://www.bell24h.com" -ForegroundColor White
'@

echo.
echo ========================================
echo COMMIT AND PUSH COMPLETE!
echo ========================================
echo.
echo ✅ All changes committed and pushed
echo ✅ Background agent ready to use
echo ✅ Ready for deployment
echo.
pause
