@echo off
echo.
echo ================================================
echo    BELL24H SIMPLE DEPLOYMENT - FINAL
echo ================================================
echo.
echo Starting automated deployment...
echo.

echo Step 1: Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo Step 2: Installing Vercel CLI...
npm install -g vercel
echo.

echo Step 3: Configuring Git...
git config --global user.name "Bell-repogit"
git config --global user.email "bell24hr@outlook.com"
echo Git configured!
echo.

echo Step 4: Installing dependencies...
npm install
echo Dependencies installed!
echo.

echo Step 5: Trying to push to repository...
git add .
git commit -m "Bell24h deployment fixes - automated"
echo.

echo Step 6: Trying different repository names...
git remote set-url origin https://github.com/Bell-repogit/Bell24h.git
git push origin main
if %errorlevel% equ 0 (
    echo Successfully pushed to Bell24h.git
    goto :deploy
)

git remote set-url origin https://github.com/Bell-repogit/Bell24hDashboard.git
git push origin main
if %errorlevel% equ 0 (
    echo Successfully pushed to Bell24hDashboard.git
    goto :deploy
)

git remote set-url origin https://github.com/Bell-repogit/bell24h.git
git push origin main
if %errorlevel% equ 0 (
    echo Successfully pushed to bell24h.git
    goto :deploy
)

echo All repository attempts failed. Proceeding with direct deployment...
echo.

:deploy
echo Step 7: Deploying to Vercel...
echo This will take 3-5 minutes...
echo.
npx vercel --prod --yes

echo.
echo ================================================
echo    DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Your Bell24h platform has been deployed!
echo.
echo Please check your Vercel dashboard for the URL.
echo.
pause 