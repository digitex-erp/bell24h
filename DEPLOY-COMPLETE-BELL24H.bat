@echo off
title BELL24H COMPLETE PLATFORM DEPLOYMENT
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
echo     COMPLETE PLATFORM DEPLOYMENT
echo  ========================================
echo.

echo [STEP 1] System Check...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Installing...
    echo    Please download from: https://nodejs.org
    start https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ NPM not found!
    pause
    exit /b 1
)
echo ✅ NPM found

echo.
echo [STEP 2] Installing Vercel CLI...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ❌ Failed to install Vercel CLI
    echo    Please run as Administrator
    pause
    exit /b 1
)
echo ✅ Vercel CLI installed

echo.
echo [STEP 3] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [STEP 4] Fixing Bell24h branding...
powershell -Command "& { Get-ChildItem -Path . -Recurse -Include '*.tsx','*.ts','*.js','*.jsx' | ForEach-Object { $content = Get-Content $_.FullName -Raw; if ($content -match 'Bell24x|bell24x|Bell24X') { $content = $content -replace 'Bell24x', 'Bell24h'; $content = $content -replace 'bell24x', 'bell24h'; $content = $content -replace 'Bell24X', 'Bell24h'; Set-Content $_.FullName -Value $content; Write-Host \"Fixed: $($_.Name)\" } } }"
echo ✅ Branding fixed across all files

echo.
echo [STEP 5] Setting up environment variables...
if not exist .env.local (
    echo Creating .env.local file...
    echo # Bell24h Environment Variables > .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo NEXTAUTH_SECRET=your-secret-key-here >> .env.local
    echo DATABASE_URL=your-neon-database-url-here >> .env.local
    echo.
    echo ⚠️  IMPORTANT: Please update .env.local with your actual values:
    echo    - NEXTAUTH_SECRET: Generate a random string
    echo    - DATABASE_URL: Your Neon database connection string
    echo.
    pause
)

echo.
echo [STEP 6] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    echo    Common fixes:
    echo    1. Update .env.local with correct values
    echo    2. Run: npx prisma generate
    echo    3. Run: npx prisma db push
    pause
    exit /b 1
)
echo ✅ Build successful

echo.
echo [STEP 7] Deploying to Vercel...
echo    📝 You will be prompted to login to Vercel
echo    📝 Follow the on-screen instructions
echo    📝 When asked about environment variables, say YES
echo.
call vercel --prod --yes

echo.
echo ========================================
echo     🎉 DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo Your complete Bell24h platform is now live!
echo.
echo Next steps:
echo 1. Set up your Neon database
echo 2. Update environment variables in Vercel dashboard
echo 3. Run database migrations
echo 4. Your site is ready!
echo.
echo Press any key to exit...
pause >nul
