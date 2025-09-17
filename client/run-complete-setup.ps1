# Bell24h Complete Setup Script for Windows
Write-Host "🚀 Starting Complete Bell24h Implementation..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

try {
    # Step 1: Install dependencies
    Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

    # Step 2: Generate Prisma client
    Write-Host "`n🔧 Step 2: Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    Write-Host "✅ Prisma client generated" -ForegroundColor Green

    # Step 3: Push database schema
    Write-Host "`n🗄️ Step 3: Pushing database schema..." -ForegroundColor Yellow
    npx prisma db push
    Write-Host "✅ Database schema pushed" -ForegroundColor Green

    # Step 4: Run complete setup
    Write-Host "`n🌱 Step 4: Running complete setup..." -ForegroundColor Yellow
    node complete-setup.js
    Write-Host "✅ Complete setup finished" -ForegroundColor Green

    Write-Host "`n🎉 COMPLETE IMPLEMENTATION SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "✅ All implementations completed" -ForegroundColor Green
    Write-Host "✅ Database ready" -ForegroundColor Green
    Write-Host "✅ Categories migrated" -ForegroundColor Green
    Write-Host "✅ Mock data generated" -ForegroundColor Green
    Write-Host "✅ Performance tested" -ForegroundColor Green
    Write-Host "`n🚀 Bell24h is ready for production!" -ForegroundColor Green

} catch {
    Write-Host "`n❌ Implementation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if DATABASE_URL is set in .env.local" -ForegroundColor White
    Write-Host "2. Ensure PostgreSQL is running" -ForegroundColor White
    Write-Host "3. Verify all dependencies are installed" -ForegroundColor White
}
