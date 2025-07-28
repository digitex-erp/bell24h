# Bell24h.com Deployment Verification Script
# This script verifies the deployment and checks all critical components

# Configuration
$targetDir = "C:\inetpub\wwwroot\bell24h.com"
$appUrl = "https://bell24h.com"

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

# Function to check file existence
function Test-FileExists {
    param (
        [string]$path,
        [string]$description
    )
    
    if (Test-Path $path) {
        Write-ColorOutput Green "[OK] $description"
        return $true
    } else {
        Write-ColorOutput Red "[ERROR] $description"
        return $false
    }
}

# Function to check directory permissions
function Test-DirectoryPermissions {
    param (
        [string]$path,
        [string]$description
    )
    
    try {
        # Create directory if it doesn't exist
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-ColorOutput Yellow "[INFO] Created directory: $description"
        }
        
        $acl = Get-Acl $path
        $hasPermission = $acl.Access | Where-Object { $_.IdentityReference -eq "IIS_IUSRS" -and $_.FileSystemRights -match "FullControl" }
        
        if ($hasPermission) {
            Write-ColorOutput Green "[OK] $description"
            return $true
        } else {
            # Set permissions if not present
            $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
            $acl.SetAccessRule($rule)
            Set-Acl $path $acl
            Write-ColorOutput Yellow "[INFO] Set permissions for: $description"
            return $true
        }
    } catch {
        Write-ColorOutput Red "[ERROR] $description - $_"
        return $false
    }
}

# Function to check web response
function Test-WebResponse {
    param (
        [string]$url,
        [string]$description
    )
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput Green "[OK] $description"
            return $true
        } else {
            Write-ColorOutput Red "[ERROR] $description - Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-ColorOutput Red "[ERROR] $description - $_"
        return $false
    }
}

# Function to check database connection
function Test-DatabaseConnection {
    Write-ColorOutput Green "Testing database connection..."
    
    try {
        $result = php artisan migrate:status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "[OK] Database connection"
            return $true
        } else {
            Write-ColorOutput Red "[ERROR] Database connection"
            return $false
        }
    } catch {
        Write-ColorOutput Red "[ERROR] Database connection - $_"
        return $false
    }
}

# Function to check cache files
function Test-CacheFiles {
    Write-ColorOutput Green "Checking cache files..."
    
    $cacheFiles = @(
        @{ Path = "bootstrap\cache\config.php"; Description = "Configuration cache" },
        @{ Path = "bootstrap\cache\routes.php"; Description = "Route cache" },
        @{ Path = "bootstrap\cache\views.php"; Description = "View cache" }
    )

    $allOk = $true
    foreach ($file in $cacheFiles) {
        if (-not (Test-FileExists "$targetDir\$($file.Path)" $file.Description)) {
            $allOk = $false
        }
    }

    return $allOk
}

# Function to check storage setup
function Test-StorageSetup {
    Write-ColorOutput Green "Checking storage setup..."
    
    $storageDirs = @(
        @{ Path = "storage\logs"; Description = "Logs directory" },
        @{ Path = "storage\app\public"; Description = "Public storage" },
        @{ Path = "storage\framework\cache"; Description = "Framework cache" },
        @{ Path = "storage\framework\sessions"; Description = "Sessions directory" },
        @{ Path = "storage\framework\views"; Description = "Views cache" }
    )

    $allOk = $true
    foreach ($dir in $storageDirs) {
        $fullPath = Join-Path $targetDir $dir.Path
        if (-not (Test-DirectoryPermissions $fullPath $dir.Description)) {
            $allOk = $false
        }
    }

    # Create storage link if it doesn't exist
    $storageLink = Join-Path $targetDir "public\storage"
    if (-not (Test-Path $storageLink)) {
        try {
            Set-Location $targetDir
            php artisan storage:link
            Write-ColorOutput Green "[OK] Created storage link"
        } catch {
            Write-ColorOutput Red "[ERROR] Failed to create storage link - $_"
            $allOk = $false
        }
    }

    return $allOk
}

# Function to check dependencies
function Test-Dependencies {
    Write-ColorOutput Green "Checking dependencies..."
    
    $dependencies = @(
        @{ Path = "vendor"; Description = "Composer dependencies" },
        @{ Path = "node_modules"; Description = "Node.js dependencies" }
    )

    $allOk = $true
    foreach ($dep in $dependencies) {
        if (-not (Test-FileExists "$targetDir\$($dep.Path)" $dep.Description)) {
            $allOk = $false
        }
    }

    return $allOk
}

# Function to check web server configuration
function Test-WebServerConfig {
    Write-ColorOutput Green "Checking web server configuration..."
    
    $configFiles = @(
        @{ Path = "web.config"; Description = "IIS configuration" },
        @{ Path = "public\.htaccess"; Description = "Apache configuration" }
    )

    $allOk = $true
    foreach ($config in $configFiles) {
        if (-not (Test-FileExists "$targetDir\$($config.Path)" $config.Description)) {
            $allOk = $false
        }
    }

    return $allOk
}

# Main verification process
try {
    Write-ColorOutput Green "Starting Bell24h.com deployment verification..."
    
    $checks = @{
        "Essential Files" = {
            Test-FileExists "$targetDir\.env" "Environment file"
            Test-FileExists "$targetDir\composer.json" "Composer configuration"
            Test-FileExists "$targetDir\package.json" "Node.js configuration"
            Test-FileExists "$targetDir\artisan" "Laravel artisan"
            Test-FileExists "$targetDir\public\index.php" "Public entry point"
        }
        "Dependencies" = { Test-Dependencies }
        "Cache Files" = { Test-CacheFiles }
        "Storage Setup" = { Test-StorageSetup }
        "Database Connection" = { Test-DatabaseConnection }
        "Web Server Config" = { Test-WebServerConfig }
        "Web Response" = { Test-WebResponse $appUrl "Website accessibility" }
    }

    $results = @{}
    foreach ($check in $checks.GetEnumerator()) {
        Write-ColorOutput Yellow "`nChecking $($check.Key)..."
        $results[$check.Key] = & $check.Value
    }

    # Summary
    Write-ColorOutput Yellow "`nDeployment Verification Summary:"
    $allPassed = $true
    foreach ($result in $results.GetEnumerator()) {
        if ($result.Value) {
            Write-ColorOutput Green "[PASS] $($result.Key)"
        } else {
            Write-ColorOutput Red "[FAIL] $($result.Key)"
            $allPassed = $false
        }
    }

    if ($allPassed) {
        Write-ColorOutput Green "`nAll checks passed! Deployment is successful."
    } else {
        Write-ColorOutput Red "`nSome checks failed. Please review the errors above."
        exit 1
    }
} catch {
    Write-ColorOutput Red "Verification failed: $_"
    exit 1
} 