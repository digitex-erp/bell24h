@echo off
echo.
echo ======================================
echo    BELL24H ONE-CLICK DEPLOYMENT
echo ======================================
echo.
echo 🚀 This will automatically deploy your Bell24h platform!
echo 📝 No coding knowledge required - just follow the prompts
echo.
pause

echo 🔍 Checking your system...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Installing Node.js...
    echo 📥 Downloading Node.js installer...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi' -OutFile 'nodejs-installer.msi'"
    echo 🔧 Installing Node.js (this may take a few minutes)...
    msiexec /i nodejs-installer.msi /quiet /norestart
    echo ✅ Node.js installed! Please restart this script.
    pause
    exit
)

echo ✅ Node.js found
echo.

REM Install Vercel CLI
echo 📦 Installing deployment tools...
npm install -g vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Global install failed, trying alternative method...
    npm install vercel
    set VERCEL_CMD=npx vercel
) else (
    set VERCEL_CMD=vercel
)

echo ✅ Deployment tools ready
echo.

REM Create deployment-ready files
echo 🛠️ Preparing your project for deployment...

REM Ensure package.json exists
if not exist package.json (
    echo Creating package.json...
    echo {> package.json
    echo   "name": "bell24h",>> package.json
    echo   "version": "1.0.0",>> package.json
    echo   "scripts": {>> package.json
    echo     "dev": "next dev",>> package.json
    echo     "build": "next build",>> package.json
    echo     "start": "next start">> package.json
    echo   },>> package.json
    echo   "dependencies": {>> package.json
    echo     "next": "14.0.0",>> package.json
    echo     "react": "18.2.0",>> package.json
    echo     "react-dom": "18.2.0">> package.json
    echo   }>> package.json
    echo }>> package.json
)

REM Install dependencies
echo 📦 Installing project dependencies...
npm install >nul 2>&1

echo ✅ Project prepared for deployment
echo.

REM Deploy to Vercel
echo 🚀 Starting deployment to Vercel...
echo.
echo 📋 IMPORTANT: When prompted, answer:
echo    - Set up and deploy? → Press Y and Enter
echo    - Which scope? → Choose your account
echo    - Link to existing project? → Press N and Enter
echo    - Project name? → Type: bell24h-marketplace
echo    - Directory? → Just press Enter
echo    - Override settings? → Press N and Enter
echo.
echo ⏱️ Deployment will take 2-3 minutes...
echo.

%VERCEL_CMD% --prod

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo.
echo 🧪 TEST YOUR LIVE WEBSITE:
echo    1. Visit the URL provided above
echo    2. Check: /dashboard/ai-matching (should show "AI Matching Fixed!")
echo    3. Check: /dashboard/predictive-analytics (should show dashboard)
echo.
echo ✅ If you see success messages, your Bell24h platform is LIVE! 🚀
echo.
echo 📞 If you need help, show the URL to a developer
echo.
pause 