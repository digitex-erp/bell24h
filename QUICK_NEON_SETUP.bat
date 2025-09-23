@echo off
echo 🚀 BELL24H NEON DATABASE QUICK SETUP
echo ====================================
echo.

echo 📋 Setting up Neon PostgreSQL database...
echo.

echo 🔧 Step 1: Navigate to client directory
cd client

echo 🔧 Step 2: Update environment variables
echo.
echo Please update your .env.local file with your Neon connection string:
echo.
echo DATABASE_URL="postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo.
echo Press any key when you've updated the .env.local file...
pause

echo.
echo 🔧 Step 3: Running database migrations...
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Migration failed. Please check your Neon connection string.
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
echo 🌐 Starting development server...
echo Visit: http://localhost:3000/categories-dashboard
echo.

npm run dev
