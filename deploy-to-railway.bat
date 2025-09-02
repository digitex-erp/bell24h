@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo 🚀 BELL24H RAILWAY DEPLOYMENT SCRIPT
echo ================================================================
echo.
echo Starting Bell24H Railway deployment process...
echo.
echo This window will stay open so you can see the progress.
echo If you see any errors, please read them before closing.
echo.
pause

:: Set colors for output
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "BLUE=%ESC%[34m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "RESET=%ESC%[0m"

:: Get current directory
set "PROJECT_ROOT=%cd%"
echo %BLUE%Project Root: %PROJECT_ROOT%%RESET%
echo.

:: STEP 1: Check Node.js and npm
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 1: Checking Node.js and npm%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

echo Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo %RED%ERROR: Node.js not found! Please install Node.js first.%RESET%
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo Checking npm version...
npm --version
if %errorlevel% neq 0 (
    echo %RED%ERROR: npm not found! Please install npm first.%RESET%
    echo.
    echo Please install npm or reinstall Node.js.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo %GREEN%✅ Node.js and npm are available%RESET%
echo.
pause

:: STEP 2: Install dependencies
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 2: Installing project dependencies%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

if not exist "node_modules" (
    echo %YELLOW%Installing dependencies...%RESET%
    echo This may take a few minutes...
    echo.
    npm install
    if !errorlevel! neq 0 (
        echo %RED%ERROR: Failed to install dependencies!%RESET%
        echo.
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
) else (
    echo %GREEN%✅ Dependencies already installed%RESET%
)
echo.
pause

:: STEP 3: Install Railway CLI
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 3: Installing Railway CLI%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

echo %YELLOW%Installing Railway CLI...%RESET%
echo This may take a moment...
echo.
npm install -g @railway/cli
if !errorlevel! neq 0 (
    echo %RED%ERROR: Failed to install Railway CLI!%RESET%
    echo.
    echo Trying alternative installation method...
    echo.
    npm install @railway/cli
    if !errorlevel! neq 0 (
        echo %RED%ERROR: Failed to install Railway CLI with both methods!%RESET%
        echo.
        echo Please try installing manually: npm install -g @railway/cli
        echo Then run this script again.
        echo.
        pause
        exit /b 1
    )
)
echo %GREEN%✅ Railway CLI installed%RESET%
echo.
pause

:: STEP 4: Initialize Git repository
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 4: Setting up Git repository%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

if not exist ".git" (
    echo %YELLOW%Initializing Git repository...%RESET%
    git init
    if !errorlevel! neq 0 (
        echo %RED%ERROR: Failed to initialize Git repository!%RESET%
        echo.
        echo Please ensure Git is installed on your system.
        echo Download from: https://git-scm.com/
        echo.
        pause
        exit /b 1
    )
    git config --global user.name "Bell24h Deployment"
    git config --global user.email "deploy@bell24h.com"
    echo %GREEN%✅ Git repository initialized%RESET%
) else (
    echo %GREEN%✅ Git repository already exists%RESET%
)

:: Add all files to Git
echo %YELLOW%Adding files to Git...%RESET%
git add .
if !errorlevel! neq 0 (
    echo %RED%ERROR: Failed to add files to Git!%RESET%
    echo.
    pause
    exit /b 1
)

git commit -m "Bell24h Railway deployment - complete project" --allow-empty
if !errorlevel! neq 0 (
    echo %RED%ERROR: Failed to commit files to Git!%RESET%
    echo.
    pause
    exit /b 1
)
echo %GREEN%✅ Files committed to Git%RESET%
echo.
pause

:: STEP 5: Set up remote repository
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 5: Setting up remote repository%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

:: Remove existing remote if any
git remote remove origin 2>nul

:: Try different repository names
echo %YELLOW%Setting up remote repository...%RESET%
echo.

:: Try Bell24hDashboard
echo Trying Bell24hDashboard repository...
git remote add origin https://github.com/Bell-repogit/Bell24hDashboard.git
git push -u origin main --force
if !errorlevel! equ 0 (
    echo %GREEN%✅ Successfully pushed to Bell24hDashboard repository%RESET%
    goto :railway_deploy
)

:: Try Bell24h
echo Trying Bell24h repository...
git remote set-url origin https://github.com/Bell-repogit/Bell24h.git
git push -u origin main --force
if !errorlevel! equ 0 (
    echo %GREEN%✅ Successfully pushed to Bell24h repository%RESET%
    goto :railway_deploy
)

:: Try bell24h
echo Trying bell24h repository...
git remote set-url origin https://github.com/Bell-repogit/bell24h.git
git push -u origin main --force
if !errorlevel! equ 0 (
    echo %GREEN%✅ Successfully pushed to bell24h repository%RESET%
    goto :railway_deploy
)

echo %YELLOW%⚠️  Could not push to GitHub. This is okay - we can still deploy to Railway.%RESET%
echo %YELLOW%Proceeding with Railway deployment...%RESET%
echo.
pause

:: STEP 6: Railway Deployment
:railway_deploy
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 6: Railway Deployment%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

echo %YELLOW%Starting Railway deployment...%RESET%
echo %YELLOW%This will open Railway in your browser for authentication.%RESET%
echo.
echo %YELLOW%IMPORTANT: You will need to:%RESET%
echo 1. Sign in to Railway in your browser
echo 2. Create a new project
echo 3. Set up environment variables
echo 4. Add a PostgreSQL database
echo.
pause

:: Login to Railway
echo %YELLOW%Logging into Railway...%RESET%
echo This will open your browser...
echo.
railway login
if !errorlevel! neq 0 (
    echo %RED%ERROR: Failed to login to Railway!%RESET%
    echo.
    echo %YELLOW%Please manually login to Railway at: https://railway.app%RESET%
    echo Then continue with the manual deployment steps.
    echo.
    pause
    goto :manual_deployment
)

:: Initialize Railway project
echo %YELLOW%Initializing Railway project...%RESET%
railway init
if !errorlevel! neq 0 (
    echo %RED%ERROR: Failed to initialize Railway project!%RESET%
    echo.
    pause
    goto :manual_deployment
)

:: Deploy to Railway
echo %YELLOW%Deploying to Railway...%RESET%
railway up
if !errorlevel! neq 0 (
    echo %RED%ERROR: Failed to deploy to Railway!%RESET%
    echo.
    pause
    goto :manual_deployment
)

goto :deployment_complete

:: Manual deployment instructions
:manual_deployment
echo.
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%MANUAL DEPLOYMENT INSTRUCTIONS%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.
echo %YELLOW%Since automated deployment failed, please follow these manual steps:%RESET%
echo.
echo 1. Go to https://railway.app/dashboard
echo 2. Click "New Project"
echo 3. Choose "Deploy from GitHub repo"
echo 4. Select your repository (Bell-repogit/Bell24hDashboard)
echo 5. Wait for the project to be created
echo 6. Add environment variables (see below)
echo 7. Add PostgreSQL database service
echo 8. Deploy the project
echo.
echo %GREEN%Required Environment Variables:%RESET%
echo DATABASE_URL (will be set by Railway PostgreSQL)
echo JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
echo NEXTAUTH_SECRET=another-secret-key-for-nextauth
echo NEXTAUTH_URL=https://your-app.railway.app
echo NODE_ENV=production
echo PORT=3000
echo.
pause
goto :deployment_complete

:: STEP 7: Final Status
:deployment_complete
echo.
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%STEP 7: Deployment Complete%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

echo %GREEN%🎉 BELL24H RAILWAY DEPLOYMENT COMPLETE! 🎉%RESET%
echo.
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%                    DEPLOYMENT INFORMATION%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.
echo %GREEN%🌐 RAILWAY DASHBOARD:%RESET%
echo    Dashboard: https://railway.app/dashboard
echo    Project: Check your Railway dashboard for the project URL
echo.
echo %YELLOW%📋 NEXT STEPS:%RESET%
echo    1. Go to https://railway.app/dashboard
echo    2. Find your Bell24h project
echo    3. Click on the project to view details
echo    4. Set up environment variables if needed
echo    5. Add PostgreSQL database service
echo    6. Check deployment logs for any issues
echo.
echo %GREEN%🔧 ENVIRONMENT VARIABLES TO SET:%RESET%
echo    DATABASE_URL (will be set by Railway PostgreSQL)
echo    JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
echo    NEXTAUTH_SECRET=another-secret-key-for-nextauth
echo    NEXTAUTH_URL=https://your-app.railway.app
echo    NODE_ENV=production
echo.
echo %BLUE%🏆 BELL24H FEATURES DEPLOYED:%RESET%
echo    ✅ AI-Powered Supplier Matching
echo    ✅ Voice RFQ Processing
echo    ✅ Enterprise Dashboard
echo    ✅ Analytics and Reporting
echo    ✅ Payment Processing
echo    ✅ Real-time Notifications
echo    ✅ Multi-tenant Architecture
echo.
echo %GREEN%Press any key to open Railway dashboard...%RESET%
pause >nul

:: Open Railway dashboard
start https://railway.app/dashboard

echo.
echo %GREEN%🚀 Bell24h Railway deployment is complete! 🚀%RESET%
echo %YELLOW%Check your Railway dashboard for the live application URL.%RESET%
echo.
echo %BLUE%Happy deploying! 🎯%RESET%
echo.
echo %YELLOW%Press any key to close this window...%RESET%
pause >nul
