@echo off
echo ========================================
echo NODE.JS UPDATE HELPER
echo ========================================
echo.
echo Current Node.js version:
node --version
echo.
echo REQUIRED VERSIONS:
echo - ToolHive: Node.js ^>=22.0.0 ^<23.0.0
echo - Playwright MCP: Node.js ^^20.19.0 ^|^| ^>=22.12.0
echo - Your version: ^^ (see above)
echo.
echo TO UPDATE NODE.JS:
echo 1. Go to: https://nodejs.org/
echo 2. Download Node.js 22.x LTS
echo 3. Run the installer
echo 4. Restart your terminal
echo 5. Run: node --version (should show v22.x.x)
echo.
echo ALTERNATIVE - Use Node Version Manager:
echo 1. Install nvm-windows from: https://github.com/coreybutler/nvm-windows
echo 2. Run: nvm install 22
echo 3. Run: nvm use 22
echo.
echo After updating Node.js, run AUTOMATE_SETUP.bat again
echo.
pause
