# Bell24h.com Deployment Script
# This script automates the deployment process for Bell24h.com

# Configuration
$sourceDir = "C:\Users\Sanika\Downloads\Bell24hDashboard\Bell24hDashboard"
$targetDir = "C:\inetpub\wwwroot\bell24h.com"
$envFile = "$targetDir\.env"
$dbName = "bell24h_db"
$dbUser = "bell24h_user"
$dbPass = "your_secure_password"

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

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to verify source directory
function Verify-SourceDirectory {
    Write-ColorOutput Green "Verifying source directory..."
    
    if (-not (Test-Path $sourceDir)) {
        Write-ColorOutput Red "Source directory not found: $sourceDir"
        exit 1
    }

    $requiredFiles = @(
        "composer.json",
        "package.json",
        ".env.example",
        "artisan",
        "public\index.php"
    )

    foreach ($file in $requiredFiles) {
        if (-not (Test-Path "$sourceDir\$file")) {
            Write-ColorOutput Red "Required file not found: $file"
            exit 1
        }
    }

    Write-ColorOutput Green "Source directory verification complete"
}

# Function to setup target directory
function Setup-TargetDirectory {
    Write-ColorOutput Green "Setting up target directory..."
    
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir | Out-Null
    }

    # Set permissions
    $acl = Get-Acl $targetDir
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($rule)
    Set-Acl $targetDir $acl

    Write-ColorOutput Green "Target directory setup complete"
}

# Function to copy files
function Copy-ApplicationFiles {
    Write-ColorOutput Green "Copying application files..."
    
    # Copy all files
    Copy-Item "$sourceDir\*" $targetDir -Recurse -Force

    # Verify critical files
    $criticalFiles = @(
        ".env",
        "composer.json",
        "package.json",
        "artisan",
        "public\index.php"
    )

    foreach ($file in $criticalFiles) {
        if (-not (Test-Path "$targetDir\$file")) {
            Write-ColorOutput Red "Failed to copy: $file"
            exit 1
        }
    }

    Write-ColorOutput Green "File copy complete"
}

# Function to setup environment
function Setup-Environment {
    Write-ColorOutput Green "Setting up environment..."
    
    if (-not (Test-Path $envFile)) {
        Copy-Item "$targetDir\.env.example" $envFile
    }

    # Update .env file
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace "APP_ENV=.*", "APP_ENV=production"
    $envContent = $envContent -replace "APP_DEBUG=.*", "APP_DEBUG=false"
    $envContent = $envContent -replace "DB_DATABASE=.*", "DB_DATABASE=$dbName"
    $envContent = $envContent -replace "DB_USERNAME=.*", "DB_USERNAME=$dbUser"
    $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$dbPass"
    Set-Content $envFile $envContent

    Write-ColorOutput Green "Environment setup complete"
}

# Function to install dependencies
function Install-Dependencies {
    Write-ColorOutput Green "Installing dependencies..."
    
    # Check for Composer
    if (-not (Test-Command composer)) {
        Write-ColorOutput Red "Composer not found. Please install Composer first."
        exit 1
    }

    # Check for Node.js
    if (-not (Test-Command npm)) {
        Write-ColorOutput Red "Node.js not found. Please install Node.js first."
        exit 1
    }

    # Install PHP dependencies
    Set-Location $targetDir
    composer install --optimize-autoloader --no-dev

    # Install Node.js dependencies
    npm install
    npm run production

    Write-ColorOutput Green "Dependencies installation complete"
}

# Function to setup database
function Setup-Database {
    Write-ColorOutput Green "Setting up database..."
    
    # Create database and user
    $sql = @"
CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$dbUser'@'localhost' IDENTIFIED BY '$dbPass';
GRANT ALL PRIVILEGES ON $dbName.* TO '$dbUser'@'localhost';
FLUSH PRIVILEGES;
"@
    $sql | Out-File "$targetDir\setup.sql"
    
    # Use mysql command with proper PowerShell syntax
    $mysqlCmd = "mysql -u root -p"
    $sqlContent = Get-Content "$targetDir\setup.sql" -Raw
    $sqlContent | & $mysqlCmd
    
    Remove-Item "$targetDir\setup.sql"

    # Run migrations
    Set-Location $targetDir
    php artisan migrate --force
    php artisan db:seed --force

    Write-ColorOutput Green "Database setup complete"
}

# Function to setup permissions
function Setup-Permissions {
    Write-ColorOutput Green "Setting up permissions..."
    
    $directories = @(
        "storage",
        "bootstrap\cache",
        "storage\logs",
        "storage\app\public",
        "storage\framework\cache",
        "storage\framework\sessions",
        "storage\framework\views"
    )

    foreach ($dir in $directories) {
        $path = "$targetDir\$dir"
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path | Out-Null
        }
        $acl = Get-Acl $path
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl $path $acl
    }

    Write-ColorOutput Green "Permissions setup complete"
}

# Function to optimize application
function Optimize-Application {
    Write-ColorOutput Green "Optimizing application..."
    
    Set-Location $targetDir
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan storage:link

    Write-ColorOutput Green "Application optimization complete"
}

# Function to verify deployment
function Verify-Deployment {
    Write-ColorOutput Green "Verifying deployment..."
    
    $checks = @(
        @{ Name = ".env file"; Path = ".env" },
        @{ Name = "Composer dependencies"; Path = "vendor" },
        @{ Name = "Node modules"; Path = "node_modules" },
        @{ Name = "Storage link"; Path = "public\storage" },
        @{ Name = "Configuration cache"; Path = "bootstrap\cache\config.php" },
        @{ Name = "Route cache"; Path = "bootstrap\cache\routes.php" },
        @{ Name = "View cache"; Path = "bootstrap\cache\views.php" }
    )

    foreach ($check in $checks) {
        if (Test-Path "$targetDir\$($check.Path)") {
            Write-ColorOutput Green "[OK] $($check.Name)"
        } else {
            Write-ColorOutput Red "[ERROR] $($check.Name)"
        }
    }

    # Test database connection
    $dbTest = php artisan migrate:status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "[OK] Database connection"
    } else {
        Write-ColorOutput Red "[ERROR] Database connection"
    }

    Write-ColorOutput Green "Deployment verification complete"
}

# Main deployment process
try {
    Write-ColorOutput Green "Starting Bell24h.com deployment..."
    
    Verify-SourceDirectory
    Setup-TargetDirectory
    Copy-ApplicationFiles
    Setup-Environment
    Install-Dependencies
    Setup-Database
    Setup-Permissions
    Optimize-Application
    Verify-Deployment

    Write-ColorOutput Green "Deployment completed successfully!"
} catch {
    Write-ColorOutput Red "Deployment failed: $_"
    exit 1
} 