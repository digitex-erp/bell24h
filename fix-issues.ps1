# Fix Script for Bell24h
# Run this after migration

$projectRoot = "C:\Users\Sanika\Projects\bell24h"

# Install missing server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Cyan
Set-Location "$projectRoot\server"
npm install --save-dev @types/express @types/node typescript ts-node
npm install --save express-validator cors helmet morgan cookie-parser jsonwebtoken bcryptjs

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Cyan
Set-Location "$projectRoot\client"
npm install --save @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install --save-dev @types/react @types/react-dom @types/node

# Fix TypeScript configuration
Write-Host "🔧 Updating TypeScript configuration..." -ForegroundColor Cyan
$tsConfig = @'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
'@

Set-Content -Path "$projectRoot\client\tsconfig.json" -Value $tsConfig

# Create .env file if it doesn't exist
if (-not (Test-Path "$projectRoot\.env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Cyan
    @"
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bell24h?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# CORS
CORS_ORIGIN="http://localhost:3002"

# Email (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="your_password"
"@ | Out-File -FilePath "$projectRoot\.env" -Encoding UTF8
}

Write-Host "✅ Fixes applied successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update the .env file with your actual configuration"
Write-Host "2. Start the development servers:"
Write-Host "   - Backend: cd $projectRoot\server && npm run dev"
Write-Host "   - Frontend: cd $projectRoot\client && npm run dev"
