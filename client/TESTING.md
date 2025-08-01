# BELL24H Testing Documentation

Comprehensive testing suite for the BELL24H marketplace platform with E2E, unit, and performance tests.

## 🧪 Testing Overview

### Test Types

- **E2E Tests**: Full user journey testing with Playwright
- **Unit Tests**: Component and utility testing with Jest
- **Performance Tests**: Load time and Core Web Vitals testing
- **Integration Tests**: API and database testing

### Test Coverage

- ✅ Homepage functionality and interactions
- ✅ Dashboard mode switching and features
- ✅ Cross-page navigation flows
- ✅ Performance benchmarks
- ✅ Responsive design testing
- ✅ Accessibility testing
- ✅ Error handling and edge cases

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
npx playwright install
```

### Run All Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:homepage
npm run test:dashboard
npm run test:navigation
npm run test:performance
```

### Run with UI

```bash
# Visual test runner
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## 📋 Test Structure

```
tests/
├── e2e/
│   ├── homepage.spec.ts          # Homepage E2E tests
│   ├── dashboard.spec.ts         # Dashboard E2E tests
│   ├── cross-page-navigation.spec.ts  # Navigation flow tests
│   ├── performance.spec.ts       # Performance benchmarks
│   └── test-utils.ts            # Test utilities and helpers
├── unit/
│   ├── components/              # Component unit tests
│   ├── hooks/                  # Custom hooks tests
│   └── utils/                  # Utility function tests
└── integration/
    ├── api/                    # API endpoint tests
    └── database/               # Database integration tests
```

## 🎯 E2E Test Coverage

### Homepage Tests (`homepage.spec.ts`)

- ✅ Page load and SEO validation
- ✅ Navigation elements and links
- ✅ Hero section with live stats
- ✅ AI-powered search functionality
- ✅ Voice RFQ feature testing
- ✅ Feature toggles and interactions
- ✅ Revenue pipeline section
- ✅ Trust marquee and social proof
- ✅ Mobile responsive design
- ✅ Footer completeness
- ✅ Performance benchmarks
- ✅ Accessibility features
- ✅ Error handling and fallbacks

### Dashboard Tests (`dashboard.spec.ts`)

- ✅ Authentication flow
- ✅ Mode switching (Buying/Selling)
- ✅ Stats display for each mode
- ✅ Quick actions functionality
- ✅ Recent activity section
- ✅ Notifications and alerts
- ✅ Profile and settings access
- ✅ Responsive design testing
- ✅ Performance measurement
- ✅ Data visualization
- ✅ Filtering and sorting
- ✅ Export functionality
- ✅ Search and pagination
- ✅ Keyboard shortcuts
- ✅ Loading states and error handling

### Navigation Tests (`cross-page-navigation.spec.ts`)

- ✅ Complete user journey flow
- ✅ Breadcrumb navigation
- ✅ Navigation consistency
- ✅ Deep linking and direct URL access
- ✅ Browser back/forward navigation
- ✅ External link handling
- ✅ Form navigation and validation
- ✅ Modal and overlay navigation
- ✅ Search functionality across pages
- ✅ Mobile responsive navigation
- ✅ Keyboard navigation accessibility
- ✅ Performance across navigation

### Performance Tests (`performance.spec.ts`)

- ✅ Page load time benchmarks
- ✅ Image loading performance
- ✅ Core Web Vitals (LCP, FID)
- ✅ Bundle size analysis
- ✅ Memory usage monitoring
- ✅ Network performance
- ✅ Caching effectiveness
- ✅ JavaScript execution performance
- ✅ Rendering performance
- ✅ Database query performance
- ✅ Mobile performance
- ✅ Concurrent user performance
- ✅ Error condition performance

## 🧩 Unit Test Coverage

### Components

- ✅ SEO component
- ✅ Error boundary
- ✅ Navigation components
- ✅ Dashboard components
- ✅ Form components
- ✅ Modal components

### Hooks

- ✅ Custom authentication hooks
- ✅ Data fetching hooks
- ✅ State management hooks
- ✅ Performance monitoring hooks

### Utils

- ✅ API utilities
- ✅ Validation functions
- ✅ Formatting utilities
- ✅ Error handling utilities

## 📊 Performance Benchmarks

### Load Time Targets

- **Homepage**: < 5 seconds
- **Marketplace**: < 4 seconds
- **Suppliers**: < 7 seconds
- **Dashboard**: < 4 seconds
- **Login**: < 2 seconds
- **Register**: < 3 seconds

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size

- **Total Bundle**: < 2MB
- **JavaScript**: < 1MB
- **CSS**: < 500KB
- **Images**: Optimized with WebP/AVIF

## 🔧 Test Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
// Multi-browser testing
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari
- Tablet (iPad)

// Features
- Screenshot on failure
- Video recording on failure
- Trace on first retry
- HTML and JSON reports
```

### Jest Configuration (`jest.config.js`)

```javascript
// Unit testing setup
- React Testing Library
- Coverage thresholds (70%)
- TypeScript support
- Next.js integration
- Custom matchers
```

## 🛠️ Test Utilities

### TestHelpers Class

```typescript
// Common test operations
-mockAuth() - // Mock authentication
  waitForPageLoad() - // Wait for page load
  takeScreenshot() - // Capture screenshots
  measurePerformance() - // Measure load times
  waitForElement() - // Wait for elements
  clickAndWait() - // Click with wait
  fillAndWait() - // Fill with wait
  scrollToElement() - // Scroll to element
  mockApiResponse() - // Mock API responses
  simulateSlowNetwork() - // Simulate slow network
  getPerformanceMetrics(); // Get performance data
```

### Test Utils

```typescript
// Global test utilities
-generateTestData() - // Generate test data
  createTestUser() - // Create test user
  loginTestUser() - // Login test user
  delay(); // Async delay
```

## 🎨 Visual Testing

### Screenshot Testing

```bash
# Take screenshots on failure
npm run test:e2e

# View screenshots
open test-results/screenshots/
```

### Visual Regression Testing

```bash
# Compare screenshots
npx playwright test --update-snapshots
```

## 📈 Test Reports

### HTML Reports

```bash
# Generate HTML report
npm run test:e2e:report

# View report
open test-results/playwright-report/index.html
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:unit:coverage

# View coverage
open coverage/lcov-report/index.html
```

## 🔍 Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:e2e:debug
```

### Headed Mode

```bash
# Run tests with visible browser
npm run test:e2e:headed
```

### UI Mode

```bash
# Visual test runner
npm run test:e2e:ui
```

## 🚨 Common Issues

### Test Failures

1. **Element not found**: Check selectors and timing
2. **Network timeouts**: Increase timeout values
3. **Authentication issues**: Verify mock auth setup
4. **Performance failures**: Check load time targets

### Debugging Tips

1. Use `console.log()` in tests
2. Take screenshots on failure
3. Use `--headed` mode to see browser
4. Check test reports for details
5. Verify test data and mocks

## 📝 Writing Tests

### E2E Test Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Unit Test Structure

```typescript
describe('Component Name', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

### Best Practices

1. **Descriptive test names**: Use clear, descriptive names
2. **Single responsibility**: Each test should test one thing
3. **Setup and teardown**: Use beforeEach/afterEach
4. **Wait for elements**: Always wait for elements to be ready
5. **Handle async**: Use proper async/await patterns
6. **Mock external dependencies**: Mock APIs and services
7. **Test edge cases**: Test error conditions and edge cases

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
```

### Test Commands

```bash
# CI test command
npm run test:ci

# Individual test commands
npm run test:unit
npm run test:e2e
npm run test:performance
```

## 📊 Monitoring and Metrics

### Test Metrics

- **Test Coverage**: > 80%
- **Test Execution Time**: < 10 minutes
- **Test Reliability**: > 95% pass rate
- **Performance Benchmarks**: All targets met

### Performance Metrics

- **Page Load Times**: Tracked in CI
- **Core Web Vitals**: Monitored in production
- **Bundle Size**: Tracked in builds
- **Memory Usage**: Monitored in tests

## 🎯 Future Enhancements

### Planned Improvements

1. **Visual regression testing**: Automated screenshot comparison
2. **Accessibility testing**: Automated a11y compliance
3. **Load testing**: High-traffic simulation
4. **Security testing**: Automated security scans
5. **Cross-browser testing**: Extended browser coverage
6. **Mobile testing**: Device-specific testing
7. **API testing**: Comprehensive API test suite

### Test Automation

1. **Scheduled tests**: Daily/weekly test runs
2. **Performance monitoring**: Continuous performance tracking
3. **Alert system**: Test failure notifications
4. **Test data management**: Automated test data setup
5. **Parallel execution**: Faster test execution

---

**Happy Testing! 🧪**

_For questions or issues, check our [testing documentation](https://docs.bell24h.com/testing) or create an issue._
