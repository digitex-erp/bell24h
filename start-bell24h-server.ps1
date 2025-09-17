# Bell24h Server Startup Script
# This script ensures you're in the correct directory and starts the development server

Write-Host "🚀 Starting Bell24h Development Server..." -ForegroundColor Green

# Navigate to the correct project directory
Set-Location "C:\Users\Sanika\Projects\bell24x-complete"

# Kill any existing Node.js processes to avoid conflicts
Write-Host "🔄 Cleaning up any existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

# Clear any cached builds
Write-Host "🧹 Clearing cached builds..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
  Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
  npm install
}

Write-Host "✅ Starting development server..." -ForegroundColor Green
Write-Host "🌐 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host "🎯 Look for 'Bell24h' branding in the top-left corner" -ForegroundColor Cyan

# Start the Next.js development server
npm run dev