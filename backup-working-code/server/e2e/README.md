# End-to-End (E2E) Tests

This directory contains end-to-end tests for the Bell24H Dashboard application using [Playwright](https://playwright.dev/). The test suite is designed to be maintainable, scalable, and easy to understand.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Utilities](#test-utilities)
- [Writing Tests](#writing-tests)
- [Test Data](#test-data)
- [API Testing](#api-testing)
- [Best Practices](#best-practices)
- [Test Organization](#test-organization)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 16+
- npm 7+ or yarn 1.22+
- Git

## Setup

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Copy the example environment file and update with your configuration:
   ```bash
   cp .env.example .env
   ```

## Running Tests

### Basic Commands

- Run all E2E tests in headless mode:
  ```bash
  npm run test:e2e
  ```

- Run tests in UI mode (interactive):
  ```bash
  npm run test:e2e:ui
  ```

- Run a specific test file:
  ```bash
  npx playwright test tests/example.spec.ts
  ```

- Run tests in debug mode:
  ```bash
  npm run test:e2e:debug
  ```

### Viewing Results

- Open the HTML test report:
  ```bash
  npx playwright show-report
  ```

- View test traces (after a test fails):
  ```bash
  npx playwright show-trace test-results/example-test-trace.zip
  ```

## Test Utilities

The test suite includes several utility modules to make testing easier and more maintainable:

### Assertions (`fixtures/assertions.ts`)
A collection of common assertions that can be used across tests:

```typescript
// Example usage
await assertions.toBeOnPath('/dashboard');
await assertions.toSeeSuccessMessage('RFQ created successfully');
await assertions.toSeeElementWithText('.rfq-list', 'Test Product');
```

### API Helper (`fixtures/api.helper.ts`)
A helper for making API requests during tests:

```typescript
// Example: Create an RFQ via API
const rfqData = await api.createTestRFQ({
  productName: 'Test Product',
  quantity: 10,
  targetPrice: 100
});

// Example: Login and get auth token
const token = await api.login({ email: 'user@example.com', password: 'password' });
```

### Test Data Factory (`fixtures/test-data.factory.ts`)
Generates consistent test data for use in tests:

```typescript
// Create a test RFQ
const rfqData = createRFQ({
  productName: 'Custom Product',
  quantity: 5,
  priority: 'high'
});
```

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '../fixtures/test.fixture';

test.describe('RFQ Management', () => {
  test('should create a new RFQ', async ({ page, api, assertions }) => {
    // Test implementation using our custom fixtures
    await page.goto('/rfqs/new');
    
    // Fill out form using page objects or selectors
    await page.getByLabel('Product Name').fill('Test Product');
    
    // Use assertions
    await assertions.toBeOnPath('/rfqs/new');
    
    // Use API helpers for setup/teardown
    const rfq = await api.createTestRFQ({
      productName: 'API Created RFQ'
    });
  });
});
```

## Test Data

Test data is managed through the `test-data.factory.ts` file, which provides functions to generate consistent test data. This helps keep tests maintainable and ensures data consistency.

### Example Test Data

```typescript
// Default RFQ data
const defaultRFQ = createRFQ();

// Custom RFQ data
const customRFQ = createRFQ({
  productName: 'Custom Product',
  quantity: 15,
  priority: 'high'
});
```

## API Testing

The test suite supports API testing through the `api.helper.ts` module. This allows you to:

1. Make API requests directly from tests
2. Mock API responses
3. Test API endpoints in isolation
4. Set up test data via API

### Example API Test

```typescript
test('should create RFQ via API', async ({ api }) => {
  const response = await api.rfq.create({
    productName: 'API Test',
    quantity: 10,
    targetPrice: 100
  });
  
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.productName).toBe('API Test');
});
```

### Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Use test fixtures for setup/teardown
   - Clean up test data after each test

2. **Selectors**
   - Prefer roles and text content over CSS selectors
   - Use `data-testid` for important elements
   - Avoid XPath selectors when possible

3. **Assertions**
   - Use meaningful assertion messages
   - Prefer specific assertions over generic ones
   - Test for both positive and negative cases

4. **Page Objects**
   - Create page objects for complex pages
   - Keep selectors in page objects
   - Add helper methods for common actions

## Test Organization

```
e2e/
├── fixtures/           # Test fixtures and utilities
├── pages/              # Page object models
├── tests/              # Test files
│   ├── auth/          # Authentication tests
│   ├── dashboard/     # Dashboard tests
│   └── rfqs/          # RFQ management tests
└── test-utils.ts      # Shared test utilities
```

## Debugging

### Debugging Tests

1. Use the Playwright Inspector:
   ```bash
   npx playwright test --debug
   ```

2. Add `await page.pause()` in your test to pause execution:
   ```typescript
   test('example', async ({ page }) => {
     await page.pause();
     // Test continues after resuming in the browser
   });
   ```

3. Take screenshots on failure:
   ```typescript
   test('example', async ({ page }) => {
     try {
       // Test code
     } catch (error) {
       await page.screenshot({ path: 'screenshot.png' });
       throw error;
     }
   });
   ```

## CI/CD Integration

### GitHub Actions

Example workflow (`.github/workflows/e2e.yml`):

```yaml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
```

## Troubleshooting

### Common Issues

1. **Tests are flaky**
   - Add more specific selectors
   - Use `await page.waitForLoadState('networkidle')` after navigation
   - Increase timeouts if needed

2. **Element not found**
   - Verify the element is visible and not in an iframe
   - Check for dynamic content loading
   - Use `page.pause()` to inspect the page state

3. **Tests failing in CI**
   - Ensure all dependencies are installed
   - Check browser versions match between local and CI
   - Add more detailed logging

### Getting Help

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [GitHub Issues](https://github.com/microsoft/playwright/issues)
3. **Waiting**: Use Playwright's auto-waiting mechanisms instead of fixed timeouts
4. **Fixtures**: Use test fixtures for common setup/teardown
5. **Environment**: Use environment variables for configuration (see `.env.test`)

## Debugging

- Use `test.only` to run a single test
- Use `test.slow()` to mark slow tests
- Use `test.fail()` for tests that are expected to fail
- Use `test.fixme()` for tests that need to be fixed
- Add `await page.pause()` to pause test execution

## CI/CD Integration

Tests can be run in CI/CD pipelines. The configuration automatically detects CI environments and adjusts settings accordingly.

## Test Data Management

- Use the `test-utils.ts` file for common test utilities
- Create and clean up test data in `beforeEach`/`afterEach` hooks
- Use unique identifiers (e.g., timestamps) for test data to avoid conflicts

## Visual Testing

Playwright supports visual regression testing. To add visual tests:

1. Take a screenshot of the element or page:
   ```typescript
   await expect(page).toHaveScreenshot('screenshot-name.png');
   ```

2. On the first run, this will generate a reference screenshot
3. On subsequent runs, it will compare against the reference

## Performance Testing

Playwright can measure performance metrics. Example:

```typescript
const metrics = await page.metrics();
console.log('Metrics:', metrics);
```

## Accessibility Testing

Playwright can be used with accessibility testing tools like axe-core. See the `test-utils.ts` file for examples.
