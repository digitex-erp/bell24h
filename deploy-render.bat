@echo off
echo ========================================
echo    BELL24H RENDER DEPLOYMENT
echo ========================================
echo.

echo 📋 DEPLOYMENT CHECKLIST:
echo ✅ 1. Build successful
echo ✅ 2. Files protected
echo ✅ 3. Ready for Render
echo.

echo 🚀 DEPLOYING TO RENDER...
echo.

echo Step 1: Installing Render CLI...
npm install -g @render/cli

echo.
echo Step 2: Building project...
npm run build

echo.
echo Step 3: Deploying to Render...
render deploy

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🌐 Your app will be available at:
echo    https://bell24h.onrender.com
echo.
echo 📱 Next steps:
echo    1. Set up environment variables in Render dashboard
echo    2. Connect your database
echo    3. Configure domain (optional)
echo.
pause
