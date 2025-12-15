#!/bin/bash

set -e

echo "🚀 BELL24H 502 FIX - AUTOMATIC DEPLOYMENT"
echo "=========================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}Step 1: Stopping old containers...${NC}"
cd /home/user/bell24h
docker-compose down || true

echo -e "${YELLOW}Step 2: Removing old images...${NC}"
docker rmi bell24h:patched || true
docker rmi bell24h-app || true

echo -e "${YELLOW}Step 3: Building fresh Docker image...${NC}"
cd /home/user/bell24h
docker-compose build --no-cache bell24h-app

echo -e "${YELLOW}Step 4: Starting containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}Step 5: Waiting for app to be ready (30 seconds)...${NC}"
sleep 30

echo -e "${YELLOW}Step 6: Testing container health...${NC}"
if docker ps | grep -q bell24h-app; then
    echo -e "${GREEN}✅ Container is running${NC}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    docker logs bell24h-app --tail 100
    exit 1
fi

echo -e "${YELLOW}Step 7: Testing application on port 3000...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ App responding on port 3000${NC}"
else
    echo -e "${RED}⚠️ App not responding yet, checking logs...${NC}"
    docker logs bell24h-app --tail 50
fi

echo -e "${YELLOW}Step 8: Restarting Nginx...${NC}"
sudo systemctl restart nginx

echo -e "${YELLOW}Step 9: Testing from Nginx proxy...${NC}"
sleep 5
if curl -s http://localhost | grep -q "Bell24h\|bell24h"; then
    echo -e "${GREEN}✅ Nginx proxy working${NC}"
else
    echo -e "${YELLOW}⚠️ Nginx might need configuration adjustment${NC}"
fi

echo -e "\n${GREEN}=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==========================================${NC}"
echo -e "\nChecking final status:"
echo "- Docker containers: $(docker ps | grep -c bell24h)"
echo "- Port 3000: $(sudo lsof -i :3000 | wc -l) processes"
echo "- Nginx status: $(sudo systemctl is-active nginx)"
echo -e "\n🌐 Your site should now be live at: https://bell24h.com"
echo -e "\nIf still showing 502:"
echo "  1. Check logs: docker logs bell24h-app --tail 100"
echo "  2. Check Nginx: sudo systemctl status nginx"
echo "  3. Test proxy: curl http://localhost:3000"

