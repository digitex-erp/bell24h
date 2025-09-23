@echo off
echo ========================================
echo BUILDING STATIC SITE ONLY FOR RAZORPAY
echo ========================================
echo.

cd /d C:\Users\Sanika\Projects\bell24h\client
echo [1] Current directory: %CD%

echo.
echo [2] Temporarily renaming API directory...
if exist "app\api" (
    ren "app\api" "api_backup"
    echo API directory renamed to api_backup
) else (
    echo API directory not found or already renamed
)

echo.
echo [3] Building static site...
npm run build

echo.
echo [4] Restoring API directory...
if exist "api_backup" (
    ren "api_backup" "app\api"
    echo API directory restored
) else (
    echo No backup found to restore
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo [5] Deploying to Vercel...
    npx vercel --prod --force
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo Please check the errors above.
)

echo.
pause
