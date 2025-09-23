@echo off
echo ========================================
echo BELL24H AUTOMATIC DEPLOYMENT
echo ========================================
echo.

echo [1] Fixing directory navigation...
cd /d C:\Users\Sanika\Projects\bell24h

echo [2] Current directory:
cd

echo [3] Creating .env.local in client directory...
cd client

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
echo [4] Testing build...
npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo [5] Installing Vercel CLI...
    npm install -g vercel
    
    echo [6] Deploying to Vercel...
    echo You'll need to login to Vercel when prompted
    vercel --prod
    
    echo.
    echo ========================================
    echo DEPLOYMENT COMPLETE!
    echo ========================================
    echo.
    echo Your Bell24h beta is now live!
    echo Save the URL that was generated above
    echo.
    echo NEXT STEPS:
    echo 1. Test OTP with your phone number
    echo 2. Share with 5 friends for beta testing
    echo 3. Submit to Razorpay for API approval
    echo.
    echo SUCCESS CRITERIA FOR SEPT 22:
    echo - 10 successful registrations
    echo - 5 completed RFQs
    echo - No major crashes
    echo.
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
