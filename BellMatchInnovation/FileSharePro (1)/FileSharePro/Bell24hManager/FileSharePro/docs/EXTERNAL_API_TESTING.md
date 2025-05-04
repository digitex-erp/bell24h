# Bell24h External API Testing Guide

This document provides information on testing the external API integrations in Bell24h.

## Overview

Bell24h integrates with several external financial APIs. This guide will help you test these integrations to ensure they're working correctly.

## Prerequisites

Before testing, ensure you have:

1. Set up the required environment variables for each API:
   - FSAT API: `FSAT_API_KEY`, `FSAT_API_SECRET`, `FSAT_BASE_URL`
   - Kotak Securities: `KOTAK_SECURITIES_API_KEY`, `KOTAK_SECURITIES_API_SECRET`
   - KredX: `KREDX_API_KEY`, `KREDX_API_SECRET`
   - RazorpayX: `RAZORPAYX_API_KEY`, `RAZORPAYX_API_SECRET`

2. Ensured network connectivity to the API endpoints

## Test Scripts

We've created several test scripts to help you verify the API integrations:

### 1. Standalone API Server

For development and testing, you can use the standalone API server:

```bash
# Start the standalone server
node external-api-server.js
```

This server runs on port 3030 and provides mock implementations of all the external API endpoints.

### 2. API Integration Tests

You can run the integration tests to verify the API functionality:

```bash
# Run API integration tests
node test-external-apis.js
```

This script tests all API endpoints and reports on their status.

## Testing Process

### 1. Environment Setup

First, check if your environment variables are properly set:

```bash
# Run the environment check script
node check-api-keys.js
```

This will show which APIs are properly configured.

### 2. Manual Testing

You can manually test each API endpoint using the following steps:

#### FSAT API

1. Test Services Endpoint:
   ```bash
   curl http://localhost:3030/api/fsat/services
   ```

2. Test Orders Endpoint:
   ```bash
   curl http://localhost:3030/api/fsat/orders
   ```

#### Kotak Securities API

1. Test Market Data:
   ```bash
   curl http://localhost:3030/api/kotak/market-data
   ```

2. Test Order Placement:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"symbol":"TATASTEEL","quantity":10,"price":1000,"type":"buy"}' \
     http://localhost:3030/api/kotak/orders
   ```

### 3. UI Testing

You can test the API integrations through the UI components:

1. Visit the API Dashboard:
   ```
   http://localhost:5000/api-dashboard
   ```

2. Check the API Status panel to see which APIs are configured

3. Interact with the Trading Widget and FSAT Dashboard to test functionality

## Troubleshooting

If you encounter issues during testing:

### API Connection Issues

1. Verify environment variables are correctly set
2. Check network connectivity to API endpoints
3. Verify API credentials are valid and not expired
4. Check if the API provider is experiencing downtime

### Authentication Errors

1. Ensure API keys and secrets are correct
2. Check if your API access has proper permissions
3. Verify your account with the API provider is in good standing

### Response Format Issues

1. Check the API version you're using
2. Verify the expected response format hasn't changed
3. Update client code if the API contract has changed

## Mock Mode

During development or when API credentials aren't available, you can use the mock mode:

```bash
# Enable mock mode
export BELL24H_API_MOCK_MODE=true

# Start the server
node external-api-server.js
```

In mock mode, the system will return realistic but fictional data instead of making actual API calls.

## Production Testing

Before deploying to production:

1. Test with production API credentials
2. Verify rate limits are correctly implemented
3. Test error handling and fallback mechanisms
4. Perform load testing to ensure the system can handle expected traffic

## Monitoring

After deployment, monitor API integrations using:

1. API success/failure rate
2. API response times
3. Error logs
4. User feedback

## Report Issues

If you encounter any issues with the API integrations, please report them with:

1. API name and endpoint
2. Request data (with sensitive information redacted)
3. Error message or unexpected behavior
4. Steps to reproduce the issue