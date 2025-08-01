#!/bin/bash

# BELL24H Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="bell24h"
DEPLOY_ENV=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${TIMESTAMP}"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js 18+ is required. Current version: $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check environment file
    if [ ! -f ".env.local" ]; then
        error ".env.local file not found. Please copy env.example to .env.local and configure it."
    fi
    
    log "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup build files
    if [ -d ".next" ]; then
        cp -r .next "$BACKUP_DIR/"
        log "Backed up .next directory"
    fi
    
    # Backup package files
    cp package*.json "$BACKUP_DIR/"
    log "Backed up package files"
    
    # Backup environment (without sensitive data)
    if [ -f ".env.local" ]; then
        grep -v -E "(SECRET|KEY|PASSWORD)" .env.local > "$BACKUP_DIR/env.backup" 2>/dev/null || true
        log "Backed up environment configuration"
    fi
    
    log "Backup completed: $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clear npm cache
    npm cache clean --force
    
    # Install dependencies
    npm ci --production=false
    
    # Install Prisma CLI
    npm install -g prisma
    
    log "Dependencies installed successfully"
}

# Database setup
setup_database() {
    log "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    npx prisma migrate deploy
    
    # Seed database if needed
    if [ "$DEPLOY_ENV" = "production" ]; then
        log "Skipping database seeding in production"
    else
        npx prisma db seed
    fi
    
    log "Database setup completed"
}

# Build application
build_application() {
    log "Building application for $DEPLOY_ENV..."
    
    # Set environment
    export NODE_ENV=$DEPLOY_ENV
    
    # Clean previous build
    rm -rf .next
    
    # Build application
    npm run build
    
    # Run type checking
    npm run type-check
    
    # Run linting
    npm run lint
    
    log "Application built successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Unit tests
    npm run test -- --passWithNoTests
    
    # Type checking
    npm run type-check
    
    # Linting
    npm run lint
    
    log "All tests passed"
}

# Optimize assets
optimize_assets() {
    log "Optimizing assets..."
    
    # Optimize images
    if command -v imagemin &> /dev/null; then
        find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | xargs imagemin --out-dir=public
    fi
    
    # Bundle analysis (optional)
    if [ "$ANALYZE" = "true" ]; then
        npm run analyze
    fi
    
    log "Asset optimization completed"
}

# Security checks
security_checks() {
    log "Running security checks..."
    
    # Check for known vulnerabilities
    npm audit --audit-level=moderate
    
    # Check for outdated packages
    npm outdated || true
    
    # Check for exposed secrets in code
    if grep -r "password\|secret\|key" src/ --include="*.ts" --include="*.tsx" | grep -v "//" | grep -v "import"; then
        warn "Potential secrets found in source code"
    fi
    
    log "Security checks completed"
}

# Start application
start_application() {
    log "Starting application..."
    
    # Set environment
    export NODE_ENV=$DEPLOY_ENV
    
    # Start the application
    if [ "$DEPLOY_ENV" = "production" ]; then
        npm start
    else
        npm run dev
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log "Health check passed"
    else
        error "Health check failed - application not responding"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep last 5)
    ls -t backups/ | tail -n +6 | xargs -I {} rm -rf backups/{} 2>/dev/null || true
    
    # Clear npm cache
    npm cache clean --force
    
    log "Cleanup completed"
}

# Main deployment function
deploy() {
    log "Starting deployment for $DEPLOY_ENV environment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Backup current deployment
    backup_current
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Run tests
    run_tests
    
    # Security checks
    security_checks
    
    # Build application
    build_application
    
    # Optimize assets
    optimize_assets
    
    # Start application
    start_application &
    
    # Health check
    health_check
    
    # Cleanup
    cleanup
    
    log "Deployment completed successfully!"
    log "Application is running on http://localhost:3000"
}

# Rollback function
rollback() {
    log "Rolling back to previous deployment..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t backups/ | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $LATEST_BACKUP"
    
    # Stop current application
    pkill -f "next" || true
    
    # Restore from backup
    if [ -d "backups/$LATEST_BACKUP/.next" ]; then
        rm -rf .next
        cp -r "backups/$LATEST_BACKUP/.next" .
    fi
    
    # Restore package files if needed
    if [ -f "backups/$LATEST_BACKUP/package.json" ]; then
        cp "backups/$LATEST_BACKUP/package.json" .
        npm install
    fi
    
    # Start application
    start_application &
    
    # Health check
    health_check
    
    log "Rollback completed successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [production|staging] [--rollback]"
    echo ""
    echo "Options:"
    echo "  production    Deploy to production environment (default)"
    echo "  staging       Deploy to staging environment"
    echo "  --rollback    Rollback to previous deployment"
    echo "  --analyze     Run bundle analysis"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to production"
    echo "  $0 staging           # Deploy to staging"
    echo "  $0 --rollback        # Rollback to previous deployment"
    echo "  $0 production --analyze  # Deploy with bundle analysis"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        production|staging)
            DEPLOY_ENV="$1"
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --analyze)
            ANALYZE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Main execution
if [ "$ROLLBACK" = true ]; then
    rollback
else
    deploy
fi 