# Migration Script for Bell24h
# Run this script in PowerShell as Administrator

# Set source and destination paths
$source = "C:\Users\Sanika\Downloads\Bell24hDashboard\Bell24hDashboard"
$dest = "C:\Users\Sanika\Projects\bell24h"

# Create directories if they don't exist
$directories = @("client\src", "public", "server", "prisma", "n8n", "assets", "utils", "services")
foreach ($dir in $directories) {
    $path = Join-Path -Path $dest -ChildPath $dir
    if (-not (Test-Path -Path $path)) {
        New-Item -Path $path -ItemType Directory -Force
        Write-Host "Created directory: $path"
    }
}

# Copy files from source to destination
Write-Host "Copying src to client\src..."
if (Test-Path -Path "$source\src") {
    Copy-Item -Path "$source\src\*" -Destination "$dest\client\src" -Recurse -Force
}

Write-Host "Copying public files..."
if (Test-Path -Path "$source\public") {
    Copy-Item -Path "$source\public\*" -Destination "$dest\public" -Recurse -Force
}

Write-Host "Copying server files..."
if (Test-Path -Path "$source\server") {
    Copy-Item -Path "$source\server\*" -Destination "$dest\server" -Recurse -Force
}

Write-Host "Copying prisma files..."
if (Test-Path -Path "$source\prisma") {
    Copy-Item -Path "$source\prisma\*" -Destination "$dest\prisma" -Recurse -Force
}

Write-Host "Copying n8n files..."
if (Test-Path -Path "$source\n8n") {
    Copy-Item -Path "$source\n8n\*" -Destination "$dest\n8n" -Recurse -Force
}

Write-Host "Copying environment file..."
if (Test-Path -Path "$source\.env") {
    Copy-Item -Path "$source\.env" -Destination "$dest\.env" -Force
}

Write-Host "Copying package.json files..."
if (Test-Path -Path "$source\package.json") {
    Copy-Item -Path "$source\package.json" -Destination "$dest\client\package.json" -Force
    Copy-Item -Path "$source\package.json" -Destination "$dest\server\package.json" -Force
}

# Fix registerRoutesSync to registerRoutes in server files
Write-Host "🔧 Fixing route registration in server files..." -ForegroundColor Cyan
Get-ChildItem -Path "$dest\server" -Recurse -Filter "*.ts" | ForEach-Object {
    (Get-Content $_.FullName -Raw) -replace 'registerRoutesSync', 'registerRoutes' | Set-Content $_.FullName
}

# Install required dependencies
Write-Host "📦 Installing required dependencies..." -ForegroundColor Cyan
Set-Location "$dest\server"
npm install csurf @types/csurf --save

# Update docker-compose file
Write-Host "🐳 Updating Docker Compose configuration..." -ForegroundColor Cyan
$dockerComposePath = "$dest\monitoring\docker-compose-monitoring.yml"
if (Test-Path $dockerComposePath) {
    $content = Get-Content $dockerComposePath -Raw
    $content -replace 'version: "\d\.\d"\s*', '' | Set-Content $dockerComposePath
}

Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd $dest\server && npx prisma generate && npx prisma migrate dev --name init"
Write-Host "2. cd $dest\client && npm install"
Write-Host "3. Start the servers:"
Write-Host "   - Backend: cd $dest\server && npm run dev"
Write-Host "   - Frontend: cd $dest\client && npm run dev"
