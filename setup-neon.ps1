Write-Host "🚀 BELL24H NEON DATABASE SETUP" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Setting up Neon PostgreSQL database..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🔧 Step 1: Navigate to client directory" -ForegroundColor Cyan
Set-Location "client"

Write-Host "🔧 Step 2: Update environment variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please update your .env.local file with your Neon connection string:" -ForegroundColor Yellow
Write-Host ""
Write-Host 'DATABASE_URL="postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' -ForegroundColor White
Write-Host ""
Write-Host "Press any key when you've updated the .env.local file..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🔧 Step 3: Running database migrations..." -ForegroundColor Cyan
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed. Please check your Neon connection string." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "✅ Database migration successful!" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Step 4: Seeding database with 50 categories..." -ForegroundColor Cyan
node scripts/seed-categories-neon.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Seeding failed. Please check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "✅ Database seeded successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 NEON SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Neon PostgreSQL database configured" -ForegroundColor Green
Write-Host "✅ 50 categories seeded with mock data" -ForegroundColor Green
Write-Host "✅ All subcategories and mock orders created" -ForegroundColor Green
Write-Host "✅ Ready for production use" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting development server..." -ForegroundColor Cyan
Write-Host "Visit: http://localhost:3000/categories-dashboard" -ForegroundColor Yellow
Write-Host ""

npm run dev
