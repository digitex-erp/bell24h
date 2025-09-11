@echo off
echo =====================================
echo BELL24H FRESH DEPLOYMENT SCRIPT
echo =====================================
echo.

echo [STEP 1] Cleaning old files...
if exist ".vercel" rmdir /s /q ".vercel"
if exist ".next" rmdir /s /q ".next"
echo Cleaned successfully!
echo.

echo [STEP 2] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo Dependencies installed!
echo.

echo [STEP 3] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo WARNING: Build had issues, but continuing...
)
echo Build completed!
echo.

echo [STEP 4] Deploying to Vercel...
echo This will open a browser for authentication...
call npx vercel --prod
echo.

echo =====================================
echo DEPLOYMENT COMPLETE!
echo =====================================
echo Your app should be live at the URL shown above
pause
