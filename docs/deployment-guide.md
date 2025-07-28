# Bell24H.com Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Monitoring Setup](#monitoring-setup)
6. [Backup Configuration](#backup-configuration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Windows Server 2019 or later
- IIS 10.0 or later
- PHP 8.1 or later
- MySQL 8.0 or later
- Node.js 18.x or later
- PowerShell 7.0 or later

### Required Software
1. **Web Server**
   - IIS with URL Rewrite Module
   - PHP FastCGI
   - Node.js

2. **Database**
   - MySQL Server
   - MySQL Workbench (optional)

3. **Development Tools**
   - Git
   - Composer
   - npm

## Environment Setup

### 1. IIS Configuration
1. Install IIS with required features:
   ```powershell
   Install-WindowsFeature -Name Web-Server -IncludeManagementTools
   Install-WindowsFeature -Name Web-CGI
   ```

2. Install URL Rewrite Module:
   - Download from [Microsoft](https://www.iis.net/downloads/microsoft/url-rewrite)
   - Run the installer

3. Configure PHP FastCGI:
   ```powershell
   # Add PHP handler
   Add-WebHandler -Name "PHP_via_FastCGI" -Path "*.php" -Module "FastCgiModule" -ScriptProcessor "C:\php\php-cgi.exe"
   ```

### 2. PHP Setup
1. Download PHP 8.1
2. Extract to `C:\php`
3. Configure `php.ini`:
   ```ini
   extension=mysqli
   extension=pdo_mysql
   extension=openssl
   date.timezone = UTC
   ```

### 3. Node.js Setup
1. Install Node.js 18.x
2. Configure npm:
   ```bash
   npm config set prefix "C:\Program Files\nodejs"
   ```

## Database Setup

### 1. MySQL Configuration
1. Install MySQL Server
2. Create database and user:
   ```sql
   CREATE DATABASE bell24h_db;
   CREATE USER 'bell24h_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON bell24h_db.* TO 'bell24h_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 2. Database Migration
1. Run migrations:
   ```bash
   php artisan migrate
   ```

2. Seed initial data:
   ```bash
   php artisan db:seed
   ```

## Application Deployment

### 1. Code Deployment
1. Clone repository:
   ```bash
   git clone https://github.com/bell24h/bell24h.com.git
   cd bell24h.com
   ```

2. Install dependencies:
   ```bash
   composer install --no-dev
   npm install --production
   ```

3. Build assets:
   ```bash
   npm run build
   ```

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Configure environment variables:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   DB_HOST=localhost
   DB_DATABASE=bell24h_db
   DB_USERNAME=bell24h_user
   DB_PASSWORD=your_password
   ```

### 3. Application Setup
1. Generate application key:
   ```bash
   php artisan key:generate
   ```

2. Optimize application:
   ```bash
   php artisan optimize
   php artisan config:cache
   php artisan route:cache
   ```

## Monitoring Setup

### 1. Error Tracking
1. Install Sentry:
   ```bash
   composer require sentry/sentry-laravel
   ```

2. Configure Sentry:
   ```php
   // config/sentry.php
   return [
       'dsn' => env('SENTRY_DSN'),
       'traces_sample_rate' => 1.0,
   ];
   ```

### 2. Performance Monitoring
1. Install Prometheus:
   ```powershell
   # Download and install Prometheus
   Invoke-WebRequest -Uri "https://github.com/prometheus/prometheus/releases/download/v2.30.0/prometheus-2.30.0.windows-amd64.zip" -OutFile "prometheus.zip"
   Expand-Archive -Path "prometheus.zip" -DestinationPath "C:\Prometheus"
   ```

2. Configure Grafana:
   - Install Grafana
   - Add Prometheus data source
   - Import dashboard templates

## Backup Configuration

### 1. Database Backup
1. Configure automated backups:
   ```powershell
   # Create backup script
   $backupScript = @"
   mysqldump -u bell24h_user -p bell24h_db > C:\backups\bell24h\db\backup_$(Get-Date -Format 'yyyyMMdd').sql
   "@
   Set-Content -Path "C:\scripts\backup-db.ps1" -Value $backupScript
   ```

2. Schedule backup task:
   ```powershell
   $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\scripts\backup-db.ps1"
   $trigger = New-ScheduledTaskTrigger -Daily -At 2am
   Register-ScheduledTask -TaskName "Bell24HDBBackup" -Action $action -Trigger $trigger
   ```

### 2. File Backup
1. Configure file backup:
   ```powershell
   # Create file backup script
   $fileBackupScript = @"
   Compress-Archive -Path "C:\inetpub\wwwroot\bell24h.com\*" -DestinationPath "C:\backups\bell24h\files\backup_$(Get-Date -Format 'yyyyMMdd').zip"
   "@
   Set-Content -Path "C:\scripts\backup-files.ps1" -Value $fileBackupScript
   ```

## Troubleshooting

### Common Issues

1. **IIS 500 Error**
   - Check PHP error logs
   - Verify FastCGI configuration
   - Check file permissions

2. **Database Connection Issues**
   - Verify MySQL service is running
   - Check database credentials
   - Test connection using MySQL Workbench

3. **Performance Issues**
   - Check server resources
   - Review application logs
   - Monitor database queries

### Support

For deployment support:
- Email: deploy@bell24h.com
- Phone: +1 (555) 123-4567
- Hours: 24/7

## Maintenance

### Regular Tasks
1. **Daily**
   - Check error logs
   - Monitor performance
   - Verify backups

2. **Weekly**
   - Review security logs
   - Check disk space
   - Update dependencies

3. **Monthly**
   - Performance optimization
   - Security updates
   - Backup verification

### Update Procedures
1. **Code Updates**
   ```bash
   git pull origin main
   composer install --no-dev
   npm install --production
   npm run build
   php artisan optimize
   ```

2. **Database Updates**
   ```bash
   php artisan migrate
   ```

3. **Configuration Updates**
   ```bash
   php artisan config:cache
   php artisan route:cache
   ``` 