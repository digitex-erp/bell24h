@echo off
echo ========================================
echo BELL24H DEPLOYMENT FIX - AUTOMATIC
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Generating Prisma client...
call npx prisma generate

echo.
echo Step 3: Testing build...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo Step 4: Committing fixes...
    git add .
    git commit -m "Fix: Remove conflicting files - deployment ready"
    
    echo.
    echo Step 5: Pushing to repository...
    git push origin main
    
    echo.
    echo 🎉 DEPLOYMENT FIX COMPLETE!
    echo Your Vercel deployment should now work!
    echo.
) else (
    echo.
    echo ❌ Build failed. Please check the errors above.
    echo.
)

echo Press any key to exit...
pause >nul
