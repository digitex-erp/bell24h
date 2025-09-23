@echo off
echo ========================================
echo PLAYWRIGHT MCP SETUP FOR CURSOR
echo ========================================
echo.

echo [1] Installing Playwright MCP globally...
npm install -g playwright-mcp
if %errorlevel% equ 0 (
    echo ✅ Playwright MCP installed successfully!
) else (
    echo ❌ Global installation failed, trying npx method...
    echo This is normal - npx method works better
)

echo.
echo [2] Testing Playwright MCP...
npx -y playwright-mcp --version
if %errorlevel% equ 0 (
    echo ✅ Playwright MCP is working!
) else (
    echo ⚠️  Playwright MCP test failed - may need Node.js update
)

echo.
echo [3] Creating Cursor MCP configuration...
if not exist ".cursor" mkdir .cursor

echo Creating .cursor\mcp.json...
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
echo [4] Testing Bell24h with Playwright...
echo You can now test with commands like:
echo - "Take a screenshot of bell24h.com"
echo - "Navigate to the Bell24h supplier page and verify the layout"
echo - "Test the RFQ form functionality"

echo.
echo ========================================
echo PLAYWRIGHT MCP SETUP COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Restart Cursor IDE
echo 2. Test with: "Take a screenshot of bell24h.com"
echo 3. Create automated tests for Bell24h features
echo.
echo EXAMPLE COMMANDS FOR BELL24H:
echo - "Navigate to bell24h.com and test the homepage"
echo - "Check if the supplier registration form works"
echo - "Verify the RFQ creation process"
echo - "Test the payment flow with Razorpay"
echo.
pause
