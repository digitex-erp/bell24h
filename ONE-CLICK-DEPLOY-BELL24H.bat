@echo off
title BELL24H ONE-CLICK DEPLOYMENT
color 0A

echo.
echo  ██████╗ ███████╗██╗     ██╗     ██████╗ ██████╗ ██╗  ██╗
echo  ██╔══██╗██╔════╝██║     ██║    ██╔════╝██╔═══██╗██║  ██║
echo  ██████╔╝█████╗  ██║     ██║    ██║     ██║   ██║███████║
echo  ██╔══██╗██╔══╝  ██║     ██║    ██║     ██║   ██║██╔══██║
echo  ██████╔╝███████╗███████╗███████╗╚██████╗╚██████╔╝██║  ██║
echo  ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝
echo.
echo  ========================================
echo     AUTOMATED BELL24H DEPLOYMENT
echo  ========================================
echo.

echo [STEP 1] Checking system requirements...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo    Download from: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ NPM not found! Please install NPM first.
    pause
    exit /b 1
)
echo ✅ NPM found

echo.
echo [STEP 2] Installing Vercel CLI globally...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ❌ Failed to install Vercel CLI
    echo    Please run as Administrator or install manually
    pause
    exit /b 1
)
echo ✅ Vercel CLI installed

echo.
echo [STEP 3] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [STEP 4] Fixing Bell24h branding automatically...
powershell -Command "& { $content = Get-Content 'src\app\page.tsx' -Raw; $content = $content -replace 'Bell24x', 'Bell24h'; $content = $content -replace 'bell24x', 'bell24h'; $content = $content -replace 'Bell24X', 'Bell24h'; Set-Content 'src\app\page.tsx' -Value $content }"
echo ✅ Branding fixed

echo.
echo [STEP 5] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b 1
)
echo ✅ Build successful

echo.
echo [STEP 6] Deploying to Vercel...
echo    📝 You will be prompted to login to Vercel
echo    📝 Follow the on-screen instructions
echo.
call vercel --prod --yes

echo.
echo ========================================
echo     🎉 DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo Your Bell24h site is now live!
echo Check the URL provided above.
echo.
echo Press any key to exit...
pause >nul
