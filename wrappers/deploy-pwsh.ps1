# PowerShell wrapper to bypass Cursor terminal 'q' prefix bug
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Commands
)

# Create logs directory
$logDir = ".\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$logDir\deploy_$timestamp.log"

# Function to log messages
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $logFile -Value $logEntry
}

# Strip any 'q' prefixes from commands
$cleanCommands = @()
foreach ($cmd in $Commands) {
    $cleanCmd = $cmd -replace '^q+', ''
    $cleanCommands += $cleanCmd
    Write-Log "Original: $cmd -> Cleaned: $cleanCmd"
}

# Join commands and execute
$fullCommand = $cleanCommands -join ' '
Write-Log "Executing: $fullCommand"

try {
    # Execute the cleaned command
    Invoke-Expression $fullCommand
    Write-Log "Command executed successfully" "SUCCESS"
} catch {
    Write-Log "Command failed: $($_.Exception.Message)" "ERROR"
    exit 1
}
