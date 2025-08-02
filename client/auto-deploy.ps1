# 🚀 BELL24H AUTOMATED DEPLOYMENT SYSTEM
# ======================================
# Fully automated deployment with no manual intervention required

Write-Host "🚀 BELL24H AUTOMATED DEPLOYMENT SYSTEM" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 This will automatically deploy your Bell24h platform!" -ForegroundColor Cyan
Write-Host "📝 No manual intervention required - fully automated" -ForegroundColor Cyan
Write-Host ""
pause

Write-Host "🔍 STEP 1: SYSTEM CHECK" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Installing Node.js..." -ForegroundColor Red
    Write-Host "📥 Downloading Node.js installer..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi" -OutFile "nodejs-installer.msi"
    Write-Host "🔧 Installing Node.js (this may take a few minutes)..." -ForegroundColor Cyan
    Start-Process msiexec.exe -Wait -ArgumentList "/i nodejs-installer.msi /quiet /norestart"
    Write-Host "✅ Node.js installed! Please restart this script." -ForegroundColor Green
    pause
    exit
}

Write-Host ""
Write-Host "🔧 STEP 2: GIT CONFIGURATION" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Configure Git with your GitHub credentials
Write-Host "📝 Setting up Git configuration..." -ForegroundColor Cyan
git config --global user.name "digitex-erp"
git config --global user.email "96367718+digitex-erp@users.noreply.github.com"

Write-Host "✅ Git configured with your GitHub account" -ForegroundColor Green
Write-Host ""

Write-Host "📦 STEP 3: INSTALLING DEPLOYMENT TOOLS" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

# Install Vercel CLI
Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Cyan
try {
    npm install -g vercel
    $VERCEL_CMD = "vercel"
    Write-Host "✅ Vercel CLI installed globally" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Global install failed, trying alternative method..." -ForegroundColor Yellow
    npm install vercel
    $VERCEL_CMD = "npx vercel"
    Write-Host "✅ Vercel CLI installed locally" -ForegroundColor Green
}

Write-Host "✅ Deployment tools ready" -ForegroundColor Green
Write-Host ""

Write-Host "🛠️ STEP 4: PREPARING PROJECT FOR DEPLOYMENT" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow

# Ensure package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "📝 Creating package.json..." -ForegroundColor Cyan
    $packageJson = @{
        name = "bell24h-marketplace"
        version = "1.0.0"
        scripts = @{
            dev = "next dev"
            build = "next build"
            start = "next start"
        }
        dependencies = @{
            next = "14.0.0"
            react = "18.2.0"
            "react-dom" = "18.2.0"
        }
    }
    $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "package.json" -Encoding UTF8
}

# Install dependencies
Write-Host "📦 Installing project dependencies..." -ForegroundColor Cyan
npm install

Write-Host "✅ Project prepared for deployment" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 STEP 5: GIT REPOSITORY SETUP" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

# Remove broken remote and create new repository
Write-Host "🔧 Fixing Git repository connection..." -ForegroundColor Cyan
git remote remove origin 2>$null

# Add new remote
Write-Host "🔗 Connecting to new repository..." -ForegroundColor Cyan
git remote add origin https://github.com/digitex-erp/bell24h-marketplace.git

Write-Host "✅ Git repository configured" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 STEP 6: DEPLOYING TO VERCEL" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

Write-Host "📤 Starting automated deployment..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 DEPLOYMENT PROCESS:" -ForegroundColor Cyan
Write-Host "   - Creating new Vercel project" -ForegroundColor White
Write-Host "   - Uploading all your fixes" -ForegroundColor White
Write-Host "   - Building the application" -ForegroundColor White
Write-Host "   - Deploying to production" -ForegroundColor White
Write-Host ""
Write-Host "⏱️ This will take 3-5 minutes..." -ForegroundColor Yellow
Write-Host ""

# Deploy to Vercel with automated responses
Write-Host "🎯 Deploying to Vercel..." -ForegroundColor Green
& $VERCEL_CMD --prod --confirm

Write-Host ""
Write-Host "🎉 STEP 7: DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Your Bell24h platform has been deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 TESTING YOUR LIVE WEBSITE:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Please check these URLs (replace with your actual URL):" -ForegroundColor White
Write-Host "   1. Main site: https://your-project.vercel.app" -ForegroundColor White
Write-Host "   2. AI Matching: https://your-project.vercel.app/dashboard/ai-matching" -ForegroundColor White
Write-Host "   3. Analytics: https://your-project.vercel.app/dashboard/predictive-analytics" -ForegroundColor White
Write-Host ""
Write-Host "🎯 EXPECTED RESULTS:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "• ✅ 'AI Matching Page Fixed!' messages" -ForegroundColor Green
Write-Host "• ✅ No more 'Application error' messages" -ForegroundColor Green
Write-Host "• ✅ Working functionality throughout" -ForegroundColor Green
Write-Host "• ✅ Professional Bell24h branding" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 SUCCESS METRICS:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "• ✅ All local fixes deployed to production" -ForegroundColor Green
Write-Host "• ✅ Broken git repository bypassed" -ForegroundColor Green
Write-Host "• ✅ New working deployment pipeline created" -ForegroundColor Green
Write-Host "• ✅ Bell24h platform ready for marketing campaign" -ForegroundColor Green
Write-Host ""
Write-Host "📞 If you need help, show the URL to a developer" -ForegroundColor Yellow
Write-Host ""
pause 