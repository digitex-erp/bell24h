@echo off
echo ========================================
echo RAZORPAY API APPROVAL SUBMISSION
echo ========================================
echo.

echo Please provide your deployed Vercel URL:
set /p VERCEL_URL=Enter your Vercel URL: 

echo.
echo [1] Creating Razorpay submission email...
echo.
echo Subject: Live Website Ready for API Approval > razorpay_submission.txt
echo. >> razorpay_submission.txt
echo Dear Razorpay Team, >> razorpay_submission.txt
echo. >> razorpay_submission.txt
echo Our B2B marketplace website is now live and ready for review: >> razorpay_submission.txt
echo. >> razorpay_submission.txt
echo URL: %VERCEL_URL% >> razorpay_submission.txt
echo. >> razorpay_submission.txt
echo Compliance Pages: >> razorpay_submission.txt
echo - Privacy Policy: %VERCEL_URL%/privacy >> razorpay_submission.txt
echo - Terms of Service: %VERCEL_URL%/terms >> razorpay_submission.txt
echo - Refund Policy: %VERCEL_URL%/refund >> razorpay_submission.txt
echo - Contact: %VERCEL_URL%/contact >> razorpay_submission.txt
echo. >> razorpay_submission.txt
echo Business Type: B2B Marketplace with Escrow Services >> razorpay_submission.txt
echo Expected Volume: ₹25L-50L monthly >> razorpay_submission.txt
echo. >> razorpay_submission.txt
echo Please review and approve our API access. >> razorpay_submission.txt
echo. >> razorpay_submission.txt
echo Regards, >> razorpay_submission.txt
echo Bell24h Team >> razorpay_submission.txt

echo ✅ Email draft created: razorpay_submission.txt

echo.
echo [2] Opening Razorpay dashboard...
start "" "https://dashboard.razorpay.com/signin"

echo.
echo [3] Opening email client...
start "" "mailto:support@razorpay.com?subject=Live Website Ready for API Approval"

echo.
echo [4] Compliance checklist:
echo □ Company Information in footer
echo □ GST Number displayed (if available)
echo □ Physical Address shown
echo □ Support Email functional
echo □ Phone Number reachable
echo □ All legal pages working
echo.

echo [5] Next steps:
echo 1. Copy email content from razorpay_submission.txt
echo 2. Send to Razorpay support
echo 3. Wait 24-48 hours for approval
echo 4. Update environment variables with real keys
echo 5. Redeploy with live payment integration
echo.

echo ========================================
echo RAZORPAY SUBMISSION READY!
echo ========================================
echo.
echo Email draft saved to: razorpay_submission.txt
echo Send this to Razorpay support for API approval
echo.
pause
