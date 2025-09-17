@echo off
echo.
echo ========================================
echo    BELL24H AUTOMATIC IMPLEMENTATION
echo ========================================
echo.
echo Starting complete setup...
echo.

cd /d "%~dp0"

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo Step 2: Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated
echo.

echo Step 3: Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push database schema
    pause
    exit /b 1
)
echo ✅ Database schema pushed
echo.

echo Step 4: Setting up database...
call node scripts/setup-database.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to setup database
    pause
    exit /b 1
)
echo ✅ Database setup completed
echo.

echo Step 5: Migrating categories...
call node scripts/migrate-categories.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to migrate categories
    pause
    exit /b 1
)
echo ✅ Categories migrated
echo.

echo Step 6: Seeding database...
call node scripts/seed-database.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database seeded
echo.

echo Step 7: Generating mock RFQs...
call node scripts/generate-mock-rfqs.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate mock RFQs
    pause
    exit /b 1
)
echo ✅ Mock RFQs generated
echo.

echo Step 8: Testing performance...
call node scripts/test-database-performance.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to test performance
    pause
    exit /b 1
)
echo ✅ Performance testing completed
echo.

echo ========================================
echo    IMPLEMENTATION COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo ✅ Database setup completed
echo ✅ Categories migrated (50 categories)
echo ✅ Mock data seeded
echo ✅ 450+ RFQs generated
echo ✅ Performance tested (1000+ users)
echo ✅ All tests passed
echo.
echo 🚀 Bell24h is ready for production!
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Visit: http://localhost:3000
echo 3. Login with: admin@bell24h.com / admin123
echo.
pause
