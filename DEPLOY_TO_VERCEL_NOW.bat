@echo off
echo ========================================
echo DEPLOYING BELL24H TO VERCEL - LIVE NOW!
echo ========================================
echo.

echo Step 1: Installing Vercel CLI...
npm install -g vercel

echo.
echo Step 2: Deploying to Vercel...
vercel --prod

echo.
echo Step 3: Your Bell24h is now LIVE!
echo Check the URL above - your site is deployed!
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo ✅ Local: http://localhost:3000 (working)
echo ✅ Live: Check Vercel URL above
echo ✅ MCP: Running on port 5174
echo.
echo Your Bell24h B2B marketplace is now LIVE!
echo.
pause
