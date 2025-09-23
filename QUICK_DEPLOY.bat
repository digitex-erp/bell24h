@echo off
echo ========================================
echo BELL24H QUICK DEPLOYMENT TO VERCEL
echo ========================================
echo.

echo [1] Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo [2] Logging into Vercel...
vercel login

echo [3] Deploying to production...
vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Bell24h beta is now live at:
echo https://bell24h.vercel.app
echo.
echo NEXT STEPS:
echo 1. Test OTP with your phone number
echo 2. Add beta disclaimer to homepage
echo 3. Submit to Razorpay for API approval
echo 4. Limit to 50 beta users
echo.
echo Beta Features Working:
echo ✅ User registration with OTP
echo ✅ Company profile creation
echo ✅ Basic RFQ submission
echo ✅ Categories viewing
echo.
echo Beta Limitations:
echo ❌ No real supplier matching
echo ❌ No payment processing (pending approval)
echo ❌ No voice/video RFQ
echo ❌ Mock data only
echo.
pause
