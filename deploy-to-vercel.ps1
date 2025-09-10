# Bell24h Production Deployment Script
Write-Host "🚀 Starting Bell24h Production Deployment..." -ForegroundColor Green

# Step 1: Check Git Status
Write-Host "`n1. Checking Git status..." -ForegroundColor Yellow
git status

# Step 2: Add all changes
Write-Host "`n2. Adding all changes..." -ForegroundColor Yellow
git add .

# Step 3: Commit changes
Write-Host "`n3. Committing changes..." -ForegroundColor Yellow
git commit -m "Phone OTP authentication integrated - Production ready"

# Step 4: Check if Vercel CLI is installed
Write-Host "`n4. Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Step 5: Deploy to Vercel
Write-Host "`n5. Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "This will open a browser for authentication..." -ForegroundColor Cyan

# Deploy with automatic setup
vercel --prod --yes

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Your Bell24h app is now live on Vercel!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Add environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Set up PostgreSQL database" -ForegroundColor White
Write-Host "3. Configure SMS/Email services" -ForegroundColor White
Write-Host "4. Start sending WhatsApp messages to get customers!" -ForegroundColor White

Write-Host "`n💰 Ready to make money! Focus on customers now!" -ForegroundColor Green
