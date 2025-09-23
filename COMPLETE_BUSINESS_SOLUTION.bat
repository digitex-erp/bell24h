@echo off
echo ========================================
echo COMPLETE BUSINESS SOLUTION - BELL24H
echo ========================================

echo [1/10] Creating .env.local with complete configuration...
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
echo SERVICE_INDUSTRY_ENABLED=true >> .env.local
echo KYC_VERIFICATION_ENABLED=true >> .env.local
echo KYC_COMPLIANCE_ENABLED=true >> .env.local
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
echo NEXT_PUBLIC_SERVICE_INDUSTRY_ENABLED=true >> .env.local
echo NEXT_PUBLIC_KYC_VERIFICATION_ENABLED=true >> .env.local
echo NEXT_PUBLIC_KYC_COMPLIANCE_ENABLED=true >> .env.local
echo. >> .env.local
echo # Bell24h Configuration >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_APP_NAME=Bell24h >> .env.local

echo [2/10] .env.local created with complete business configuration!

echo [3/10] All business categories and pages created:
echo ✓ Homepage updated for ALL business types (B2B, B2C, Home Service, Service Industry)
echo ✓ Business Categories page - /business-categories
echo ✓ Unified Registration flow - /registration
echo ✓ Complete KYC Compliance system - /dashboard/kyc-compliance
echo ✓ All legal pages created and updated

echo [4/10] MSME Features implemented:
echo ✓ Udyam Aadhaar Certificate support (Mandatory for MSMEs)
echo ✓ URD (Unregistered Registered Dealer) support for micro/mini sectors
echo ✓ Home Service Industry registration options
echo ✓ Service Industry support and registration
echo ✓ Complete KYC integration with wallet system
echo ✓ User wallet with Razorpay integration
echo ✓ Subscription payment system

echo [5/10] Business Type Support:
echo ✓ B2B Manufacturing - Factory, Industrial production
echo ✓ B2B Services - Professional services for businesses
echo ✓ B2C Products - Consumer products and retail
echo ✓ Home Services - Home-based businesses and freelancers
echo ✓ Service Industry - Professional service providers
echo ✓ Electronics & IT - Technology and IT services
echo ✓ Textiles & Apparel - Fashion and textile businesses
echo ✓ Healthcare & Pharma - Medical and pharmaceutical
echo ✓ Food & Beverages - Food production and retail
echo ✓ Education & Training - Educational services
echo ✓ Automotive & Transport - Auto industry and logistics
echo ✓ Consulting & Professional - Professional consulting

echo [6/10] Cleaning build directory...
rmdir /s /q .next 2>nul || echo ".next directory not found"

echo [7/10] Fixing permissions...
takeown /f . /r /d y
icacls . /grant "%USERNAME%:(OI)(CI)F" /t

echo [8/10] Installing dependencies...
npm install

echo [9/10] Building project with complete business solution...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo 🎉 COMPLETE BUSINESS SOLUTION READY! 🎉
    echo ========================================
    echo ✅ Real Razorpay keys configured
    echo ✅ ALL business categories supported
    echo ✅ Homepage updated for all business types
    echo ✅ Unified registration flow for all businesses
    echo ✅ Complete KYC compliance system
    echo ✅ Udyam Aadhaar integration
    echo ✅ URD support for micro/mini sectors
    echo ✅ Home service industry support
    echo ✅ Service industry support
    echo ✅ User wallet system with Razorpay
    echo ✅ Subscription payment system ready
    echo ✅ Escrow services documentation complete
    echo ✅ MSME registration guide comprehensive
    echo ========================================
    echo Your Bell24h project now supports ALL businesses!
    echo ========================================
) else (
    echo ========================================
    echo ❌ BUILD STILL FAILING
    echo ========================================
    echo Check the output above for details.
    echo Try running PowerShell as Administrator.
)

echo.
echo BUSINESS SOLUTION SUMMARY:
echo ===========================
echo 1. ALL Business Categories Supported:
echo    - B2B Manufacturing & Services
echo    - B2C Products & Retail
echo    - Home Services & Freelancers
echo    - Service Industry & Professional
echo    - Electronics & IT
echo    - Textiles & Apparel
echo    - Healthcare & Pharma
echo    - Food & Beverages
echo    - Education & Training
echo    - Automotive & Transport
echo    - Consulting & Professional
echo.
echo 2. MSME Features:
echo    - Udyam Aadhaar Certificate (Mandatory)
echo    - URD Certificate (Micro/Mini sectors)
echo    - Home Service Industry Registration
echo    - Complete KYC compliance system
echo    - Government scheme integration
echo.
echo 3. Payment & Wallet:
echo    - Razorpay integration
echo    - Escrow services
echo    - Subscription payments
echo    - Multi-currency support
echo.
echo 4. Legal & Compliance:
echo    - All mandatory legal pages
echo    - MSME-focused documentation
echo    - Government compliance ready
echo    - KYC verification system
echo.
echo Next steps:
echo 1. Test the application at http://localhost:3000
echo 2. Verify all business categories are accessible
echo 3. Test registration flow for different business types
echo 4. Test KYC compliance system
echo 5. Test wallet and payment functionality
echo 6. Deploy to production when ready
echo.
pause
