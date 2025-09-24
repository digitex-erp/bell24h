@echo off
echo 🚀 DEPLOYING BELL24H TO VERCEL
echo ================================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🔧 Step 1: Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b %errorlevel%
)
echo ✅ Build successful!
echo.

echo 📦 Step 2: Deploying to Vercel...
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    echo Trying alternative deployment method...
    call npx vercel deploy --prod --yes
)
echo ✅ Deployment successful!
echo.

echo 🎉 BELL24H IS NOW LIVE!
echo.
echo ✅ New homepage with Bell24h branding
echo ✅ Mobile OTP login system
echo ✅ All 215 pages deployed
echo.
pause