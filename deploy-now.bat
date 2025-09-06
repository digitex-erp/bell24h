@echo off
echo ========================================
echo    BELL24H VERCEL DEPLOYMENT
echo ========================================
echo.

echo Step 1: Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build successful!
echo.

echo Step 2: Deploying to Vercel...
call npx vercel deploy --prod --yes
if %errorlevel% neq 0 (
    echo Deployment failed, trying alternative method...
    call npx vercel --prod --yes
)
echo.

echo Step 3: Getting deployment URL...
call npx vercel ls
echo.

echo ========================================
echo    DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your site should be live at: https://bell24h-v1.vercel.app
echo.
pause
