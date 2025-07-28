# Start the Bell24h WebSocket Server
param (
    [switch]$Optimized,
    [int]$Port = 8080,
    [int]$Connections = 1000,
    [int]$BatchSize = 50
)

# Ensure TypeScript is compiled
Write-Host "Compiling TypeScript..." -ForegroundColor Yellow
npx tsc --esModuleInterop server/websocket-server.ts
npx tsc --esModuleInterop client/websocket-client.ts

# Start the WebSocket server using ts-node

$env:NODE_ENV = "development"
$env:WS_PORT = "$Port"
$env:WS_MAX_CONNECTIONS = "$Connections"
$env:WS_BATCH_SIZE = "$BatchSize"

Write-Host "🚀 Starting Bell24h WebSocket Server..."
Write-Host "- Port: $Port"
Write-Host "- Max Connections: $Connections"
Write-Host "- Batch Size: $BatchSize"

Set-Location $PSScriptRoot

if ($Optimized) {
    Write-Host "📈 Using HIGH CONCURRENCY optimized version"
    npx ts-node websocket-server-optimized.ts
} else {
    Write-Host "📊 Using standard version"
    npx ts-node websocket-server.ts
}

# Usage examples:
# Standard: .\start-websocket-server.ps1
# Optimized: .\start-websocket-server.ps1 -Optimized
# Custom settings: .\start-websocket-server.ps1 -Optimized -Port 9000 -Connections 2000 -BatchSize 100
