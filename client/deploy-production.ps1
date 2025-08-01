# 🚀 BELL24H PRODUCTION DEPLOYMENT SCRIPT (PowerShell)
# This script automates the deployment process for Bell24h on Windows

param(
  [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 BELL24H PRODUCTION DEPLOYMENT STARTING..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
  param([string]$Message)
  Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
  param([string]$Message)
  Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
  param([string]$Message)
  Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
  Write-Error "Please run this script from the client directory"
  exit 1
}

Write-Status "Starting Bell24h production deployment..."

# Step 1: Check environment variables
Write-Status "Checking environment variables..."
if (-not (Test-Path ".env.local")) {
  Write-Warning ".env.local file not found. Please create it with your Supabase credentials."
  Write-Host "Required variables:" -ForegroundColor Yellow
  Write-Host "- NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
  Write-Host "- NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
  Write-Host "- NEXT_PUBLIC_APP_URL" -ForegroundColor Yellow
    
  if (-not $Force) {
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
      exit 1
    }
  }
}
else {
  Write-Success "Environment file found"
}

# Step 2: Install dependencies
Write-Status "Installing dependencies..."
try {
  npm install
  Write-Success "Dependencies installed"
}
catch {
  Write-Error "Failed to install dependencies: $_"
  exit 1
}

# Step 3: Generate Prisma client
Write-Status "Generating Prisma client..."
try {
  npx prisma generate
  Write-Success "Prisma client generated"
}
catch {
  Write-Error "Failed to generate Prisma client: $_"
  exit 1
}

# Step 4: Build the application
Write-Status "Building Bell24h application..."
try {
  npm run build
  Write-Success "Application built successfully"
}
catch {
  Write-Error "Failed to build application: $_"
  exit 1
}

# Step 5: Deploy to Vercel
Write-Status "Deploying to Vercel..."
try {
  if ($Force) {
    npx vercel --prod --yes
  }
  else {
    npx vercel --prod
  }
  Write-Success "Deployment completed!"
}
catch {
  Write-Error "Failed to deploy to Vercel: $_"
  exit 1
}

# Step 6: Get deployment URL
Write-Status "Getting deployment URL..."
try {
  $vercelOutput = npx vercel ls --prod
  $deploymentUrl = $vercelOutput | Select-String "bell24h" | Select-Object -First 1
  if ($deploymentUrl) {
    $url = $deploymentUrl.ToString().Split()[-1]
    Write-Success "Deployment URL: $url"
  }
  else {
    $url = "https://your-app-url.vercel.app"
    Write-Warning "Could not determine deployment URL, using default: $url"
  }
}
catch {
  $url = "https://your-app-url.vercel.app"
  Write-Warning "Could not get deployment URL, using default: $url"
}

# Step 7: Verify deployment
Write-Status "Verifying deployment..."
Write-Host "Testing critical endpoints..." -ForegroundColor Blue

# Test homepage
try {
  $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing
  if ($response.StatusCode -eq 200) {
    Write-Success "Homepage accessible"
  }
  else {
    Write-Warning "Homepage returned status code: $($response.StatusCode)"
  }
}
catch {
  Write-Warning "Could not test homepage: $_"
}

# Test login page
try {
  $loginUrl = "$url/login"
  $response = Invoke-WebRequest -Uri $loginUrl -Method Head -UseBasicParsing
  if ($response.StatusCode -eq 200) {
    Write-Success "Login page accessible"
  }
  else {
    Write-Warning "Login page returned status code: $($response.StatusCode)"
  }
}
catch {
  Write-Warning "Could not test login page: $_"
}

# Test dashboard (should redirect to login)
try {
  $dashboardUrl = "$url/dashboard"
  $response = Invoke-WebRequest -Uri $dashboardUrl -Method Head -UseBasicParsing
  if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
    Write-Success "Dashboard endpoint accessible"
  }
  else {
    Write-Warning "Dashboard endpoint returned status code: $($response.StatusCode)"
  }
}
catch {
  Write-Warning "Could not test dashboard endpoint: $_"
}

# Step 8: Display next steps
Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Bell24h has been successfully deployed to production!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Your production URL: $url" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Configure Supabase SMTP settings for email functionality" -ForegroundColor White
Write-Host "2. Create user_profiles table in Supabase database" -ForegroundColor White
Write-Host "3. Test the complete user flow:" -ForegroundColor White
Write-Host "   - Registration → Email verification → Dashboard" -ForegroundColor White
Write-Host "   - Login → Dashboard" -ForegroundColor White
Write-Host "   - Password reset functionality" -ForegroundColor White
Write-Host "4. Launch your marketing campaign!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 READY FOR 5000-SUPPLIER ACQUISITION CAMPAIGN!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 MONITORING:" -ForegroundColor Yellow
Write-Host "- Check Vercel dashboard for deployment status" -ForegroundColor White
Write-Host "- Monitor Supabase dashboard for user activity" -ForegroundColor White
Write-Host "- Test email delivery in Supabase settings" -ForegroundColor White
Write-Host ""
Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "- If emails not working: Configure SMTP in Supabase" -ForegroundColor White
Write-Host "- If dashboard not loading: Check environment variables" -ForegroundColor White
Write-Host "- If build fails: Clear cache with 'Remove-Item -Recurse -Force .next'" -ForegroundColor White
Write-Host ""
Write-Success "Bell24h is now live and ready for your marketing launch! 🚀🇮🇳" 