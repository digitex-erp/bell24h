#!/bin/bash

# Bell24h Production Testing Script
# Quick automated tests for production environment

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Bell24h Production Environment Test Suite           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

SERVER="http://165.232.187.195"
PASS=0
FAIL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        ((FAIL++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PHASE 1: Server Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Homepage" "$SERVER/"
test_endpoint "Login Page" "$SERVER/login"
test_endpoint "Dashboard" "$SERVER/dashboard"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PHASE 2: API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test Dashboard Stats API
echo -n "Testing Dashboard Stats API... "
stats_response=$(curl -s "$SERVER/api/dashboard/stats")
if echo "$stats_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC} (Returns JSON)"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL${NC} (Invalid response)"
    ((FAIL++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PHASE 3: Static Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Favicon" "$SERVER/favicon.ico"
test_endpoint "Next.js Build" "$SERVER/_next/static/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Tests Passed: ${GREEN}$PASS${NC}"
echo -e "Tests Failed: ${RED}$FAIL${NC}"
echo ""

TOTAL=$((PASS + FAIL))
SUCCESS_RATE=$((PASS * 100 / TOTAL))

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ ALL TESTS PASSED! Server is healthy.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ SOME TESTS FAILED! Check errors above.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if PM2 is running: ssh root@165.232.187.195 'pm2 status'"
    echo "2. View logs: ssh root@165.232.187.195 'pm2 logs bell24h'"
    echo "3. Restart server: ssh root@165.232.187.195 'pm2 restart bell24h'"
    exit 1
fi
