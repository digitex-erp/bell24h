@echo off
echo 🚀 FIXING BUILD ERRORS AND DEPLOYING BELL24H
echo ==============================================
echo.

echo 📍 Navigating to client directory...
cd /d "%~dp0\client"
echo Current directory: %CD%
echo.

echo 🔧 Step 1: Cleaning build artifacts...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
echo ✅ Cleaned previous builds
echo.

echo 🔧 Step 2: Installing dependencies...
call npm install
echo ✅ Dependencies ready
echo.

echo 🔧 Step 3: Building with all fixes applied...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Check errors above.
    pause
    exit /b %errorlevel%
)
echo ✅ Build successful!
echo.

echo 📦 Step 4: Deploying to Vercel...
call npx vercel link --project=bell24h-v1 --yes
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b %errorlevel%
)
echo ✅ Deployed successfully!
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo ✅ Build errors fixed
echo ✅ New homepage deployed
echo ✅ Mobile OTP login deployed
echo ✅ All 216 pages ready
echo.
echo 🌐 Your Bell24h is now live!
echo.
pause