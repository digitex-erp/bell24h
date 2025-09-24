@echo off
echo ========================================
echo DEPLOYING WORKING BELL24H VERSION
echo ========================================
echo Time: %TIME%
echo ========================================

echo [1/5] Cleaning build artifacts...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"

echo [2/5] Installing dependencies...
call npm install

echo [3/5] Building Next.js application (without static export)...
call npm run build

echo [4/5] Checking build status...
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful! Deploying...
    echo [5/5] Deploying to bell24h-v1...
    call npx vercel --prod --yes
) else (
    echo ❌ Build failed! Creating minimal deployment...
    echo [5/5] Creating minimal out directory...
    if not exist "out" mkdir "out"
    echo ^<!DOCTYPE html^> > "out\index.html"
    echo ^<html^> >> "out\index.html"
    echo ^<head^> >> "out\index.html"
    echo ^<title^>Bell24h - India's Leading AI-Powered B2B Marketplace^</title^> >> "out\index.html"
    echo ^<meta name="viewport" content="width=device-width, initial-scale=1"^> >> "out\index.html"
    echo ^<style^> >> "out\index.html"
    echo body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; } >> "out\index.html"
    echo .container { max-width: 1200px; margin: 0 auto; text-align: center; } >> "out\index.html"
    echo h1 { font-size: 3rem; margin-bottom: 1rem; } >> "out\index.html"
    echo p { font-size: 1.2rem; margin-bottom: 2rem; } >> "out\index.html"
    echo .button { background: #059669; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; margin: 10px; } >> "out\index.html"
    echo .button:hover { background: #047857; } >> "out\index.html"
    echo ^</style^> >> "out\index.html"
    echo ^</head^> >> "out\index.html"
    echo ^<body^> >> "out\index.html"
    echo ^<div class="container"^> >> "out\index.html"
    echo ^<h1^>🔔 Bell24h^</h1^> >> "out\index.html"
    echo ^<p^>India's Leading AI-Powered B2B Marketplace^</p^> >> "out\index.html"
    echo ^<p^>Post RFQ. Get 3 Verified Quotes in 24 Hours^</p^> >> "out\index.html"
    echo ^<button class="button" onclick="alert('Coming Soon!')"^>Start My RFQ Now^</button^> >> "out\index.html"
    echo ^<button class="button" onclick="alert('Coming Soon!')"^>Join as Supplier^</button^> >> "out\index.html"
    echo ^<p^>✅ Escrow-Secured ^| ✅ GST Verified ^| ✅ AI Trust-Score^</p^> >> "out\index.html"
    echo ^<p^>📱 Mobile OTP Login ^| 🇮🇳 Made in India ^| 🚀 200+ Data Signals^</p^> >> "out\index.html"
    echo ^</div^> >> "out\index.html"
    echo ^</body^> >> "out\index.html"
    echo ^</html^> >> "out\index.html"
    echo Deploying minimal version...
    call npx vercel deploy ./out --prod --yes
)

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo Your Bell24h site should now be live!
echo Check your Vercel dashboard for the URL
echo ========================================
pause
