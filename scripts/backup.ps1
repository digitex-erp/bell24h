# Bell24h.com Backup Script
# This script handles database and file backups

# Configuration
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$targetDir = $projectRoot
$backupDir = Join-Path $projectRoot "backups"
$dbName = "bell24h_db"
$dbUser = "bell24h_user"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $backupDir $timestamp

# Function to write colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function to verify source directory
function Verify-SourceDirectory {
    Write-ColorOutput Green "Verifying source directory..."
    
    $requiredFiles = @(
        ".env",
        "composer.json",
        "package.json",
        "artisan",
        "public\index.php"
    )

    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path (Join-Path $targetDir $file))) {
            $missingFiles += $file
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-ColorOutput Red "Missing required files:"
        $missingFiles | ForEach-Object { Write-ColorOutput Red "  - $_" }
        return $false
    }

    Write-ColorOutput Green "Source directory verification complete"
    return $true
}

# Function to create backup directory
function Initialize-BackupDirectory {
    Write-ColorOutput Green "Initializing backup directory..."
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    }
    
    Write-ColorOutput Green "Backup directory initialized"
}

# Function to backup database
function Backup-Database {
    Write-ColorOutput Green "Backing up database..."
    
    $dbBackupFile = Join-Path $backupPath "database_backup.sql"
    
    try {
        # Create database backup
        $mysqldumpCmd = "mysqldump -u $dbUser -p $dbName"
        & $mysqldumpCmd | Out-File $dbBackupFile
        
        if (Test-Path $dbBackupFile) {
            Write-ColorOutput Green "[OK] Database backup created: $dbBackupFile"
            return $true
        } else {
            Write-ColorOutput Red "[ERROR] Database backup failed"
            return $false
        }
    } catch {
        Write-ColorOutput Red "[ERROR] Database backup failed: $_"
        return $false
    }
}

# Function to backup files
function Backup-Files {
    Write-ColorOutput Green "Backing up files..."
    
    $fileBackupPath = Join-Path $backupPath "files"
    New-Item -ItemType Directory -Path $fileBackupPath -Force | Out-Null
    
    try {
        # Backup .env file
        if (Test-Path "$targetDir\.env") {
            Copy-Item "$targetDir\.env" "$fileBackupPath\.env" -Force
        } else {
            Write-ColorOutput Yellow "[WARNING] .env file not found"
        }
        
        # Backup storage directory
        if (Test-Path "$targetDir\storage") {
            Copy-Item "$targetDir\storage" "$fileBackupPath\storage" -Recurse -Force
        } else {
            Write-ColorOutput Yellow "[WARNING] storage directory not found"
        }
        
        # Backup public directory
        if (Test-Path "$targetDir\public") {
            Copy-Item "$targetDir\public" "$fileBackupPath\public" -Recurse -Force
        } else {
            Write-ColorOutput Yellow "[WARNING] public directory not found"
        }
        
        # Backup config directory
        if (Test-Path "$targetDir\config") {
            Copy-Item "$targetDir\config" "$fileBackupPath\config" -Recurse -Force
        } else {
            Write-ColorOutput Yellow "[WARNING] config directory not found"
        }
        
        Write-ColorOutput Green "[OK] Files backup created in: $fileBackupPath"
        return $true
    } catch {
        Write-ColorOutput Red "[ERROR] Files backup failed: $_"
        return $false
    }
}

# Function to create backup manifest
function Create-BackupManifest {
    Write-ColorOutput Green "Creating backup manifest..."
    
    $manifest = @{
        timestamp = $timestamp
        database = @{
            name = $dbName
            backup_file = "database_backup.sql"
        }
        files = @{
            env = ".env"
            storage = "storage"
            public = "public"
            config = "config"
        }
        system_info = @{
            os = (Get-WmiObject Win32_OperatingSystem).Caption
            backup_path = $backupPath
            target_path = $targetDir
        }
    }
    
    $manifestPath = Join-Path $backupPath "manifest.json"
    $manifest | ConvertTo-Json -Depth 10 | Out-File $manifestPath
    
    Write-ColorOutput Green "[OK] Backup manifest created"
}

# Function to cleanup old backups
function Cleanup-OldBackups {
    Write-ColorOutput Green "Cleaning up old backups..."
    
    # Keep backups from last 7 days
    $cutoffDate = (Get-Date).AddDays(-7)
    
    Get-ChildItem $backupDir -Directory | Where-Object {
        $backupDate = [DateTime]::ParseExact($_.Name, "yyyyMMdd_HHmmss", $null)
        $backupDate -lt $cutoffDate
    } | ForEach-Object {
        Remove-Item $_.FullName -Recurse -Force
        Write-ColorOutput Yellow "Removed old backup: $($_.Name)"
    }
    
    Write-ColorOutput Green "Cleanup complete"
}

# Function to verify backup
function Verify-Backup {
    Write-ColorOutput Green "Verifying backup..."
    
    $verificationResults = @{
        database = $false
        files = $false
        manifest = $false
    }
    
    # Verify database backup
    $dbBackupFile = Join-Path $backupPath "database_backup.sql"
    if (Test-Path $dbBackupFile) {
        $fileSize = (Get-Item $dbBackupFile).Length
        if ($fileSize -gt 0) {
            $verificationResults.database = $true
            Write-ColorOutput Green "[OK] Database backup verified"
        }
    }
    
    # Verify file backups
    $fileBackupPath = Join-Path $backupPath "files"
    if (Test-Path $fileBackupPath) {
        $requiredFiles = @(".env", "storage", "public", "config")
        $allFilesPresent = $true
        foreach ($file in $requiredFiles) {
            if (-not (Test-Path (Join-Path $fileBackupPath $file))) {
                $allFilesPresent = $false
                break
            }
        }
        if ($allFilesPresent) {
            $verificationResults.files = $true
            Write-ColorOutput Green "[OK] File backups verified"
        }
    }
    
    # Verify manifest
    $manifestPath = Join-Path $backupPath "manifest.json"
    if (Test-Path $manifestPath) {
        try {
            $manifest = Get-Content $manifestPath | ConvertFrom-Json
            if ($manifest.timestamp -eq $timestamp) {
                $verificationResults.manifest = $true
                Write-ColorOutput Green "[OK] Backup manifest verified"
            }
        } catch {
            Write-ColorOutput Red "[ERROR] Manifest verification failed: $_"
        }
    }
    
    return $verificationResults
}

# Main backup process
try {
    Write-ColorOutput Green "Starting Bell24h.com backup process..."
    
    # Verify source directory first
    if (-not (Verify-SourceDirectory)) {
        Write-ColorOutput Red "Source directory verification failed"
        exit 1
    }
    
    Initialize-BackupDirectory
    $dbBackupSuccess = Backup-Database
    $filesBackupSuccess = Backup-Files
    Create-BackupManifest
    $verificationResults = Verify-Backup
    Cleanup-OldBackups
    
    # Summary
    Write-ColorOutput Yellow "`nBackup Summary:"
    Write-ColorOutput Yellow "Timestamp: $timestamp"
    Write-ColorOutput Yellow "Backup Location: $backupPath"
    Write-ColorOutput Yellow "Database Backup: $(if ($dbBackupSuccess) { 'Success' } else { 'Failed' })"
    Write-ColorOutput Yellow "Files Backup: $(if ($filesBackupSuccess) { 'Success' } else { 'Failed' })"
    Write-ColorOutput Yellow "Verification Results:"
    Write-ColorOutput Yellow "  - Database: $(if ($verificationResults.database) { 'OK' } else { 'Failed' })"
    Write-ColorOutput Yellow "  - Files: $(if ($verificationResults.files) { 'OK' } else { 'Failed' })"
    Write-ColorOutput Yellow "  - Manifest: $(if ($verificationResults.manifest) { 'OK' } else { 'Failed' })"
    
    if ($dbBackupSuccess -and $filesBackupSuccess -and $verificationResults.database -and $verificationResults.files -and $verificationResults.manifest) {
        Write-ColorOutput Green "`nBackup completed successfully!"
    } else {
        Write-ColorOutput Red "`nBackup completed with some issues. Please check the summary above."
        exit 1
    }
} catch {
    Write-ColorOutput Red "Backup failed: $_"
    exit 1
} 