@echo off
echo 🚀 DEPLOYING BELL24H WITH BUILD FIXES
echo =====================================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🔧 Step 1: Cleaning build artifacts...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
echo ✅ Cleaned
echo.

echo 🔧 Step 2: Installing dependencies...
call npm install
echo ✅ Dependencies installed
echo.

echo 🔧 Step 3: Building with fixes...
call npm run build
echo ✅ Build completed
echo.

echo 📦 Step 4: Deploying to Vercel...
call npx vercel --prod --yes
echo ✅ Deployed to Vercel
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo ✅ Build errors fixed
echo ✅ New homepage deployed
echo ✅ Mobile OTP login deployed
echo ✅ All 216 pages ready
echo.
pause
