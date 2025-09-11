@echo off
echo 🚀 CONNECTING BELL24H TO GITHUB → VERCEL AUTO DEPLOYMENT
echo.

echo Step 1: Setting up GitHub remote...
echo Please replace 'yourusername' and 'bell24h' with your actual GitHub details
echo.
echo Current remote status:
git remote -v
echo.

echo Step 2: Add your GitHub repository URL:
echo git remote add origin https://github.com/yourusername/bell24h.git
echo.
echo Step 3: Push to GitHub:
echo git push -u origin main
echo.

echo Step 4: Connect to Vercel:
echo 1. Go to https://vercel.com/dashboard
echo 2. Click "New Project"
echo 3. Import from GitHub → Select your bell24h repository
echo 4. Add environment variables (see env.example)
echo 5. Deploy!
echo.

echo 📋 ENVIRONMENT VARIABLES TO ADD IN VERCEL:
echo.
echo DATABASE_URL=postgresql://username:password@host:port/database
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
echo MSG91_SENDER_ID=BELL24H
echo RESEND_API_KEY=re_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4
echo FROM_EMAIL=noreply@bell24h.com
echo RAZORPAY_KEY_ID=your_razorpay_key_id_here
echo RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
echo JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
echo NEXTAUTH_URL=https://your-app.vercel.app
echo NEXTAUTH_SECRET=your_nextauth_secret_here
echo NODE_ENV=production
echo.

echo ✅ After completing these steps, every git push will auto-deploy to Vercel!
echo.
pause
