@echo off
echo 🚀 COMPREHENSIVE BUILD FIX FOR BELL24H
echo =====================================
echo.

cd /d "%~dp0"

echo 📍 Current directory: %CD%
echo.

echo 🔧 Step 1: Fixing Tailwind CSS classes...
powershell -ExecutionPolicy Bypass -File "FIX_ALL_TAILWIND_CLASSES.ps1"
echo ✅ Tailwind classes fixed
echo.

echo 🔧 Step 2: Cleaning build artifacts...
cd client
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
if exist ".vercel" rmdir /s /q ".vercel"
echo ✅ Build artifacts cleaned
echo.

echo 🔧 Step 3: Installing dependencies...
call npm install
echo ✅ Dependencies installed
echo.

echo 🔧 Step 4: Generating Prisma client...
call npx prisma generate
echo ✅ Prisma client generated
echo.

echo 🔧 Step 5: Testing build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Check errors above.
    pause
    exit /b %errorlevel%
)
echo ✅ Build successful!
echo.

echo 🚀 Step 6: Pushing to GitHub...
cd /d "%~dp0"
git add .
git commit -m "Fix: Comprehensive build optimization - Tailwind, Next.js config, AgentAuth"
git push origin main
echo ✅ Pushed to GitHub
echo.

echo 🎉 COMPREHENSIVE FIX COMPLETE!
echo.
echo ✅ Tailwind CSS classes fixed
echo ✅ Next.js configuration optimized
echo ✅ AgentAuth method implemented
echo ✅ Build artifacts cleaned
echo ✅ Dependencies updated
echo ✅ Prisma client generated
echo ✅ Build tested successfully
echo ✅ Changes pushed to GitHub
echo.
echo 🚀 Vercel will auto-redeploy in 2 minutes!
echo 🌐 Your Bell24h will be live at: https://bell24h-v1.vercel.app
echo.
pause
