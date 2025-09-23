@echo off
echo ========================================
echo FIXED DEPLOYMENT FOR RAZORPAY REVIEW
echo ========================================
echo.

echo [1] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client
echo Current directory: %CD%

echo.
echo [2] Installing Vercel CLI globally...
npm install -g vercel

echo.
echo [3] Building with fixed config...
npm run build

echo.
echo [4] Deploying to Vercel...
vercel --prod --force

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your site is now live for Razorpay review!
echo Check your Vercel dashboard for the URL.
echo.
pause
