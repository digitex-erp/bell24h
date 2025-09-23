@echo off
echo ========================================
echo CURSOR TERMINAL FIX - WORKAROUND
echo ========================================

echo.
echo PROBLEM: Cursor is adding 'q' prefix to all commands
echo SOLUTION: Use direct PowerShell execution
echo.

echo Step 1: Starting PowerShell directly...
powershell.exe -Command "& {Write-Host 'Starting PowerShell fix...'; Remove-Item function:Q: -Force -ErrorAction SilentlyContinue; Write-Host 'Q: function removed'; Write-Host 'Testing commands...'; npm --version; node --version; Write-Host 'Fix complete!'}"

echo.
echo Step 2: Testing if fix worked...
echo If you see version numbers above, the fix worked!

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Close this terminal
echo 2. Open a NEW terminal in Cursor
echo 3. Try: npm --version
echo 4. If it works, start your MCP server
echo.

pause
