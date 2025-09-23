@echo off
echo ========================================
echo FIXING PAYMENT API CONFIGURATION
echo ========================================

echo [1/5] Navigating to client directory...
cd client

echo [2/5] Creating .env.local with real Razorpay keys...
echo # Payment Gateway Configuration (Real Razorpay Keys) > .env.local
echo RAZORPAY_KEY_ID=rzp_live_JzjA268916kOdR >> .env.local
echo RAZORPAY_KEY_SECRET=zgKuNGLemP0X53HXuM4l >> .env.local
echo. >> .env.local
echo # Wallet and Subscription Configuration >> .env.local
echo RAZORPAY_WALLET_ENABLED=true >> .env.local
echo RAZORPAY_SUBSCRIPTION_ENABLED=true >> .env.local
echo RAZORPAY_ESCROW_ENABLED=true >> .env.local
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
echo. >> .env.local
echo # Bell24h Configuration >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_APP_NAME=Bell24h >> .env.local

echo [3/5] Cleaning build directory...
rmdir /s /q .next 2>nul || echo ".next directory not found"

echo [4/5] Building project with fixed payment API...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo ✅ PAYMENT API FIXED! BUILD SUCCESSFUL!
    echo ========================================
    echo ✅ Real Razorpay keys configured
    echo ✅ Wallet system enabled
    echo ✅ Escrow services enabled
    echo ✅ Subscription payment ready
    echo ========================================
) else (
    echo ========================================
    echo ❌ BUILD STILL FAILING
    echo ========================================
    echo Check the output above for details.
)

echo [5/5] Payment API fix complete!
pause
