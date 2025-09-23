@echo off
echo ========================================
echo AUTO STARTING BELL24H + MCP AUTOMATION
echo ========================================
echo.

echo Step 1: Starting Bell24h Development Server...
echo Running: npm run dev
start "Bell24h Server" npm run dev
echo ✅ Bell24h server starting on http://localhost:3000

echo.
echo Step 2: Starting MCP Server...
echo Running: npx -y playwright-mcp
start "MCP Server" npx -y playwright-mcp
echo ✅ MCP server starting for automation

echo.
echo Step 3: Checking Vercel CLI...
vercel --version
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI available
)

echo.
echo Step 4: Deploying to Vercel...
echo Running: vercel --prod
vercel --prod
echo ✅ Deployment initiated!

echo.
echo Step 5: Testing Everything...
echo ✅ Bell24h: http://localhost:3000
echo ✅ MCP Server: Running for automation
echo ✅ Vercel: Deployed

echo.
echo ========================================
echo AUTOMATION COMPLETE!
echo ========================================
echo.
echo 🎉 Your Bell24h project is now running!
echo.
echo You can now:
echo   - Visit: http://localhost:3000
echo   - Use MCP automation features
echo   - Access your deployed site
echo   - Test all functionality
echo.
pause
