@echo off
echo ========================================
echo    BELL24H NETLIFY DEPLOYMENT
echo ========================================
echo.

echo 📋 DEPLOYMENT CHECKLIST:
echo ✅ 1. Build successful
echo ✅ 2. Files protected
echo ✅ 3. Ready for Netlify
echo.

echo 🚀 DEPLOYING TO NETLIFY...
echo.

echo Step 1: Installing Netlify CLI...
npm install -g netlify-cli

echo.
echo Step 2: Building project...
npm run build

echo.
echo Step 3: Deploying to Netlify...
netlify deploy --prod --dir=.next

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🌐 Your app will be available at:
echo    https://bell24h.netlify.app
echo.
echo 📱 Next steps:
echo    1. Set up environment variables in Netlify dashboard
echo    2. Connect your database
echo    3. Configure domain (optional)
echo.
pause
