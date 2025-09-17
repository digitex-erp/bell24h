@echo off
title BELL24H SIMPLE DEPLOYMENT
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
echo     BELL24H SIMPLE DEPLOYMENT
echo  ========================================
echo.

echo [STEP 1] Installing Vercel CLI...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ❌ Failed to install Vercel CLI
    pause
    exit /b 1
)
echo ✅ Vercel CLI installed

echo.
echo [STEP 2] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [STEP 3] Creating environment file...
echo # Bell24h Environment Variables > .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo NEXTAUTH_SECRET=bell24h-secret-key-2025 >> .env.local
echo DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require >> .env.local
echo ✅ Environment file created

echo.
echo [STEP 4] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b 1
)
echo ✅ Build successful

echo.
echo [STEP 5] Deploying to Vercel...
echo    📝 You will be prompted to login to Vercel
echo    📝 Follow the on-screen instructions
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
echo Press any key to exit...
pause >nul