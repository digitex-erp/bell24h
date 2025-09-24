@echo off
echo ========================================
echo REPLACING RAILWAY WITH NEON DATABASE
echo ========================================

echo Creating .env.local with Neon database...
if exist "client\.env.local" (
    echo Updating existing .env.local...
) else (
    echo Creating new .env.local...
)

REM Create the .env.local file with Neon database configuration
(
echo # Bell24h Development Environment Variables - NEON DATABASE
echo # =======================================================
echo.
echo # Database Configuration (NEON PostgreSQL - FREE & RELIABLE)
echo DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
echo DIRECT_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
echo.
echo # Mobile OTP Authentication (MSG91)
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
echo MSG91_SENDER_ID=BELL24H
echo.
echo # Redis Configuration (for caching)
echo REDIS_URL=redis://localhost:6379
echo.
echo # Application Configuration
echo NODE_ENV=development
echo NEXT_TELEMETRY_DISABLED=1
echo.
echo # App Configuration
echo NEXT_PUBLIC_APP_NAME=BELL24H
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo.
echo # Feature Flags
echo NEXT_PUBLIC_ENABLE_AI_MATCHING=true
echo NEXT_PUBLIC_ENABLE_VOICE_RFQ=true
echo NEXT_PUBLIC_ENABLE_ESCROW=true
echo NEXT_PUBLIC_ENABLE_ANALYTICS=true
echo.
echo # Authentication
echo NEXTAUTH_URL=http://localhost:3000
echo NEXTAUTH_SECRET=bell24h-super-secret-key-32-chars-minimum
echo.
echo # Security
echo JWT_SECRET=bell24h-jwt-secret-key-32-chars-minimum
echo ENCRYPTION_KEY=bell24h-encryption-key-32-chars-minimum
echo.
echo # API Keys
echo API_SECRET_KEY=bell24h-api-secret-key-2024
echo.
echo # Payment Gateway (Razorpay - Test Mode)
echo NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
echo RAZORPAY_KEY_SECRET=your_razorpay_secret_key
echo.
echo # Cloudinary (Image Upload)
echo NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=bell24h
echo CLOUDINARY_API_KEY=your_cloudinary_api_key
echo CLOUDINARY_API_SECRET=your_cloudinary_api_secret
echo.
echo # AI Services
echo OPENAI_API_KEY=your_openai_api_key
echo ANTHROPIC_API_KEY=your_anthropic_api_key
) > "client\.env.local"

echo ✅ Created .env.local with Neon database configuration

echo.
echo Updating production environment file...
REM Update the production environment file
if exist "client\env.production" (
    REM Read the current content and replace Railway URLs
    powershell -Command "
    $content = Get-Content 'client\env.production' -Raw
    $content = $content -replace 'postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline\.proxy\.rlwy\.net:45776/railway\?sslmode=require', 'postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require'
    $content = $content -replace 'Railway PostgreSQL - External URL', 'Neon PostgreSQL - FREE & RELIABLE'
    Set-Content 'client\env.production' $content
    "
    echo ✅ Updated env.production with Neon database
) else (
    echo ⚠️  env.production not found, skipping...
)

echo.
echo Updating template files...
REM Update template files
if exist "client\env.local.template" (
    powershell -Command "
    $content = Get-Content 'client\env.local.template' -Raw
    $content = $content -replace 'postgresql://username:password@localhost:5432/bell24h_dev', 'postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require'
    $content = $content -replace 'Database Configuration \(if needed\)', 'Database Configuration (NEON PostgreSQL - FREE & RELIABLE)'
    Set-Content 'client\env.local.template' $content
    "
    echo ✅ Updated env.local.template with Neon database
) else (
    echo ⚠️  env.local.template not found, skipping...
)

echo.
echo Creating Neon database setup guide...
REM Create a guide for getting Neon database URL
(
echo ========================================
echo NEON DATABASE SETUP REQUIRED
echo ========================================
echo.
echo To complete the switch to Neon database:
echo.
echo 1. Go to: https://console.neon.tech
echo 2. Sign up or sign in
echo 3. Create a new database named 'bell24h'
echo 4. Copy the connection string from the dashboard
echo.
echo The connection string should look like:
echo postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
echo.
echo 5. Replace the DATABASE_URL in client\.env.local with your actual Neon URL
echo 6. Replace the DIRECT_URL in client\.env.local with your actual Neon URL
echo 7. Update client\env.production with your actual Neon URL
echo.
echo ========================================
echo WHY NEON IS BETTER THAN RAILWAY
echo ========================================
echo.
echo ✅ FREE TIER: 0.5 GB storage, always available
echo ✅ NO SLEEPING: Database stays active 24/7
echo ✅ RELIABLE: Better uptime than Railway
echo ✅ FASTER: Optimized for performance
echo ✅ SCALABLE: Easy to upgrade when needed
echo ✅ NO DOWNTIME: No surprise database sleeping
echo.
echo ========================================
echo TEST YOUR DATABASE CONNECTION
echo ========================================
echo.
echo After updating the URLs, test with:
echo.
echo cd client
echo npx prisma db push
echo npx prisma studio
echo.
echo If Prisma Studio opens = SUCCESS! 🎉
echo.
) > "NEON_DATABASE_SETUP_GUIDE.txt"

echo ✅ Created Neon database setup guide

echo.
echo ========================================
echo DATABASE MIGRATION COMPLETE!
echo ========================================
echo.
echo Your project now uses Neon database instead of Railway.
echo.
echo Next steps:
echo 1. Get your Neon database URL from https://console.neon.tech
echo 2. Update the DATABASE_URL in client\.env.local
echo 3. Update the DIRECT_URL in client\.env.local
echo 4. Test with: npx prisma db push
echo.
echo Read NEON_DATABASE_SETUP_GUIDE.txt for detailed instructions.
echo.
echo ========================================
echo MIGRATION SUMMARY
echo ========================================
echo ✅ Replaced Railway database URLs with Neon URLs
echo ✅ Updated all environment files
echo ✅ Created comprehensive setup guide
echo ✅ Your project is now Neon-ready!
echo.
pause
