# CI/CD Integration for Bell24H.com

## Goal
Ensure all tests (unit, integration, E2E, accessibility, performance) run automatically on every push/PR, and that deployments are safe and reliable.

## Recommended Tools
- **GitHub Actions** (or GitLab CI, Bitbucket Pipelines, etc.)
- **npm scripts** for running tests and builds

## Example GitHub Actions Workflow
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

## Next Steps
- Add this workflow file to `.github/workflows/ci.yml`
- Expand with steps for linting, coverage, and deployment as needed
- Monitor CI results and fix failures promptly
