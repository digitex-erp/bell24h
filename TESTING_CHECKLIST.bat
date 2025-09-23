@echo off
echo ========================================
echo BELL24H TESTING CHECKLIST - SEPT 19-22
echo ========================================
echo.

echo TODAY (Sept 19) - Fix & Deploy:
echo □ Run FIX_BUILD_ERROR.bat
echo □ Run DEPLOY_TO_VERCEL.bat
echo □ Save your Vercel URL
echo.

echo TOMORROW (Sept 20) - Basic Testing:
echo □ Speed test: https://tools.pingdom.com
echo □ Mobile test: https://search.google.com/test/mobile-friendly
echo □ Personal testing with your phone
echo.

echo Sept 21 - Friends Testing:
echo □ Create WhatsApp group "Bell24h Beta Testers"
echo □ Add 5-10 friends/family
echo □ Send test message with your Vercel URL
echo □ Create Google Form for feedback
echo.

echo Sept 22 - Launch Day:
echo □ Check site is live
echo □ Test OTP one more time
echo □ Enable Hotjar
echo □ Post on LinkedIn/WhatsApp
echo □ Monitor Vercel dashboard
echo.

echo SUCCESS METRICS:
echo Minimum: 10 registrations, 5 RFQs, no crashes
echo Good: 25 registrations, 10 RFQs, <5%% error rate
echo Great: 50+ registrations, 20+ RFQs, positive feedback
echo.

echo EMERGENCY FIXES:
echo - OTP not working: Check MSG91 credits, verify phone format
echo - Site not loading: Check Vercel dashboard, redeploy
echo - Users can't register: Temporarily disable validation
echo.

echo START WITH: FIX_BUILD_ERROR.bat
echo.
pause
