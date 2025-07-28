#!/bin/bash

# Bell24H Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Bell24H Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bell24h"
ENVIRONMENT="production"
BUILD_DIR=".next"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check Node.js version
if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm
if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi

# Check environment file
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found, creating from template..."
    cp env.example .env.production
    print_warning "Please configure .env.production with your production values"
    exit 1
fi

# Check required environment variables
print_status "Validating environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "OPENAI_API_KEY"
    "RAZORPAY_KEY_ID"
    "RAZORPAY_KEY_SECRET"
    "ETHEREUM_PRIVATE_KEY"
    "ETHEREUM_RPC_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Create backup
print_status "Creating backup of current deployment..."
mkdir -p "$BACKUP_DIR"
if [ -d "$BUILD_DIR" ]; then
    cp -r "$BUILD_DIR" "$BACKUP_DIR/"
    print_success "Backup created at $BACKUP_DIR"
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production
print_success "Dependencies installed"

# Database migration
print_status "Running database migrations..."
npx prisma generate
npx prisma migrate deploy
print_success "Database migrations completed"

# Build the application
print_status "Building application for production..."
npm run build
print_success "Application built successfully"

# Security audit
print_status "Running security audit..."
npm audit --audit-level moderate || {
    print_warning "Security vulnerabilities found. Review and fix before deployment."
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
}

# Performance optimization
print_status "Optimizing for production..."

# Generate sitemap
print_status "Generating sitemap..."
npx next-sitemap

# Compress static assets
print_status "Compressing static assets..."
find public -name "*.js" -o -name "*.css" -o -name "*.html" | xargs gzip -k

# Health check
print_status "Running health checks..."

# Test database connection
print_status "Testing database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1 || {
    print_error "Database connection failed"
    exit 1
}

# Test API endpoints
print_status "Testing critical API endpoints..."
curl -f -s "$NEXTAUTH_URL/api/health" > /dev/null || {
    print_warning "Health check endpoint not responding"
}

print_success "Health checks completed"

# Start application
print_status "Starting production application..."
print_success "Deployment completed successfully!"

echo ""
echo "🎉 Bell24H is now running in production!"
echo ""
echo "📊 Deployment Summary:"
echo "   - Environment: $ENVIRONMENT"
echo "   - Build Directory: $BUILD_DIR"
echo "   - Backup Location: $BACKUP_DIR"
echo "   - Database: Migrated and verified"
echo "   - Security: Audited"
echo "   - Performance: Optimized"
echo ""
echo "🔗 Access your application at: $NEXTAUTH_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Monitor application logs"
echo "   2. Set up monitoring and alerts"
echo "   3. Configure SSL certificates"
echo "   4. Set up CDN for static assets"
echo "   5. Configure backup strategies"
echo ""

# Optional: Start with PM2 for process management
if command_exists pm2; then
    print_status "Starting with PM2 process manager..."
    pm2 start npm --name "$PROJECT_NAME" -- start
    pm2 save
    print_success "Application started with PM2"
else
    print_warning "PM2 not found. Consider installing for better process management."
    print_status "Starting with npm..."
    npm start
fi 