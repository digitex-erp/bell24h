#!/bin/bash

# Bell24h Production Deployment Script
# Run this script ON THE PRODUCTION SERVER (165.232.187.195)
# After copying it there via: scp deploy-on-server.sh root@165.232.187.195:/var/www/bell24h/

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     Bell24h Production Deployment (On-Server)             ║"
echo "║     Deploying InsForge Integration                        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BRANCH="claude/document-project-architecture-QHk0Z"

# Navigate to app directory
cd /var/www/bell24h

echo -e "${BLUE}Current directory: $(pwd)${NC}"
echo ""

# Step 1: Show current status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 1: Current Git Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
git branch --show-current
git log --oneline -3
echo ""

# Step 2: Stop PM2
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 2: Stopping Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pm2 stop bell24h || echo "Warning: PM2 stop failed"
echo -e "${GREEN}✅ Application stopped${NC}"
echo ""

# Step 3: Backup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 3: Creating Backup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -d ".next" ]; then
    BACKUP_NAME=".next.backup.$(date +%Y%m%d_%H%M%S)"
    cp -r .next "$BACKUP_NAME"
    echo -e "${GREEN}✅ Backup created: $BACKUP_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  No .next directory to backup${NC}"
fi
echo ""

# Step 4: Pull latest code
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 4: Pulling Latest Code${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Fetching from origin..."
git fetch origin
echo ""
echo "Checking out branch: $BRANCH"
git checkout $BRANCH
echo ""
echo "Pulling latest changes..."
git pull origin $BRANCH
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 5: Install dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 5: Installing Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Running npm install..."
npm install
echo ""
echo "Verifying critical packages..."
npm list @supabase/supabase-js dotenv || npm install @supabase/supabase-js dotenv
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 6: Check environment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 6: Environment Variables Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✓ .env.production exists${NC}"

    if grep -q "NEXT_PUBLIC_INSFORGE_URL" .env.production; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_INSFORGE_URL configured${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_INSFORGE_URL missing${NC}"
    fi

    if grep -q "NEXT_PUBLIC_INSFORGE_ANON_KEY" .env.production; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_INSFORGE_ANON_KEY configured${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_INSFORGE_ANON_KEY missing${NC}"
    fi
else
    echo -e "${RED}✗ WARNING: .env.production missing!${NC}"
    echo "You need to create .env.production with InsForge credentials"
fi
echo ""

# Step 7: Clear cache
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 7: Clearing Build Cache${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
rm -rf .next/cache
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Step 8: Build
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 8: Building Production Bundle${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "This may take 2-3 minutes..."
echo ""
npm run build
echo ""
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 9: Restart PM2
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 9: Restarting Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pm2 restart bell24h --update-env
echo ""
echo "Waiting 5 seconds for startup..."
sleep 5
echo ""
pm2 status bell24h
echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Step 10: Health check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 10: Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Testing homepage..."
curl -s -o /dev/null -w "Homepage Status: %{http_code}\n" http://localhost:3000/
echo ""
echo "Testing API..."
curl -s http://localhost:3000/api/dashboard/stats | head -100
echo ""
echo ""

# Step 11: Show logs
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  STEP 11: Recent Logs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pm2 logs bell24h --lines 20 --nostream
echo ""

# Summary
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ DEPLOYMENT COMPLETED                       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 What was deployed:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ InsForge database integration (lib/insforge.ts)"
echo "✅ Dashboard Stats API (app/api/dashboard/stats/route.ts)"
echo "✅ Updated RFQ creation API (real database operations)"
echo "✅ Updated dependencies (@supabase/supabase-js)"
echo ""
echo "🧪 Next: Run E2E tests"
echo "   From your local machine run: ./test-production.sh"
echo ""
echo "📋 Useful commands:"
echo "   pm2 logs bell24h        - View live logs"
echo "   pm2 restart bell24h     - Restart app"
echo "   pm2 status              - Check status"
echo ""
