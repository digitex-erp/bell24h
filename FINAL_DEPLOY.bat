@echo off
echo ========================================
echo FINAL DEPLOYMENT FOR RAZORPAY REVIEW
echo ========================================
echo.

cd /d C:\Users\Sanika\Projects\bell24h\client
echo [1] Current directory: %CD%

echo.
echo [2] Building project...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo [3] Deploying to Vercel...
    npx vercel --prod --yes
    
    echo.
    echo ========================================
    echo DEPLOYMENT COMPLETE!
    echo ========================================
    echo Your site is now live for Razorpay review!
    echo Check your Vercel dashboard for the URL.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo Please check the errors above.
)

echo.
pause
