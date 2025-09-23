@echo off
echo ========================================
echo DEPLOYING TO CORRECT VERCEL PROJECT
echo ========================================
echo.
echo This will deploy to bell24h-v1 project where www.bell24h.com is connected:
echo.
echo ✅ Target: bell24h-v1 (prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS)
echo ✅ Domain: www.bell24h.com
echo ✅ Features: Enhanced homepage + Razorpay live + Neon database
echo ✅ Admin pages: All policy pages
echo.
echo Running in external PowerShell to avoid Cursor terminal issues...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\DEPLOY_TO_CORRECT_PROJECT_NOW.ps1"

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Bell24h site is now live with:
echo ✅ Enhanced homepage with animations
echo ✅ Razorpay live payment integration
echo ✅ Neon database connected
echo ✅ All admin pages deployed
echo.
echo Site URL: https://www.bell24h.com
echo.
pause
