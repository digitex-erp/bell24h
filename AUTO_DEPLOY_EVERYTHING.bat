@echo off
echo ========================================
echo AUTO DEPLOY EVERYTHING TO BELL24H-V1
echo ========================================
echo.
echo This will automatically:
echo ✅ Fix project linking (bell24h-complete → bell24h-v1)
echo ✅ Install Vercel CLI
echo ✅ Fix Hero.tsx build errors
echo ✅ Store Razorpay live keys
echo ✅ Build project with all pages
echo ✅ Deploy to bell24h-v1
echo ✅ Verify all pages are live on bell24h.com
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

cd /d "C:\Users\Sanika\Projects\bell24h"
powershell -ExecutionPolicy Bypass -File "AUTO_DEPLOY_EVERYTHING.ps1"

echo.
echo ========================================
echo AUTO DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Bell24h website should now be live at:
echo https://www.bell24h.com
echo.
pause
