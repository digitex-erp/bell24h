@echo off
echo ========================================
echo    BELL24H CLEAN DEPLOYMENT
echo ========================================
echo.

echo Step 1: Checking if logged into Vercel...
npx vercel whoami
if %errorlevel% neq 0 (
    echo Logging into Vercel...
    npx vercel login
)

echo.
echo Step 2: Deploying directly to Vercel (bypassing GitHub)...
npx vercel --prod --yes --force

echo.
echo ========================================
echo    DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your site is now live!
echo Check the URL shown above to view your deployment.
echo.
pause
