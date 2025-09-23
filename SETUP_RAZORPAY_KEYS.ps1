# PowerShell script to set up Razorpay production keys
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SETTING UP RAZORPAY PRODUCTION KEYS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Razorpay Live API Keys:" -ForegroundColor Yellow
Write-Host "✅ Key ID: rzp_live_RJjxcgaBo9j0UA" -ForegroundColor Green
Write-Host "✅ Key Secret: lwTxLReQSkVL7lbrr39XSoyG" -ForegroundColor Green
Write-Host ""

# Create .env.local file
Write-Host "Creating .env.local file with Razorpay keys..." -ForegroundColor Yellow

$envContent = @"
# Bell24h Environment Variables
# Production Razorpay Configuration

# Razorpay Live API Keys
RAZORPAY_KEY_ID=rzp_live_RJjxcgaBo9j0UA
RAZORPAY_KEY_SECRET=lwTxLReQSkVL7lbrr39XSoyG

# Environment
NODE_ENV=production

# Database (if needed)
# DATABASE_URL=your_database_url_here

# NextAuth (if needed)
# NEXTAUTH_URL=https://www.bell24h.com
# NEXTAUTH_SECRET=your_nextauth_secret_here

# Other API Keys (add as needed)
# OPENAI_API_KEY=your_openai_key_here
# STRIPE_SECRET_KEY=your_stripe_key_here

# Note: This file contains live production keys
# Keep this file secure and never commit to version control
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ .env.local file created with Razorpay keys" -ForegroundColor Green

# Also create .env.production for Vercel deployment
Write-Host ""
Write-Host "Creating .env.production for Vercel deployment..." -ForegroundColor Yellow

$prodContent = @"
# Bell24h Production Environment Variables
# Razorpay Live API Configuration

RAZORPAY_KEY_ID=rzp_live_RJjxcgaBo9j0UA
RAZORPAY_KEY_SECRET=lwTxLReQSkVL7lbrr39XSoyG
NODE_ENV=production
"@

$prodContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✅ .env.production file created for Vercel" -ForegroundColor Green

# Verify files were created
Write-Host ""
Write-Host "Verifying environment files..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
}

if (Test-Path ".env.production") {
    Write-Host "✅ .env.production exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env.production not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RAZORPAY KEYS SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Razorpay live keys have been stored in:" -ForegroundColor Green
Write-Host "  📁 .env.local (for local development)" -ForegroundColor White
Write-Host "  📁 .env.production (for Vercel deployment)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Important Security Notes:" -ForegroundColor Yellow
Write-Host "  • These are LIVE production keys" -ForegroundColor White
Write-Host "  • Never commit these files to version control" -ForegroundColor White
Write-Host "  • Add .env.local and .env.production to .gitignore" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run the deployment script to deploy with Razorpay" -ForegroundColor White
Write-Host "  2. Configure environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "  3. Test payment functionality on live site" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
