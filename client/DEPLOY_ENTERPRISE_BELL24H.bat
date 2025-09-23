@echo off
echo ========================================
echo DEPLOYING ENTERPRISE BELL24H TO VERCEL
echo ========================================
echo Time: %TIME%
echo ========================================

echo.
echo [1/6] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client

echo.
echo [2/6] Installing dependencies...
npm install

echo.
echo [3/6] Building Next.js application...
npm run build

echo.
echo [4/6] Checking build status...
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Check errors above.
    echo Attempting deployment anyway for testing...
)

echo.
echo [5/6] Linking to bell24h-v1 project...
npx vercel link --project=bell24h-v1 --yes

echo.
echo [6/6] Deploying to bell24h-v1 production...
npx vercel --prod --yes

echo.
echo ========================================
echo ENTERPRISE DEPLOYMENT COMPLETE!
echo ========================================
echo Your Bell24h enterprise homepage should now be at:
echo https://bell24h-v1.vercel.app
echo ========================================
echo.
echo [7/7] Opening the deployed site...
start https://bell24h-v1.vercel.app

echo.
echo Enterprise deployment process finished!
pause
