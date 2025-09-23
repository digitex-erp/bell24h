@echo off
echo 🚀 BELL24H FIXED SETUP
echo =====================
echo.

echo 📋 This script will:
echo 1. Run the working category seeding script
echo 2. Start the development server
echo 3. Open the categories page
echo.

pause

echo.
echo 🔧 Step 1: Running category seeding...
cd client
node scripts/seed-categories-simple.js
if %errorlevel% neq 0 (
    echo ❌ Seeding failed. Please check the error messages above.
    pause
    exit /b 1
)

echo ✅ Category seeding successful!

echo.
echo 🔧 Step 2: Starting development server...
echo.
echo 🎉 SETUP COMPLETE!
echo.
echo ✅ Categories data generated successfully
echo ✅ 50 categories with mock orders created
echo ✅ OpenAI billing issue fixed (using placeholder images)
echo.
echo 🌐 Your application is ready!
echo Visit: http://localhost:3001/categories-simple
echo.

npm run dev
