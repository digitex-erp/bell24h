@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo 🔧 BELL24H REACT DEVELOPMENT SERVER FIX SCRIPT
echo ================================================================
echo.
echo Fixing React/Next.js development server issues...
echo.

:: Set colors for output
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "BLUE=%ESC%[34m"
set "YELLOW=%ESC%[33m"
set "RED=%ESC%[31m"
set "RESET=%ESC%[0m"

echo %YELLOW%Step 1: Killing all Node.js and React processes...%RESET%
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
taskkill /f /im npx.exe >nul 2>&1
echo %GREEN%✅ All Node.js processes terminated%RESET%
echo.

echo %YELLOW%Step 2: Clearing Next.js cache...%RESET%
if exist "client\.next" (
    rmdir /s /q "client\.next" >nul 2>&1
    echo %GREEN%✅ Next.js cache cleared%RESET%
) else (
    echo %YELLOW%No .next cache found%RESET%
)

if exist "client\node_modules\.cache" (
    rmdir /s /q "client\node_modules\.cache" >nul 2>&1
    echo %GREEN%✅ Node modules cache cleared%RESET%
)
echo.

echo %YELLOW%Step 3: Clearing npm cache...%RESET%
npm cache clean --force >nul 2>&1
echo %GREEN%✅ NPM cache cleared%RESET%
echo.

echo %YELLOW%Step 4: Reinstalling dependencies...%RESET%
cd client
if exist "node_modules" (
    rmdir /s /q "node_modules" >nul 2>&1
    echo %GREEN%✅ Old node_modules removed%RESET%
)

if exist "package-lock.json" (
    del "package-lock.json" >nul 2>&1
    echo %GREEN%✅ Package-lock.json removed%RESET%
)

echo %YELLOW%Installing fresh dependencies...%RESET%
npm install
if %errorlevel% == 0 (
    echo %GREEN%✅ Dependencies installed successfully%RESET%
) else (
    echo %RED%❌ Failed to install dependencies%RESET%
    pause
    exit /b 1
)
echo.

echo %YELLOW%Step 5: Starting development server...%RESET%
echo %GREEN%Starting Next.js development server...%RESET%
echo %YELLOW%URL: http://localhost:3000%RESET%
echo %YELLOW%Dashboard: http://localhost:3000/dashboard%RESET%
echo.

npm run dev

echo.
echo %GREEN%🎉 React development server should now be running cleanly! 🎉%RESET%
echo %YELLOW%If you still see errors, try restarting your computer.%RESET%
echo.
pause 