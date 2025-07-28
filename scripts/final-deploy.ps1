# Final Deployment Script for Bell24h.com
# This script handles the complete deployment process

# Configuration
$config = @{
    ProjectRoot = "C:\inetpub\wwwroot\bell24h.com"
    BackupDir = "C:\backups\bell24h"
    DatabaseName = "bell24h_db"
    DatabaseUser = "bell24h_user"
    LogFile = "C:\logs\deployment.log"
    Environment = "production"
}

# Import required modules
Import-Module WebAdministration

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

# Function to log messages
function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $config.LogFile -Value $logMessage
    Write-Output $logMessage
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-ColorOutput Green "Checking prerequisites..."
    Write-Log "Checking prerequisites"

    $prerequisites = @(
        @{ Name = "PHP"; Version = "8.1" },
        @{ Name = "MySQL"; Version = "8.0" },
        @{ Name = "Node.js"; Version = "18.x" },
        @{ Name = "Redis"; Version = "latest" }
    )

    foreach ($prereq in $prerequisites) {
        try {
            $installed = Get-Command $prereq.Name -ErrorAction Stop
            Write-ColorOutput Green "✓ $($prereq.Name) is installed"
            Write-Log "$($prereq.Name) is installed"
        }
        catch {
            Write-ColorOutput Red "✗ $($prereq.Name) is not installed"
            Write-Log "ERROR: $($prereq.Name) is not installed"
            return $false
        }
    }

    return $true
}

# Function to create backup
function Backup-System {
    Write-ColorOutput Green "Creating system backup..."
    Write-Log "Creating system backup"

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = Join-Path $config.BackupDir $timestamp

    try {
        # Create backup directory
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

        # Backup database
        $dbBackupFile = Join-Path $backupPath "database.sql"
        mysqldump -u $config.DatabaseUser -p $config.DatabaseName > $dbBackupFile
        Write-ColorOutput Green "✓ Database backup created"
        Write-Log "Database backup created"

        # Backup files
        $filesBackupPath = Join-Path $backupPath "files"
        New-Item -ItemType Directory -Path $filesBackupPath -Force | Out-Null
        Copy-Item -Path $config.ProjectRoot -Destination $filesBackupPath -Recurse
        Write-ColorOutput Green "✓ Files backup created"
        Write-Log "Files backup created"

        return $true
    }
    catch {
        Write-ColorOutput Red "✗ Backup failed: $_"
        Write-Log "ERROR: Backup failed: $_"
        return $false
    }
}

# Function to deploy code
function Deploy-Code {
    Write-ColorOutput Green "Deploying code..."
    Write-Log "Deploying code"

    try {
        # Stop IIS site
        Stop-Website -Name "bell24h.com"
        Write-Log "IIS site stopped"

        # Deploy code
        Copy-Item -Path ".\*" -Destination $config.ProjectRoot -Recurse -Force
        Write-ColorOutput Green "✓ Code deployed"
        Write-Log "Code deployed"

        # Install dependencies
        Set-Location $config.ProjectRoot
        npm install --production
        Write-ColorOutput Green "✓ Dependencies installed"
        Write-Log "Dependencies installed"

        # Build assets
        npm run build
        Write-ColorOutput Green "✓ Assets built"
        Write-Log "Assets built"

        # Clear caches
        php artisan cache:clear
        php artisan config:clear
        php artisan view:clear
        Write-ColorOutput Green "✓ Caches cleared"
        Write-Log "Caches cleared"

        # Set permissions
        $acl = Get-Acl $config.ProjectRoot
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl $config.ProjectRoot $acl
        Write-ColorOutput Green "✓ Permissions set"
        Write-Log "Permissions set"

        # Start IIS site
        Start-Website -Name "bell24h.com"
        Write-Log "IIS site started"

        return $true
    }
    catch {
        Write-ColorOutput Red "✗ Deployment failed: $_"
        Write-Log "ERROR: Deployment failed: $_"
        return $false
    }
}

# Function to run database migrations
function Update-Database {
    Write-ColorOutput Green "Updating database..."
    Write-Log "Updating database"

    try {
        Set-Location $config.ProjectRoot
        php artisan migrate --force
        Write-ColorOutput Green "✓ Database updated"
        Write-Log "Database updated"
        return $true
    }
    catch {
        Write-ColorOutput Red "✗ Database update failed: $_"
        Write-Log "ERROR: Database update failed: $_"
        return $false
    }
}

# Function to verify deployment
function Test-Deployment {
    Write-ColorOutput Green "Verifying deployment..."
    Write-Log "Verifying deployment"

    try {
        # Test database connection
        $result = php artisan db:monitor
        if ($LASTEXITCODE -ne 0) {
            throw "Database connection failed"
        }
        Write-ColorOutput Green "✓ Database connection verified"
        Write-Log "Database connection verified"

        # Test application health
        $response = Invoke-WebRequest -Uri "https://bell24h.com/health" -UseBasicParsing
        if ($response.StatusCode -ne 200) {
            throw "Health check failed"
        }
        Write-ColorOutput Green "✓ Health check passed"
        Write-Log "Health check passed"

        # Test critical paths
        $paths = @(
            "/api/auth/register",
            "/api/rfq/create",
            "/api/shipping/calculate",
            "/api/payment/process"
        )

        foreach ($path in $paths) {
            $response = Invoke-WebRequest -Uri "https://bell24h.com$path" -Method OPTIONS -UseBasicParsing
            if ($response.StatusCode -ne 200) {
                throw "Path $path is not accessible"
            }
        }
        Write-ColorOutput Green "✓ Critical paths verified"
        Write-Log "Critical paths verified"

        return $true
    }
    catch {
        Write-ColorOutput Red "✗ Verification failed: $_"
        Write-Log "ERROR: Verification failed: $_"
        return $false
    }
}

# Function to rollback deployment
function Rollback-Deployment {
    param($BackupPath)
    Write-ColorOutput Yellow "Rolling back deployment..."
    Write-Log "Rolling back deployment"

    try {
        # Stop IIS site
        Stop-Website -Name "bell24h.com"
        Write-Log "IIS site stopped"

        # Restore files
        $filesBackupPath = Join-Path $BackupPath "files"
        Copy-Item -Path $filesBackupPath\* -Destination $config.ProjectRoot -Recurse -Force
        Write-ColorOutput Green "✓ Files restored"
        Write-Log "Files restored"

        # Restore database
        $dbBackupFile = Join-Path $BackupPath "database.sql"
        mysql -u $config.DatabaseUser -p $config.DatabaseName < $dbBackupFile
        Write-ColorOutput Green "✓ Database restored"
        Write-Log "Database restored"

        # Start IIS site
        Start-Website -Name "bell24h.com"
        Write-Log "IIS site started"

        return $true
    }
    catch {
        Write-ColorOutput Red "✗ Rollback failed: $_"
        Write-Log "ERROR: Rollback failed: $_"
        return $false
    }
}

# Main deployment process
try {
    Write-ColorOutput Cyan "Starting Bell24h.com deployment..."
    Write-Log "Starting deployment"

    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        throw "Prerequisites check failed"
    }

    # Create backup
    if (-not (Backup-System)) {
        throw "Backup failed"
    }

    # Deploy code
    if (-not (Deploy-Code)) {
        throw "Code deployment failed"
    }

    # Update database
    if (-not (Update-Database)) {
        throw "Database update failed"
    }

    # Verify deployment
    if (-not (Test-Deployment)) {
        throw "Deployment verification failed"
    }

    Write-ColorOutput Green "`nDeployment completed successfully!"
    Write-Log "Deployment completed successfully"
}
catch {
    Write-ColorOutput Red "`nDeployment failed: $_"
    Write-Log "ERROR: Deployment failed: $_"

    # Attempt rollback
    $latestBackup = Get-ChildItem $config.BackupDir | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestBackup) {
        Write-ColorOutput Yellow "`nAttempting rollback..."
        if (Rollback-Deployment $latestBackup.FullName) {
            Write-ColorOutput Green "Rollback completed successfully"
            Write-Log "Rollback completed successfully"
        }
        else {
            Write-ColorOutput Red "Rollback failed"
            Write-Log "ERROR: Rollback failed"
        }
    }
    else {
        Write-ColorOutput Red "No backup found for rollback"
        Write-Log "ERROR: No backup found for rollback"
    }

    exit 1
}

Write-ColorOutput Cyan "`nDeployment Summary:"
Write-ColorOutput Cyan "------------------"
Write-ColorOutput Cyan "Project Root: $($config.ProjectRoot)"
Write-ColorOutput Cyan "Environment: $($config.Environment)"
Write-ColorOutput Cyan "Log File: $($config.LogFile)"
Write-ColorOutput Cyan "Backup Directory: $($config.BackupDir)"
Write-ColorOutput Cyan "Database: $($config.DatabaseName)"

Write-ColorOutput Green "`nNext Steps:"
Write-ColorOutput Green "1. Monitor error rates and performance metrics"
Write-ColorOutput Green "2. Verify all critical paths are working"
Write-ColorOutput Green "3. Check monitoring dashboards"
Write-ColorOutput Green "4. Review deployment logs for any warnings"

exit 0 