@echo off
echo 🚀 BELL24H PHASE A: Basic E2E Validation
echo ==========================================

REM Check if npx is available
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: npx not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Run Phase A tests only
echo 📋 Running Phase A tests (5 pages only)...
echo ⏱️  Expected time: 1-2 minutes
echo.

REM Execute Phase A with Playwright
npx playwright test __tests__/e2e/phase-a-basic.spec.ts --headed

REM Check exit code
if %errorlevel% equ 0 (
    echo.
    echo ✅ PHASE A COMPLETED SUCCESSFULLY!
    echo 📊 Results: 5/5 tests passed
    echo 🎯 Core Bell24H pages validated
    echo.
    echo 🚀 Ready for Phase B (AI Features)
) else (
    echo.
    echo ❌ PHASE A FAILED
    echo 🔍 Check the errors above
    echo 💡 Make sure Bell24H server is running on localhost:3000
)

pause 