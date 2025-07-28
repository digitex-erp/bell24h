# Bell24H Dashboard - Testing Strategy

## 🧪 Test Coverage Checklist & Expansion (2025-05-26)

All critical APIs and user flows must have:
- [x] **API Contract Tests** (see `server/__tests__/api-contracts/`)
- [x] **Integration Tests** (see `server/__tests__/integration/`, `tests/integration/`)
- [x] **E2E Tests** (see `tests/e2e/`, `e2e/`, Playwright/Cypress suites)
- [x] **Performance/Load Tests** (see `tests/performance/`, `tests/load/`)
- [x] **Cross-browser/Visual Regression Tests** (see `docs/cross-browser-testing.md`, Playwright configs)

> For test expansion, copy templates from `server/__tests__/api-contracts/api-contract-template.test.ts` or `tests/e2e/` as needed. See `docs/milestone-contract-testing-guide.md` for best practices.

## 1. Unit Testing

### Client-Side Components
- Test individual React components in isolation
- Test custom hooks and utility functions
- Mock external dependencies

### Server-Side
- Test API routes and middleware
- Test service layer functions
- Test database operations

## 2. Integration Testing

### Component Integration
- Test component compositions
- Test state management
- Test routing and navigation

### API Integration
- Test API endpoints with mocked services
- Test authentication flows
- Test error handling

## 3. End-to-End Testing

### Critical User Flows
- User authentication
- Dashboard navigation
- Data submission and validation
- Real-time updates

## 4. Performance Testing
- Component rendering performance
- API response times
- Real-time update performance

## 5. Security Testing
- Authentication and authorization
- Input validation
- XSS and CSRF protection

## Test Directory Structure

```
tests/
  ├── unit/
  │   ├── components/
  │   ├── hooks/
  │   └── utils/
  ├── integration/
  │   ├── components/
  │   └── api/
  └── e2e/
      ├── auth/
      └── dashboard/
```

## Test Coverage Goals
- 80%+ statement coverage
- 80%+ branch coverage
- 90%+ function coverage
- 80%+ line coverage

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### E2E Tests
```bash
# Run end-to-end tests
npm run test:e2e
```

## Continuous Integration
- Run tests on every push/PR
- Enforce code coverage thresholds
- Run security scans
- Performance budget checks
