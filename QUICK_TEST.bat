@echo off
echo ========================================
echo QUICK BELL24H + MCP TEST
echo ========================================
echo.

echo [1] Testing Bell24h build...
cd client
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Bell24h build: SUCCESS
) else (
    echo ❌ Bell24h build: FAILED
)
cd ..

echo.
echo [2] Testing Playwright MCP...
npx -y playwright-mcp --version 2>nul
if %errorlevel% equ 0 (
    echo ✅ Playwright MCP: WORKING
) else (
    echo ❌ Playwright MCP: FAILED (Node.js version issue)
)

echo.
echo [3] Testing Node.js version...
node --version
echo Current version above - need 22+ for full compatibility

echo.
echo [4] Checking Cursor MCP config...
if exist ".cursor\mcp.json" (
    echo ✅ Cursor MCP config: EXISTS
    type .cursor\mcp.json
) else (
    echo ❌ Cursor MCP config: MISSING
)

echo.
echo ========================================
echo TEST RESULTS SUMMARY
echo ========================================
echo.
echo If Bell24h build works: ✅ Your main project is ready!
echo If Playwright MCP fails: Update Node.js to v22+
echo If Cursor MCP config missing: Run AUTOMATE_SETUP.bat
echo.
pause
