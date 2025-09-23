# Deploy Bell24h with new homepage sections
Write-Host "Deploying Bell24h with updated homepage..." -ForegroundColor Green

# Navigate to client directory
Set-Location "C:\Users\Sanika\Projects\bell24h\client"

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Build successful! Deploying to Vercel..." -ForegroundColor Green

# Deploy to Vercel
npx vercel --prod --yes

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your updated site is live at: https://bell24h-v1.vercel.app" -ForegroundColor Cyan

Read-Host "Press Enter to continue"