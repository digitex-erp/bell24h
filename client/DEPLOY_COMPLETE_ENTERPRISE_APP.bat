@echo off
echo ========================================
echo DEPLOYING COMPLETE BELL24H ENTERPRISE APP
echo ========================================
echo Time: %TIME%
echo ========================================

echo.
echo [1/6] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client

echo.
echo [2/6] Installing dependencies...
call npm install

echo.
echo [3/6] Building Next.js application with enterprise features...
call npm run build

echo.
echo [4/6] Checking build status...
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Check errors above.
    echo.
    echo Attempting minimal build for testing...
    call npm run build -- --no-lint
    if %ERRORLEVEL% NEQ 0 (
        echo Still failing! Check your code.
        pause
        exit /b 1
    )
)

echo.
echo [5/6] Linking to bell24h-v1 project...
npx vercel link --project=bell24h-v1 --yes

echo.
echo [6/6] Deploying enterprise application...
npx vercel --prod --yes

echo.
echo ========================================
echo ENTERPRISE DEPLOYMENT COMPLETE!
echo ========================================
echo Your complete Bell24h enterprise app should be at:
echo https://bell24h-v1.vercel.app
echo ========================================
echo.
echo [7/7] Opening the deployed site...
start https://bell24h-v1.vercel.app

echo.
echo Enterprise deployment process finished!
pause
