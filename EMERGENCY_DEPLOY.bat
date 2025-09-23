@echo off
echo ========================================
echo EMERGENCY BELL24H BETA DEPLOYMENT
echo ========================================
echo.

cd /d "C:\Users\Sanika\Projects\bell24h\client"

echo [1/3] Installing dependencies...
call npm install --silent

echo [2/3] Building with emergency config...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Creating emergency HTML fallback...
    echo ^<!DOCTYPE html^> > ..\emergency-site.html
    echo ^<html^> >> ..\emergency-site.html
    echo ^<head^>^<title^>Bell24h - Coming Soon^</title^>^</head^> >> ..\emergency-site.html
    echo ^<body style="font-family:Arial;text-align:center;padding:50px;"^> >> ..\emergency-site.html
    echo ^<h1^>Bell24h - Beta Launch^</h1^> >> ..\emergency-site.html
    echo ^<p^>We're launching our beta today!^</p^> >> ..\emergency-site.html
    echo ^<p^>Contact: +91 90049 62871^</p^> >> ..\emergency-site.html
    echo ^</body^>^</html^> >> ..\emergency-site.html
    echo.
    echo Emergency HTML created at: C:\Users\Sanika\Projects\bell24h\emergency-site.html
    echo Deploy this to Netlify as backup!
    pause
    exit /b 1
)

echo [3/3] Deploying to Vercel...
call npx vercel --prod --yes

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ VERCEL DEPLOY FAILED!
    echo.
    echo Alternative: Deploy the 'out' folder to Netlify manually
    echo 1. Go to netlify.com
    echo 2. Drag the 'out' folder to deploy
    echo 3. Get your live URL
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ DEPLOYMENT SUCCESSFUL!
echo.
echo Your beta site should be live now!
echo Check your Vercel dashboard for the URL.
echo.
pause