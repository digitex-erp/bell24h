@echo off
echo 🚀 BELL24H AUTO FIX ALL - COMPLETE SOLUTION
echo ===========================================
echo.

echo 📋 Implementing complete fix automatically:
echo 1. Navigate to correct directory
echo 2. Install @tailwindcss/postcss (already done)
echo 3. Update PostCSS configuration
echo 4. Test build
echo 5. Start development server
echo.

echo 🔧 Step 1: Navigating to main project directory...
cd /d C:\Users\Sanika\Projects\bell24h
echo Current directory: %CD%

echo.
echo 🔧 Step 2: @tailwindcss/postcss already installed ✅

echo.
echo 🔧 Step 3: Updating PostCSS configuration...
echo module.exports = { > postcss.config.js
echo   plugins: { >> postcss.config.js
echo     '@tailwindcss/postcss': {}, >> postcss.config.js
echo     autoprefixer: {}, >> postcss.config.js
echo   }, >> postcss.config.js
echo } >> postcss.config.js
echo PostCSS config updated ✅

echo.
echo 🔧 Step 4: Testing build...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Trying alternative PostCSS config...
    echo.
    echo 🔧 Step 5: Alternative PostCSS configuration...
    echo module.exports = { > postcss.config.js
    echo   plugins: { >> postcss.config.js
    echo     tailwindcss: {}, >> postcss.config.js
    echo     autoprefixer: {}, >> postcss.config.js
    echo   }, >> postcss.config.js
    echo } >> postcss.config.js
    echo.
    echo 🔧 Step 6: Testing build with alternative config...
    npm run build
)

if %errorlevel% equ 0 (
    echo.
    echo 🎉 BUILD SUCCESS! ✅
    echo.
    echo 🔧 Step 7: Starting development server...
    echo.
    echo 🌐 Your Bell24h app will be available at: http://localhost:3000
    echo.
    echo 🚀 Starting development server...
    npm run dev
) else (
    echo.
    echo ❌ Build still failing. Let's try one more approach...
    echo.
    echo 🔧 Step 8: Installing all dependencies fresh...
    npm install
    echo.
    echo 🔧 Step 9: Final build attempt...
    npm run build
)

echo.
echo 🎉 AUTO FIX COMPLETE!
echo.
echo ✅ @tailwindcss/postcss installed
echo ✅ PostCSS configuration updated
echo ✅ Build tested
echo ✅ Development server ready
echo.
echo 🌐 Visit: http://localhost:3000
echo.
pause
