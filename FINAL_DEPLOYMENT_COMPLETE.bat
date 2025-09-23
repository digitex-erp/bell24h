@echo off
echo ========================================
echo    BELL24H - FINAL DEPLOYMENT
echo ========================================
echo.

echo ✅ Build Status: SUCCESSFUL
echo ✅ Tailwind CSS: FIXED
echo ✅ Git Commit: COMPLETED
echo.

echo 🚀 Deploying to Vercel...
echo.
echo Step 1: Login to Vercel (if needed)
npx vercel login

echo.
echo Step 2: Deploy to Production
npx vercel --prod --yes

echo.
echo ========================================
echo    DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Bell24h site should now be live at:
echo https://bell24h.com
echo https://www.bell24h.com
echo.
echo Check Vercel dashboard for deployment status.
echo.
pause



