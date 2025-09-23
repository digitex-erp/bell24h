@echo off
echo ========================================
echo TESTING OTP WITH REAL PHONE NUMBER
echo ========================================
echo.
echo This is CRITICAL - you need to test with your actual phone.
echo.

echo [1] Starting Bell24h development server...
cd client
start "Bell24h Dev Server" cmd /k "npm run dev"

echo [2] Server starting... Wait 30 seconds then:
echo.
echo 1. Go to: http://localhost:3000
echo 2. Click "Login" or "Register"
echo 3. Enter YOUR real phone number
echo 4. Check if you receive the OTP SMS
echo 5. Enter the OTP and verify it works
echo.
echo ⚠️  CRITICAL: If OTP doesn't work, your beta launch will fail!
echo.
echo MSG91 Configuration Check:
echo - Auth Key: 468517Ak5rJ0vb7NDV68c24863P1
echo - Sender ID: BELL24H
echo.
echo Test with your phone: +91XXXXXXXXXX
echo.
echo After testing, close this window and proceed to deployment.
echo.
pause
