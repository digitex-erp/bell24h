# Bell24H E2E Test Runner
# This script runs comprehensive E2E tests for the Bell24H marketplace

Write-Host "🚀 Starting Bell24H E2E Test Suite..." -ForegroundColor Green

# Check if Playwright is installed
Write-Host "📋 Checking Playwright installation..." -ForegroundColor Yellow
$playwrightInstalled = npm list @playwright/test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Playwright not found. Installing..." -ForegroundColor Red
    npm install --save-dev @playwright/test
    npx playwright install
}

# Create test results directory
Write-Host "📁 Creating test results directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "test-results" -Force | Out-Null

# Run tests with different configurations
Write-Host "🧪 Running E2E tests..." -ForegroundColor Green

# Run all tests
Write-Host "📊 Running all E2E tests..." -ForegroundColor Cyan
npx playwright test --reporter=html,json,junit

# Run specific test suites
Write-Host "🔐 Running Authentication tests..." -ForegroundColor Cyan
npx playwright test tests/e2e/auth.spec.ts --reporter=list

Write-Host "📋 Running RFQ Workflow tests..." -ForegroundColor Cyan
npx playwright test tests/e2e/rfq-workflow.spec.ts --reporter=list

Write-Host "💳 Running Payment Flow tests..." -ForegroundColor Cyan
npx playwright test tests/e2e/payment-flow.spec.ts --reporter=list

Write-Host "👨‍💼 Running Admin Dashboard tests..." -ForegroundColor Cyan
npx playwright test tests/e2e/admin-dashboard.spec.ts --reporter=list

# Generate comprehensive report
Write-Host "📈 Generating test report..." -ForegroundColor Yellow
npx playwright show-report

Write-Host "✅ E2E Test Suite completed!" -ForegroundColor Green
Write-Host "📊 Check test-results/ directory for detailed reports" -ForegroundColor Cyan 