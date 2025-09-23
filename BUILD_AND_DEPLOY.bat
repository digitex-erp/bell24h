@echo off
echo Building and deploying Bell24h...

cd /d "C:\Users\Sanika\Projects\bell24h\client"

echo Installing dependencies...
call npm install

echo Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build successful! Deploying to Vercel...
call npx vercel --prod --yes

echo Deployment complete!
pause
