# Bell24h Marketplace CI/CD Pipelines

This document describes the CI/CD pipelines implemented for the Bell24h Marketplace using GitHub Actions.

## Overview

The CI/CD pipelines are designed to automate the testing, validation, security scanning, and deployment processes for the Bell24h Marketplace application. The pipelines are implemented using GitHub Actions and are triggered on various events such as push to main branch, pull request creation/updates, and manual triggers.

## Pipeline Structure

The CI/CD pipelines consist of the following workflows:

### 1. CI Testing (`ci.yml`)

This workflow is responsible for running linting and tests whenever code is pushed to the main branch or a pull request is created/updated.

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch
- Manual trigger via workflow_dispatch

**Jobs:**
- **Lint**: Runs ESLint to check code quality and style
- **Test**: Sets up a PostgreSQL database and runs unit and integration tests

### 2. CD Deployment (`cd.yml`)

This workflow handles the deployment of the application to staging and production environments.

**Triggers:**
- Push to `main` branch
- Manual trigger via workflow_dispatch

**Jobs:**
- **Deploy to Staging**: Builds and deploys the application to the staging environment
- **Deploy to Production**: After successful deployment to staging, deploys to production

### 3. PR Validation (`pr-validation.yml`)

This workflow validates pull requests by running additional checks beyond the basic CI tests.

**Triggers:**
- Pull request to `main` branch
- Manual trigger via workflow_dispatch

**Jobs:**
- **Validate PR**: Runs linting, type checking, and tests
- **Size Analysis**: Analyzes the bundle size to prevent unexpected increases
- **UI Validation**: Runs visual regression tests using Playwright

### 4. Security Scanning (`security-scan.yml`)

This workflow performs various security scans to identify vulnerabilities in dependencies, code, and container images.

**Triggers:**
- Push to `main` branch
- Pull request to `main` branch
- Weekly schedule (Sundays at midnight)
- Manual trigger via workflow_dispatch

**Jobs:**
- **Dependency Scan**: Runs npm audit and Snyk to check for vulnerabilities in dependencies
- **Code Scan**: Runs ESLint security plugin and GitHub CodeQL analysis
- **Secrets Scan**: Uses Gitleaks to scan for secrets accidentally committed to the repository
- **Container Scan**: Builds a Docker image and scans it with Trivy for vulnerabilities

## Required Secrets

The following secrets need to be configured in GitHub repository settings:

### For Deployment
- `DATABASE_URL`: Connection string for the database (different for staging and production)
- `VERCEL_TOKEN`: Vercel API token for deployments
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### For Security Scanning
- `SNYK_TOKEN`: API token for Snyk vulnerability scanning

## Environment Configuration

The deployment workflow uses GitHub Environments to separate staging and production deployments:

- **Staging**: First deployment target, used for verification before production
- **Production**: Final deployment target, accessible to end users

## Adding New Tests or Checks

When adding new tests or checks to the CI/CD pipelines:

1. Determine which workflow is most appropriate for the new check
2. Add the necessary steps to the workflow file
3. Test the changes by triggering the workflow manually
4. Monitor the workflow runs to ensure the new check is functioning correctly

## Troubleshooting

If a workflow fails, check the GitHub Actions logs for details. Common issues include:

- **Linting errors**: Fix code style issues indicated in the logs
- **Test failures**: Debug failing tests locally before pushing changes
- **Deployment failures**: Check environment configuration and credentials
- **Security scan alerts**: Review identified vulnerabilities and address critical issues