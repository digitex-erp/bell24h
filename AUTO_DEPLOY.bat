@echo off
echo 🚀 BELL24H AUTOMATED DEPLOYMENT TO VERCEL
echo ==========================================

echo.
echo Step 1: Installing Vercel CLI...
call npm install -g vercel

echo.
echo Step 2: Deploying to Vercel using npx...
echo This will open a browser for login...
call npx vercel login

echo.
echo Step 3: Deploying to production...
echo Answer the prompts as follows:
echo - Set up and deploy? → Y
echo - Which scope? → Press Enter
echo - Link to existing project? → N
echo - Project name? → bell24h
echo - Directory? → Press Enter
echo - Override settings? → N
echo.
call npx vercel --prod

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo IMPORTANT: Add environment variables in Vercel Dashboard:
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select your bell24h project
echo 3. Go to Settings → Environment Variables
echo 4. Add the variables from COPY_PASTE_DEPLOYMENT.txt
echo 5. Redeploy with: npx vercel --prod
echo.
echo Your Bell24h platform is now live and ready for revenue generation!
echo.
pause
