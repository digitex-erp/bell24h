@echo off
echo ================================================================
echo BELL24H RAILWAY DEPLOYMENT SCRIPT
echo ================================================================
echo.
echo Starting Bell24H Railway deployment process...
echo.
echo This window will stay open so you can see the progress.
echo If you see any errors, please read them before closing.
echo.
pause

:: Get current directory
set "PROJECT_ROOT=%cd%"
echo Project Root: %PROJECT_ROOT%
echo.

:: STEP 1: Check Node.js and npm
echo ================================================================
echo STEP 1: Checking Node.js and npm
echo ================================================================
echo.

echo Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js first.
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
    echo ERROR: npm not found! Please install npm first.
    echo.
    echo Please install npm or reinstall Node.js.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo OK: Node.js and npm are available
echo.
pause

:: STEP 2: Install dependencies
echo ================================================================
echo STEP 2: Installing project dependencies
echo ================================================================
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    npm install
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install dependencies!
        echo.
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
) else (
    echo OK: Dependencies already installed
)
echo.
pause

:: STEP 3: Install Railway CLI
echo ================================================================
echo STEP 3: Installing Railway CLI
echo ================================================================
echo.

echo Installing Railway CLI...
echo This may take a moment...
echo.
npm install -g @railway/cli
if !errorlevel! neq 0 (
    echo ERROR: Failed to install Railway CLI!
    echo.
    echo Trying alternative installation method...
    echo.
    npm install @railway/cli
    if !errorlevel! neq 0 (
        echo ERROR: Failed to install Railway CLI with both methods!
        echo.
        echo Please try installing manually: npm install -g @railway/cli
        echo Then run this script again.
        echo.
        pause
        exit /b 1
    )
)
echo OK: Railway CLI installed
echo.
pause

:: STEP 4: Initialize Git repository
echo ================================================================
echo STEP 4: Setting up Git repository
echo ================================================================
echo.

if not exist ".git" (
    echo Initializing Git repository...
    git init
    if !errorlevel! neq 0 (
        echo ERROR: Failed to initialize Git repository!
        echo.
        echo Please ensure Git is installed on your system.
        echo Download from: https://git-scm.com/
        echo.
        pause
        exit /b 1
    )
    git config --global user.name "Bell24h Deployment"
    git config --global user.email "deploy@bell24h.com"
    echo OK: Git repository initialized
) else (
    echo OK: Git repository already exists
)

:: Add all files to Git
echo Adding files to Git...
git add .
if !errorlevel! neq 0 (
    echo ERROR: Failed to add files to Git!
    echo.
    pause
    exit /b 1
)

git commit -m "Bell24h Railway deployment - complete project" --allow-empty
if !errorlevel! neq 0 (
    echo ERROR: Failed to commit files to Git!
    echo.
    pause
    exit /b 1
)
echo OK: Files committed to Git
echo.
pause

:: STEP 5: Railway Deployment
echo ================================================================
echo STEP 5: Railway Deployment
echo ================================================================
echo.

echo Starting Railway deployment...
echo This will open Railway in your browser for authentication.
echo.
echo IMPORTANT: You will need to:
echo 1. Sign in to Railway in your browser
echo 2. Create a new project
echo 3. Set up environment variables
echo 4. Add a PostgreSQL database
echo.
pause

:: Login to Railway
echo Logging into Railway...
echo This will open your browser...
echo.
railway login
if !errorlevel! neq 0 (
    echo ERROR: Failed to login to Railway!
    echo.
    echo Please manually login to Railway at: https://railway.app
    echo Then continue with the manual deployment steps.
    echo.
    pause
    goto :manual_deployment
)

:: Initialize Railway project
echo Initializing Railway project...
railway init
if !errorlevel! neq 0 (
    echo ERROR: Failed to initialize Railway project!
    echo.
    pause
    goto :manual_deployment
)

:: Deploy to Railway
echo Deploying to Railway...
railway up
if !errorlevel! neq 0 (
    echo ERROR: Failed to deploy to Railway!
    echo.
    pause
    goto :manual_deployment
)

goto :deployment_complete

:: Manual deployment instructions
:manual_deployment
echo.
echo ================================================================
echo MANUAL DEPLOYMENT INSTRUCTIONS
echo ================================================================
echo.
echo Since automated deployment failed, please follow these manual steps:
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
echo Required Environment Variables:
echo DATABASE_URL (will be set by Railway PostgreSQL)
echo JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
echo NEXTAUTH_SECRET=another-secret-key-for-nextauth
echo NEXTAUTH_URL=https://your-app.railway.app
echo NODE_ENV=production
echo PORT=3000
echo.
pause
goto :deployment_complete

:: STEP 6: Final Status
:deployment_complete
echo.
echo ================================================================
echo STEP 6: Deployment Complete
echo ================================================================
echo.

echo SUCCESS: BELL24H RAILWAY DEPLOYMENT COMPLETE!
echo.
echo ================================================================
echo                    DEPLOYMENT INFORMATION
echo ================================================================
echo.
echo RAILWAY DASHBOARD:
echo    Dashboard: https://railway.app/dashboard
echo    Project: Check your Railway dashboard for the project URL
echo.
echo NEXT STEPS:
echo    1. Go to https://railway.app/dashboard
echo    2. Find your Bell24h project
echo    3. Click on the project to view details
echo    4. Set up environment variables if needed
echo    5. Add PostgreSQL database service
echo    6. Check deployment logs for any issues
echo.
echo ENVIRONMENT VARIABLES TO SET:
echo    DATABASE_URL (will be set by Railway PostgreSQL)
echo    JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
echo    NEXTAUTH_SECRET=another-secret-key-for-nextauth
echo    NEXTAUTH_URL=https://your-app.railway.app
echo    NODE_ENV=production
echo.
echo BELL24H FEATURES DEPLOYED:
echo    - AI-Powered Supplier Matching
echo    - Voice RFQ Processing
echo    - Enterprise Dashboard
echo    - Analytics and Reporting
echo    - Payment Processing
echo    - Real-time Notifications
echo    - Multi-tenant Architecture
echo.
echo Press any key to open Railway dashboard...
pause >nul

:: Open Railway dashboard
start https://railway.app/dashboard

echo.
echo SUCCESS: Bell24h Railway deployment is complete!
echo Check your Railway dashboard for the live application URL.
echo.
echo Happy deploying!
echo.
echo Press any key to close this window...
pause >nul
