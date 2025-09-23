@echo off
echo ========================================
echo RESTARTING BELL24H PROJECT
echo ========================================
echo.

echo Step 1: Stopping any running processes...
taskkill /f /im node.exe 2>nul

echo Step 2: Installing dependencies...
npm install

echo Step 3: Generating Prisma client...
npx prisma generate

echo Step 4: Starting development server...
echo.
echo Your Bell24h project will be available at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
