@echo off
echo.
echo ========================================
echo   BELL24H QUICK START - WINDOWS
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Not in Bell24h project directory.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo ✅ Project directory verified
echo.

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo ⚙️  Creating environment configuration...
    (
        echo DATABASE_URL="file:./dev.db"
        echo JWT_SECRET="bell24h-jwt-secret-key-2024-super-secure"
        echo NEXTAUTH_SECRET="bell24h-nextauth-secret-key-2024"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NODE_ENV="development"
        echo NEXT_PUBLIC_DEBUG="true"
        echo NEXT_PUBLIC_VERCEL_ENV="development"
        echo ADMIN_EMAIL="admin@bell24h.com"
        echo ADMIN_PASSWORD="admin123"
        echo NEXT_PUBLIC_ENABLE_AI_FEATURES="true"
        echo NEXT_PUBLIC_ENABLE_VOICE_RFQ="true"
        echo NEXT_PUBLIC_ENABLE_WALLET="true"
        echo NEXT_PUBLIC_ENABLE_FINTECH="true"
        echo CORS_ORIGIN="http://localhost:3000"
        echo RATE_LIMIT_MAX="100"
        echo RATE_LIMIT_WINDOW="900000"
        echo LOG_LEVEL="debug"
    ) > .env.local
    echo ✅ Environment configured
) else (
    echo ✅ Environment already configured
)

echo.
echo 🚀 Starting Bell24h development server...
echo.
echo 🌐 Your platform will be available at:
echo    Homepage: http://localhost:3000
echo    Admin Panel: http://localhost:3000/admin
echo    Marketing Dashboard: http://localhost:3000/admin (AI Marketing tab)
echo.
echo 📊 Features Available:
echo    ✅ All 34 pages restored
echo    ✅ Admin Command Center with 6 tabs
echo    ✅ Marketing Dashboard with database integration
echo    ✅ Agent authentication system
echo    ✅ Campaign management system
echo    ✅ Real-time analytics
echo.
echo 🎯 Ready to launch!
echo.

REM Start the development server
npm run dev

pause
