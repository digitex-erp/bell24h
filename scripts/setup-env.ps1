# Setup Environment Script for Bell24h.com

# Configuration
$config = @{
    ProjectRoot = "$PSScriptRoot\\.."
    StorageDirs = @(
        "storage/app/public",
        "storage/framework/cache",
        "storage/framework/sessions",
        "storage/framework/views",
        "storage/logs"
    )
    EnvVars = @{
        "APP_ENV" = "production"
        "APP_DEBUG" = "false"
        "APP_URL" = "https://bell24h.com"
        "DB_CONNECTION" = "mysql"
        "DB_HOST" = "localhost"
        "DB_PORT" = "3306"
        "DB_DATABASE" = "bell24h_db"
        "DB_USERNAME" = "bell24h_user"
        "DB_PASSWORD" = "your_secure_password"
        "MAIL_MAILER" = "smtp"
        "MAIL_HOST" = "smtp.mailtrap.io"
        "MAIL_PORT" = "2525"
        "MAIL_USERNAME" = "your_mail_username"
        "MAIL_PASSWORD" = "your_mail_password"
        "MAIL_ENCRYPTION" = "tls"
        "MAIL_FROM_ADDRESS" = "noreply@bell24h.com"
        "MAIL_FROM_NAME" = "Bell24h"
        "SENTRY_DSN" = "your_sentry_dsn"
        "REDIS_HOST" = "127.0.0.1"
        "REDIS_PASSWORD" = "your_redis_password"
        "REDIS_PORT" = "6379"
    }
}

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

# Function to create directories
function Create-Directories {
    Write-ColorOutput Cyan "Creating storage directories..."
    
    foreach ($dir in $config.StorageDirs) {
        $fullPath = Join-Path $config.ProjectRoot $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-ColorOutput Green "Created directory: $dir"
        }
        else {
            Write-ColorOutput Yellow "Directory already exists: $dir"
        }
    }
}

# Function to set directory permissions
function Set-DirectoryPermissions {
    Write-ColorOutput Cyan "Setting directory permissions..."
    
    foreach ($dir in $config.StorageDirs) {
        $fullPath = Join-Path $config.ProjectRoot $dir
        try {
            $acl = Get-Acl $fullPath
            $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
            $acl.SetAccessRule($rule)
            Set-Acl $fullPath $acl
            Write-ColorOutput Green "Set permissions for: $dir"
        }
        catch {
            Write-ColorOutput Red "Failed to set permissions for: $dir"
            Write-ColorOutput Red $_.Exception.Message
        }
    }
}

# Function to create .env file
function Create-EnvFile {
    Write-ColorOutput Cyan "Creating .env file..."
    
    $envPath = Join-Path $config.ProjectRoot ".env"
    $envContent = ""
    
    foreach ($key in $config.EnvVars.Keys) {
        $envContent += "$key=$($config.EnvVars[$key])`n"
    }
    
    try {
        Set-Content -Path $envPath -Value $envContent
        Write-ColorOutput Green "Created .env file"
    }
    catch {
        Write-ColorOutput Red "Failed to create .env file"
        Write-ColorOutput Red $_.Exception.Message
    }
}

# Function to create composer.json
function Create-ComposerJson {
    Write-ColorOutput Cyan "Creating composer.json..."
    
    $composerPath = Join-Path $config.ProjectRoot "composer.json"
    $composerContent = @{
        "name" = "bell24h/bell24h"
        "description" = "Bell24h.com - Your 24/7 Logistics Solution"
        "type" = "project"
        "require" = @{
            "php" = "^8.1"
            "laravel/framework" = "^10.0"
            "laravel/sanctum" = "^3.2"
            "laravel/tinker" = "^2.8"
        }
        "require-dev" = @{
            "fakerphp/faker" = "^1.9.1"
            "laravel/pint" = "^1.0"
            "laravel/sail" = "^1.18"
            "mockery/mockery" = "^1.4.4"
            "nunomaduro/collision" = "^7.0"
            "phpunit/phpunit" = "^10.1"
            "spatie/laravel-ignition" = "^2.0"
        }
        "autoload" = @{
            "psr-4" = @{
                "App\\" = "app/"
                "Database\\Factories\\" = "database/factories/"
                "Database\\Seeders\\" = "database/seeders/"
            }
        }
        "autoload-dev" = @{
            "psr-4" = @{
                "Tests\\" = "tests/"
            }
        }
        "scripts" = @{
            "post-autoload-dump" = @(
                "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
                "@php artisan package:discover --ansi"
            )
            "post-update-cmd" = @(
                "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
            )
            "post-root-package-install" = @(
                '@php -r "file_exists(''.env'') || copy(''.env.example'', ''.env'');"'
            )
            "post-create-project-cmd" = @(
                "@php artisan key:generate --ansi"
            )
        }
        "extra" = @{
            "laravel" = @{
                "dont-discover" = @()
            }
        }
        "config" = @{
            "optimize-autoloader" = $true
            "preferred-install" = "dist"
            "sort-packages" = $true
            "allow-plugins" = @{
                "pestphp/pest-plugin" = $true
                "php-http/discovery" = $true
            }
        }
        "minimum-stability" = "stable"
        "prefer-stable" = $true
    } | ConvertTo-Json -Depth 10
    
    try {
        Set-Content -Path $composerPath -Value $composerContent
        Write-ColorOutput Green "Created composer.json"
    }
    catch {
        Write-ColorOutput Red "Failed to create composer.json"
        Write-ColorOutput Red $_.Exception.Message
    }
}

# Main execution
try {
    Write-ColorOutput Cyan "Starting environment setup..."
    
    Create-Directories
    Set-DirectoryPermissions
    Create-EnvFile
    Create-ComposerJson
    
    Write-ColorOutput Green "`nEnvironment setup completed successfully!"
    Write-ColorOutput Yellow "`nNext steps:"
    Write-ColorOutput Yellow "1. Install PHP 8.1"
    Write-ColorOutput Yellow "2. Install MySQL 8.0"
    Write-ColorOutput Yellow "3. Install Redis"
    Write-ColorOutput Yellow "4. Run 'composer install'"
    Write-ColorOutput Yellow "5. Run 'php artisan key:generate'"
    Write-ColorOutput Yellow "6. Run 'php artisan migrate'"
}
catch {
    Write-ColorOutput Red "`nEnvironment setup failed:"
    Write-ColorOutput Red $_.Exception.Message
    exit 1
} 