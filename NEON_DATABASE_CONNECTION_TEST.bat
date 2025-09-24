@echo off
echo ========================================
echo TESTING NEON DATABASE CONNECTION
echo ========================================
echo.

echo Your Neon Database URL:
echo postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
echo.

echo Step 1: Testing database connection...
cd client

echo Creating .env.local with your real Neon database...
(
echo # Bell24h Development Environment Variables - NEON DATABASE
echo # =======================================================
echo.
echo # Database Configuration (NEON PostgreSQL - FREE & RELIABLE)
echo DATABASE_URL="postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo DIRECT_URL="postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
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
) > ".env.local"

echo ✅ Created .env.local with your real Neon database URL!
echo.

echo Step 2: Testing Prisma connection...
echo Running: npx prisma db push
npx prisma db push

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database connection successful!
    echo.
    echo Step 3: Opening Prisma Studio...
    echo This will open your database in the browser.
    echo Press Ctrl+C to stop Prisma Studio when done.
    echo.
    npx prisma studio
) else (
    echo ❌ Database connection failed!
    echo.
    echo Possible issues:
    echo 1. Check if your Neon database is active
    echo 2. Verify the connection string is correct
    echo 3. Check your internet connection
    echo.
    echo Your Neon URL: postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
)

echo.
echo ========================================
echo NEON DATABASE TEST COMPLETE
echo ========================================
pause
