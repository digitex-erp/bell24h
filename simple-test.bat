@echo off
echo ================================================================
echo BELL24H DEPLOYMENT REQUIREMENTS TEST
echo ================================================================
echo.
echo This script will test if your system meets the requirements
echo for Bell24h Railway deployment.
echo.
echo Press any key to continue...
pause

echo.
echo ================================================================
echo CHECKING REQUIREMENTS...
echo ================================================================
echo.

:: Check Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js is NOT installed
    echo    Please install Node.js from: https://nodejs.org/
)
echo.

:: Check npm
echo [2/4] Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm is NOT installed
    echo    Please install npm or reinstall Node.js
)
echo.

:: Check Git
echo [3/4] Checking Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git is installed
    git --version
) else (
    echo [ERROR] Git is NOT installed
    echo    Please install Git from: https://git-scm.com/
)
echo.

:: Check Internet Connection
echo [4/4] Checking Internet Connection...
ping -n 1 google.com >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Internet connection is working
) else (
    echo [ERROR] Internet connection failed
    echo    Please check your internet connection
)
echo.

echo ================================================================
echo SUMMARY
echo ================================================================
echo.

:: Count errors
set "errors=0"
node --version >nul 2>&1 || set /a errors+=1
npm --version >nul 2>&1 || set /a errors+=1
git --version >nul 2>&1 || set /a errors+=1
ping -n 1 google.com >nul 2>&1 || set /a errors+=1

if %errors% equ 0 (
    echo SUCCESS: ALL REQUIREMENTS MET!
    echo.
    echo You can now run: deploy-to-railway.bat
    echo.
    echo Press any key to run the deployment script...
    pause
    call deploy-to-railway.bat
) else (
    echo WARNING: %errors% REQUIREMENT(S) MISSING
    echo.
    echo Please fix the missing requirements above before running the deployment.
    echo.
    echo After fixing the issues, run this test again or directly run:
    echo deploy-to-railway.bat
)

echo.
echo Press any key to close this window...
pause
