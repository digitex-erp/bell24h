@echo off
echo ========================================
echo    BELL24H AUTOMATED DEPLOYMENT
echo ========================================
echo.

echo [1/6] Installing Vercel CLI...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)

echo [2/6] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [3/6] Fixing Bell24h branding...
powershell -Command "(Get-Content 'src\app\page.tsx') -replace 'Bell24x', 'Bell24h' | Set-Content 'src\app\page.tsx'"
powershell -Command "(Get-Content 'src\app\page.tsx') -replace 'bell24x', 'bell24h' | Set-Content 'src\app\page.tsx'"

echo [4/6] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo [5/6] Deploying to Vercel...
echo Please login to Vercel when prompted...
call vercel --prod --yes

echo [6/6] Deployment complete!
echo.
echo ========================================
echo    DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo Your Bell24h site is now live!
echo Check the URL provided above.
echo.
pause
