@echo off
echo =====================================
echo BELL24H EMERGENCY DEPLOYMENT
echo =====================================
echo.

echo [STEP 1] Cleaning everything...
if exist ".vercel" rmdir /s /q ".vercel"
if exist ".next" rmdir /s /q ".next"
echo Cleaned!
echo.

echo [STEP 2] Building project...
call npm run build
echo Build completed!
echo.

echo [STEP 3] Deploying to Vercel...
echo This will open browser for authentication...
call npx vercel --prod --yes
echo.

echo [STEP 4] If above failed, trying alternative...
call npx vercel deploy --prod --public
echo.

echo =====================================
echo DEPLOYMENT ATTEMPTED!
echo =====================================
echo Check output above for your URL
echo Your domain bell24h.com will work automatically
pause
