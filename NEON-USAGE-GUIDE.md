# Bell24H Neon PostgreSQL Usage Guide

This guide will help you test and use the Neon PostgreSQL integration we've implemented for your Bell24H platform.

## 📋 Table of Contents

1. [Setting Up Your Environment](#setting-up-your-environment)
2. [Testing Supplier Risk Scoring](#testing-supplier-risk-scoring)
3. [Using Neon Branching](#using-neon-branching)
4. [Migrating Analytics Data](#migrating-analytics-data)
5. [Integrating with Frontend](#integrating-with-frontend)
6. [Troubleshooting](#troubleshooting)

## Setting Up Your Environment

### 1. Configure Your `.env` File

Copy the settings from `.env.neon` to your main `.env` file:

```bash
# Copy the template (Linux/macOS)
cp .env.neon .env
# Edit with your actual credentials
nano .env
```

```powershell
# Copy the template (Windows PowerShell)
Copy-Item .env.neon .env
notepad .env
```

> **Recommended Node.js version:** 18.x or 20.x


Required settings:

```
# Neon PostgreSQL Connection String
DATABASE_URL=postgres://your-username:your-password@your-hostname.neon.tech/your-database

# For Neon branching
NEON_API_KEY=your-neon-api-key
NEON_PROJECT_ID=your-neon-project-id
```

### 2. Install Required Dependencies

Make sure you have all required dependencies:

```bash
npm install @neondatabase/serverless pg dotenv
```

## Testing Redis Caching (Optional)
If you enabled caching, ensure Redis is running locally:

```bash
# With Docker
# (Linux/macOS/Windows with Docker Desktop)
docker run -p 6379:6379 redis:7
```
Or use AWS ElastiCache in production.


### 3. Test Your Connection

Run the connection test script:

```bash
node test-neon-connection.js
```

You should see output confirming your connection to Neon PostgreSQL.

---

### 🪟 Windows PowerShell: Neon Scripts

```powershell
# List Neon branches
node .\scripts\neon-branch.js list
# Run analytics migration
node .\scripts\migrate-analytics-to-neon.js
```


## Testing Supplier Risk Scoring

### 1. Start Your Server

Make sure your Bell24H server is running:

```bash
npm run dev
```

### 2. Test the API Endpoint

Use curl or Postman to test the supplier risk endpoint:

```bash
curl http://localhost:3000/api/supplier-risk-neon/123
```

You should receive a JSON response with risk score and explanation data:

```json
{
  "supplierId": 123,
  "riskScore": 0.72,
  "explanation": {
    "shap": {
      "features": [
        {
          "name": "credit_score",
          "value": 720,
          "importance": 0.35,
          "description": "Credit score indicates financial stability"
        },
        // More features...
      ],
      "modelConfidence": 0.85
    },
    "perplexity": {
      "score": 42.5,
      "normalizedScore": 65,
      "category": "Medium",
      "interpretation": "The supplier data has moderate complexity..."
    }
  }
}
```

### 3. Recalculate Risk Score

To recalculate a supplier's risk score:

```bash
curl -X POST http://localhost:3000/api/supplier-risk-neon/123/recalculate
```

## Using Neon Branching

Neon's branching feature lets you create isolated copies of your database for development and testing.

### 1. List Existing Branches

```bash
node scripts/neon-branch.js list
```

### 2. Create a Development Branch

```bash
node scripts/neon-branch.js create dev-testing
```

This will create a new branch and provide you with a connection string:

```
Branch created successfully!
Branch details:
  ID: br-abcd1234
  Name: dev-testing
  Created: 5/12/2025, 9:00:00 AM

Connection information:
  Host: ep-cool-forest-123456.us-east-2.aws.neon.tech
  Connection string: postgres://<username>:<password>@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb
```

### 3. Use the Development Branch

Update your `.env` file with the new connection string for testing:

```
# Development branch
DEV_DATABASE_URL=postgres://your-username:your-password@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb
```

### 4. Delete a Branch When Done

```bash
node scripts/neon-branch.js delete dev-testing
```

## Migrating Analytics Data

### 1. Configure Source and Target Databases

In your `.env` file:

```
# For analytics migration
SOURCE_DATABASE_URL=postgres://source-username:source-password@source-host/source-database
NEON_DATABASE_URL=postgres://your-username:your-password@your-hostname.neon.tech/your-database
```

### 2. Run the Migration Script

```bash
node scripts/migrate-analytics-to-neon.js
```

This will ensure your schema is up to date:

```bash
npm run db:migrate
```

The script will:
1. Test connections to both databases
2. List analytics tables to migrate
3. Ask for confirmation
4. Migrate schema and data
5. Show progress and completion status

### 3. Verify Migration

Check that your data was migrated correctly:

```bash
# Start the standalone Neon server
node neon-server.js

# Then visit:
# http://localhost:3001/tables
# http://localhost:3001/tables/analytics_metrics
```

## Integrating with Frontend

### 1. Using the Supplier Risk Component

Add the `SupplierRiskExplanation` component to your supplier detail page:

```tsx
import SupplierRiskExplanation from '../components/SupplierRiskExplanation';

// In your component:
<SupplierRiskExplanation supplierId={123} />
```

### 2. Fetching Risk Data Directly

```javascript
// In your component or service
const fetchSupplierRisk = async (supplierId) => {
  const response = await fetch(`/api/supplier-risk-neon/${supplierId}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
};
```

## Troubleshooting

### Connection Issues

If you're having trouble connecting to Neon:

1. Check your connection string format:
   ```
   postgres://username:password@hostname.neon.tech/database
   ```

2. Verify IP allowlist settings in Neon dashboard

3. Test connection with a simple query:
   ```javascript
   const { neon } = require('@neondatabase/serverless');
   const sql = neon(process.env.DATABASE_URL);
   sql`SELECT 1`.then(console.log).catch(console.error);
   ```

### API Errors

If the supplier risk API returns errors:

1. Check server logs for detailed error messages
2. Verify that all required tables exist in your Neon database
3. Make sure authentication middleware is properly configured

### Performance Optimization

For better performance:

1. Enable connection pooling in Neon dashboard
2. Use the serverless driver for edge functions
3. Use the traditional pool for server environments
4. Add proper indexes to frequently queried columns

---

## Next Steps

- Implement database schema migrations for Neon
- Add monitoring and logging for database performance
- Set up periodic sync for analytics data
- Expand the supplier risk model with more features

For more information, refer to the [Neon Documentation](https://neon.tech/docs) and the [Node.js Serverless Driver](https://github.com/neondatabase/serverless) documentation.
