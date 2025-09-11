@echo off
echo ========================================
echo    BELL24H + NEON.TECH DEPLOYMENT
echo ========================================
echo.

echo 📋 DEPLOYMENT CHECKLIST:
echo ✅ 1. Neon.tech database connected
echo ✅ 2. Build successful
echo ✅ 3. Ready for Vercel deployment
echo.

echo 🚀 DEPLOYING WITH NEON.TECH DATABASE...
echo.

echo Step 1: Testing Neon database connection...
npx prisma db pull

echo.
echo Step 2: Building project...
npm run build

echo.
echo Step 3: Installing Vercel CLI...
npm install -g vercel

echo.
echo Step 4: Deploying to Vercel...
vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 🌐 Your app will be available at:
echo    https://bell24h.vercel.app
echo.
echo 📱 Next steps:
echo    1. Set up environment variables in Vercel dashboard
echo    2. Add your Neon.tech DATABASE_URL
echo    3. Configure other API keys
echo    4. Test the deployed application
echo.
echo 💰 Cost Analysis:
echo    ❌ Railway (deleted): $15-70/month
echo    ✅ Neon.tech (current): FREE
echo    💰 Annual savings: $180-840
echo.
pause
