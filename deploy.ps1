# Bell24x Automatic Deployment Script
Write-Host "🚀 Starting Bell24x Deployment..." -ForegroundColor Green

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

# Step 3: Install Vercel CLI globally
Write-Host "🌐 Installing Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel

# Step 4: Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your Bell24x platform is now live!" -ForegroundColor Cyan
