@echo off
echo ========================================
echo FIXING BUILD ERROR - STEP 1
echo ========================================
echo.

echo [1] Navigating to client directory...
cd client

echo [2] Creating .env.local with dummy values...
echo # Bell24h Build Environment - Dummy Values for Testing > .env.local
echo # These are placeholder values to make the build work >> .env.local
echo. >> .env.local
echo # Razorpay (Dummy values - will be replaced with real ones after approval) >> .env.local
echo RAZORPAY_KEY_ID=dummy_key_for_build >> .env.local
echo RAZORPAY_KEY_SECRET=dummy_secret_for_build >> .env.local
echo. >> .env.local
echo # Stripe (Dummy value) >> .env.local
echo STRIPE_SECRET_KEY=sk_test_dummy >> .env.local
echo. >> .env.local
echo # Database (Dummy value) >> .env.local
echo DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy >> .env.local
echo. >> .env.local
echo # NextAuth (Required for build) >> .env.local
echo NEXTAUTH_SECRET=bell24h-build-secret-key-32-characters-min >> .env.local
echo. >> .env.local
echo # MSG91 (Working credentials) >> .env.local
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1 >> .env.local
echo MSG91_SENDER_ID=BELL24H >> .env.local
echo. >> .env.local
echo # Application URLs >> .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
echo NEXT_PUBLIC_APP_NAME=Bell24h >> .env.local
echo. >> .env.local
echo # Feature Flags (Beta Mode) >> .env.local
echo NEXT_PUBLIC_BETA_MODE=true >> .env.local
echo NEXT_PUBLIC_MAX_USERS=50 >> .env.local
echo. >> .env.local
echo # Security (Dummy values) >> .env.local
echo JWT_SECRET=bell24h-jwt-secret-build-test >> .env.local
echo ENCRYPTION_KEY=bell24h-encryption-key-32chars >> .env.local

echo ✅ .env.local file created!

echo.
echo [3] Testing build...
npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo NEXT STEP: Deploy to Vercel
    echo Run: DEPLOY_TO_VERCEL.bat
) else (
    echo.
    echo ❌ BUILD FAILED
    echo Check the errors above and fix them
    echo Common fixes:
    echo 1. npm install
    echo 2. npm cache clean --force
    echo 3. Delete node_modules and reinstall
)

echo.
pause