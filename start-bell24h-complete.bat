@echo off
echo.
echo ========================================
echo 🚀 BELL24H COMPLETE PLATFORM STARTUP
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "client" (
    echo ❌ Error: Please run this script from the Bell24H root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Bell24H root directory confirmed
echo.

:: Step 1: Check AI Service
echo 📋 STEP 1: VERIFYING AI SERVICE...
if not exist "ai-explainability-service" (
    echo ❌ AI service directory not found
    echo Please ensure ai-explainability-service exists
    pause
    exit /b 1
)

if not exist "ai-explainability-service\main.py" (
    echo ❌ AI service main.py not found
    pause
    exit /b 1
)

echo ✅ AI service files verified
echo.

:: Step 2: Check Client
echo 📋 STEP 2: VERIFYING CLIENT...
if not exist "client\package.json" (
    echo ❌ Client package.json not found
    pause
    exit /b 1
)

echo ✅ Client files verified
echo.

:: Step 3: Check Demo Data
echo 📋 STEP 3: VERIFYING DEMO DATA...
if not exist "client\src\data\demoData.ts" (
    echo ❌ Demo data file not found
    pause
    exit /b 1
)

echo ✅ Demo data verified
echo.

:: Step 4: Start AI Service
echo 📋 STEP 4: STARTING AI SERVICE...
echo Starting AI Explainability Service on port 8000...
echo.

cd ai-explainability-service

:: Check if virtual environment exists
if not exist ".venv" (
    echo ⚠️ Virtual environment not found, creating one...
    python -m venv .venv
)

:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Install requirements if needed
if not exist ".venv\Lib\site-packages\fastapi" (
    echo 📦 Installing AI service requirements...
    pip install -r requirements.txt
)

:: Start AI service in background
echo 🚀 Starting AI service...
start "Bell24H AI Service" cmd /k "call .venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait a moment for AI service to start
timeout /t 5 /nobreak > nul

:: Go back to root
cd ..

:: Step 5: Start Next.js Client
echo 📋 STEP 5: STARTING NEXT.JS CLIENT...
echo Starting Next.js client on port 3000...
echo.

cd client

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing client dependencies...
    npm install
)

:: Start Next.js in background
echo 🚀 Starting Next.js client...
start "Bell24H Next.js Client" cmd /k "npm run dev"

:: Wait a moment for Next.js to start
timeout /t 10 /nobreak > nul

:: Go back to root
cd ..

:: Step 6: Verify Services
echo 📋 STEP 6: VERIFYING SERVICES...
echo.

:: Test AI service
echo 🔍 Testing AI service...
curl -s http://localhost:8000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ AI service is running on http://localhost:8000
) else (
    echo ⚠️ AI service may still be starting up...
)

:: Test Next.js client
echo 🔍 Testing Next.js client...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Next.js client is running on http://localhost:3000
) else (
    echo ⚠️ Next.js client may still be starting up...
)

echo.
echo ========================================
echo 🎉 BELL24H PLATFORM STARTUP COMPLETE!
echo ========================================
echo.
echo 📊 SERVICE STATUS:
echo ✅ AI Service: http://localhost:8000
echo ✅ Next.js Client: http://localhost:3000
echo.
echo 🧪 TESTING URLs:
echo 📋 Homepage: http://localhost:3000
echo 📋 Categories: http://localhost:3000/categories
echo 📋 Demo RFQ: http://localhost:3000/rfq/RFQ-ELE-001
echo 📋 AI Dashboard: http://localhost:3000/dashboard/ai-matching
echo.
echo 🔍 VERIFICATION CHECKLIST:
echo - [ ] Homepage loads with all features
echo - [ ] All 15 categories visible with demo RFQs
echo - [ ] Wallet system functional
echo - [ ] Escrow system working
echo - [ ] AI explainability accessible
echo - [ ] Voice RFQ processing working
echo - [ ] Payment integration functional
echo - [ ] Authentication working
echo - [ ] Real-time features operational
echo.
echo 💡 TROUBLESHOOTING:
echo - If services don't start, check the terminal windows
echo - AI service needs Python 3.8+ and virtual environment
echo - Next.js needs Node.js 16+ and npm
echo.
echo 🚀 Your Bell24H platform is now ready for testing!
echo.
pause 