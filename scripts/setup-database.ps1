# Bell24h.com Database Setup Script
# This script sets up the PostgreSQL database and user for Bell24h.com

# Configuration
$dbName = "bell24h_db"
$dbUser = "bell24h_user"
$dbPassword = "bell24h_password"
$dbHost = "localhost"
$dbPort = "5432"

# PostgreSQL paths - update these if your installation is different
$postgresPaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\13\bin"
)

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

# Function to check if PostgreSQL service is running
function Test-PostgreSQLService {
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if (-not $service) {
        Write-ColorOutput Red "PostgreSQL service not found"
        return $false
    }

    if ($service.Status -ne 'Running') {
        Write-ColorOutput Yellow "PostgreSQL service is not running. Attempting to start..."
        try {
            Start-Service -Name $service.Name
            Start-Sleep -Seconds 5
            $service = Get-Service -Name $service.Name
            if ($service.Status -eq 'Running') {
                Write-ColorOutput Green "PostgreSQL service started successfully"
                return $true
            }
        } catch {
            Write-ColorOutput Red "Failed to start PostgreSQL service: $_"
            return $false
        }
    }

    Write-ColorOutput Green "PostgreSQL service is running"
    return $true
}

# Function to find PostgreSQL installation
function Find-PostgreSQL {
    foreach ($path in $postgresPaths) {
        if (Test-Path $path) {
            $psqlPath = Join-Path $path "psql.exe"
            if (Test-Path $psqlPath) {
                Write-ColorOutput Green "Found PostgreSQL at: $path"
                return $psqlPath
            }
        }
    }
    return $null
}

# Function to check if PostgreSQL is installed
function Test-PostgreSQL {
    $psqlPath = Find-PostgreSQL
    if ($psqlPath) {
        try {
            $psqlVersion = & $psqlPath --version
            if ($psqlVersion) {
                Write-ColorOutput Green "PostgreSQL is installed: $psqlVersion"
                return $psqlPath
            }
        } catch {
            Write-ColorOutput Red "PostgreSQL is not properly installed"
            return $null
        }
    }
    Write-ColorOutput Red "PostgreSQL is not installed or not found in common locations"
    Write-ColorOutput Yellow "Please install PostgreSQL from https://www.postgresql.org/download/windows/"
    return $null
}

# Function to execute PostgreSQL command
function Invoke-PostgreSQLCommand {
    param (
        [string]$psqlPath,
        [string]$command,
        [string]$user = "postgres",
        [string]$password
    )

    # Create a temporary file for the command
    $tempFile = [System.IO.Path]::GetTempFileName()
    $command | Out-File -FilePath $tempFile -Encoding UTF8

    try {
        # Set PGPASSWORD environment variable
        $env:PGPASSWORD = $password

        # Execute the command using the file
        $result = & $psqlPath -U $user -f $tempFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw $result
        }
        return $result
    }
    finally {
        # Clean up
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
        # Clear PGPASSWORD
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Function to create database and user
function Initialize-Database {
    param (
        [string]$psqlPath
    )

    Write-ColorOutput Green "Initializing database and user..."

    # Get postgres user password
    Write-ColorOutput Yellow "Please enter the password for the postgres user:"
    $postgresPassword = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
    $postgresPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

    # Create .env file with database URL
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://$dbUser`:$dbPassword@$dbHost`:$dbPort/$dbName"

# JWT Configuration
JWT_SECRET="bell24h_jwt_secret_key_2024"
JWT_EXPIRES_IN="7d"

# MFA Configuration
MFA_ISSUER="Bell24h.com"

# Security Configuration
SESSION_SECRET="bell24h_session_secret_2024"
COOKIE_SECRET="bell24h_cookie_secret_2024"

# API Configuration
API_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@bell24h.com"
SMTP_PASS="your-app-specific-password"

# Redis Configuration (for rate limiting)
REDIS_URL="redis://localhost:6379"
"@

    try {
        # Create database and user
        Write-ColorOutput Green "Creating database..."
        Invoke-PostgreSQLCommand -psqlPath $psqlPath -command "CREATE DATABASE $dbName;" -password $postgresPassword
        if ($LASTEXITCODE -ne 0) { throw "Failed to create database" }

        Write-ColorOutput Green "Creating user..."
        Invoke-PostgreSQLCommand -psqlPath $psqlPath -command "CREATE USER $dbUser WITH PASSWORD '$dbPassword';" -password $postgresPassword
        if ($LASTEXITCODE -ne 0) { throw "Failed to create user" }

        Write-ColorOutput Green "Granting privileges..."
        Invoke-PostgreSQLCommand -psqlPath $psqlPath -command "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;" -password $postgresPassword
        if ($LASTEXITCODE -ne 0) { throw "Failed to grant privileges" }

        # Create .env file
        Write-ColorOutput Green "Creating .env file..."
        $envContent | Out-File -FilePath ".env" -Encoding UTF8

        Write-ColorOutput Green "Database and user created successfully"
        Write-ColorOutput Green ".env file created with database configuration"

        # Run Prisma migration
        Write-ColorOutput Green "Running Prisma migration..."
        npx prisma migrate dev --name add_security_features

        Write-ColorOutput Green "Database setup completed successfully!"
    } catch {
        Write-ColorOutput Red "Error during database setup: $_"
        Write-ColorOutput Yellow "Please make sure PostgreSQL is running and the postgres user password is correct"
        exit 1
    }
}

# Main execution
try {
    Write-ColorOutput Green "Starting Bell24h.com database setup..."

    # Check if PostgreSQL service is running
    if (-not (Test-PostgreSQLService)) {
        Write-ColorOutput Red "Please start PostgreSQL service and try again"
        exit 1
    }

    # Check if PostgreSQL is installed
    $psqlPath = Test-PostgreSQL
    if (-not $psqlPath) {
        Write-ColorOutput Red "Please install PostgreSQL and try again"
        exit 1
    }

    # Initialize database
    Initialize-Database -psqlPath $psqlPath

} catch {
    Write-ColorOutput Red "Setup failed: $_"
    exit 1
} 