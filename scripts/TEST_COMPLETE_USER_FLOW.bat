@echo off
echo.
echo ================================================================
echo 🚀 TESTING COMPLETE USER FLOW - BELL24H SYSTEM
echo ================================================================
echo.

echo 📋 TESTING PLAN:
echo 1. ✅ Test Mobile OTP Login API
echo 2. ✅ Test RFQ Creation with Voice Input
echo 3. ✅ Test N8N Dashboard Access
echo 4. ✅ Test Complete End-to-End Flow
echo.

echo 🔧 STARTING SERVICES:
echo =====================================
echo Starting Bell24h application...
start "Bell24h App" cmd /k "cd client && npm run dev"

echo Waiting for app to initialize...
timeout /t 8 /nobreak

echo Starting N8N service...
start "N8N Service" cmd /k "n8n start --tunnel"

echo Waiting for N8N to initialize...
timeout /t 10 /nobreak

echo.
echo 🌐 OPENING TEST PAGES:
echo =====================================

echo 1. Opening Mobile OTP Login (FIXED)...
start http://localhost:3000/auth/login

echo 2. Opening RFQ Creation (Voice Input FIXED)...
start http://localhost:3000/rfq/create

echo 3. Opening N8N Dashboard (RESTARTED)...
start http://localhost:5678

echo 4. Opening Admin Dashboard...
start http://localhost:3000/admin/autonomous-system

echo.
echo 🧪 TESTING CHECKLIST:
echo =====================================
echo.
echo 📱 TEST 1: Mobile OTP Login
echo =====================================
echo Steps:
echo 1. Go to: http://localhost:3000/auth/login
echo 2. Enter phone number: 9867638113
echo 3. Click "Send Mobile OTP"
echo 4. Enter OTP: 123456
echo 5. Click "Verify Mobile OTP"
echo.
echo ✅ Expected Result: Login successful, redirect to dashboard
echo ❌ If fails: Check browser console for errors
echo.

echo 🎤 TEST 2: Voice Input in RFQ Creation
echo =====================================
echo Steps:
echo 1. Go to: http://localhost:3000/rfq/create
echo 2. Click "Voice Input" button
echo 3. Wait for voice simulation (3 seconds)
echo 4. Check description field
echo.
echo ✅ Expected Result: Voice text added without duplication
echo ❌ If fails: Text should not duplicate "[Voice input: ...]"
echo.

echo 🤖 TEST 3: N8N Dashboard Access
echo =====================================
echo Steps:
echo 1. Go to: http://localhost:5678
echo 2. Check if N8N dashboard loads
echo 3. Look for workflow interface
echo.
echo ✅ Expected Result: N8N dashboard opens successfully
echo ❌ If fails: Connection refused error
echo.

echo 🔄 TEST 4: Complete End-to-End Flow
echo =====================================
echo Steps:
echo 1. Login with mobile OTP (Test 1)
echo 2. Navigate to RFQ creation
echo 3. Test voice input (Test 2)
echo 4. Create an RFQ
echo 5. Check N8N dashboard (Test 3)
echo.
echo ✅ Expected Result: Complete flow works without errors
echo ❌ If fails: Any step fails in the sequence
echo.

echo 📊 TEST RESULTS TRACKING:
echo =====================================
echo.
echo Mobile OTP Login:     [ ] PASS  [ ] FAIL
echo Voice Input Fix:      [ ] PASS  [ ] FAIL  
echo N8N Dashboard:        [ ] PASS  [ ] FAIL
echo Complete Flow:        [ ] PASS  [ ] FAIL
echo.

echo 🎯 SUCCESS CRITERIA:
echo =====================================
echo ✅ OTP 123456 works for any phone number
echo ✅ Voice input adds text without duplication
echo ✅ N8N dashboard is accessible at localhost:5678
echo ✅ Complete user journey works end-to-end
echo.

echo 🚨 TROUBLESHOOTING:
echo =====================================
echo If Mobile OTP fails:
echo - Check browser console for API errors
echo - Verify API endpoint is /api/auth/verify-otp
echo - Ensure test OTP 123456 is accepted
echo.

echo If Voice Input fails:
echo - Check if text duplicates
echo - Verify voice button works
echo - Check description field updates
echo.

echo If N8N Dashboard fails:
echo - Wait longer for N8N to install
echo - Check if port 5678 is available
echo - Restart N8N service
echo.

echo 📈 EXPECTED PERFORMANCE:
echo =====================================
echo - OTP verification: < 2 seconds
echo - Voice input simulation: 3 seconds
echo - N8N dashboard load: < 10 seconds
echo - Complete flow: < 30 seconds
echo.

echo 🎉 READY TO TEST!
echo ================================================================
echo.
echo All pages are now open for testing.
echo Follow the testing checklist above.
echo Report any failures immediately.
echo.

pause
