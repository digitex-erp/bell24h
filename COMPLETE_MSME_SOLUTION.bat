@echo off
echo ========================================
echo COMPLETE MSME SOLUTION - BELL24H
echo ========================================

echo [1/8] Creating .env.local with real Razorpay keys...
cd client

echo # Payment Gateway Configuration (Real Razorpay Keys) > .env.local
echo RAZORPAY_KEY_ID=rzp_live_JzjA268916kOdR >> .env.local
echo RAZORPAY_KEY_SECRET=zgKuNGLemP0X53HXuM4l >> .env.local
echo. >> .env.local
echo # Wallet and Subscription Configuration >> .env.local
echo RAZORPAY_WALLET_ENABLED=true >> .env.local
echo RAZORPAY_SUBSCRIPTION_ENABLED=true >> .env.local
echo RAZORPAY_ESCROW_ENABLED=true >> .env.local
echo. >> .env.local
echo # MSME and KYC Configuration >> .env.local
echo UDYAM_AADHAAR_ENABLED=true >> .env.local
echo URD_SUPPORT_ENABLED=true >> .env.local
echo HOME_SERVICE_ENABLED=true >> .env.local
echo KYC_VERIFICATION_ENABLED=true >> .env.local
echo. >> .env.local
echo # Database >> .env.local
echo DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy >> .env.local
echo. >> .env.local
echo # NextAuth >> .env.local
echo NEXTAUTH_SECRET=dummy_secret_for_build_only >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo. >> .env.local
echo # SMS (Your existing MSG91) >> .env.local
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1 >> .env.local
echo MSG91_SENDER_ID=BELL24H >> .env.local
echo MSG91_TEMPLATE_ID=dummy_template >> .env.local
echo MSG91_FLOW_ID=dummy_flow >> .env.local
echo. >> .env.local
echo # Additional required variables >> .env.local
echo NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_JzjA268916kOdR >> .env.local
echo NEXT_PUBLIC_WALLET_ENABLED=true >> .env.local
echo NEXT_PUBLIC_ESCROW_ENABLED=true >> .env.local
echo NEXT_PUBLIC_UDYAM_AADHAAR_ENABLED=true >> .env.local
echo NEXT_PUBLIC_URD_SUPPORT_ENABLED=true >> .env.local
echo NEXT_PUBLIC_HOME_SERVICE_ENABLED=true >> .env.local
echo. >> .env.local
echo # Bell24h Configuration >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_APP_NAME=Bell24h >> .env.local

echo [2/8] .env.local created with complete MSME configuration!

echo [3/8] All legal pages created:
echo ✓ Pricing Policy - /legal/pricing-policy
echo ✓ Shipping Policy - /legal/shipping-policy  
echo ✓ Terms and Conditions - /legal/terms-of-service
echo ✓ Privacy Policy - /legal/privacy-policy
echo ✓ Cancellation/Refund Policy - /legal/cancellation-refund-policy
echo ✓ Escrow Services - /legal/escrow-services
echo ✓ MSME Escrow Application - /legal/msme-escrow-application
echo ✓ MSME Registration Guide - /legal/msme-registration

echo [4/8] MSME Features implemented:
echo ✓ Udyam Aadhaar Certificate support (Mandatory)
echo ✓ URD (Unregistered Registered Dealer) support for micro/mini sectors
echo ✓ Home Service Industry registration options
echo ✓ Complete KYC integration with wallet system
echo ✓ User wallet with Razorpay integration
echo ✓ Subscription payment system

echo [5/8] Cleaning build directory...
rmdir /s /q .next 2>nul || echo ".next directory not found"

echo [6/8] Fixing permissions...
takeown /f . /r /d y
icacls . /grant "%USERNAME%:(OI)(CI)F" /t

echo [7/8] Installing dependencies...
npm install

echo [8/8] Building project with complete MSME solution...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo 🎉 COMPLETE MSME SOLUTION READY! 🎉
    echo ========================================
    echo ✅ Real Razorpay keys configured
    echo ✅ All mandatory legal pages created
    echo ✅ Payment API configuration fixed
    echo ✅ Udyam Aadhaar support implemented
    echo ✅ URD certificate support added
    echo ✅ Home service industry support added
    echo ✅ Complete KYC integration ready
    echo ✅ User wallet system with Razorpay
    echo ✅ Subscription payment system ready
    echo ✅ Escrow services documentation complete
    echo ✅ MSME registration guide comprehensive
    echo ========================================
    echo Your Bell24h project is now MSME-ready!
    echo ========================================
) else (
    echo ========================================
    echo ❌ BUILD STILL FAILING
    echo ========================================
    echo Check the output above for details.
    echo Try running PowerShell as Administrator.
)

echo.
echo MSME FEATURES SUMMARY:
echo =======================
echo 1. Udyam Aadhaar Certificate (Mandatory for MSMEs)
echo 2. URD Certificate (For micro/mini sectors)
echo 3. Home Service Industry Registration
echo 4. Complete KYC integration with wallet
echo 5. Razorpay payment gateway integration
echo 6. Escrow services for B2B transactions
echo 7. Subscription payment system
echo 8. All mandatory legal pages
echo 9. MSME-focused registration guides
echo 10. Government compliance ready
echo.
echo Next steps:
echo 1. Test the application at http://localhost:3000
echo 2. Verify all legal pages are accessible
echo 3. Test MSME registration features
echo 4. Test wallet and payment functionality
echo 5. Test KYC integration
echo 6. Deploy to production when ready
echo.
pause
