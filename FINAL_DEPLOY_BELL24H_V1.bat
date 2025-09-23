@echo off
echo ========================================
echo FINAL DEPLOYMENT TO BELL24H-V1 PROJECT
echo ========================================
echo Time: %TIME%
echo ========================================

echo.
echo [1/6] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client

echo.
echo [2/6] Building the project...
call npm run build

echo.
echo [3/6] Checking build status...
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo [4/6] Deploying to bell24h-v1 production...
npx vercel --prod

echo.
echo [5/6] Getting deployment URL...
timeout /t 5 /nobreak > nul
npx vercel ls

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo Your Bell24h homepage should now be at:
echo https://bell24h-v1.vercel.app
echo ========================================
echo.
echo [6/6] Opening the deployed site...
start https://bell24h-v1.vercel.app

echo.
echo Deployment process finished!
pause
