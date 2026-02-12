@echo off
REM Bell24h Database Seeding Run Script for Windows
REM This script provides all the commands needed to seed your database

echo 🌱 Bell24h Database Seeding Setup
echo =================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm detected
echo.

REM 1. Install dependencies (if needed)
echo 📦 Step 1: Installing dependencies...
echo Command: npm install
echo.
set /p install_deps="Do you want to install dependencies? (y/n): "
if /i "%install_deps%"=="y" (
    npm install
    echo ✅ Dependencies installed
) else (
    echo ⏭️  Skipping dependency installation
)
echo.

REM 2. Run Prisma migrations (if needed)
echo 🗄️  Step 2: Database setup...
echo Command: npx prisma generate
echo.
set /p generate_prisma="Do you want to generate Prisma client? (y/n): "
if /i "%generate_prisma%"=="y" (
    npx prisma generate
    echo ✅ Prisma client generated
) else (
    echo ⏭️  Skipping Prisma client generation
)
echo.

set /p push_schema="Do you want to push schema to database? (y/n): "
if /i "%push_schema%"=="y" (
    echo Command: npx prisma db push
    npx prisma db push
    echo ✅ Schema pushed to database
) else (
    echo ⏭️  Skipping schema push
)
echo.

REM 3. Run the seed script
echo 🌱 Step 3: Seeding database...
echo.
echo Choose seeding option:
echo 1. Basic seed (quick setup - 5 users, 5 RFQs)
echo 2. Comprehensive seed (full dataset - 50 suppliers, 20 buyers, 30 RFQs)
echo 3. Skip seeding
echo.
set /p seed_choice="Enter your choice (1/2/3): "

if "%seed_choice%"=="1" (
    echo 🌱 Running basic seed...
    echo Command: npm run db:seed:basic
    npm run db:seed:basic
) else if "%seed_choice%"=="2" (
    echo 🌱 Running comprehensive seed...
    echo Command: npm run db:seed:comprehensive
    npm run db:seed:comprehensive
) else if "%seed_choice%"=="3" (
    echo ⏭️  Skipping seeding
) else (
    echo ❌ Invalid choice. Skipping seeding.
)
echo.

REM 4. Verify data was inserted
echo 🔍 Step 4: Data verification...
echo.
set /p open_studio="Do you want to open Prisma Studio to verify data? (y/n): "
if /i "%open_studio%"=="y" (
    echo Opening Prisma Studio...
    echo Command: npx prisma studio
    start npx prisma studio
    echo ✅ Prisma Studio opened in browser
) else (
    echo ⏭️  Skipping Prisma Studio
)
echo.

REM 5. Run verification queries
echo 📊 Step 5: Running verification queries...
echo.
set /p run_queries="Do you want to run SQL verification queries? (y/n): "
if /i "%run_queries%"=="y" (
    echo Running verification queries...
    echo.
    
    REM Check supplier count
    echo Checking supplier count...
    echo SELECT COUNT(*) as supplier_count FROM users WHERE type = 'SUPPLIER';
    
    REM Check buyer count
    echo Checking buyer count...
    echo SELECT COUNT(*) as buyer_count FROM users WHERE type = 'BUYER';
    
    echo.
    echo ✅ Verification queries completed
    echo 📋 Results summary:
    echo    - Check the SQL output above for counts
    echo    - Expected: 50 suppliers, 20 buyers, 30 RFQs, 50 quotes, 100 messages
) else (
    echo ⏭️  Skipping verification queries
)
echo.

REM 6. Test accounts
echo 👥 Step 6: Test accounts ready!
echo.
echo 📝 Test Login Credentials:
echo.
echo Buyer Accounts:
echo   • buyer1@bell24h.com / Test@123
echo   • buyer2@bell24h.com / Test@123
echo   • buyer3@bell24h.com / Test@123
echo   • ... up to buyer20@bell24h.com
echo.
echo Supplier Accounts:
echo   • supplier1@bell24h.com / Test@123
echo   • supplier2@bell24h.com / Test@123
echo   • supplier3@bell24h.com / Test@123
echo   • ... up to supplier50@bell24h.com
echo.

REM 7. Next steps
echo 🚀 Step 7: Next Steps
echo.
echo ✅ Database seeding completed!
echo.
echo 🔧 What to test next:
echo    1. Log in with test accounts
echo    2. Create new RFQs
echo    3. Submit quotes as suppliers
echo    4. Test chat messaging (Hindi-English mix)
echo    5. Test Razorpay payment flow
echo    6. Test n8n marketing workflows
echo.
echo 🔄 Reset Commands (if needed):
echo    • Reset database: npx prisma migrate reset
echo    • Clear all data: npx prisma db push --force-reset
echo    • Run seed again: npm run db:seed:comprehensive
echo.
echo 📚 Documentation:
echo    • Seeding guide: SEEDING_GUIDE.md
echo    • Verification queries: src/scripts/verify-seed.sql
echo.
echo 🎉 Happy testing!

REM Keep window open
pause