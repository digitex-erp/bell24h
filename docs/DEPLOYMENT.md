# Bell24H Deployment Guide

---
## 🚀 AWS Mumbai Production Deployment (2025-06-01 Update)

This section describes the recommended process for deploying Bell24H.com to AWS Mumbai using the robust deployment script and monitoring best practices.

### 1. Prepare Environment Variables
- Copy `.env.production.template` to `.env.production` and fill in all required secure values.
- Ensure all AWS, monitoring, and integration keys are present.

### 2. Run the Deployment Script
- From the project root, execute:
  ```bash
  node deployment/deploy-aws-mumbai.js
  ```
- The script will:
  - Check environment variables
  - Install dependencies
  - Build the application
  - Run database migrations
  - Set up SSL/TLS
  - Set up CloudWatch and APM/monitoring
  - Deploy to AWS
  - Rotate credentials and verify integrations
  - Log all steps to `logs/deployment.log`

### 3. Post-Deployment Checklist
- [ ] Complete Monitoring & Alerting Verification Checklist (see SECURITY.md)
- [ ] Verify `/api/health` endpoint returns 200
- [ ] Confirm WebSocket server is accepting connections
- [ ] Check CloudWatch and APM dashboards (New Relic, Datadog, or Sentry)
- [ ] Confirm all integrations (payments, blockchain, logistics) are working
- [ ] Review deployment logs for errors/warnings
- [ ] Test credential rotation and alerting

For troubleshooting and rollback, see the main guide below.
---


This guide provides detailed instructions for deploying the Bell24H platform in different environments.

## Prerequisites

- Node.js v20.x or later
- PostgreSQL 15 or later
- PowerShell 7.0+ (for Windows) or Bash (for Unix systems)

## Deployment Options

Bell24H supports multiple deployment scenarios:

### 1. Local Deployment (Windows)

```powershell
# Run the deployment script
.\scripts\deploy.ps1 -Environment "staging" -RunMigrations -BuildFrontend
```

### 2. CI/CD Pipeline Deployment (GitHub Actions)

Our repository is configured with GitHub Actions workflows that automatically deploy to:
- Staging environment when code is pushed to the `develop` branch
- Production environment when code is pushed to the `main` branch

See `.github/workflows/main.yml` for details.

### 3. Manual Cloud Deployment

#### Vercel

1. Set up environment variables in the Vercel dashboard
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Database Migrations

Database migrations are run automatically during deployment, but can also be run manually:

```bash
# For development
npm run db:migrate

# For specific environments
NODE_ENV=production npm run db:migrate
```

## Environment Configuration

Copy the appropriate template file for your environment:

```bash
# For local development
cp .env.example .env

# For staging
cp .env.staging .env

# For production, a separate secure process should be used
# to provision the production environment variables
```

Make sure to fill in all required environment variables as specified in the template.

## Secrets Management

For production deployments, secrets must be managed securely:

1. **Never** commit secrets to version control
2. Use your cloud provider's secrets management system
3. Rotate secrets regularly
4. Use different secrets for each environment

## WebSocket Server Configuration

The WebSocket server requires specific environment variables:

- `WS_PORT`: Port for WebSocket server (default: 8080)
- `JWT_SECRET`: Secret for authenticating WebSocket connections

For high-availability environments, consider:
- Setting up a WebSocket connection pool
- Configuring auto-reconnection logic
- Implementing proper error handling and logging

## Video Feature Deployment

The video upload and analytics features require Cloudinary configuration:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Make sure these variables are correctly set for features like Video RFQ and Product Showcase to work properly.

## Post-Deployment Verification

After deployment, verify that:

1. The API server is running (`/api/health` should return 200)
2. WebSocket server is accepting connections
3. Database migrations have been applied correctly
4. All integrations (payments, blockchain, third-party APIs) are functioning

## Rollback Procedure

In case of deployment failure:

1. For Vercel/Railway: Redeploy the previous version
2. For manual deployments: Restore from the latest backup
3. For database issues: Rollback migrations using `npm run db:rollback`

## Troubleshooting

- **Database Connection Issues**: Verify DATABASE_URL and network connectivity
- **WebSocket Connection Failures**: Check WS_PORT and JWT_SECRET configuration
- **API Authentication Problems**: Ensure SESSION_SECRET and JWT_SECRET are set correctly
- **Missing Video Features**: Verify Cloudinary configuration
- **Jest Test Failures**: Check that the jest.config.cjs is properly configured
- **TypeScript Compilation Errors**: Verify tsconfig.json settings

## Next.js Specific Deployment

Since Bell24H uses Next.js for the frontend, there are additional considerations:

1. Ensure `next.config.js` is correctly configured for your environment
2. For API routes, verify that serverless functions are properly set up
3. For image optimization, configure appropriate providers in Next.js config
4. Consider using Next.js ISR (Incremental Static Regeneration) for improved performance

## Monitoring and Analytics

Bell24H includes several monitoring solutions:

1. **Application Performance Monitoring (APM)**:
   - Configure your APM provider (New Relic, Datadog, etc.) using environment variables
   - Ensure proper instrumentation for both frontend and backend

2. **Error Tracking**:
   - Set up Sentry or similar error tracking service
   - Configure notification channels for critical errors

3. **Analytics**:
   - Ensure Google Analytics or preferred analytics service is properly configured
   - Set up custom events for business-critical user actions

## Security Considerations

1. **HTTPS**: Ensure SSL/TLS is properly configured
2. **Content Security Policy**: Review and update CSP headers
3. **Rate Limiting**: Configure for authentication and API endpoints
4. **CORS**: Verify correct configuration for cross-origin requests
5. **Data Validation**: Ensure all inputs are properly validated

For more details, refer to the `SECURITY.md` document.
