# Bell24h Application Preview & Deployment Guide

This guide explains how to preview the Bell24h application in the development environment and how to prepare it for deployment.

## 🔍 Preview Mode

Preview mode allows you to see the application running in a local development environment without requiring external API keys or services.

### Starting Preview Mode

To start the application in preview mode:

```bash
node preview.js
```

This will:
1. Start the server in compatibility mode on port 5000
2. Use internal fallbacks for services that require API keys
3. Allow you to view the application UI and basic functionality

### Viewing the Application

After starting preview mode:
1. Click the "Webview" button in Replit
2. Or navigate to the preview URL displayed in the console

## 🚀 Deployment Preparation

Before deploying the Bell24h application, ensure that it's properly configured for production use.

### Prerequisites

The following environment variables are required for deployment:
- `DATABASE_URL`: Connection string for your PostgreSQL database
- `OPENAI_API_KEY`: API key for OpenAI services (fallback for Perplexity)
- `PERPLEXITY_API_KEY` (optional): API key for Perplexity AI services

### Preparing for Deployment

Run the deployment preparation script:

```bash
node prepare-deploy.js
```

This script will:
1. Verify that all required configuration files exist
2. Check for required environment variables
3. Validate module compatibility
4. Provide a final deployment readiness report

### Module Compatibility

The application uses a hybrid ESM/CommonJS approach. The updated `tsconfig.json` ensures compatibility with modern module systems.

Key settings:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

## 📋 Deployment Options

### Replit Deployment

1. Click the "Deploy" button in the Replit interface
2. Follow the prompts to configure your deployment

### External Platform Deployment

#### Vercel
1. Connect your GitHub repository
2. Set the required environment variables
3. Use the following build command:
   ```
   npm run build
   ```
4. Set the output directory to `dist`

#### Render
1. Create a new Web Service
2. Point to your repository
3. Set the start command:
   ```
   node server/index.compat.js
   ```
4. Configure environment variables

#### AWS Elastic Beanstalk
1. Create a new application
2. Upload a ZIP of your repository
3. Configure environment properties
4. Set the Node version to 18 or higher

## 🛠️ Troubleshooting

### Common Issues

#### Module Resolution Problems

**Issue**: `Error [ERR_MODULE_NOT_FOUND]` or `Error [ERR_REQUIRE_ESM]`  
**Solution**: The application can run in compatibility mode via `server/index.compat.js`

#### API Key Issues

**Issue**: Features not working due to missing API keys  
**Solution**: Configure the required environment variables

## 🔒 Security Considerations

- Never commit API keys or sensitive credentials to your repository
- Use environment variables or secrets management for all sensitive data
- Ensure your database connection uses TLS/SSL encryption