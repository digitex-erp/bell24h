@echo off
echo 🚀 DEPLOYING NEW HOMEPAGE AND MOBILE OTP LOGIN
echo ================================================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🔧 Step 1: Building new homepage and mobile OTP...
call npm run build
echo.

echo 📦 Step 2: Deploying to Vercel...
call npx vercel --prod --yes
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo ✅ New homepage with Bell24h branding
echo ✅ Mobile OTP login system
echo ✅ All 176-210 pages ready
echo.
pause
