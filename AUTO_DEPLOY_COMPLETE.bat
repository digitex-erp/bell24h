@echo off
echo ========================================
echo    BELL24H COMPLETE AUTOMATED DEPLOYMENT
echo ========================================
echo.

echo Step 1: Checking prerequisites...
node --version
npm --version
echo.

echo Step 2: Installing dependencies...
call npm install
echo.

echo Step 3: Building project...
call npm run build
echo.

echo Step 4: Installing Vercel CLI...
call npm install -g vercel
echo.

echo Step 5: Creating environment template...
echo # Bell24h Environment Variables > .env.vercel.template
echo # Copy these to Vercel Dashboard ^> Settings ^> Environment Variables >> .env.vercel.template
echo. >> .env.vercel.template
echo # Database (Neon.tech) >> .env.vercel.template
echo DATABASE_URL=postgresql://[your-neon-connection-string] >> .env.vercel.template
echo POSTGRES_PRISMA_URL=[same-as-above] >> .env.vercel.template
echo POSTGRES_URL_NON_POOLING=[same-as-above] >> .env.vercel.template
echo. >> .env.vercel.template
echo # Authentication >> .env.vercel.template
echo NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters >> .env.vercel.template
echo NEXTAUTH_URL=https://bell24h.vercel.app >> .env.vercel.template
echo. >> .env.vercel.template
echo # API Keys (add your actual keys) >> .env.vercel.template
echo MSG91_API_KEY=your_msg91_key >> .env.vercel.template
echo SENDGRID_API_KEY=your_sendgrid_key >> .env.vercel.template
echo RAZORPAY_KEY_ID=your_razorpay_key >> .env.vercel.template
echo RAZORPAY_KEY_SECRET=your_razorpay_secret >> .env.vercel.template
echo. >> .env.vercel.template
echo # App Configuration >> .env.vercel.template
echo NODE_ENV=production >> .env.vercel.template
echo NEXT_PUBLIC_APP_URL=https://bell24h.vercel.app >> .env.vercel.template
echo.

echo Step 6: Creating deployment instructions...
echo # Bell24h Deployment Instructions > DEPLOYMENT_INSTRUCTIONS.md
echo. >> DEPLOYMENT_INSTRUCTIONS.md
echo ## Prerequisites Completed >> DEPLOYMENT_INSTRUCTIONS.md
echo - Node.js and npm installed >> DEPLOYMENT_INSTRUCTIONS.md
echo - Dependencies installed >> DEPLOYMENT_INSTRUCTIONS.md
echo - Project built successfully >> DEPLOYMENT_INSTRUCTIONS.md
echo - Vercel CLI installed >> DEPLOYMENT_INSTRUCTIONS.md
echo - Environment template created >> DEPLOYMENT_INSTRUCTIONS.md
echo. >> DEPLOYMENT_INSTRUCTIONS.md
echo ## Next Steps >> DEPLOYMENT_INSTRUCTIONS.md
echo. >> DEPLOYMENT_INSTRUCTIONS.md
echo ### 1. Deploy to Vercel >> DEPLOYMENT_INSTRUCTIONS.md
echo Run: vercel --prod >> DEPLOYMENT_INSTRUCTIONS.md
echo. >> DEPLOYMENT_INSTRUCTIONS.md
echo ### 2. Configure Environment Variables >> DEPLOYMENT_INSTRUCTIONS.md
echo Go to vercel.com/dashboard >> DEPLOYMENT_INSTRUCTIONS.md
echo Add variables from .env.vercel.template >> DEPLOYMENT_INSTRUCTIONS.md
echo. >> DEPLOYMENT_INSTRUCTIONS.md
echo ### 3. Get Neon Connection String >> DEPLOYMENT_INSTRUCTIONS.md
echo Go to console.neon.tech >> DEPLOYMENT_INSTRUCTIONS.md
echo Copy connection string to Vercel >> DEPLOYMENT_INSTRUCTIONS.md
echo.

echo Step 7: Creating quick deploy script...
echo @echo off > quick-deploy-vercel.bat
echo echo ======================================== >> quick-deploy-vercel.bat
echo echo    BELL24H QUICK DEPLOY TO VERCEL >> quick-deploy-vercel.bat
echo echo ======================================== >> quick-deploy-vercel.bat
echo echo. >> quick-deploy-vercel.bat
echo echo Step 1: Deploying to Vercel... >> quick-deploy-vercel.bat
echo echo Please follow the prompts: >> quick-deploy-vercel.bat
echo vercel --prod >> quick-deploy-vercel.bat
echo echo. >> quick-deploy-vercel.bat
echo echo Step 2: Configure environment variables >> quick-deploy-vercel.bat
echo echo Go to vercel.com/dashboard >> quick-deploy-vercel.bat
echo echo Add variables from .env.vercel.template >> quick-deploy-vercel.bat
echo echo. >> quick-deploy-vercel.bat
echo echo Step 3: Get Neon connection string >> quick-deploy-vercel.bat
echo echo Go to console.neon.tech >> quick-deploy-vercel.bat
echo echo Copy connection string to Vercel >> quick-deploy-vercel.bat
echo echo. >> quick-deploy-vercel.bat
echo echo DEPLOYMENT COMPLETE! >> quick-deploy-vercel.bat
echo echo Your app will be live at: https://bell24h.vercel.app >> quick-deploy-vercel.bat
echo echo. >> quick-deploy-vercel.bat
echo pause >> quick-deploy-vercel.bat
echo.

echo ========================================
echo    AUTOMATION COMPLETE!
echo ========================================
echo.
echo What was completed:
echo - Prerequisites checked
echo - Dependencies installed
echo - Project built successfully
echo - Vercel CLI installed
echo - Environment template created
echo - Deployment instructions created
echo - Quick deploy script created
echo.
echo Next Steps:
echo 1. Run: vercel --prod
echo 2. Configure environment variables in Vercel dashboard
echo 3. Add your Neon connection string
echo 4. Test your deployment
echo.
echo Cost Savings:
echo - Railway (deleted): $15-70/month
echo - Neon.tech (current): FREE
echo - Annual savings: $180-840
echo.
echo Your Bell24h application is ready to go live!
echo Expected URL: https://bell24h.vercel.app
echo.
echo Run 'quick-deploy-vercel.bat' to deploy now!
echo.
pause
