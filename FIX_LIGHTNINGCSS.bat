@echo off
echo ========================================
echo    FIXING LIGHTNINGCSS ISSUE - BELL24H
echo ========================================
echo.

echo Step 1: Cleaning npm cache...
npm cache clean --force

echo.
echo Step 2: Removing problematic package...
npm uninstall @tailwindcss/postcss

echo.
echo Step 3: Installing standard Tailwind CSS...
npm install tailwindcss postcss autoprefixer

echo.
echo Step 4: Testing build...
npm run build

echo.
echo Step 5: If build successful, committing changes...
git add .
git commit -m "Fix: Use standard Tailwind CSS configuration"
git push origin main

echo.
echo Step 6: Deploying to Vercel...
npx vercel --prod

echo.
echo ========================================
echo    FIX COMPLETE!
echo ========================================
pause
