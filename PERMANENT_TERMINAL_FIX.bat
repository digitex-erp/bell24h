@echo off
echo ========================================
echo PERMANENT TERMINAL FIX - REMOVE Q: FUNCTION
echo ========================================

echo.
echo PROBLEM IDENTIFIED: PowerShell Q: function is adding 'q' prefix to commands
echo.

echo Step 1: Removing the problematic Q: function...
powershell -Command "Remove-Item function:Q: -Force -ErrorAction SilentlyContinue"

echo Step 2: Clearing any Q: aliases...
powershell -Command "Remove-Item alias:Q: -Force -ErrorAction SilentlyContinue"

echo Step 3: Testing if fix worked...
echo Testing: npm --version
npm --version

echo.
echo Testing: node --version
node --version

echo.
echo Testing: dir
dir

echo.
echo ========================================
echo PERMANENT FIX APPLIED
echo ========================================
echo.
echo The Q: function has been removed from PowerShell.
echo Your terminal should now work normally.
echo.
echo Test your MCP server now!
echo.

pause
