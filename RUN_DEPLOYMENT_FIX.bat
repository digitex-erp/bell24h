@echo off
title BELL24H DEPLOYMENT FIX - SIMPLE VERSION
color 0A

echo.
echo ========================================
echo   BELL24H DEPLOYMENT FIX - AUTOMATIC
echo ========================================
echo.

echo Step 1: Installing dependencies...
npm install
echo.

echo Step 2: Generating Prisma client...
npx prisma generate
echo.

echo Step 3: Testing build...
npm run build
echo.

echo Step 4: Deploying to Vercel...
npx vercel --prod
echo.

echo Step 5: Opening Vercel dashboard...
start https://vercel.com/dashboard
echo.

echo ========================================
echo   DEPLOYMENT FIX COMPLETE!
echo ========================================
echo.
echo Your Bell24h site should now be working!
echo.
pause
