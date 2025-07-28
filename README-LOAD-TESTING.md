# Bell24H Load Testing with Neon PostgreSQL Integration

This guide explains how to use the load testing infrastructure for Bell24H with Neon PostgreSQL integration for metrics storage and analysis.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Running Load Tests](#running-load-tests)
4. [Analyzing Results](#analyzing-results)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js v16+ installed
- Artillery.io (`npm install -g artillery`)
- Neon PostgreSQL account (https://neon.tech)
- Bell24H server running locally or in production

## Setup

### 1. Configure Environment Variables

Ensure your `.env` file contains the Neon PostgreSQL connection string:

```
# Neon Database for Load Testing
NEON_DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
```

### 2. Keep Neon Endpoint Active

Neon's serverless model automatically disables endpoints after periods of inactivity. Run the keep-alive script before and during load testing:

```bash
# In a separate terminal
node scripts/keep-neon-active.cjs
```

### 3. Create Required Database Tables

Run the table creation script to set up the necessary tables for storing load test metrics:

```bash
node scripts/create-load-test-tables.cjs
```

This will create:
- `report_responses` - For storing detailed response data
- `test_metrics` - For storing aggregated test metrics

## Running Load Tests

### Basic Load Test

```bash
npx artillery run -e local scripts/artillery-config.yml
```

### Production Load Test

```bash
npx artillery run -e production scripts/artillery-config.yml
```

### Custom Load Test

You can override config parameters:

```bash
npx artillery run --target "http://localhost:3000" --rate 10 scripts/artillery-config.yml
```

## Analyzing Results

### View Test Metrics in Neon

Query the `test_metrics` table to see aggregated results:

```sql
SELECT 
  scenario_id, 
  start_time, 
  duration, 
  response_count, 
  error_count, 
  avg_latency, 
  max_latency, 
  p95_latency
FROM 
  test_metrics
ORDER BY 
  start_time DESC
LIMIT 10;
```

### View Detailed Response Data

Query the `report_responses` table to see detailed response data:

```sql
SELECT 
  message_id, 
  response_data->>'type' as response_type,
  latency, 
  timestamp
FROM 
  report_responses
ORDER BY 
  timestamp DESC
LIMIT 10;
```

### Generate HTML Report

```bash
npx artillery report artillery_report.json
```

## Troubleshooting

### Neon Endpoint Disabled

If you see "Control plane request failed: endpoint is disabled", your Neon endpoint is inactive. Solutions:

1. Run the keep-alive script:
   ```bash
   node scripts/keep-neon-active.cjs
   ```

2. Manually activate the endpoint in Neon console:
   - Visit https://console.neon.tech
   - Navigate to your project
   - Go to the "Branches" tab
   - Find your main branch
   - Click "Activate endpoint"

### Connection Issues

Test your connection:

```bash
node scripts/test-neon-connection.cjs
```

### Artillery Not Found

If Artillery is not found, install it:

```bash
npm install -g artillery
```

## Integration with Bell24H Features

The load testing infrastructure integrates with several Bell24H features:

### Video RFQ and Product Showcase

Tests the video upload and analytics endpoints implemented in:
- `server/api/product-showcases.ts`
- `server/api/video-analytics.ts`

### Analytics Export

Tests the analytics export functionality implemented in:
- `server/api/analytics-export.ts`

### Supplier Risk Scoring

Tests the supplier risk scoring with SHAP/LIME explainability:
- `server/api/supplier-risk-neon.ts`
- `server/services/ai-explainer.ts`

### WebSocket Communication

Tests the WebSocket implementation with connection pooling and batched message handling.
