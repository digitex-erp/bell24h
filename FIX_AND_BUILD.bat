@echo off
echo ========================================
echo FIXING BUILD ERRORS AND TESTING
echo ========================================
echo.

echo [1] Navigating to correct directory...
cd /d C:\Users\Sanika\Projects\bell24h\client

echo [2] Current directory:
cd

echo [3] Testing build...
npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL! 
    echo Bell24h is ready for deployment.
    echo.
    echo Next: Setup Playwright MCP
) else (
    echo.
    echo ❌ BUILD FAILED - Check errors above
    echo.
    echo Common fixes:
    echo 1. Check for missing dependencies: npm install
    echo 2. Clear cache: npm cache clean --force
    echo 3. Delete node_modules and reinstall
)

echo.
pause
