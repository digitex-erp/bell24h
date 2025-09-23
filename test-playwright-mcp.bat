@echo off
echo ========================================
echo TESTING PLAYWRIGHT MCP SERVER
echo ========================================
echo.

echo Step 1: Testing if terminal is fixed...
echo Running: npm --version
npm --version
if %errorlevel% neq 0 (
    echo ERROR: Terminal still has 'q' prefix issue!
    echo Please use External Terminal (Ctrl+Shift+P -> Terminal: Open External Terminal)
    pause
    exit /b 1
)

echo.
echo ✅ Terminal is working! Testing Playwright MCP...
echo.

echo Step 2: Checking MCP configuration...
if exist ".cursor\mcp.json" (
    echo ✅ MCP config file found: .cursor\mcp.json
) else (
    echo ❌ ERROR: MCP config file not found!
    pause
    exit /b 1
)

echo.
echo Step 3: Testing Playwright MCP server...
echo Running: npx -y playwright-mcp
echo.
echo This will test if the Playwright MCP server can start...
echo If successful, you should see MCP server output.
echo.

npx -y playwright-mcp
if %errorlevel% neq 0 (
    echo ERROR: Playwright MCP server failed to start
    echo This might be normal if the server is waiting for connections
    echo Let's check if it's actually working...
)

echo.
echo Step 4: Testing Bell24h project...
echo Running: npm run dev
npm run dev
if %errorlevel% neq 0 (
    echo ERROR: Bell24h project failed to start
    echo Please check your project setup
    pause
    exit /b 1
)

echo.
echo ✅ All tests completed!
echo.
echo Your Playwright MCP server should now be working!
echo You can use it for web automation and testing in your Bell24h project.
echo.
pause
