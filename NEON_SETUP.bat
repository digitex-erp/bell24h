@echo off
echo 🚀 BELL24H NEON DATABASE SETUP
echo ===============================
echo.

echo 📋 This script will:
echo 1. Guide you through Neon database setup
echo 2. Configure Bell24h for Neon PostgreSQL
echo 3. Run database migrations
echo 4. Seed with 50 categories
echo 5. Start development server
echo.

echo 🌐 Step 1: Create Neon Account
echo ===============================
echo.
echo 1. Go to: https://neon.tech
echo 2. Sign up with GitHub/Google
echo 3. Create a new project named "bell24h-production"
echo 4. Choose region closest to India (Singapore/Mumbai)
echo 5. Copy your connection string
echo.
echo Example connection string:
echo postgresql://username:password@host.neon.tech/database?sslmode=require
echo.

pause

echo.
echo 🔧 Step 2: Update Environment Variables
echo ======================================
echo.
echo Please update your .env.local file with:
echo.
echo DATABASE_URL="your-neon-connection-string"
echo.
echo Press any key when you've updated the .env.local file...
pause

echo.
echo 🔧 Step 3: Running database migrations...
cd client
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Migration failed. Please check your Neon connection string.
    echo.
    echo Common issues:
    echo - Incorrect connection string format
    echo - Missing SSL mode (add ?sslmode=require)
    echo - Wrong credentials
    echo.
    pause
    exit /b 1
)

echo ✅ Database migration successful!

echo.
echo 🔧 Step 4: Seeding database with 50 categories...
node scripts/seed-categories-neon.js
if %errorlevel% neq 0 (
    echo ❌ Seeding failed. Please check the error messages above.
    pause
    exit /b 1
)

echo ✅ Database seeded successfully!

echo.
echo 🎉 NEON SETUP COMPLETE!
echo.
echo ✅ Neon PostgreSQL database configured
echo ✅ 50 categories seeded with mock data
echo ✅ All subcategories and mock orders created
echo ✅ Ready for production use
echo.
echo 📊 Database Summary:
echo - Provider: Neon PostgreSQL
echo - Storage: 0.5 GB (Free tier)
echo - Transfer: 10 GB/month (Free tier)
echo - Cost: $0/month (Free tier)
echo.
echo 🌐 Starting development server...
echo Visit: http://localhost:3000/categories-dashboard
echo.

npm run dev
