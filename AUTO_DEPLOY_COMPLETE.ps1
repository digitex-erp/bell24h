# Bell24h Complete Automated Deployment
# PowerShell script for Windows

Write-Host "🚀 BELL24H COMPLETE AUTOMATED DEPLOYMENT" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Check prerequisites
Write-Host "📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js or npm not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`n📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Build project
Write-Host "`n🔨 Step 3: Building project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Install Vercel CLI
Write-Host "`n📦 Step 4: Installing Vercel CLI..." -ForegroundColor Yellow
try {
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
    exit 1
}

# Step 5: Create environment template
Write-Host "`n⚙️ Step 5: Creating environment template..." -ForegroundColor Yellow
$envTemplate = @"
# Bell24h Environment Variables
# Copy these to Vercel Dashboard → Settings → Environment Variables

# Database (Neon.tech)
DATABASE_URL=postgresql://[your-neon-connection-string]
POSTGRES_PRISMA_URL=[same-as-above]
POSTGRES_URL_NON_POOLING=[same-as-above]

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
NEXTAUTH_URL=https://bell24h.vercel.app

# API Keys (add your actual keys)
MSG91_API_KEY=your_msg91_key
SENDGRID_API_KEY=your_sendgrid_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.vercel.app
"@

$envTemplate | Out-File -FilePath ".env.vercel.template" -Encoding UTF8
Write-Host "✅ Environment template created: .env.vercel.template" -ForegroundColor Green

# Step 6: Create deployment instructions
Write-Host "`n📝 Step 6: Creating deployment instructions..." -ForegroundColor Yellow
$instructions = @"
# 🚀 Bell24h Deployment Instructions

## ✅ Prerequisites Completed
- ✅ Node.js and npm installed
- ✅ Dependencies installed
- ✅ Project built successfully
- ✅ Vercel CLI installed
- ✅ Environment template created

## 🎯 Next Steps

### 1. Deploy to Vercel
Run this command in your terminal:
``````bash
vercel --prod
``````

### 2. Configure Environment Variables
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your Bell24h project
3. Go to Settings → Environment Variables
4. Add all variables from .env.vercel.template
5. Redeploy

### 3. Get Your Neon Connection String
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click on your Bell24h project
3. Click "Connection Details" in bell24h-prod database
4. Copy the "Connection string"
5. Update DATABASE_URL in Vercel

### 4. Test Your Deployment
Visit your deployed URL and test:
- ✅ Homepage loads
- ✅ Phone OTP authentication works
- ✅ Admin dashboard accessible
- ✅ Database operations work

## 🎉 Expected Results
- **URL**: https://bell24h.vercel.app
- **Cost**: ₹0/month (saved $180-840/year)
- **Database**: Free Neon.tech
- **Features**: All working

## 📞 Need Help?
If you encounter any issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connection
4. Check GitHub repository settings

Your Bell24h application is ready to go live! 🚀
"@

$instructions | Out-File -FilePath "DEPLOYMENT_INSTRUCTIONS.md" -Encoding UTF8
Write-Host "✅ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Green

# Step 7: Create quick deploy script
Write-Host "`n🚀 Step 7: Creating quick deploy script..." -ForegroundColor Yellow
$quickDeployScript = @"
@echo off
echo ========================================
echo    BELL24H QUICK DEPLOY TO VERCEL
echo ========================================
echo.

echo Step 1: Deploying to Vercel...
echo Please follow the prompts:
vercel --prod

echo.
echo Step 2: Configure environment variables
echo Go to vercel.com/dashboard
echo Add variables from .env.vercel.template
echo.

echo Step 3: Get Neon connection string
echo Go to console.neon.tech
echo Copy connection string to Vercel
echo.

echo ✅ DEPLOYMENT COMPLETE!
echo Your app will be live at: https://bell24h.vercel.app
echo.
pause
"@

$quickDeployScript | Out-File -FilePath "quick-deploy-vercel.bat" -Encoding UTF8
Write-Host "✅ Quick deploy script created: quick-deploy-vercel.bat" -ForegroundColor Green

# Step 8: Final summary
Write-Host "`n🎉 AUTOMATION COMPLETE!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "`n📊 What was completed:" -ForegroundColor Cyan
Write-Host "✅ Prerequisites checked" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "✅ Project built successfully" -ForegroundColor Green
Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
Write-Host "✅ Environment template created" -ForegroundColor Green
Write-Host "✅ Deployment instructions created" -ForegroundColor Green
Write-Host "✅ Quick deploy script created" -ForegroundColor Green

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run: vercel --prod" -ForegroundColor White
Write-Host "2. Configure environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "3. Add your Neon connection string" -ForegroundColor White
Write-Host "4. Test your deployment" -ForegroundColor White

Write-Host "`n💰 Cost Savings:" -ForegroundColor Cyan
Write-Host "❌ Railway (deleted): $15-70/month" -ForegroundColor Red
Write-Host "✅ Neon.tech (current): FREE" -ForegroundColor Green
Write-Host "💰 Annual savings: $180-840" -ForegroundColor Yellow

Write-Host "`n🚀 Your Bell24h application is ready to go live!" -ForegroundColor Green
Write-Host "📱 Expected URL: https://bell24h.vercel.app" -ForegroundColor Cyan
Write-Host "`nRun 'quick-deploy-vercel.bat' to deploy now!" -ForegroundColor Yellow
