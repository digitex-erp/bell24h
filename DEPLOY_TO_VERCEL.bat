@echo off
echo ========================================
echo DEPLOYING TO VERCEL - STEP 2
echo ========================================
echo.

echo [1] Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo [2] Logging into Vercel...
echo You'll need to:
echo 1. Open browser
echo 2. Login with GitHub/Google
echo 3. Authorize Vercel
vercel login

echo [3] Deploying to production...
echo When prompted:
echo - Set up and deploy: Y
echo - Which scope: Select your account
echo - Link to existing project: N (if first time)
echo - Project name: bell24h
echo - Directory: ./
echo - Override settings: N
echo.
vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Bell24h beta is now live!
echo Save this URL: https://bell24h-xxxx.vercel.app
echo.
echo NEXT STEPS (Tomorrow):
echo 1. Test site speed: https://tools.pingdom.com
echo 2. Test mobile: https://search.google.com/test/mobile-friendly
echo 3. Test OTP with your phone number
echo 4. Create WhatsApp group for beta testing
echo.
echo SUCCESS CRITERIA FOR SEPT 22:
echo - 10 successful registrations
echo - 5 completed RFQs
echo - No major crashes
echo.
pause
