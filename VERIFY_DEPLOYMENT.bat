@echo off
echo ========================================
echo BELL24H DEPLOYMENT VERIFICATION
echo ========================================
echo.

echo [1] Opening your deployed site...
echo Please provide your Vercel URL (e.g., https://bell24h-xxxx.vercel.app)
set /p VERCEL_URL=Enter your Vercel URL: 

echo.
echo [2] Testing deployment...
echo Opening browser to test your site...

start "" "%VERCEL_URL%"

echo.
echo [3] Testing compliance pages...
echo Testing Privacy Policy...
start "" "%VERCEL_URL%/privacy"
timeout /t 2 /nobreak >nul

echo Testing Terms of Service...
start "" "%VERCEL_URL%/terms"
timeout /t 2 /nobreak >nul

echo Testing Refund Policy...
start "" "%VERCEL_URL%/refund"
timeout /t 2 /nobreak >nul

echo Testing Contact Page...
start "" "%VERCEL_URL%/contact"
timeout /t 2 /nobreak >nul

echo.
echo [4] Quick tests to perform manually:
echo □ Homepage loads correctly
echo □ Beta disclaimer is visible
echo □ All compliance pages load (opened above)
echo □ Mobile responsive (test on phone)
echo □ OTP registration works (test with your phone)
echo.

echo [5] Speed test...
echo Opening Pingdom speed test...
start "" "https://tools.pingdom.com"
echo Enter your URL: %VERCEL_URL%
echo Target: Load time under 3 seconds

echo.
echo [6] Mobile test...
echo Opening Google Mobile Test...
start "" "https://search.google.com/test/mobile-friendly"
echo Enter your URL: %VERCEL_URL%
echo Target: "Page is mobile friendly"

echo.
echo ========================================
echo VERIFICATION COMPLETE!
echo ========================================
echo.
echo If all tests pass, you're ready for beta launch!
echo.
echo NEXT: Create WhatsApp group for beta testing
echo Send this message:
echo.
echo "Hi! I'm launching my B2B platform Bell24h.
echo Please help test it:
echo 1. Visit: %VERCEL_URL%
echo 2. Register with your phone
echo 3. Create a fake company profile
echo 4. Submit a test RFQ
echo 5. Send me screenshots of any errors
echo First 5 testers get ₹100 Paytm!"
echo.
pause
