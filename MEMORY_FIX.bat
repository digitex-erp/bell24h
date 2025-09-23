@echo off
echo 🚀 MEMORY FIX FOR BUILD
echo ======================
echo.

echo 🔧 Setting Node.js memory limit to 4GB...
set NODE_OPTIONS=--max-old-space-size=4096

echo 🔧 Installing cross-env for memory management...
npm install --save-dev cross-env

echo.
echo 🔧 Testing build with increased memory...
npm run build

if %errorlevel% equ 0 (
    echo 🎉 BUILD SUCCESS! ✅
    echo.
    echo 🚀 Starting development server...
    npm run dev
) else (
    echo ❌ Build failed. Trying development mode...
    echo.
    echo 🚀 Starting development server (bypasses build)...
    npm run dev
)

echo.
echo 🌐 Visit: http://localhost:3000
pause

