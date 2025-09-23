# Bell24h Complete Setup Script
Write-Host "🚀 Setting up Bell24h environment..." -ForegroundColor Green

# Navigate to client directory
Set-Location "C:\Users\Sanika\Projects\bell24h\client"

# Create complete .env.local file
$envContent = @"
OPENAI_API_KEY=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
NEXTAUTH_SECRET=bell24h_secret_key_2025_autonomous_system
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://bell24h:Bell24h@2025@localhost:5432/bell24h
RAZORPAY_KEY_ID=rzp_live_JzjA268916kOdR
RAZORPAY_KEY_SECRET=zgKuNGLemP0X53HXuM4l
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
MSG91_SENDER_ID=BELL24H
NODE_ENV=development
"@

# Write to .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Environment file created successfully!" -ForegroundColor Green

# Install N8N globally
Write-Host "🔧 Installing N8N globally..." -ForegroundColor Yellow
npm install -g n8n

Write-Host "✅ N8N installed successfully!" -ForegroundColor Green

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal

# Start N8N in new window
Write-Host "🤖 Starting N8N service..." -ForegroundColor Yellow
Start-Process -FilePath "n8n" -ArgumentList "start", "--tunnel" -WindowStyle Normal

Write-Host "🎉 Setup complete! Your applications are starting..." -ForegroundColor Green
Write-Host "📱 Next.js: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🤖 N8N: http://localhost:5678" -ForegroundColor Cyan
Write-Host "🎤 Voice RFQ: http://localhost:3000/dashboard/voice-rfq" -ForegroundColor Cyan

Read-Host "Press Enter to continue..."
