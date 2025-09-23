@echo off
echo ========================================
echo BELL24H + TOOLHIVE + PLAYWRIGHT MCP SETUP
echo ========================================
echo.

echo [1/6] Testing Bell24h Build...
cd client
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Bell24h build successful!
) else (
    echo ❌ Bell24h build failed - check errors above
)
cd ..

echo.
echo [2/6] Checking Node.js version...
node --version
echo Current Node.js version above ^^
echo NOTE: You need Node.js 22+ for ToolHive and Playwright MCP
echo.

echo [3/6] Installing Playwright MCP...
npm install -g playwright-mcp
if %errorlevel% equ 0 (
    echo ✅ Playwright MCP installed successfully!
) else (
    echo ❌ Playwright MCP installation failed
    echo Trying alternative method...
    npx -y playwright-mcp
)

echo.
echo [4/6] Testing Playwright MCP...
npx -y playwright-mcp --version
if %errorlevel% equ 0 (
    echo ✅ Playwright MCP is working!
) else (
    echo ❌ Playwright MCP test failed
)

echo.
echo [5/6] Setting up ToolHive (if Node.js 22+)...
node --version | findstr "v22" >nul
if %errorlevel% equ 0 (
    echo Node.js 22+ detected - installing ToolHive...
    cd toolhive-studio
    call npm install --legacy-peer-deps
    if %errorlevel% equ 0 (
        echo ✅ ToolHive dependencies installed!
    ) else (
        echo ❌ ToolHive installation failed
    )
    cd ..
) else (
    echo ⚠️  Node.js 22+ required for ToolHive - skipping
    echo Download pre-built ToolHive from: https://github.com/stacklok/toolhive-studio/releases
)

echo.
echo [6/6] Creating Cursor MCP configuration...
if not exist ".cursor" mkdir .cursor
echo {> .cursor\mcp.json
echo   "mcpServers": {>> .cursor\mcp.json
echo     "playwright-mcp": {>> .cursor\mcp.json
echo       "command": "npx",>> .cursor\mcp.json
echo       "args": [>> .cursor\mcp.json
echo         "-y",>> .cursor\mcp.json
echo         "playwright-mcp">> .cursor\mcp.json
echo       ]>> .cursor\mcp.json
echo     }>> .cursor\mcp.json
echo   }>> .cursor\mcp.json
echo }>> .cursor\mcp.json
echo ✅ Cursor MCP configuration created!

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Restart Cursor IDE
echo 2. Test Playwright MCP with: "Take a screenshot of bell24h.com"
echo 3. If ToolHive failed, download from: https://github.com/stacklok/toolhive-studio/releases
echo 4. If Node.js version issues, update to Node.js 22+ from: https://nodejs.org/
echo.
pause
