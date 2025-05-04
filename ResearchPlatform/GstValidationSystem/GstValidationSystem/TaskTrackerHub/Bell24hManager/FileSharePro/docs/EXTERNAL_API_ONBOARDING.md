# Bell24h External API Onboarding for Developers

Welcome to the Bell24h external API integration module! This guide will help you understand how to work with our external API integrations.

## Architecture Overview

Bell24h integrates with multiple external financial APIs using a consistent pattern:

1. **API Clients**: Encapsulate the details of each external API
2. **API Routes**: Express routes that expose API functionality
3. **React Components**: UI components that display and interact with API data

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  React UI    │      │  Express     │      │  External    │
│  Components  │<─────┤  API Routes  │<─────┤  API Clients │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Getting Started

### Prerequisites

1. Node.js 16+
2. Access to the Bell24h codebase
3. External API credentials (see below)

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   # Create a .env file with your API credentials
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

## Environment Variables

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

## Development Workflow

### Running the Standalone External API Server

For development, you can use the standalone API server:

```bash
# Start the standalone server
node external-api-server.js
```

This creates a separate server on port 3030 that implements all the external API routes.

### Testing Your Changes

After making changes to the API integration code:

1. Run the API tests:
   ```bash
   node test-external-apis.js
   ```

2. Start the application and check the API Dashboard:
   ```bash
   npm run dev
   ```
   Then visit `http://localhost:5000/api-dashboard`

### Implementing a New API Client

To add a new API integration:

1. Create a new client class in `server/api-clients/`
2. Extend the `BaseApiClient` class
3. Implement the required methods
4. Add routes in `server/external-apis/routes.js`
5. Add UI components to display the API data

Example:

```javascript
// my-api-client.js
import { BaseApiClient } from './base-client.js';

export class MyApiClient extends BaseApiClient {
  constructor(config) {
    super({
      apiKey: config.apiKey || process.env.MY_API_KEY,
      apiSecret: config.apiSecret || process.env.MY_API_SECRET,
      baseUrl: config.baseUrl || process.env.MY_API_BASE_URL
    });
  }
  
  // Implement authentication
  requestInterceptor(config) {
    config.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    return config;
  }
  
  // API methods
  async getResource() {
    const response = await this.get('/resource');
    return response.data;
  }
  
  async createResource(data) {
    const response = await this.post('/resource', data);
    return response.data;
  }
  
  // Implement any required utility methods
  isConfigured() {
    return !!(this.config.apiKey && this.config.apiSecret);
  }
  
  getEndpoints() {
    return ['/api/external/my-api/resource'];
  }
}
```

## Best Practices

### Error Handling

Always handle errors properly:

1. Use try/catch blocks around API calls
2. Return appropriate HTTP status codes
3. Provide meaningful error messages
4. Log errors for debugging

Example:

```javascript
try {
  const data = await apiClient.getResource();
  res.json({
    status: 'success',
    data
  });
} catch (error) {
  console.error('API Error:', error);
  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.apiMessage || 'Failed to fetch resource',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

### Authentication

Never hardcode API credentials:

1. Always use environment variables for credentials
2. Use different credentials for each environment
3. Implement proper request signing when required

### Caching

Implement appropriate caching:

1. Cache responses that don't change frequently
2. Use React Query's caching mechanism on the frontend
3. Implement stale-while-revalidate patterns for better UX

Example:

```javascript
const { data, error, isLoading } = useQuery({
  queryKey: ['/api/external/resource'],
  staleTime: 60000, // 1 minute
  cacheTime: 300000 // 5 minutes
});
```

### Rate Limiting

Respect API rate limits:

1. Implement client-side rate limiting
2. Use exponential backoff for retries
3. Track API usage to avoid exceeding limits

### Security

Follow security best practices:

1. Use HTTPS for all API communications
2. Validate and sanitize all input data
3. Never expose API secrets to clients
4. Implement proper authentication for your own API endpoints

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Check if environment variables are properly set
   - Verify environment variable names match the expected format

2. **API Connection Issues**
   - Verify network connectivity to API endpoints
   - Check if API provider is experiencing downtime

3. **Authentication Errors**
   - Verify API credentials are correct
   - Check if your account has the required permissions

4. **Module Compatibility Issues**
   - Ensure consistent use of CommonJS or ES modules
   - Check import/export syntax

### Debugging Tools

1. **API Status Check**
   - Use the `/api/external/status` endpoint to check API configuration
   - Run `node check-api-keys.js` to verify environment variables

2. **API Test Script**
   - Run `node test-external-apis.js` to test all API endpoints

3. **Logging**
   - Check server logs for API-related errors
   - Use the browser console to debug client-side issues

## Resources

### API Documentation

- [FSAT API Documentation](https://docs.fsat.com)
- [Kotak Securities API Documentation](https://docs.kotaksecurities.com)
- [KredX API Documentation](https://docs.kredx.com)
- [RazorpayX API Documentation](https://docs.razorpayx.com)

### Internal Documentation

- [External API Implementation Guide](./EXTERNAL_API_IMPLEMENTATION.md)
- [External API Testing Guide](./EXTERNAL_API_TESTING.md)

### Support

If you need help with the API integrations, contact:

- Technical Support: dev-support@bell24h.com
- API Access: api-access@bell24h.com