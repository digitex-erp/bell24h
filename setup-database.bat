@echo off
echo 🗄️ Setting up Bell24h Database...
echo.

echo 📋 Step 1: Checking Prisma installation...
call npx prisma --version
if %errorlevel% neq 0 (
    echo ❌ Prisma not found, installing...
    call npm install prisma @prisma/client
    if %errorlevel% neq 0 (
        echo ❌ Prisma installation failed
        pause
        exit /b 1
    )
)
echo ✅ Prisma ready

echo.
echo 🔧 Step 2: Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma generate failed
    pause
    exit /b 1
)
echo ✅ Prisma client generated

echo.
echo 🗄️ Step 3: Creating database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Database creation failed
    pause
    exit /b 1
)
echo ✅ Database created

echo.
echo 📊 Step 4: Running migrations...
if exist "prisma\migrations" (
    call npx prisma migrate deploy
    if %errorlevel% neq 0 (
        echo ⚠️ Migration deploy failed, trying db push...
        call npx prisma db push
        if %errorlevel% neq 0 (
            echo ❌ Database setup failed
            pause
            exit /b 1
        )
    )
    echo ✅ Migrations applied
) else (
    echo ⚠️ No migrations found, using db push
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo ❌ Database setup failed
        pause
        exit /b 1
    )
    echo ✅ Database schema applied
)

echo.
echo 🧪 Step 5: Testing database connection...
call npx prisma db pull --print
if %errorlevel% neq 0 (
    echo ❌ Database connection test failed
    pause
    exit /b 1
)
echo ✅ Database connection working

echo.
echo 📊 Step 6: Opening Prisma Studio...
echo Opening Prisma Studio at http://localhost:5555
echo You can view and manage your database here
echo.
start /B npx prisma studio

echo.
echo 🎉 Database Setup Complete!
echo.
echo 📋 Database Information:
echo - Type: SQLite (Development)
echo - Location: prisma/dev.db
echo - Studio: http://localhost:5555
echo - Tables: User, Company, RFQ, Quote, Transaction, etc.
echo.
echo 📋 Next Steps:
echo 1. Check Prisma Studio at http://localhost:5555
echo 2. Verify all tables are created
echo 3. Test database operations
echo.
pause
