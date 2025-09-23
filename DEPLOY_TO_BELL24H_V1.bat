@echo off
echo ========================================
echo DEPLOYING TO CORRECT BELL24H-V1 PROJECT
echo ========================================
echo Time: %TIME%
echo ========================================

echo.
echo [1/8] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client

echo.
echo [2/8] Installing Vercel CLI globally...
npm install -g vercel

echo.
echo [3/8] Removing any existing .vercel directory...
if exist .vercel rmdir /s /q .vercel

echo.
echo [4/8] Linking to EXISTING bell24h-v1 project...
vercel link --project=bell24h-v1 --yes

echo.
echo [5/8] Building the project...
npm run build

echo.
echo [6/8] Deploying to bell24h-v1 production...
vercel --prod --name=bell24h-v1 --yes

echo.
echo [7/8] Getting deployment URL...
vercel ls --name=bell24h-v1

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo Your Bell24h homepage should now be at:
echo https://bell24h-v1.vercel.app
echo ========================================
echo.
echo [8/8] Opening the deployed site...
start https://bell24h-v1.vercel.app

echo.
echo Deployment process finished!
pause
