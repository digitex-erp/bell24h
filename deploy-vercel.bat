@echo off
echo Deploying Bell24h to Vercel...
echo.

REM Set environment variables
set NODE_ENV=production
set NEXT_TELEMETRY_DISABLED=1

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the project
echo Building project...
call npm run build

REM Deploy to Vercel
echo Deploying to Vercel...
call npx vercel --prod --yes

echo.
echo Deployment complete!
pause
