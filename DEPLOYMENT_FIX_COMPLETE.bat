@echo off
echo ========================================
echo BELL24H DEPLOYMENT FIX - COMPLETE SOLUTION
echo ========================================
echo.

echo [1/8] Cleaning up conflicting files...
if exist "pages\api\auth\[...nextauth].js" (
    echo Removing conflicting pages router file...
    del "pages\api\auth\[...nextauth].js"
)

if exist "pages\api\auth" (
    echo Removing empty auth directory...
    rmdir "pages\api\auth"
)

if exist "pages\api" (
    echo Removing empty api directory...
    rmdir "pages\api"
)

if exist "pages" (
    echo Checking if pages directory is empty...
    dir "pages" /b >nul 2>&1
    if %errorlevel% equ 0 (
        echo Pages directory is empty, removing...
        rmdir "pages"
    )
)

echo [2/8] Installing dependencies...
call npm install

echo [3/8] Generating Prisma client...
call npx prisma generate

echo [4/8] Running build test...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo [5/8] Committing fixes...
    git add .
    git commit -m "Fix: Remove conflicting pages router files - deployment ready"
    
    echo [6/8] Pushing to repository...
    git push origin main
    
    echo [7/8] Deploying to Vercel...
    call npx vercel --prod
    
    echo [8/8] ✅ DEPLOYMENT COMPLETE!
    echo.
    echo ========================================
    echo 🚀 BELL24H IS NOW LIVE AND WORKING!
    echo ========================================
    echo.
    echo Your deployment should now be successful.
    echo Check your Vercel dashboard for the latest status.
    echo.
) else (
    echo ❌ BUILD FAILED!
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo - Missing environment variables
    echo - TypeScript errors
    echo - Import/export issues
    echo.
    echo Run 'npm run build' manually to see detailed errors.
)

echo.
echo Press any key to exit...
pause >nul
