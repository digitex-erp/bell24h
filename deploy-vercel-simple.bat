@echo off
echo Starting Vercel Deployment...

echo Step 1: Installing dependencies...
call npm install

echo Step 2: Building project...
call npm run build

echo Step 3: Deploying to Vercel...
call npx vercel --prod --yes

echo Deployment complete!
pause
