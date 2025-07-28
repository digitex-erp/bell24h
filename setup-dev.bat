@echo off
echo =======================================
echo Bell24H Development Setup
=======================================

echo [1/5] Installing dependencies...
call npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b %ERRORLEVEL%
)

echo [2/5] Generating Prisma client...
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to generate Prisma client
    exit /b %ERRORLEVEL%
)

echo [3/5] Running database migrations...
call npx prisma migrate dev --name init

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run database migrations
    exit /b %ERRORLEVEL%
)

echo [4/5] Running setup script...
call npx tsx scripts/auto-setup.ts

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Setup script failed
    exit /b %ERRORLEVEL%
)

echo [5/5] Starting development server...
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start development server
    exit /b %ERRORLEVEL%
)

echo =======================================
echo Setup completed successfully! 🎉
echo =======================================
