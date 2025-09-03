# Simple Railway Deployment Script for Bell24h
# This script handles Railway deployment step by step

Write-Host "🚀 Starting Bell24h Railway Deployment..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Step 1: Check if Railway CLI is installed
Write-Host "🔍 Checking Railway CLI..." -ForegroundColor Blue
try {
    $railwayVersion = railway --version 2>$null
    if ($railwayVersion) {
        Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
    } else {
        throw "Railway CLI not found"
    }
} catch {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
}

# Step 2: Login to Railway
Write-Host "🔐 Logging in to Railway..." -ForegroundColor Blue
Write-Host "Please follow the browser authentication..." -ForegroundColor Yellow
railway login

# Step 3: Initialize Railway project
Write-Host "🏗️  Initializing Railway project..." -ForegroundColor Blue
railway init bell24h-production

# Step 4: Add PostgreSQL database
Write-Host "🗄️  Adding PostgreSQL database..." -ForegroundColor Blue
railway add postgresql

# Step 5: Set environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Blue

# Core variables
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_APP_URL=https://bell24h-production.up.railway.app
railway variables set NEXTAUTH_URL=https://bell24h-production.up.railway.app
railway variables set NEXTAUTH_SECRET=bell24h-super-secret-key-32-chars-minimum-required
railway variables set JWT_SECRET=bell24h-jwt-secret-key-32-chars-minimum

# API Keys (using your existing configuration)
railway variables set API_SECRET_KEY=bell24h-api-secret-key-2024
railway variables set RAZORPAY_KEY_ID=rzp_test_your_key_id
railway variables set RAZORPAY_KEY_SECRET=your_razorpay_secret_key
railway variables set CLOUDINARY_CLOUD_NAME=bell24h
railway variables set CLOUDINARY_API_KEY=your_cloudinary_api_key
railway variables set CLOUDINARY_API_SECRET=your_cloudinary_api_secret
railway variables set OPENAI_API_KEY=your_openai_api_key
railway variables set NANO_BANANA_API_KEY=your_nano_banana_api_key
railway variables set N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/bell24h

# Feature flags
railway variables set ENABLE_ESCROW=false
railway variables set ENABLE_AI_MARKETING=true
railway variables set ENABLE_UGC=true

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Step 6: Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Blue
railway up

Write-Host "✅ Deployment initiated!" -ForegroundColor Green

# Step 7: Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
railway run npx prisma migrate deploy

# Step 8: Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Blue
railway run npx prisma db seed

# Step 9: Get deployment URL
Write-Host "🌐 Getting deployment URL..." -ForegroundColor Blue
$deploymentUrl = railway domain

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🌐 Your Bell24h platform is live at: $deploymentUrl" -ForegroundColor Blue
Write-Host "👑 Admin Panel: $deploymentUrl/admin" -ForegroundColor Blue
Write-Host "💰 Pricing Page: $deploymentUrl/pricing" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update API keys in Railway dashboard with your real keys" -ForegroundColor White
Write-Host "2. Test all integrations" -ForegroundColor White
Write-Host "3. Create your first admin account" -ForegroundColor White
Write-Host "4. Set up your first marketing campaign" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Bell24h is now LIVE on Railway!" -ForegroundColor Green
