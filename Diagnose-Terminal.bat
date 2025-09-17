@echo off
echo ========================================
echo    TERMINAL DIAGNOSTIC SCRIPT
echo ========================================
echo.

echo [TEST 1] Basic CMD functionality...
echo Testing CMD: ok-cmd
echo.

echo [TEST 2] PowerShell version check...
powershell -NoProfile -Command "try { $PSVersionTable.PSVersion; 'ok-ps' } catch { 'ps-error: ' + $_.Exception.Message }"
echo.

echo [TEST 3] Node.js check...
node -v 2>NUL || echo node-not-found
echo.

echo [TEST 4] NPM check...
npm -v 2>NUL || echo npm-not-found
echo.

echo [TEST 5] Checking CMD AutoRun...
reg query "HKCU\Software\Microsoft\Command Processor" /v AutoRun 2>NUL || echo no-autorun
echo.

echo [TEST 6] Checking PowerShell profiles...
powershell -NoProfile -Command "Get-ChildItem -LiteralPath $PROFILE* -ErrorAction SilentlyContinue | Select-Object Name"
echo.

echo [TEST 7] Checking execution policy...
powershell -NoProfile -Command "Get-ExecutionPolicy -Scope CurrentUser"
echo.

echo ========================================
echo    DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo Please share the output above to help identify the issue.
pause
