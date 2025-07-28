# Bell24h.com Restore Script
# This script restores the application from a backup

# Configuration
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
$targetDir = $projectRoot
$backupDir = Join-Path $projectRoot "backups"
$dbName = "bell24h_db"
$dbUser = "bell24h_user"

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

# Function to verify target directory
function Verify-TargetDirectory {
    Write-ColorOutput Green "Verifying target directory..."
    
    if (-not (Test-Path $targetDir)) {
        Write-ColorOutput Red "Target directory not found: $targetDir"
        return $false
    }
    
    # Check if directory is writable
    try {
        $testFile = Join-Path $targetDir "write_test.tmp"
        New-Item -ItemType File -Path $testFile -Force | Out-Null
        Remove-Item $testFile -Force
        Write-ColorOutput Green "Target directory is writable"
        return $true
    } catch {
        Write-ColorOutput Red "Target directory is not writable: $_"
        return $false
    }
}

# Function to list available backups
function Get-AvailableBackups {
    Write-ColorOutput Green "Available backups:"
    
    if (-not (Test-Path $backupDir)) {
        Write-ColorOutput Red "Backup directory not found: $backupDir"
        exit 1
    }
    
    $backups = Get-ChildItem $backupDir -Directory | Sort-Object Name -Descending
    
    if ($backups.Count -eq 0) {
        Write-ColorOutput Red "No backups found in $backupDir"
        exit 1
    }
    
    $backupList = @()
    foreach ($backup in $backups) {
        $manifestPath = Join-Path $backup.FullName "manifest.json"
        if (Test-Path $manifestPath) {
            $manifest = Get-Content $manifestPath | ConvertFrom-Json
            $backupList += [PSCustomObject]@{
                Timestamp = $backup.Name
                Date = [DateTime]::ParseExact($backup.Name, "yyyyMMdd_HHmmss", $null)
                OS = $manifest.system_info.os
                Path = $backup.FullName
            }
        }
    }
    
    $backupList | Format-Table -Property Timestamp, Date, OS
    
    return $backupList
}

# Function to verify backup integrity
function Test-BackupIntegrity {
    param (
        [string]$backupPath
    )
    
    Write-ColorOutput Green "Verifying backup integrity..."
    
    $manifestPath = Join-Path $backupPath "manifest.json"
    if (-not (Test-Path $manifestPath)) {
        Write-ColorOutput Red "Backup manifest not found"
        return $false
    }
    
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        
        # Check database backup
        $dbBackupFile = Join-Path $backupPath "database_backup.sql"
        if (-not (Test-Path $dbBackupFile)) {
            Write-ColorOutput Red "Database backup file not found"
            return $false
        }
        
        # Check file backups
        $fileBackupPath = Join-Path $backupPath "files"
        if (-not (Test-Path $fileBackupPath)) {
            Write-ColorOutput Red "File backup directory not found"
            return $false
        }
        
        $requiredFiles = @(".env", "storage", "public", "config")
        foreach ($file in $requiredFiles) {
            if (-not (Test-Path (Join-Path $fileBackupPath $file))) {
                Write-ColorOutput Red "Required file not found: $file"
                return $false
            }
        }
        
        Write-ColorOutput Green "Backup integrity verified"
        return $true
    } catch {
        Write-ColorOutput Red "Backup verification failed: $_"
        return $false
    }
}

# Function to restore database
function Restore-Database {
    param (
        [string]$backupPath
    )
    
    Write-ColorOutput Green "Restoring database..."
    
    $dbBackupFile = Join-Path $backupPath "database_backup.sql"
    
    try {
        # Drop and recreate database
        $sql = @"
DROP DATABASE IF EXISTS $dbName;
CREATE DATABASE $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"@
        $sql | Out-File "$backupPath\recreate.sql"
        $sqlContent = Get-Content "$backupPath\recreate.sql" -Raw
        $sqlContent | & "mysql -u root -p"
        Remove-Item "$backupPath\recreate.sql"
        
        # Restore database
        $dbContent = Get-Content $dbBackupFile -Raw
        $dbContent | & "mysql -u $dbUser -p $dbName"
        
        Write-ColorOutput Green "[OK] Database restored"
        return $true
    } catch {
        Write-ColorOutput Red "[ERROR] Database restore failed: $_"
        return $false
    }
}

# Function to restore files
function Restore-Files {
    param (
        [string]$backupPath
    )
    
    Write-ColorOutput Green "Restoring files..."
    
    $fileBackupPath = Join-Path $backupPath "files"
    
    try {
        # Create backup of current files before restore
        $currentBackupPath = Join-Path $backupPath "pre_restore_backup"
        if (Test-Path "$targetDir\.env") {
            Copy-Item "$targetDir\.env" "$currentBackupPath\.env" -Force
        }
        if (Test-Path "$targetDir\storage") {
            Copy-Item "$targetDir\storage" "$currentBackupPath\storage" -Recurse -Force
        }
        if (Test-Path "$targetDir\public") {
            Copy-Item "$targetDir\public" "$currentBackupPath\public" -Recurse -Force
        }
        if (Test-Path "$targetDir\config") {
            Copy-Item "$targetDir\config" "$currentBackupPath\config" -Recurse -Force
        }
        
        # Restore .env file
        if (Test-Path "$fileBackupPath\.env") {
            Copy-Item "$fileBackupPath\.env" "$targetDir\.env" -Force
        }
        
        # Restore storage directory
        if (Test-Path "$fileBackupPath\storage") {
            Remove-Item "$targetDir\storage" -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item "$fileBackupPath\storage" "$targetDir\storage" -Recurse -Force
        }
        
        # Restore public directory
        if (Test-Path "$fileBackupPath\public") {
            Remove-Item "$targetDir\public" -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item "$fileBackupPath\public" "$targetDir\public" -Recurse -Force
        }
        
        # Restore config directory
        if (Test-Path "$fileBackupPath\config") {
            Remove-Item "$targetDir\config" -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item "$fileBackupPath\config" "$targetDir\config" -Recurse -Force
        }
        
        Write-ColorOutput Green "[OK] Files restored"
        return $true
    } catch {
        Write-ColorOutput Red "[ERROR] Files restore failed: $_"
        
        # Attempt to restore from pre-restore backup
        Write-ColorOutput Yellow "Attempting to restore from pre-restore backup..."
        try {
            if (Test-Path "$currentBackupPath\.env") {
                Copy-Item "$currentBackupPath\.env" "$targetDir\.env" -Force
            }
            if (Test-Path "$currentBackupPath\storage") {
                Remove-Item "$targetDir\storage" -Recurse -Force -ErrorAction SilentlyContinue
                Copy-Item "$currentBackupPath\storage" "$targetDir\storage" -Recurse -Force
            }
            if (Test-Path "$currentBackupPath\public") {
                Remove-Item "$targetDir\public" -Recurse -Force -ErrorAction SilentlyContinue
                Copy-Item "$currentBackupPath\public" "$targetDir\public" -Recurse -Force
            }
            if (Test-Path "$currentBackupPath\config") {
                Remove-Item "$targetDir\config" -Recurse -Force -ErrorAction SilentlyContinue
                Copy-Item "$currentBackupPath\config" "$targetDir\config" -Recurse -Force
            }
            Write-ColorOutput Green "[OK] Restored from pre-restore backup"
        } catch {
            Write-ColorOutput Red "[ERROR] Failed to restore from pre-restore backup: $_"
        }
        
        return $false
    }
}

# Function to verify restore
function Verify-Restore {
    Write-ColorOutput Green "Verifying restore..."
    
    $verificationResults = @{
        database = $false
        files = $false
    }
    
    # Verify database
    try {
        $dbTest = php artisan migrate:status 2>&1
        if ($LASTEXITCODE -eq 0) {
            $verificationResults.database = $true
            Write-ColorOutput Green "[OK] Database connection verified"
        }
    } catch {
        Write-ColorOutput Red "[ERROR] Database verification failed: $_"
    }
    
    # Verify files
    $requiredFiles = @(".env", "storage", "public", "config")
    $allFilesPresent = $true
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path (Join-Path $targetDir $file))) {
            $allFilesPresent = $false
            break
        }
    }
    if ($allFilesPresent) {
        $verificationResults.files = $true
        Write-ColorOutput Green "[OK] Files verified"
    }
    
    return $verificationResults
}

# Main restore process
try {
    Write-ColorOutput Green "Starting Bell24h.com restore process..."
    
    # Verify target directory first
    if (-not (Verify-TargetDirectory)) {
        Write-ColorOutput Red "Target directory verification failed"
        exit 1
    }
    
    # List available backups
    $backups = Get-AvailableBackups
    
    # Prompt for backup selection
    Write-ColorOutput Yellow "`nEnter the timestamp of the backup to restore (e.g., 20240315_123456):"
    $selectedTimestamp = Read-Host
    
    $selectedBackup = $backups | Where-Object { $_.Timestamp -eq $selectedTimestamp }
    if (-not $selectedBackup) {
        Write-ColorOutput Red "Invalid backup timestamp selected"
        exit 1
    }
    
    # Verify backup integrity
    if (-not (Test-BackupIntegrity $selectedBackup.Path)) {
        Write-ColorOutput Red "Backup integrity check failed"
        exit 1
    }
    
    # Confirm restore
    Write-ColorOutput Yellow "`nWARNING: This will overwrite the current installation."
    Write-ColorOutput Yellow "Are you sure you want to proceed? (y/N)"
    $confirm = Read-Host
    
    if ($confirm -ne "y") {
        Write-ColorOutput Yellow "Restore cancelled"
        exit 0
    }
    
    # Perform restore
    $dbRestoreSuccess = Restore-Database $selectedBackup.Path
    $filesRestoreSuccess = Restore-Files $selectedBackup.Path
    
    # Verify restore
    $verificationResults = Verify-Restore
    
    # Summary
    Write-ColorOutput Yellow "`nRestore Summary:"
    Write-ColorOutput Yellow "Backup Timestamp: $selectedTimestamp"
    Write-ColorOutput Yellow "Database Restore: $(if ($dbRestoreSuccess) { 'Success' } else { 'Failed' })"
    Write-ColorOutput Yellow "Files Restore: $(if ($filesRestoreSuccess) { 'Success' } else { 'Failed' })"
    Write-ColorOutput Yellow "Verification Results:"
    Write-ColorOutput Yellow "  - Database: $(if ($verificationResults.database) { 'OK' } else { 'Failed' })"
    Write-ColorOutput Yellow "  - Files: $(if ($verificationResults.files) { 'OK' } else { 'Failed' })"
    
    if ($dbRestoreSuccess -and $filesRestoreSuccess -and $verificationResults.database -and $verificationResults.files) {
        Write-ColorOutput Green "`nRestore completed successfully!"
    } else {
        Write-ColorOutput Red "`nRestore completed with some issues. Please check the summary above."
        exit 1
    }
} catch {
    Write-ColorOutput Red "Restore failed: $_"
    exit 1
} 