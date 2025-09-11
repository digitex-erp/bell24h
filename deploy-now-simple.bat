@echo off
echo ========================================
echo    BELL24H DEPLOYMENT TO VERCEL
echo ========================================
echo.

echo Step 1: Building project...
call npm run build

echo.
echo Step 2: Installing Vercel CLI...
call npm install -g vercel

echo.
echo Step 3: Deploying to Vercel...
echo Please follow the prompts:
call vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo Next steps:
echo 1. Go to vercel.com/dashboard
echo 2. Add environment variables
echo 3. Test your app
echo.
pause
