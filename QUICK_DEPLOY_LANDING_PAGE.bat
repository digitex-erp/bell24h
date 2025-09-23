@echo off
echo ===============================================
echo QUICK DEPLOY - LANDING PAGE (2-3 DAYS TO LAUNCH)
echo ===============================================
echo.

echo STEP 1: Choose working directory
echo.
echo A) ROOT directory (Enterprise Homepage)
echo B) CLIENT directory (Existing System)
echo.
set /p choice="Enter A or B: "

if /i "%choice%"=="A" (
    echo.
    echo Using ROOT directory...
    cd /d "%~dp0"
    set WORK_DIR=ROOT
) else if /i "%choice%"=="B" (
    echo.
    echo Using CLIENT directory...
    cd /d "%~dp0\client"
    set WORK_DIR=CLIENT
) else (
    echo Invalid choice. Defaulting to CLIENT directory...
    cd /d "%~dp0\client"
    set WORK_DIR=CLIENT
)

echo.
echo Working directory: %WORK_DIR%
echo Current path: %CD%
echo.

echo STEP 2: Test build
echo Running: npm run build
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED
    echo Cannot deploy broken build.
    echo.
    echo Please fix build errors first:
    echo 1. Check for missing dependencies
    echo 2. Fix TypeScript errors
    echo 3. Fix import/export issues
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ BUILD SUCCESSFUL
echo.

echo STEP 3: Deploy to Vercel
echo.
echo This will deploy your landing page to Vercel.
echo You'll get a live URL like: https://your-project.vercel.app
echo.

set /p deploy="Deploy to Vercel now? (y/n): "
if /i "%deploy%"=="y" (
    echo.
    echo Installing Vercel CLI...
    npm install -g vercel
    
    echo.
    echo Deploying to Vercel...
    vercel --prod
    
    echo.
    echo ===============================================
    echo DEPLOYMENT COMPLETE!
    echo ===============================================
    echo.
    echo Your landing page is now live!
    echo Check the URL provided by Vercel.
    echo.
    echo NEXT STEPS:
    echo 1. Test the live site
    echo 2. Add real contact information
    echo 3. Replace placeholder content
    echo 4. Set up email collection
    echo.
) else (
    echo.
    echo Deployment cancelled.
    echo.
    echo MANUAL DEPLOYMENT OPTIONS:
    echo 1. Vercel: https://vercel.com
    echo 2. Netlify: https://netlify.com
    echo 3. Railway: https://railway.app
    echo 4. Render: https://render.com
    echo.
    echo Upload the 'out' or 'dist' folder to any of these services.
)

echo.
echo ===============================================
echo QUICK DEPLOY COMPLETE
echo ===============================================
pause
