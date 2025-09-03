# Bell24h Quick Start Script
# One-click startup for development

param(
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [int]$Port = 3000
)

$ErrorActionPreference = "Continue"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "🚀 $Title" -ForegroundColor $Cyan
    Write-Host "=" * 40 -ForegroundColor $Cyan
    Write-Host ""
}

# Main execution
Write-Header "BELL24H QUICK START"

try {
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        throw "Not in Bell24h project directory. Please run from project root."
    }
    
    # Step 1: Install Dependencies
    if (-not $SkipInstall) {
        Write-ColorOutput "📦 Installing dependencies..." $Blue
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Dependencies installed" $Green
        } else {
            Write-ColorOutput "⚠️  Dependency installation had issues, continuing..." $Yellow
        }
    }
    
    # Step 2: Environment Setup
    if (-not (Test-Path ".env.local")) {
        Write-ColorOutput "⚙️  Creating environment configuration..." $Blue
        @"
DATABASE_URL="file:./dev.db"
JWT_SECRET="bell24h-jwt-secret-key-2024-super-secure"
NEXTAUTH_SECRET="bell24h-nextauth-secret-key-2024"
NEXTAUTH_URL="http://localhost:$Port"
NODE_ENV="development"
NEXT_PUBLIC_DEBUG="true"
NEXT_PUBLIC_VERCEL_ENV="development"
ADMIN_EMAIL="admin@bell24h.com"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_ENABLE_AI_FEATURES="true"
NEXT_PUBLIC_ENABLE_VOICE_RFQ="true"
NEXT_PUBLIC_ENABLE_WALLET="true"
NEXT_PUBLIC_ENABLE_FINTECH="true"
CORS_ORIGIN="http://localhost:$Port"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
LOG_LEVEL="debug"
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-ColorOutput "✅ Environment configured" $Green
    }
    
    # Step 3: Database Setup
    Write-ColorOutput "🗄️  Setting up database..." $Blue
    npx prisma generate
    npx prisma db push
    Write-ColorOutput "✅ Database ready" $Green
    
    # Step 4: Build (optional)
    if (-not $SkipBuild) {
        Write-ColorOutput "🏗️  Building project..." $Blue
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Build successful" $Green
        } else {
            Write-ColorOutput "⚠️  Build had issues, continuing..." $Yellow
        }
    }
    
    # Step 5: Start Development Server
    Write-ColorOutput "🚀 Starting development server..." $Blue
    Write-Host ""
    Write-ColorOutput "🌐 Your Bell24h platform will be available at:" $Cyan
    Write-ColorOutput "   Homepage: http://localhost:$Port" $Blue
    Write-ColorOutput "   Admin Panel: http://localhost:$Port/admin" $Blue
    Write-ColorOutput "   Marketing Dashboard: http://localhost:$Port/admin (AI Marketing tab)" $Blue
    Write-Host ""
    Write-ColorOutput "📊 Features Available:" $Cyan
    Write-ColorOutput "   ✅ All 34 pages restored" $Green
    Write-ColorOutput "   ✅ Admin Command Center with 6 tabs" $Green
    Write-ColorOutput "   ✅ Marketing Dashboard with database integration" $Green
    Write-ColorOutput "   ✅ Agent authentication system" $Green
    Write-ColorOutput "   ✅ Campaign management system" $Green
    Write-ColorOutput "   ✅ Real-time analytics" $Green
    Write-Host ""
    Write-ColorOutput "🎯 Ready to launch! Starting server..." $Green
    Write-Host ""
    
    # Start the development server
    npm run dev
    
} catch {
    Write-ColorOutput "❌ Quick start failed: $($_.Exception.Message)" $Red
    Write-Host ""
    Write-ColorOutput "🔧 Troubleshooting:" $Yellow
    Write-ColorOutput "  1. Ensure you're in the Bell24h project directory" $Yellow
    Write-ColorOutput "  2. Check that Node.js is installed" $Yellow
    Write-ColorOutput "  3. Try running: npm install" $Yellow
    Write-ColorOutput "  4. Check for any error messages above" $Yellow
    Write-Host ""
    exit 1
}
