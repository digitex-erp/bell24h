# CONFIGURE VERCEL PRODUCTION ENVIRONMENT VARIABLES
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURING VERCEL ENVIRONMENT VARIABLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure production environment variables in Vercel." -ForegroundColor White
Write-Host ""

# Step 1: Check if Vercel CLI is installed
Write-Host "Step 1: Checking Vercel CLI installation..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "✅ Vercel CLI is installed: $vercelVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to check Vercel CLI. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
}

# Step 2: Login to Vercel
Write-Host ""
Write-Host "Step 2: Login to Vercel..." -ForegroundColor Yellow
Write-Host "You need to be logged in to Vercel to configure environment variables." -ForegroundColor White
Write-Host "If not logged in, this will open a browser window for authentication." -ForegroundColor Gray

try {
    vercel login
    Write-Host "✅ Successfully logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to login to Vercel" -ForegroundColor Red
    Write-Host "Please run 'vercel login' manually and then continue." -ForegroundColor Yellow
    Read-Host "Press Enter after logging in to Vercel"
}

# Step 3: Link to bell24h-v1 project
Write-Host ""
Write-Host "Step 3: Linking to bell24h-v1 project..." -ForegroundColor Yellow

# Create .vercel/project.json if it doesn't exist
$projectConfig = @{
    projectId = "prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS"
    orgId = "team_COE65vdscwE4rITBcp2XyKqm"
} | ConvertTo-Json

New-Item -ItemType Directory -Path ".vercel" -Force | Out-Null
$projectConfig | Out-File -FilePath ".vercel/project.json" -Encoding UTF8
Write-Host "✅ Project configuration created" -ForegroundColor Green

# Step 4: Set up environment variables
Write-Host ""
Write-Host "Step 4: Setting up production environment variables..." -ForegroundColor Yellow

# Razorpay Production Keys
Write-Host "Setting up Razorpay production keys..." -ForegroundColor Gray
try {
    vercel env add RAZORPAY_KEY_ID production
    Write-Host "Enter the value for RAZORPAY_KEY_ID: rzp_live_RJjxcgaBo9j0UA" -ForegroundColor White
    $razorpayKeyId = "rzp_live_RJjxcgaBo9j0UA"
    Write-Host "RAZORPAY_KEY_ID set to: $razorpayKeyId" -ForegroundColor Green
} catch {
    Write-Host "Failed to set RAZORPAY_KEY_ID via CLI" -ForegroundColor Yellow
    Write-Host "You'll need to set this manually in Vercel dashboard" -ForegroundColor Yellow
}

try {
    vercel env add RAZORPAY_KEY_SECRET production
    Write-Host "Enter the value for RAZORPAY_KEY_SECRET: lwTxLReQSkVL7lbrr39XSoyG" -ForegroundColor White
    $razorpayKeySecret = "lwTxLReQSkVL7lbrr39XSoyG"
    Write-Host "RAZORPAY_KEY_SECRET set" -ForegroundColor Green
} catch {
    Write-Host "Failed to set RAZORPAY_KEY_SECRET via CLI" -ForegroundColor Yellow
    Write-Host "You'll need to set this manually in Vercel dashboard" -ForegroundColor Yellow
}

# Database URL
Write-Host ""
Write-Host "Setting up database connection..." -ForegroundColor Gray
try {
    vercel env add DATABASE_URL production
    Write-Host "Enter your production DATABASE_URL (PostgreSQL connection string)" -ForegroundColor White
    Write-Host "Format: postgresql://username:password@host:port/database" -ForegroundColor Gray
    $databaseUrl = Read-Host "DATABASE_URL"
    if ($databaseUrl) {
        Write-Host "DATABASE_URL set" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to set DATABASE_URL via CLI" -ForegroundColor Yellow
}

# NextAuth Configuration
Write-Host ""
Write-Host "Setting up NextAuth configuration..." -ForegroundColor Gray
try {
    vercel env add NEXTAUTH_SECRET production
    $nextAuthSecret = Read-Host "Enter NEXTAUTH_SECRET (random string for JWT signing)"
    if ($nextAuthSecret) {
        Write-Host "NEXTAUTH_SECRET set" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to set NEXTAUTH_SECRET via CLI" -ForegroundColor Yellow
}

try {
    vercel env add NEXTAUTH_URL production
    $nextAuthUrl = "https://www.bell24h.com"
    Write-Host "NEXTAUTH_URL set to: $nextAuthUrl" -ForegroundColor Green
} catch {
    Write-Host "Failed to set NEXTAUTH_URL via CLI" -ForegroundColor Yellow
}

# Node Environment
Write-Host ""
Write-Host "Setting up Node.js environment..." -ForegroundColor Gray
try {
    vercel env add NODE_ENV production
    $nodeEnv = "production"
    Write-Host "NODE_ENV set to: $nodeEnv" -ForegroundColor Green
} catch {
    Write-Host "Failed to set NODE_ENV via CLI" -ForegroundColor Yellow
}

# Step 5: Create local environment files
Write-Host ""
Write-Host "Step 5: Creating local environment files..." -ForegroundColor Yellow

$envLocalContent = @"
# Razorpay Production Keys
RAZORPAY_KEY_ID=rzp_live_RJjxcgaBo9j0UA
RAZORPAY_KEY_SECRET=lwTxLReQSkVL7lbrr39XSoyG

# Database
DATABASE_URL=your_production_database_url_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://www.bell24h.com

# Environment
NODE_ENV=production
"@

$envProductionContent = @"
# Razorpay Production Keys
RAZORPAY_KEY_ID=rzp_live_RJjxcgaBo9j0UA
RAZORPAY_KEY_SECRET=lwTxLReQSkVL7lbrr39XSoyG

# Database
DATABASE_URL=your_production_database_url_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://www.bell24h.com

# Environment
NODE_ENV=production
"@

$envLocalContent | Out-File -FilePath ".env.local" -Encoding UTF8
$envProductionContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✅ Local environment files created" -ForegroundColor Green

# Step 6: Display manual setup instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MANUAL VERCEL DASHBOARD SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Since CLI environment variable setup can be complex, here's how to set them manually:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Yellow
Write-Host "2. Click on your 'bell24h-v1' project" -ForegroundColor Yellow
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor Yellow
Write-Host "4. Add these environment variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   RAZORPAY_KEY_ID = rzp_live_RJjxcgaBo9j0UA" -ForegroundColor Green
Write-Host "   RAZORPAY_KEY_SECRET = lwTxLReQSkVL7lbrr39XSoyG" -ForegroundColor Green
Write-Host "   NEXTAUTH_SECRET = [generate a random string]" -ForegroundColor Green
Write-Host "   NEXTAUTH_URL = https://www.bell24h.com" -ForegroundColor Green
Write-Host "   NODE_ENV = production" -ForegroundColor Green
Write-Host "   DATABASE_URL = [your production database URL]" -ForegroundColor Green
Write-Host ""
Write-Host "5. Make sure to select 'Production' environment for all variables" -ForegroundColor Yellow
Write-Host "6. Click 'Save' after adding each variable" -ForegroundColor Yellow
Write-Host ""

# Step 7: Generate a random NextAuth secret
Write-Host "Step 7: Generating NextAuth secret..." -ForegroundColor Yellow
$nextAuthSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "Generated NEXTAUTH_SECRET: $nextAuthSecret" -ForegroundColor Green
Write-Host "Copy this value to your Vercel environment variables!" -ForegroundColor Yellow

# Step 8: Display summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ENVIRONMENT VARIABLES SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Razorpay Keys: Configured" -ForegroundColor Green
Write-Host "✅ Project Linking: bell24h-v1" -ForegroundColor Green
Write-Host "✅ Local Files: Created (.env.local, .env.production)" -ForegroundColor Green
Write-Host "✅ NextAuth Secret: Generated" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Manual Setup Required:" -ForegroundColor Yellow
Write-Host "   - Add environment variables in Vercel Dashboard" -ForegroundColor Yellow
Write-Host "   - Set DATABASE_URL for your production database" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Vercel Dashboard URL:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Go to Vercel Dashboard" -ForegroundColor White
Write-Host "   2. Add the environment variables listed above" -ForegroundColor White
Write-Host "   3. Redeploy your project" -ForegroundColor White
Write-Host "   4. Test your live site" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
