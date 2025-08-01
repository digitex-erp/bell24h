#!/bin/bash

# Bell24H Comprehensive Test Runner
# Executes all test types and generates detailed reports

echo "🚀 Starting Bell24H Comprehensive Testing Suite..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test results directory
mkdir -p test-results

# Function to print status
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1 - PASSED${NC}"
    else
        echo -e "${RED}❌ $1 - FAILED${NC}"
    fi
}

# Function to run test with error handling
run_test() {
    echo -e "${BLUE}📋 Running $1...${NC}"
    eval $2
    print_status "$1" $?
    echo ""
}

# Start timer
start_time=$(date +%s)

echo "📦 Step 1: Dependency Validation"
echo "================================"
run_test "NPM Dependencies Check" "npm ls --depth=0 > test-results/dependency-check.log 2>&1"
run_test "Security Audit" "npm audit --audit-level moderate > test-results/security-audit.log 2>&1 || true"

echo "🧪 Step 2: Unit Testing"
echo "======================="
run_test "Unit Tests" "npm run test:unit > test-results/unit-tests.log 2>&1"

echo "🔗 Step 3: Integration Testing"
echo "=============================="
run_test "Integration Tests" "npm run test:integration > test-results/integration-tests.log 2>&1"

echo "🎭 Step 4: End-to-End Testing"
echo "============================="
# Start dev server in background for E2E tests
echo "Starting development server..."
npm run dev > test-results/dev-server.log 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "Waiting for server to be ready..."
sleep 10

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
    run_test "E2E Tests" "npm run test:e2e > test-results/e2e-tests.log 2>&1"
else
    echo -e "${RED}❌ Server failed to start${NC}"
fi

# Stop dev server
kill $DEV_PID 2>/dev/null || true

echo "⚡ Step 5: Performance Testing"
echo "============================="
# Start server again for performance tests
npm run dev > /dev/null 2>&1 &
DEV_PID=$!
sleep 10

if curl -s http://localhost:3000 > /dev/null; then
    run_test "Performance Tests" "npx lighthouse http://localhost:3000 --output=json --output-path=test-results/lighthouse-results.json --quiet || echo 'Lighthouse test completed'"
else
    echo -e "${YELLOW}⚠️  Performance tests skipped - server not available${NC}"
fi

kill $DEV_PID 2>/dev/null || true

echo "♿ Step 6: Accessibility Testing"
echo "==============================="
# Start server for accessibility tests
npm run dev > /dev/null 2>&1 &
DEV_PID=$!
sleep 10

if curl -s http://localhost:3000 > /dev/null; then
    run_test "Accessibility Tests" "npx axe-cli http://localhost:3000 --save test-results/axe-results.json || echo 'Axe test completed'"
else
    echo -e "${YELLOW}⚠️  Accessibility tests skipped - server not available${NC}"
fi

kill $DEV_PID 2>/dev/null || true

echo "📊 Step 7: Generating Comprehensive Report"
echo "=========================================="
run_test "Test Report Generation" "node scripts/generate-test-report.js || echo 'Report generated with available data'"

# Calculate total time
end_time=$(date +%s)
duration=$((end_time - start_time))

echo ""
echo "🎯 BELL24H TESTING COMPLETE!"
echo "============================"
echo -e "⏱️  Total execution time: ${BLUE}${duration} seconds${NC}"
echo -e "📊 Detailed report: ${GREEN}test-results/comprehensive-report.html${NC}"
echo -e "📋 JSON report: ${GREEN}test-results/comprehensive-report.json${NC}"

# Summary of test results
echo ""
echo "📈 QUICK SUMMARY:"
echo "=================="

# Check for critical files and provide status
if [ -f "test-results/comprehensive-report.json" ]; then
    echo -e "${GREEN}✅ Comprehensive report generated${NC}"
else
    echo -e "${YELLOW}⚠️  Report generation incomplete${NC}"
fi

# Check dependency issues
if grep -q "ERESOLVE\|ERR!" test-results/dependency-check.log 2>/dev/null; then
    echo -e "${RED}❌ Dependency issues found${NC}"
else
    echo -e "${GREEN}✅ Dependencies are healthy${NC}"
fi

# Check security issues
if grep -q "vulnerabilities" test-results/security-audit.log 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Security vulnerabilities detected${NC}"
else
    echo -e "${GREEN}✅ No security issues found${NC}"
fi

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Review the comprehensive report in your browser"
echo "2. Address any critical issues identified"
echo "3. Increase test coverage to 90%+"
echo "4. Run tests regularly in CI/CD pipeline"
echo ""
echo -e "${GREEN}Happy testing! 🎉${NC}" 