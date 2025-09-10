@echo off
echo 🚀 Deploying Bell24h to Production...

echo.
echo 1. Adding all changes...
git add .

echo.
echo 2. Committing changes...
git commit -m "Phone OTP authentication integrated - Ready for customers"

echo.
echo 3. Creating GitHub repository...
echo Note: You need to create the repository manually at https://github.com/new
echo Repository name: bell24h-production
echo Then run: git remote add origin https://github.com/[your-username]/bell24h-production.git

echo.
echo 4. Pushing to GitHub...
git push -u origin main

echo.
echo 5. Deploy to Vercel...
echo Go to https://vercel.com/new
echo Import from GitHub: bell24h-production
echo Add environment variables:
echo - DATABASE_URL=postgresql://[neon-connection-string]
echo - NEXTAUTH_SECRET=your-secret-key-here
echo - MSG91_AUTH_KEY=your-msg91-key

echo.
echo ✅ Deployment complete! Now focus on customers!
echo.
echo NEXT: Send WhatsApp messages to get your first ₹2,000 customer!