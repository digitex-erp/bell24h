@echo off
echo ========================================
echo EXECUTING CURSOR AGENTS SOLUTION
echo ========================================

echo [1/8] Closing VS Code completely...
taskkill /f /im "Code.exe" 2>nul || echo "VS Code not running"

echo [2/8] Stopping all Node processes...
taskkill /f /im "node.exe" 2>nul || echo "No Node processes running"

echo [3/8] Navigating to client directory...
cd client

echo [4/8] Cleaning .next directory...
rmdir /s /q .next 2>nul || echo ".next directory not found"

echo [5/8] Cleaning node_modules...
rmdir /s /q node_modules 2>nul || echo "node_modules not found"

echo [6/8] Clearing npm cache...
npm cache clean --force

echo [7/8] Fixing permissions...
takeown /f /r /d y
icacls . /grant "%USERNAME%:(OI)(CI)F" /t

echo [8/8] Reinstalling and building...
npm install
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo Following Cursor Agents solution worked!
    echo Your project can now build successfully.
) else (
    echo ========================================
    echo BUILD STILL FAILING
    echo ========================================
    echo Check the output above for details.
    echo Try running PowerShell as Administrator.
)

echo.
pause
