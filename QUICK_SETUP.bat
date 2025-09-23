@echo off
echo 🚀 BELL24H QUICK SETUP - 50 CATEGORIES
echo =====================================
echo.

echo 📋 This script will:
echo 1. Use your existing SQLite database
echo 2. Run database migrations
echo 3. Seed the database with 50 categories
echo 4. Start the development server
echo.

pause

echo.
echo 🔧 Step 1: Running database migrations...
cd client
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Migration failed. Please check your database connection.
    pause
    exit /b 1
)

echo.
echo 🔧 Step 2: Seeding database with 50 categories...
node scripts/seed-categories-sqlite.js
if %errorlevel% neq 0 (
    echo ❌ Seeding failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 SETUP COMPLETE!
echo.
echo ✅ Database seeded with 50 categories
echo ✅ All subcategories and mock orders created
echo ✅ Ready to use the categories dashboard
echo.
echo 🌐 Starting development server...
echo Visit: http://localhost:3000/categories-dashboard
echo.

npm run dev
