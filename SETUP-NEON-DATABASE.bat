@echo off
title NEON DATABASE SETUP FOR BELL24H
color 0B

echo.
echo  ███╗   ██╗███████╗ ██████╗ ███╗   ██╗
echo  ████╗  ██║██╔════╝██╔═══██╗████╗  ██║
echo  ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║
echo  ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║
echo  ██║ ╚████║███████╗╚██████╔╝██║ ╚████║
echo  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo  ========================================
echo     NEON DATABASE AUTOMATIC SETUP
echo  ========================================
echo.

echo [STEP 1] Installing Prisma CLI...
call npm install -g prisma
if %errorlevel% neq 0 (
    echo ❌ Failed to install Prisma CLI
    pause
    exit /b 1
)
echo ✅ Prisma CLI installed

echo.
echo [STEP 2] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [STEP 3] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated

echo.
echo [STEP 4] Setting up environment variables...
if not exist .env.local (
    echo Creating .env.local file...
    echo # Bell24h Environment Variables > .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo NEXTAUTH_SECRET=bell24h-secret-key-2025 >> .env.local
    echo DATABASE_URL=postgresql://username:password@hostname:port/database >> .env.local
    echo.
    echo ⚠️  IMPORTANT: Please update .env.local with your Neon database URL
    echo    Format: postgresql://username:password@hostname:port/database
    echo.
)

echo.
echo [STEP 5] Database setup instructions...
echo.
echo 📋 TO COMPLETE DATABASE SETUP:
echo.
echo 1. Go to https://neon.tech
echo 2. Create a new project
echo 3. Copy the connection string
echo 4. Update .env.local with your DATABASE_URL
echo 5. Run: npx prisma db push
echo.
echo Press any key to continue after updating .env.local...
pause

echo.
echo [STEP 6] Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
    echo    Please check your DATABASE_URL in .env.local
    pause
    exit /b 1
)
echo ✅ Database schema pushed successfully

echo.
echo [STEP 7] Seeding database (optional)...
echo Do you want to seed the database with sample data? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    call npx prisma db seed
    if %errorlevel% neq 0 (
        echo ⚠️  Seeding failed, but database is ready
    ) else (
        echo ✅ Database seeded successfully
    )
)

echo.
echo ========================================
echo     🎉 DATABASE SETUP COMPLETE! 🎉
echo ========================================
echo.
echo Your Neon database is now ready for Bell24h!
echo.
echo Next steps:
echo 1. Deploy your application
echo 2. Update Vercel environment variables
echo 3. Your platform is ready to use!
echo.
echo Press any key to exit...
pause >nul
