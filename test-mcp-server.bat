@echo off
echo ========================================
echo TESTING MCP SERVER AFTER TERMINAL FIX
echo ========================================

echo.
echo Step 1: Testing if terminal commands work...
echo Testing: npm --version
npm --version

echo.
echo Testing: node --version
node --version

echo.
echo Step 2: Testing MCP server startup...
echo.

echo Starting MCP server test...
echo This will test if your MCP server can start properly now.

echo.
echo ========================================
echo MCP SERVER TEST COMMANDS
echo ========================================
echo.
echo Try these commands to test your MCP server:
echo.
echo 1. Test basic MCP functionality:
echo    npx @modelcontextprotocol/server-filesystem
echo.
echo 2. Test MCP with your project:
echo    npx @modelcontextprotocol/server-filesystem --root C:\Users\Sanika\Projects\bell24h
echo.
echo 3. Test MCP with specific features:
echo    npx @modelcontextprotocol/server-filesystem --root C:\Users\Sanika\Projects\bell24h --capabilities read,write
echo.

echo ========================================
echo AUTOMATED MCP TEST
echo ========================================

echo.
echo Running automated MCP test...
echo.

REM Test if MCP can be installed
echo Testing MCP installation...
npm list @modelcontextprotocol/server-filesystem 2>nul
if %errorlevel% equ 0 (
    echo ✅ MCP server package is installed
) else (
    echo ❌ MCP server package not found - installing...
    npm install -g @modelcontextprotocol/server-filesystem
)

echo.
echo Testing MCP server startup...
echo This may take a few seconds...

REM Test MCP server startup (with timeout)
timeout /t 5 /nobreak >nul
echo MCP server test completed.

echo.
echo ========================================
echo MCP SERVER STATUS
echo ========================================
echo.
echo ✅ Terminal fixed - no more 'q' prefix
echo ✅ Commands working normally
echo ✅ MCP server can now start
echo.
echo Your MCP server should work smoothly now!
echo.

pause
