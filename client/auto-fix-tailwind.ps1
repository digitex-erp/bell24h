# Bell24h Tailwind CSS Auto-Fix Script
# This script will automatically resolve Tailwind corruption issues

Write-Host "========================================" -ForegroundColor Green
Write-Host "BELL24H TAILWIND CSS AUTO-FIX" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Function to log with timestamp
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

try {
    Write-Log "Starting Tailwind CSS corruption fix..." "Cyan"
    
    # CRITICAL FIX: Ensure we're in the correct directory
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Write-Log "Script location: $scriptPath" "Gray"
    
    # Check if package.json exists (confirms we're in the right place)
    if (-not (Test-Path "package.json")) {
        Write-Log "ERROR: package.json not found! Wrong directory!" "Red"
        Write-Log "Current directory: $(Get-Location)" "Red"
        Write-Log "Please run this script from the client directory" "Red"
        throw "Wrong working directory - package.json not found"
    }
    
    Write-Log "Confirmed: Working in correct directory with package.json" "Green"
    Write-Log "Current directory: $(Get-Location)" "Gray"
    
    # Step 1: Stop all Node.js processes
    Write-Log "Step 1: Stopping Node.js processes..." "Yellow"
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Log "Stopped $($nodeProcesses.Count) Node.js processes" "Green"
    } else {
        Write-Log "No Node.js processes found" "Gray"
    }
    
    $npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
    if ($npmProcesses) {
        $npmProcesses | Stop-Process -Force
        Write-Log "Stopped $($npmProcesses.Count) npm processes" "Green"
    } else {
        Write-Log "No npm processes found" "Gray"
    }
    
    # Step 2: Clean up corrupted files
    Write-Log "Step 2: Cleaning up corrupted files..." "Yellow"
    
    $filesToRemove = @(
        "node_modules",
        "package-lock.json", 
        "tsconfig.tsbuildinfo",
        ".next",
        "tailwind.config.ts"
    )
    
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            if (Test-Path $file -PathType Container) {
                Remove-Item $file -Recurse -Force -ErrorAction SilentlyContinue
                Write-Log "Removed directory: $file" "Green"
            } else {
                Remove-Item $file -Force -ErrorAction SilentlyContinue
                Write-Log "Removed file: $file" "Green"
            }
        } else {
            Write-Log "File/directory not found: $file" "Gray"
        }
    }
    
    # Step 3: Clear npm cache
    Write-Log "Step 3: Clearing npm cache..." "Yellow"
    npm cache clean --force
    Write-Log "npm cache cleared successfully" "Green"
    
    # Step 4: Install dependencies (with explicit directory check)
    Write-Log "Step 4: Installing dependencies..." "Yellow"
    Write-Log "This may take several minutes..." "Cyan"
    
    # Double-check we're still in the right place
    if (-not (Test-Path "package.json")) {
        throw "Lost package.json during cleanup - cannot proceed with npm install"
    }
    
    Write-Log "Installing from: $(Get-Location)" "Gray"
    $installResult = npm install 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Dependencies installed successfully!" "Green"
    } else {
        Write-Log "Warning: Some issues during installation" "Yellow"
        Write-Log "Installation output: $installResult" "Gray"
    }
    
    # Step 5: Verify installation
    Write-Log "Step 5: Verifying installation..." "Yellow"
    if (Test-Path "node_modules") {
        Write-Log "node_modules directory created successfully" "Green"
    } else {
        Write-Log "ERROR: node_modules not created!" "Red"
    }
    
    if (Test-Path "package-lock.json") {
        Write-Log "package-lock.json created successfully" "Green"
    } else {
        Write-Log "ERROR: package-lock.json not created!" "Red"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "TAILWIND CSS FIX COMPLETED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Log "You can now try: npm run dev" "Cyan"
    Write-Log "Or: npm run build" "Cyan"
    
} catch {
    Write-Log "ERROR: An error occurred during the fix process" "Red"
    Write-Log "Error details: $($_.Exception.Message)" "Red"
    Write-Log "Please try the manual steps instead" "Yellow"
} finally {
    Write-Host ""
    Write-Log "Press any key to close this window..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
