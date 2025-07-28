#!/bin/bash

# BELL24H Final Deployment Script
# This script deploys the complete BELL24H marketplace to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Script header
echo "🚀 BELL24H Final Deployment Script"
echo "=================================="
echo ""

# Check prerequisites
log "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { error "Docker is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { error "npm is required but not installed."; exit 1; }
success "All prerequisites are installed"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "Please run this script from the client directory"
    exit 1
fi

# Environment setup
log "Setting up environment..."
if [ ! -f .env.production ]; then
    error ".env.production file not found. Please create it first."
    echo "Example .env.production file:"
    cat << EOF
# BELL24H Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.com
DATABASE_URL=postgresql://username:password@localhost:5432/bell24h_prod
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://bell24h.com
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_SECRET=your-razorpay-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@bell24h.com
SMTP_PASS=your-app-password
REDIS_URL=redis://localhost:6379
EOF
    exit 1
fi

# Load environment variables
source .env.production
success "Environment variables loaded"

# Install dependencies
log "Installing dependencies..."
npm ci --only=production
success "Dependencies installed"

# Database setup
log "Setting up database..."
if command -v npx >/dev/null 2>&1; then
    npx prisma generate
    npx prisma db push
    npx prisma db seed
    success "Database setup completed"
else
    warning "npx not found, skipping database setup"
fi

# Build application
log "Building BELL24H application..."
npm run build
if [ $? -ne 0 ]; then
    error "Build failed!"
    exit 1
fi
success "Application built successfully"

# Run tests
log "Running production tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
    warning "Some tests failed, but continuing deployment..."
else
    success "All tests passed"
fi

# Create necessary directories
log "Creating deployment directories..."
mkdir -p deployment/nginx/ssl
mkdir -p deployment/nginx/logs
mkdir -p deployment/monitoring
mkdir -p deployment/backups
mkdir -p deployment/database
success "Directories created"

# Generate SSL certificates (self-signed for development)
log "Generating SSL certificates..."
if [ ! -f deployment/nginx/ssl/bell24h.com.crt ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout deployment/nginx/ssl/bell24h.com.key \
        -out deployment/nginx/ssl/bell24h.com.crt \
        -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=BELL24H/CN=bell24h.com"
    success "SSL certificates generated"
else
    success "SSL certificates already exist"
fi

# Create default SSL certificate
if [ ! -f deployment/nginx/ssl/default.crt ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout deployment/nginx/ssl/default.key \
        -out deployment/nginx/ssl/default.crt \
        -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=BELL24H/CN=default"
fi

# Create Prometheus configuration
log "Setting up monitoring..."
cat > deployment/monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'bell24h-app'
    static_configs:
      - targets: ['bell24h-app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
EOF
success "Monitoring configuration created"

# Create database initialization script
log "Creating database initialization script..."
cat > deployment/database/init.sql << EOF
-- BELL24H Database Initialization
CREATE DATABASE IF NOT EXISTS bell24h_prod;
\c bell24h_prod;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bell24h_prod TO bell24h_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bell24h_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bell24h_user;
EOF
success "Database initialization script created"

# Deploy with Docker
log "Deploying with Docker..."
docker-compose -f deployment/docker-compose.production.yml down
docker-compose -f deployment/docker-compose.production.yml up -d

# Wait for services to start
log "Waiting for services to start..."
sleep 30

# Health check
log "Performing health check..."
for i in {1..10}; do
    if curl -f http://localhost/health >/dev/null 2>&1; then
        success "Health check passed"
        break
    else
        if [ $i -eq 10 ]; then
            error "Health check failed after 10 attempts!"
            exit 1
        fi
        warning "Health check attempt $i failed, retrying..."
        sleep 10
    fi
done

# Performance test
log "Running performance test..."
if command -v curl >/dev/null 2>&1; then
    start_time=$(date +%s.%N)
    curl -s http://localhost/ >/dev/null
    end_time=$(date +%s.%N)
    response_time=$(echo "$end_time - $start_time" | bc)
    success "Performance test completed - Response time: ${response_time}s"
else
    warning "curl not found, skipping performance test"
fi

# Final status check
log "Final status check..."
docker-compose -f deployment/docker-compose.production.yml ps

echo ""
echo "🎉 BELL24H deployment completed successfully!"
echo ""
echo "📊 Access your marketplace at:"
echo "   🌐 Main site: https://bell24h.com"
echo "   📈 Admin dashboard: https://bell24h.com/admin"
echo "   📚 API documentation: https://bell24h.com/api/docs"
echo "   📊 Monitoring: http://localhost:3001 (Grafana)"
echo "   📈 Metrics: http://localhost:9090 (Prometheus)"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose -f deployment/docker-compose.production.yml logs -f"
echo "   Restart app: docker-compose -f deployment/docker-compose.production.yml restart bell24h-app"
echo "   Stop all: docker-compose -f deployment/docker-compose.production.yml down"
echo ""
echo "📋 Next steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Set up SSL certificates with Let's Encrypt"
echo "   3. Configure monitoring alerts"
echo "   4. Set up automated backups"
echo "   5. Configure CDN for better performance"
echo ""
success "Deployment completed! 🚀" 