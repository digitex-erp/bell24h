# Bell24h Marketplace GitHub Workflows

This directory contains the GitHub Actions workflows for the Bell24h Marketplace CI/CD pipelines.

## Workflow Files

- **ci.yml**: Continuous Integration workflow for linting and testing
- **cd.yml**: Continuous Deployment workflow for staging and production
- **pr-validation.yml**: Pull Request validation workflow for additional checks
- **security-scan.yml**: Security scanning workflow for dependency, code, secrets, and container scanning

## Usage

### Running Workflows Manually

All workflows support manual triggering via `workflow_dispatch`. To run a workflow manually:

1. Go to the Actions tab in the GitHub repository
2. Select the workflow you want to run
3. Click the "Run workflow" button
4. Choose the branch and click "Run workflow"

### Monitoring Workflow Runs

To monitor workflow runs:

1. Go to the Actions tab in the GitHub repository
2. Click on the workflow name to see its runs
3. Click on a specific run to see details and logs

## Required Secrets

For these workflows to function properly, you need to configure the following secrets in your GitHub repository settings:

- `DATABASE_URL`: Database connection string (for tests and deployments)
- `VERCEL_TOKEN`: Vercel API token for deployments
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `SNYK_TOKEN`: Snyk API token for security scanning

## Environment Configuration

The deployment workflow uses GitHub Environments:

- **staging**: For staging deployments
- **production**: For production deployments

You can configure environment-specific protections and secrets in the repository settings.

## For More Information

See the full documentation in [docs/ci-cd-pipelines.md](../../docs/ci-cd-pipelines.md) for more details on how these workflows work and how to troubleshoot issues.