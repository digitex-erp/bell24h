# Bell24h CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the Bell24h project.

## Overview

The Bell24h project uses GitHub Actions for automating the build, test, and deployment processes. The following workflows are configured:

1. **CI (Continuous Integration)** - Runs on pull requests and pushes to main, performing linting, type checking, and tests.
2. **CD (Continuous Deployment)** - Automatically deploys to production when changes are pushed to the main branch.
3. **Pull Request** - Validates pull requests and creates a preview deployment.
4. **Security** - Performs security scanning and vulnerability checks.

## Workflow Details

### CI Workflow (`ci.yml`)

This workflow is triggered on pushes to the main branch and on pull requests. It performs the following jobs:

- **Lint**: Runs ESLint to check code quality.
- **TypeScript Check**: Verifies TypeScript type correctness.
- **Test**: Runs the test suite with a PostgreSQL database service.

### CD Workflow (`cd.yml`)

This workflow is triggered on pushes to the main branch and can also be manually triggered. It performs the following job:

- **Deploy**: Builds the application, runs database migrations, and deploys to Render. It also sends notifications about the deployment status.

### Pull Request Workflow (`pull-request.yml`)

This workflow is triggered on pull request events (opened, synchronize, reopened) and performs the following jobs:

- **Validate**: Runs code quality checks and tests.
- **Preview**: Deploys a preview environment for testing the changes before merging.

### Security Workflow (`security.yml`)

This workflow is triggered on pushes to main, pull requests, and runs weekly. It performs the following security checks:

- **npm audit**: Checks for known vulnerabilities in dependencies.
- **CodeQL Analysis**: Performs static analysis to find security issues.
- **TruffleHog**: Scans for leaked secrets.
- **Snyk**: Checks dependencies for vulnerabilities.

## Required Secrets

The following secrets need to be configured in the GitHub repository for the workflows to function correctly:

- `DATABASE_URL`: PostgreSQL connection string for production
- `VITE_API_URL`: API URL for the production environment
- `VITE_API_URL_STAGING`: API URL for the staging environment
- `RENDER_SERVICE_ID`: Service ID for the Render production app
- `RENDER_PREVIEW_SERVICE_ID`: Service ID for the Render preview app
- `RENDER_API_KEY`: API key for Render
- `DISCORD_WEBHOOK`: Discord webhook URL for notifications
- `SNYK_TOKEN`: API token for Snyk vulnerability scanning

## Local Development

To simulate these workflows locally before pushing, you can use [act](https://github.com/nektos/act), a tool for running GitHub Actions locally:

```bash
# Install act (macOS with Homebrew)
brew install act

# Run the CI workflow
act -j lint
act -j typecheck
act -j test

# Run the security workflow
act -j security
```

## Deployment Process

1. Push changes to a feature branch
2. Create a pull request to main
3. The Pull Request workflow will run validation and create a preview deployment
4. After review and approval, merge the PR to main
5. The CD workflow will automatically deploy to production

## Troubleshooting

- **Failing Tests**: Check the CI workflow logs for details on which tests are failing.
- **Deployment Issues**: Check the CD workflow logs for deployment errors.
- **Security Alerts**: Review the security workflow logs for detected vulnerabilities.

For any questions or issues with the CI/CD setup, please contact the DevOps team.