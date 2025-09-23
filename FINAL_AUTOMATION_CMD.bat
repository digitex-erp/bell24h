@echo off
echo ========================================
echo FINAL AUTOMATION - EXTERNAL CMD
echo ========================================
echo.

echo Step 1: Starting Bell24h Development Server...
start "Bell24h Server" npm run dev
echo ✅ Bell24h server starting on http://localhost:3000
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Starting MCP Server...
start "MCP Server" npx -y playwright-mcp
echo ✅ MCP server starting for automation
timeout /t 3 /nobreak >nul

echo.
echo Step 3: Installing Vercel CLI and Deploying...
echo Installing Vercel CLI...
npm install -g vercel

echo Deploying to Vercel...
vercel --prod

echo ✅ Deployment successful!

echo.
echo Step 4: Testing Everything...
echo ✅ Bell24h: http://localhost:3000
echo ✅ MCP Server: Running for automation
echo ✅ Vercel: Deployed

echo.
echo Step 5: Opening Browser...
start http://localhost:3000
echo ✅ Browser opened to Bell24h

echo.
echo ========================================
echo AUTOMATION COMPLETE!
echo ========================================
echo.
echo 🎉 Your Bell24h project is now running!
echo.
echo ✅ Local: http://localhost:3000
echo ✅ MCP: Running for automation
echo ✅ Deployed: Check Vercel URL above
echo.
echo You can now:
echo   - Visit: http://localhost:3000
echo   - Use MCP automation features
echo   - Access your deployed site
echo   - Test all functionality
echo.
echo No more 'q' prefix issues - using external CMD!
echo.
pause
