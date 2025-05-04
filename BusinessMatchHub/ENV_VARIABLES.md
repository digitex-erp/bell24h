# Bell24h Environment Variables Guide

This document provides a quick reference for setting up environment variables for Bell24h Marketplace in your production environment.

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://username:password@hostname:5432/bell24h` |
| `SESSION_SECRET` | Secret for session encryption (generate a strong random string) | `b9d86e8f7a3c2d1e0f4b5a6c7d8e9f0` |
| `OPENAI_API_KEY` | API key for OpenAI services | `sk-...` |
| `NODE_ENV` | Application environment | `production` |
| `PORT` | HTTP port (default: 5000) | `5000` |

## Optional Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PERPLEXITY_API_KEY` | API key for Perplexity AI (for industry trends) | `pplx-...` |
| `SENDGRID_API_KEY` | API key for SendGrid email service | `SG....` |
| `LOG_LEVEL` | Logging verbosity | `info` or `debug` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://yourdomain.com` |

## Generating Secure Values

### SESSION_SECRET
Generate a secure random string using one of these methods:

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

**Linux/Mac:**
```bash
openssl rand -hex 32
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32))
```

## Environment File Template

Create a `.env` file in your production environment with this template:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:5432/bell24h

# Security
SESSION_SECRET=your_generated_secure_string_here

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
# PERPLEXITY_API_KEY=your_perplexity_api_key_here
# SENDGRID_API_KEY=your_sendgrid_api_key_here

# Application Configuration
NODE_ENV=production
PORT=5000

# Optional Configuration
# LOG_LEVEL=info
# CORS_ORIGIN=https://yourdomain.com
```

## Platform-Specific Setup

### Railway
Set environment variables through the web dashboard or CLI:
```bash
railway variables set SESSION_SECRET=your_secure_string
railway variables set OPENAI_API_KEY=your_openai_key
# etc.
```

### Render
Navigate to your service's "Environment" tab and add each key-value pair.

### Docker
Update the `docker-compose.yml` environment section or create a `.env` file in the same directory.

### Heroku
```bash
heroku config:set SESSION_SECRET=your_secure_string
heroku config:set OPENAI_API_KEY=your_openai_key
# etc.
```

### AWS Elastic Beanstalk
```bash
eb setenv SESSION_SECRET=your_secure_string OPENAI_API_KEY=your_openai_key
# etc.
```

## Security Best Practices

1. **Never commit environment files** (.env) to version control
2. **Rotate secrets regularly** for enhanced security
3. **Use different secrets** for development, staging, and production
4. **Set appropriate access controls** for environment variable management
5. **Audit environment variable access** in your deployment platform

## Troubleshooting

If your application isn't connecting to services correctly, verify:

1. Environment variables are correctly set without typos
2. API keys are valid and not expired
3. Database connection string is correctly formatted
4. Proper access permissions are set for your API keys
5. Network access is allowed between your app and services

For database connection issues, test connectivity with:
```bash
pg_isready -h hostname -p port -U username
```