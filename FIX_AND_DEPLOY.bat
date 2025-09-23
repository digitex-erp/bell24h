@echo off
echo Fixing Bell24h deployment issues...

cd /d "C:\Users\Sanika\Projects\bell24h\client"

echo Step 1: Building project with fixes...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check the errors above.
    pause
    exit /b 1
)

echo Step 2: Build successful! Now deploying to Vercel...
echo You may need to login to Vercel first...

call npx vercel login
call npx vercel --prod --yes

echo Deployment complete!
echo Your site should be live at: https://bell24h-v1.vercel.app
pause