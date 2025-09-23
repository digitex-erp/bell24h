@echo off
echo ========================================
echo DEPLOYING BELL24H TO VERCEL
echo ========================================

echo.
echo Deploying from out directory...
npx vercel deploy ./out --prod --yes

echo.
echo ========================================
echo If deployment successful, check:
echo https://bell24h-v1.vercel.app
echo ========================================
pause
