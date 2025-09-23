param(
  [string[]]$Args
)

# Join the incoming args
$cmd = $Args -join " "

# Defensive: strip leading 'q ' or single char 'q' if present
$cmd = $cmd -replace '^\s*q\s+',''
$cmd = $cmd -replace '^\s*q$',''

# Log the command being executed
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logDir = ".\logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Write-Output "========================================"
Write-Output "DEPLOY WRAPPER - $timestamp"
Write-Output "========================================"
Write-Output "Original command: $($Args -join ' ')"
Write-Output "Cleaned command: $cmd"
Write-Output "Working directory: $(Get-Location)"
Write-Output "PowerShell version: $($PSVersionTable.PSVersion)"
Write-Output "========================================"

# Start logging
Start-Transcript -Path "$logDir\deploy_$timestamp.log" -IncludeInvocationHeader

try {
    # Execute the command
    Invoke-Expression $cmd
    Write-Output "✅ Command executed successfully"
    exit 0
} catch {
    Write-Output "❌ Command failed: $_"
    Write-Output "Error details: $($_.Exception.Message)"
    exit 1
} finally {
    Stop-Transcript
}
