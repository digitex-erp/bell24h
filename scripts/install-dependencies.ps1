# Install Dependencies Script
$ErrorActionPreference = "Stop"

# Create temp directory
$tempDir = "C:\temp\bell24h-setup"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "Downloading dependencies..." -ForegroundColor Green

# Download PHP 8.1
$phpUrl = "https://windows.php.net/downloads/releases/php-8.1.0-Win32-vs16-x64.zip"
$phpZip = "$tempDir\php.zip"
Invoke-WebRequest -Uri $phpUrl -OutFile $phpZip

# Download MySQL 8.0
$mysqlUrl = "https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.36-winx64.zip"
$mysqlZip = "$tempDir\mysql.zip"
Invoke-WebRequest -Uri $mysqlUrl -OutFile $mysqlZip

# Download Redis
$redisUrl = "https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.msi"
$redisMsi = "$tempDir\redis.msi"
Invoke-WebRequest -Uri $redisUrl -OutFile $redisMsi

Write-Host "Installing PHP..." -ForegroundColor Green
# Extract PHP
Expand-Archive -Path $phpZip -DestinationPath "C:\php" -Force
# Add PHP to PATH
$phpPath = "C:\php"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if (-not $currentPath.Contains($phpPath)) {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$phpPath", "Machine")
}

Write-Host "Installing MySQL..." -ForegroundColor Green
# Extract MySQL
Expand-Archive -Path $mysqlZip -DestinationPath "C:\mysql" -Force
# Initialize MySQL
Start-Process -FilePath "C:\mysql\bin\mysqld.exe" -ArgumentList "--initialize-insecure" -Wait
# Install MySQL as a service
Start-Process -FilePath "C:\mysql\bin\mysqld.exe" -ArgumentList "--install MySQL" -Wait

Write-Host "Installing Redis..." -ForegroundColor Green
# Install Redis
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i $redisMsi /qn" -Wait

Write-Host "Cleaning up..." -ForegroundColor Green
# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "Please restart your computer to ensure all environment variables are properly set." 