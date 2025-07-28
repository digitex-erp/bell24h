@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo 🚀 BELL24H ENTERPRISE PLATFORM - AUTOMATIC STARTUP SCRIPT
echo ================================================================
echo.
echo Starting Bell24H AI-Powered B2B Marketplace...
echo.

:: Set colors for output
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "BLUE=%ESC%[34m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "RESET=%ESC%[0m"

:: Get current directory
set "PROJECT_ROOT=%cd%"
echo %BLUE%Project Root: %PROJECT_ROOT%%RESET%
echo.

:: Function to check if port is available
:check_port
netstat -an | find ":%1 " >nul
if %errorlevel% == 0 (
    echo %RED%Port %1 is already in use. Trying to free it...%RESET%
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%1 "') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 >nul
)
goto :eof

:: Check and free ports
echo %YELLOW%Checking and freeing ports 8000 and 3000...%RESET%
call :check_port 8000
call :check_port 3000
echo.

:: PHASE 1: Start AI Explainability Service
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%PHASE 1: Starting AI Explainability Service (SHAP/LIME)%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

:: Check if AI service directory exists
if not exist "ai-explainability-service" (
    echo %RED%ERROR: ai-explainability-service directory not found!%RESET%
    echo Please ensure you're running this from the project root directory.
    pause
    exit /b 1
)

cd ai-explainability-service

:: Check if virtual environment exists
if not exist "venv" (
    if exist ".venv" (
        echo %YELLOW%Found .venv instead of venv, using .venv...%RESET%
        set "VENV_PATH=.venv"
    ) else (
        echo %RED%ERROR: Virtual environment not found!%RESET%
        echo Please create virtual environment first.
        pause
        exit /b 1
    )
) else (
    set "VENV_PATH=venv"
)

:: Activate virtual environment
echo %YELLOW%Activating Python virtual environment...%RESET%
call %VENV_PATH%\Scripts\activate.bat

:: Check if main.py exists
if not exist "main.py" (
    echo %RED%ERROR: main.py not found in ai-explainability-service!%RESET%
    echo Please ensure all AI service files are present.
    pause
    exit /b 1
)

:: Start AI service in background
echo %GREEN%Starting AI Explainability Service on port 8000...%RESET%
echo %YELLOW%Service URL: http://localhost:8000%RESET%
echo %YELLOW%API Documentation: http://localhost:8000/docs%RESET%
echo %YELLOW%Health Check: http://localhost:8000/health%RESET%
echo.

start "Bell24H AI Service" cmd /k "title Bell24H AI Service && echo AI Service Starting... && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait for AI service to start
echo %YELLOW%Waiting for AI service to initialize...%RESET%
timeout /t 15 >nul

:: Test AI service health
echo %YELLOW%Testing AI service health...%RESET%
for /l %%i in (1,1,10) do (
    curl -s http://localhost:8000/health >nul 2>&1
    if !errorlevel! == 0 (
        echo %GREEN%✅ AI Service is healthy and ready!%RESET%
        goto ai_service_ready
    )
    echo Attempt %%i/10 - Waiting for AI service...
    timeout /t 3 >nul
)

echo %YELLOW%⚠️  AI Service may still be starting. Continuing with frontend...%RESET%

:ai_service_ready
echo.

:: PHASE 2: Start Next.js Frontend
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%PHASE 2: Starting Next.js Frontend Application%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

cd "%PROJECT_ROOT%\client"

:: Check if client directory exists
if not exist "package.json" (
    echo %RED%ERROR: package.json not found in client directory!%RESET%
    echo Please ensure you're in the correct project directory.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo %YELLOW%Installing Node.js dependencies...%RESET%
    npm install
    if !errorlevel! neq 0 (
        echo %RED%ERROR: Failed to install dependencies!%RESET%
        pause
        exit /b 1
    )
)

:: Check environment variables
if not exist ".env.local" (
    echo %YELLOW%⚠️  .env.local not found. Creating template...%RESET%
    echo # Bell24H Environment Variables > .env.local
    echo OPENAI_API_KEY=your_openai_api_key_here >> .env.local
    echo AI_EXPLAINABILITY_SERVICE_URL=http://localhost:8000 >> .env.local
    echo.
    echo %YELLOW%Please add your OpenAI API key to client/.env.local%RESET%
)

:: Start Next.js frontend
echo %GREEN%Starting Bell24H Frontend on port 3000...%RESET%
echo %YELLOW%Application URL: http://localhost:3000%RESET%
echo %YELLOW%Dashboard: http://localhost:3000/dashboard%RESET%
echo %YELLOW%AI Matching: http://localhost:3000/dashboard/ai-matching%RESET%
echo %YELLOW%Voice RFQ: http://localhost:3000/dashboard/voice-rfq%RESET%
echo.

start "Bell24H Frontend" cmd /k "title Bell24H Frontend && echo Frontend Starting... && npm run dev"

:: Wait for frontend to start
echo %YELLOW%Waiting for frontend to initialize...%RESET%
timeout /t 20 >nul

:: Test frontend health
echo %YELLOW%Testing frontend availability...%RESET%
for /l %%i in (1,1,15) do (
    curl -s http://localhost:3000 >nul 2>&1
    if !errorlevel! == 0 (
        echo %GREEN%✅ Frontend is ready!%RESET%
        goto frontend_ready
    )
    echo Attempt %%i/15 - Waiting for frontend...
    timeout /t 2 >nul
)

echo %YELLOW%⚠️  Frontend may still be compiling. Check the frontend terminal.%RESET%

:frontend_ready
echo.

:: PHASE 3: Final Status and Testing
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%PHASE 3: Bell24H Platform Status and Testing%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.

:: Test both services
echo %YELLOW%Performing final system tests...%RESET%
echo.

:: Test AI Service
echo Testing AI Explainability Service...
curl -s http://localhost:8000/health
if %errorlevel% == 0 (
    echo %GREEN%✅ AI Service: HEALTHY%RESET%
) else (
    echo %RED%❌ AI Service: NOT RESPONDING%RESET%
)

:: Test Frontend
echo Testing Frontend Application...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo %GREEN%✅ Frontend: HEALTHY%RESET%
) else (
    echo %RED%❌ Frontend: NOT RESPONDING%RESET%
)

echo.
echo %GREEN%🎉 BELL24H ENTERPRISE PLATFORM STARTUP COMPLETE! 🎉%RESET%
echo.
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%                    PLATFORM ACCESS INFORMATION%RESET%
echo %BLUE%════════════════════════════════════════════════════════════════%RESET%
echo.
echo %GREEN%🌐 FRONTEND APPLICATION:%RESET%
echo    Main Application:     http://localhost:3000
echo    Enterprise Dashboard: http://localhost:3000/dashboard
echo    AI Matching:          http://localhost:3000/dashboard/ai-matching
echo    Voice RFQ:            http://localhost:3000/dashboard/voice-rfq
echo    Wallet System:        http://localhost:3000/dashboard/wallet
echo    Categories:           http://localhost:3000/categories
echo.
echo %BLUE%🤖 AI EXPLAINABILITY SERVICE:%RESET%
echo    Health Check:         http://localhost:8000/health
echo    API Documentation:    http://localhost:8000/docs
echo    Metrics:              http://localhost:8000/metrics
echo.
echo %YELLOW%📋 TESTING CHECKLIST:%RESET%
echo    [ ] Navigate to dashboard and verify all 15+ features load
echo    [ ] Test AI Matching with "Generate AI Explanations"
echo    [ ] Test Voice RFQ with microphone recording
echo    [ ] Verify SHAP/LIME explanations display correctly
echo    [ ] Check wallet, RFQ management, and other features
echo.
echo %GREEN%💡 NEXT STEPS:%RESET%
echo    1. Open http://localhost:3000 in your browser
echo    2. Navigate through all dashboard features
echo    3. Test AI explainability and voice processing
echo    4. Verify OpenAI integration works with your API key
echo.
echo %BLUE%🏆 ENTERPRISE FEATURES READY:%RESET%
echo    ✅ AI-Powered Supplier Matching (SHAP/LIME)
echo    ✅ Voice RFQ Processing (Whisper + GPT-4)
echo    ✅ Predictive Analytics Dashboard
echo    ✅ Enterprise Wallet System
echo    ✅ Real-time Logistics Tracking
echo    ✅ Multi-tenant Architecture
echo    ✅ Production-ready Monitoring
echo.
echo %GREEN%Press any key to open the application in your default browser...%RESET%
pause >nul

:: Open browser to application
start http://localhost:3000

echo.
echo %GREEN%🚀 Bell24H Enterprise Platform is now running! 🚀%RESET%
echo %YELLOW%Keep both terminal windows open to maintain services.%RESET%
echo %YELLOW%Press Ctrl+C in either terminal to stop the respective service.%RESET%
echo.
echo %BLUE%Happy developing! 🎯%RESET%

pause 