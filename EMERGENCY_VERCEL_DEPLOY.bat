@echo off
echo ========================================
echo EMERGENCY DEPLOYMENT TO BELL24H-V1
echo ========================================
echo Deploying NEW homepage to existing Vercel project
echo Time: 8:00 PM - Launch Day
echo ========================================

echo.
echo [1/6] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client

echo.
echo [2/6] Linking to bell24h-v1 project...
vercel link --yes --project=bell24h-v1

echo.
echo [3/6] Pulling environment variables...
vercel env pull .env.production

echo.
echo [4/6] Installing dependencies...
npm install

echo.
echo [5/6] Building project...
npm run build

echo.
echo [6/6] Deploying to bell24h-v1...
vercel --prod --name=bell24h-v1 --yes

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo Your NEW homepage should now be live at:
echo https://bell24h-v1.vercel.app
echo ========================================
pause
