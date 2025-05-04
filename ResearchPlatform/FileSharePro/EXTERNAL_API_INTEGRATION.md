# Bell24h External API Integration

This document provides information about the external API integration for Bell24h.

## Overview

Bell24h integrates with several external financial APIs to provide comprehensive trading and financial services:

1. **FSAT (Financial Services API for Trade)** - Core trading API for order management and financial services
2. **Kotak Securities** - Stock market data and trading operations
3. **KredX** - Invoice discounting and vendor management
4. **RazorpayX** - Payment processing and banking operations

## Integration Architecture

The integration follows a modular client-based architecture:

- Each external API has its own client implementation
- Authentication is handled securely using appropriate methods for each API
- All API clients include error handling and retry mechanisms
- Responses are normalized to a consistent format for the application

## Standalone API Server

For testing and development purposes, we've created a standalone external API server:

```
node external-api-server.js
```

This server provides mock implementations of all the external API endpoints, allowing you to develop against them without requiring actual API credentials.

## Required Environment Variables

Each API integration requires specific environment variables:

### FSAT API
- `FSAT_API_KEY`: Your FSAT API key
- `FSAT_API_SECRET`: Your FSAT API secret
- `FSAT_BASE_URL`: Base URL for the FSAT API (typically `https://api.fsat.com/v1/`)

### Kotak Securities API
- `KOTAK_SECURITIES_API_KEY`: Your Kotak Securities API key
- `KOTAK_SECURITIES_API_SECRET`: Your Kotak Securities API secret

### KredX API
- `KREDX_API_KEY`: Your KredX API key
- `KREDX_API_SECRET`: Your KredX API secret

### RazorpayX API
- `RAZORPAYX_API_KEY`: Your RazorpayX API key
- `RAZORPAYX_API_SECRET`: Your RazorpayX API secret

## Testing the Integration

A test script is provided to verify the API integration:

```
node test-external-apis.js
```

This script tests all the API endpoints and validates the responses.

## API Endpoints

The following endpoints are available:

### Health and Status
- `/health` - Server health check
- `/status` - API configuration status

### FSAT API
- `/api/fsat/services` - Available FSAT services
- `/api/fsat/orders` - Order management

### Kotak Securities API
- `/api/kotak/market-data` - Market data feed
- `/api/kotak/orders` - Trading orders

### KredX API
- `/api/kredx/invoices` - Invoice discounting 
- `/api/kredx/vendors` - Vendor management

### RazorpayX API
- `/api/razorpayx/contacts` - Contact management
- `/api/razorpayx/payouts` - Payout operations

## Integration with Main Application

The standalone API server is designed to be integrated with the main Bell24h application. The integration points are:

1. Add the external API configuration to the main server
2. Register the API routes with the main Express application
3. Use the API clients in the appropriate service modules

## Security Considerations

- All API keys and secrets are stored as environment variables
- HTTPS is used for all API communications
- Authentication credentials are never logged or exposed
- Request and response payloads containing sensitive data are encrypted

## Troubleshooting

If you encounter issues with the API integration:

1. Check if all required environment variables are set
2. Verify the API credentials with the provider
3. Examine the server logs for error messages
4. Run the test script to validate the integration
5. Ensure the network connectivity to the API providers