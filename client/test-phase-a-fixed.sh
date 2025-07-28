#!/bin/bash

echo "🚀 BELL24H PHASE A TESTING - FIXED VERSION"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the client directory"
    exit 1
fi

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js first."
    exit 1
fi

# Check if the test file exists
if [ ! -f "__tests__/e2e/phase-a-basic.spec.ts" ]; then
    echo "❌ Error: Phase A test file not found"
    echo "Expected: __tests__/e2e/phase-a-basic.spec.ts"
    exit 1
fi

echo "📋 Running fixed Phase A tests..."
echo "⏱️  Expected time: 1-2 minutes"
echo "🎯 Testing: Homepage, Dashboard, Categories, Voice RFQ, Login"
echo ""

# Start the development server in background if not running
echo "🔧 Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Run Phase A tests
echo "🧪 Executing Phase A tests..."
npx playwright test __tests__/e2e/phase-a-basic.spec.ts --headed

# Capture exit code
TEST_EXIT_CODE=$?

# Stop the development server
kill $SERVER_PID 2>/dev/null

# Report results
echo ""
echo "📊 PHASE A TEST RESULTS:"
echo "========================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ SUCCESS: All 5 tests passed!"
    echo "🎯 Bell24H core platform validated"
    echo "🚀 Ready for Phase B (AI Features)"
    echo ""
    echo "📈 Next Steps:"
    echo "1. Run Phase B: AI features testing"
    echo "2. Run Phase C: Analytics dashboard testing"
    echo "3. Run Phase D: Business features testing"
    echo "4. Run Phase E: Performance & security testing"
    echo "5. Generate reports with Phase F"
else
    echo "❌ FAILURE: Some tests failed"
    echo "🔍 Check the errors above"
    echo "💡 Common issues:"
    echo "   - Server not running on localhost:3000"
    echo "   - Missing dependencies (run: npm install)"
    echo "   - Page paths incorrect"
    echo ""
    echo "🛠️  Troubleshooting:"
    echo "1. Ensure Bell24H server is running"
    echo "2. Check all dependencies are installed"
    echo "3. Verify page routes are correct"
    echo "4. Run: npm install && npx playwright install"
fi

echo ""
echo "📁 Test results saved to: test-results/playwright-report/"
echo "📄 Detailed report: test-results/playwright-results.json" 