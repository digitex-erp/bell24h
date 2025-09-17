@echo off
title BELL24H FINAL DEPLOYMENT SOLUTION
color 0A

echo.
echo  ██████╗ ███████╗██╗     ██╗     ██████╗ ██████╗ ██╗  ██╗
echo  ██╔══██╗██╔════╝██║     ██║    ██╔════╝██╔═══██╗██║  ██║
echo  ██████╔╝█████╗  ██║     ██║    ██║     ██║   ██║███████║
echo  ██╔══██╗██╔══╝  ██║     ██║    ██║     ██║   ██║██╔══██║
echo  ██████╔╝███████╗███████╗███████╗╚██████╗╚██████╔╝██║  ██║
echo  ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝
echo.
echo  ========================================
echo     BELL24H FINAL DEPLOYMENT SOLUTION
echo  ========================================
echo.

echo [STEP 1] Cleaning up problematic files...
if exist "src\components\mobile" rmdir /s /q "src\components\mobile"
if exist "src\pages\mobile" rmdir /s /q "src\pages\mobile"
if exist "src\services\logistics" rmdir /s /q "src\services\logistics"
echo ✅ Problematic files removed

echo.
echo [STEP 2] Installing required dependencies...
call npm install @mui/material @emotion/react @emotion/styled axios
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [STEP 3] Installing Vercel CLI...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ❌ Failed to install Vercel CLI
    pause
    exit /b 1
)
echo ✅ Vercel CLI installed

echo.
echo [STEP 4] Creating environment file...
echo # Bell24h Environment Variables > .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo NEXTAUTH_SECRET=bell24h-secret-key-2025 >> .env.local
echo DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require >> .env.local
echo ✅ Environment file created

echo.
echo [STEP 5] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    echo.
    echo 🔧 TROUBLESHOOTING:
    echo    - Make sure all dependencies are installed
    echo    - Check for any remaining import errors
    echo    - Try running: npm install
    echo.
    pause
    exit /b 1
)
echo ✅ Build successful!

echo.
echo [STEP 6] Deploying to Vercel...
echo    📝 You will be prompted to login to Vercel
echo    📝 Follow the on-screen instructions
echo    📝 Choose your project settings when prompted
echo.
call vercel --prod --yes

echo.
echo ========================================
echo     🎉 DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo Your Bell24h platform is now live!
echo Check the URL provided above.
echo.
echo 📋 NEXT STEPS:
echo    1. Configure your domain (bell24h.com)
echo    2. Set up DNS records
echo    3. Test all features
echo    4. Start using your B2B marketplace!
echo.
echo Press any key to exit...
pause >nul
