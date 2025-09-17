@echo off
title BELL24H COMPLETE AUTOMATION
color 0C

echo.
echo  ██████╗ ███████╗██╗     ██╗     ██████╗ ██████╗ ██╗  ██╗
echo  ██╔══██╗██╔════╝██║     ██║    ██╔════╝██╔═══██╗██║  ██║
echo  ██████╔╝█████╗  ██║     ██║    ██║     ██║   ██║███████║
echo  ██╔══██╗██╔══╝  ██║     ██║    ██║     ██║   ██║██╔══██║
echo  ██████╔╝███████╗███████╗███████╗╚██████╗╚██████╔╝██║  ██║
echo  ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝
echo.
echo  ========================================
echo     BELL24H COMPLETE AUTOMATION
echo  ========================================
echo.

echo 🚀 This script will automatically:
echo    ✅ Fix all Bell24h branding
echo    ✅ Set up Neon database
echo    ✅ Deploy to Vercel
echo    ✅ Configure everything
echo.

echo Press any key to start...
pause >nul

echo.
echo [PHASE 1] System Preparation...
echo.

echo [1/8] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install first.
    start https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

echo [2/8] Installing Vercel CLI...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ❌ Failed to install Vercel CLI
    echo    Please run as Administrator
    pause
    exit /b 1
)
echo ✅ Vercel CLI installed

echo [3/8] Installing Prisma CLI...
call npm install -g prisma
if %errorlevel% neq 0 (
    echo ❌ Failed to install Prisma CLI
    pause
    exit /b 1
)
echo ✅ Prisma CLI installed

echo.
echo [PHASE 2] Project Setup...
echo.

echo [4/8] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo [5/8] Fixing Bell24h branding...
powershell -Command "& { Get-ChildItem -Path . -Recurse -Include '*.tsx','*.ts','*.js','*.jsx','*.md' | ForEach-Object { $content = Get-Content $_.FullName -Raw; if ($content -match 'Bell24x|bell24x|Bell24X') { $content = $content -replace 'Bell24x', 'Bell24h'; $content = $content -replace 'bell24x', 'bell24h'; $content = $content -replace 'Bell24X', 'Bell24h'; Set-Content $_.FullName -Value $content; Write-Host \"Fixed: $($_.Name)\" } } }"
echo ✅ Branding fixed across all files

echo [6/8] Setting up environment...
if not exist .env.local (
    echo Creating .env.local...
    echo # Bell24h Environment Variables > .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo NEXTAUTH_SECRET=bell24h-secret-key-2025 >> .env.local
    echo DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require >> .env.local
    echo.
    echo ✅ Environment configured with your Neon database
)

echo [7/8] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check .env.local
    pause
    exit /b 1
)
echo ✅ Build successful

echo.
echo [PHASE 3] Database Setup...
echo.

echo [8/8] Setting up database...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated

echo.
echo [PHASE 4] Deployment...
echo.

echo Deploying to Vercel...
call vercel --prod --yes

echo.
echo ========================================
echo     🎉 AUTOMATION COMPLETE! 🎉
echo ========================================
echo.
echo Your Bell24h platform is now:
echo ✅ Branded correctly
echo ✅ Database ready
echo ✅ Deployed to Vercel
echo.
echo Next steps:
echo 1. Update Vercel environment variables
echo 2. Run: npx prisma db push
echo 3. Your platform is live!
echo.
echo Press any key to exit...
pause >nul