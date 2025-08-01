@echo off
echo.
echo ========================================
echo    Bell24H Development Server Restart
echo ========================================
echo.

echo 🔧 Checking environment configuration...
if not exist ".env.local" (
    echo ❌ .env.local file not found!
    echo.
    echo Please follow these steps:
    echo 1. Copy env.local.template to .env.local
    echo 2. Update .env.local with your Supabase credentials
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ .env.local file found
echo.

echo 🔍 Checking Supabase configuration...
findstr "NEXT_PUBLIC_SUPABASE_URL" .env.local >nul
if errorlevel 1 (
    echo ❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local
    echo Please add your Supabase URL to .env.local
    pause
    exit /b 1
)

findstr "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local >nul
if errorlevel 1 (
    echo ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local
    echo Please add your Supabase Anon Key to .env.local
    pause
    exit /b 1
)

echo ✅ Supabase configuration found
echo.

echo 🛑 Stopping any running development server...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 🚀 Starting development server...
echo.
echo 📝 Server will be available at: http://localhost:3000
echo 📝 Login page: http://localhost:3000/auth/login
echo.
echo ⚠️  If you see any errors, check the browser console
echo.

npm run dev 