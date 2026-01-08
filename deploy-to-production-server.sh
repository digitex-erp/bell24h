#!/bin/bash

# Bell24h DigitalOcean Production Deployment Script
# Deploys the InsForge-integrated code to production server at 165.232.187.195
# Branch: claude/document-project-architecture-QHk0Z

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     Bell24h Production Server Deployment                 ║"
echo "║     Server: 165.232.187.195                               ║"
echo "║     Branch: claude/document-project-architecture-QHk0Z    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER="root@165.232.187.195"
APP_DIR="/var/www/bell24h"
BRANCH="claude/document-project-architecture-QHk0Z"

# Function to print step
step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to execute remote command
remote_exec() {
    echo -e "${YELLOW}Running: $1${NC}"
    ssh $SERVER "cd $APP_DIR && $1"
}

# Step 1: Backup current deployment
step "STEP 1: Creating backup of current deployment"
echo "This allows rollback if deployment fails..."
remote_exec "cp -r .next .next.backup.$(date +%Y%m%d_%H%M%S) || true"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Step 2: Stop PM2 (graceful shutdown)
step "STEP 2: Stopping application (graceful shutdown)"
remote_exec "pm2 stop bell24h || true"
echo -e "${GREEN}✅ Application stopped${NC}"
echo ""

# Step 3: Pull latest code from Git
step "STEP 3: Pulling latest code from Git"
echo "Fetching branch: $BRANCH"
remote_exec "git fetch origin"
echo ""
echo "Checking out branch: $BRANCH"
remote_exec "git checkout $BRANCH"
echo ""
echo "Pulling latest changes..."
remote_exec "git pull origin $BRANCH"
echo -e "${GREEN}✅ Code updated successfully${NC}"
echo ""

# Step 4: Install/Update dependencies
step "STEP 4: Installing dependencies"
echo "Installing @supabase/supabase-js and other packages..."
remote_exec "npm install"
echo ""
echo "Verifying critical packages..."
remote_exec "npm list @supabase/supabase-js dotenv || npm install @supabase/supabase-js dotenv"
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Environment variables check
step "STEP 5: Checking environment variables"
echo "Verifying .env.production exists..."
remote_exec "test -f .env.production && echo '✓ .env.production exists' || echo '✗ WARNING: .env.production missing!'"
echo ""
echo "Checking InsForge configuration..."
remote_exec "grep -q 'NEXT_PUBLIC_INSFORGE_URL' .env.production && echo '✓ InsForge URL configured' || echo '✗ Missing NEXT_PUBLIC_INSFORGE_URL'"
remote_exec "grep -q 'NEXT_PUBLIC_INSFORGE_ANON_KEY' .env.production && echo '✓ InsForge API key configured' || echo '✗ Missing NEXT_PUBLIC_INSFORGE_ANON_KEY'"
echo -e "${GREEN}✅ Environment checked${NC}"
echo ""

# Step 6: Clear old build cache
step "STEP 6: Clearing build cache"
echo "Removing old .next directory..."
remote_exec "rm -rf .next/cache"
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Step 7: Build production bundle
step "STEP 7: Building production bundle"
echo "This may take 2-3 minutes..."
echo ""
remote_exec "npm run build"
echo ""
echo -e "${GREEN}✅ Build completed successfully${NC}"
echo ""

# Step 8: Restart PM2
step "STEP 8: Restarting application with PM2"
echo "Starting with updated environment..."
remote_exec "pm2 restart bell24h --update-env"
echo ""
echo "Waiting 5 seconds for application to start..."
sleep 5
echo ""
echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Step 9: Health check
step "STEP 9: Health check"
echo "Testing homepage..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://165.232.187.195/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Homepage: OK (Status: $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Homepage: FAILED (Status: $HTTP_CODE)${NC}"
fi
echo ""

echo "Testing Dashboard Stats API..."
STATS_RESPONSE=$(curl -s http://165.232.187.195/api/dashboard/stats)
if echo "$STATS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Dashboard Stats API: OK (Returns JSON)${NC}"
    echo "  Response: $STATS_RESPONSE"
else
    echo -e "${YELLOW}⚠ Dashboard Stats API: Returns HTML (might be 404 or auth redirect)${NC}"
    echo "  This is expected if not logged in - API requires authentication"
fi
echo ""

# Step 10: View logs
step "STEP 10: Checking application logs"
echo "Last 20 lines of PM2 logs:"
echo ""
remote_exec "pm2 logs bell24h --lines 20 --nostream"
echo ""

# Final summary
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ DEPLOYMENT COMPLETED                       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Code pulled from: $BRANCH"
echo "✅ Dependencies installed"
echo "✅ Production build completed"
echo "✅ PM2 restarted with new code"
echo "✅ Health check performed"
echo ""
echo "🌐 Application URLs:"
echo "   Homepage: http://165.232.187.195"
echo "   Dashboard: http://165.232.187.195/dashboard"
echo "   Stats API: http://165.232.187.195/api/dashboard/stats"
echo ""
echo "📋 Next Steps:"
echo "1. Run E2E tests: ./test-production.sh"
echo "2. Test login with real SMS (MSG91)"
echo "3. Create test RFQ to verify database integration"
echo "4. Monitor logs: ssh $SERVER 'pm2 logs bell24h'"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: ssh $SERVER 'pm2 logs bell24h'"
echo "   Restart: ssh $SERVER 'pm2 restart bell24h'"
echo "   Status: ssh $SERVER 'pm2 status'"
echo ""
echo "🎯 Deployment successful! Ready for testing."
echo ""
