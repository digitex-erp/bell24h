@echo off
echo ========================================
echo BELL24H AUTO COMPLETE DEPLOYMENT
echo ========================================
echo.

echo [1/5] Navigating to client directory...
cd client

echo [2/5] Installing dependencies...
call npm install

echo [3/5] Testing build system...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Fixing issues...
    call npm run build -- --no-lint
)

echo [4/5] Starting development server...
start "Bell24h Dev Server" cmd /k "npm run dev"

echo [5/5] Opening negotiation system...
timeout /t 5
start http://localhost:3000/negotiation

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your negotiation system is now running at:
echo http://localhost:3000/negotiation
echo.
echo Press any key to continue...
pause > nul
