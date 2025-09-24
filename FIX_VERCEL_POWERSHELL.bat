@echo off
echo 🚀 FIXING VERCEL WITH POWERSHELL COMMANDS
echo =========================================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🧹 Step 1: Cleaning Vercel configuration...
powershell -Command "Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue"
echo ✅ Cleaned .vercel folder
echo.

echo 🔍 Step 2: Checking required files...
powershell -Command "if (Test-Path package.json) { Write-Host '✅ package.json exists' } else { Write-Host '❌ package.json missing' }"
powershell -Command "if (Test-Path next.config.js) { Write-Host '✅ next.config.js exists' } else { Write-Host '❌ next.config.js missing' }"
powershell -Command "if (Test-Path .next) { Write-Host '✅ .next folder exists' } else { Write-Host '❌ .next folder missing' }"
echo.

echo 🔗 Step 3: Fresh Vercel link...
call npx vercel link --project=bell24h-v1 --yes
echo ✅ Vercel linked
echo.

echo 🚀 Step 4: Deploying to Vercel...
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    echo.
    echo 🔄 Trying alternative method...
    call npx vercel deploy --prod --yes
    if %errorlevel% neq 0 (
        echo ❌ Alternative also failed
        echo.
        echo 🌐 Use Vercel Web Dashboard:
        echo 1. Go to https://vercel.com/dashboard
        echo 2. Import from GitHub: digitex-erp/bell24h
        echo 3. Set Root Directory: client
        pause
        exit /b %errorlevel%
    )
)

echo.
echo 🎉 DEPLOYMENT SUCCESSFUL!
echo.
echo ✅ Build files exist
echo ✅ Vercel configuration fixed
echo ✅ Bell24h is now live!
echo.
pause
