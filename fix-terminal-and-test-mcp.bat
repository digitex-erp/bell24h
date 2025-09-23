@echo off
echo ========================================
echo FIXING TERMINAL ISSUE AND TESTING MCP
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
echo ✅ Terminal is working! Testing MCP server...
echo.

echo Step 2: Starting MCP Server...
echo Running: npx @modelcontextprotocol/server-filesystem
npx @modelcontextprotocol/server-filesystem
if %errorlevel% neq 0 (
    echo ERROR: MCP server failed to start
    echo Please check your MCP installation
    pause
    exit /b 1
)

echo.
echo ✅ MCP Server started successfully!
echo.
echo Step 3: Testing Bell24h project...
echo Running: npm run dev
npm run dev
if %errorlevel% neq 0 (
    echo ERROR: Bell24h project failed to start
    echo Please check your project setup
    pause
    exit /b 1
)

echo.
echo ✅ All tests passed! Your terminal and MCP are working!
echo.
pause
