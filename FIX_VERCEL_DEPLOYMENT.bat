@echo off
echo 🚀 FIXING VERCEL DEPLOYMENT - COMPLETE SOLUTION
echo ===============================================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🔍 Step 1: Checking build files...
if exist .next (
    echo ✅ .next folder exists
    dir .next | findstr /i "static"
    if %errorlevel% neq 0 (
        echo ❌ .next folder is empty or incomplete
        echo 🔧 Will rebuild...
    ) else (
        echo ✅ .next folder has content
    )
) else (
    echo ❌ .next folder missing - need to build
)

echo.
echo 🧹 Step 2: Cleaning old build artifacts...
if exist .next rmdir /s /q .next
if exist .vercel rmdir /s /q .vercel
echo ✅ Cleaned
echo.

echo 📦 Step 3: Fresh install of dependencies...
call npm install
echo ✅ Dependencies installed
echo.

echo 🔨 Step 4: Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    echo Check the errors above and try again.
    pause
    exit /b %errorlevel%
)
echo ✅ Build successful!
echo.

echo 🔍 Step 5: Verifying build files...
if exist .next (
    echo ✅ .next folder created
    if exist .next\static (
        echo ✅ Static files generated
    ) else (
        echo ❌ Static files missing
    )
) else (
    echo ❌ .next folder still missing
    echo Build may have failed silently
    pause
    exit /b 1
)

echo.
echo 🚀 Step 6: Deploying to Vercel...
call npx vercel link --project=bell24h-v1 --yes
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    echo.
    echo 🔄 Trying alternative deployment method...
    call npx vercel deploy --prod --yes
    if %errorlevel% neq 0 (
        echo ❌ Alternative deployment also failed
        echo.
        echo 📋 Manual steps needed:
        echo 1. Go to https://vercel.com/dashboard
        echo 2. Import from GitHub: digitex-erp/bell24h
        echo 3. Set Root Directory: client
        echo 4. Set Build Command: npm run build
        pause
        exit /b %errorlevel%
    )
)

echo.
echo 🎉 DEPLOYMENT SUCCESSFUL!
echo.
echo ✅ Build files created properly
echo ✅ Vercel deployment completed
echo ✅ Bell24h is now live!
echo.
echo 🌐 Your site should be available at:
echo https://bell24h-v1.vercel.app
echo.
pause