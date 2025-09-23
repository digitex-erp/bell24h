@echo off
echo 🚀 BELL24H DATABASE SETUP AND SEEDING
echo =====================================
echo.

echo 📋 This script will:
echo 1. Install PostgreSQL (if not already installed)
echo 2. Create the Bell24h database
echo 3. Run database migrations
echo 4. Seed the database with 50 categories
echo.

pause

echo.
echo 🔧 Step 1: Checking PostgreSQL installation...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL not found. Installing...
    echo.
    echo 📥 Downloading PostgreSQL installer...
    echo Please download PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    echo After installation, please:
    echo 1. Add PostgreSQL to your PATH
    echo 2. Restart this script
    echo.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL found!
)

echo.
echo 🔧 Step 2: Creating Bell24h database...
psql -U postgres -c "CREATE DATABASE bell24h;" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Database might already exist or connection failed
    echo Please ensure PostgreSQL is running and accessible
)

echo.
echo 🔧 Step 3: Running database migrations...
cd client
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Migration failed. Please check your database connection.
    pause
    exit /b 1
)

echo.
echo 🔧 Step 4: Seeding database with 50 categories...
node scripts/seed-all-categories-fixed.js
if %errorlevel% neq 0 (
    echo ❌ Seeding failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 SETUP COMPLETE!
echo.
echo ✅ Database created and seeded with 50 categories
echo ✅ All subcategories and mock orders created
echo ✅ Ready to use the categories dashboard
echo.
echo 🌐 Next steps:
echo 1. Start your development server: npm run dev
echo 2. Visit: http://localhost:3000/categories-dashboard
echo 3. Explore all 50 categories with mock data
echo.
pause
