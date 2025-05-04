# Bell24h External API Implementation Guide

## Overview

Bell24h integrates with several external financial APIs to provide comprehensive trading and financial services. This document details the implementation approach, architecture, and integration patterns.

## External APIs

The platform integrates with the following external APIs:

1. **FSAT (Financial Services API for Trade)**
   - Core trading API for financial services
   - Features: Order management, Account balances, Transaction history
   - Authentication: API Key + Secret

2. **Kotak Securities**
   - Stock market data and trading operations
   - Features: Market data, Order placement, Portfolio management
   - Authentication: API Key + Secret 

3. **KredX**
   - Invoice discounting and vendor management
   - Features: Invoice submission, Financing requests, Vendor analytics
   - Authentication: API Key + Secret

4. **RazorpayX**
   - Payment processing and banking operations
   - Features: Fund transfers, Account management, Payout processing
   - Authentication: API Key + Secret

## Architecture

### Client Pattern

All external API clients follow a consistent pattern:

```javascript
class ExternalApiClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 30000;
  }

  async request(method, endpoint, data = null, headers = {}) {
    // Implementation with authentication, error handling, etc.
  }

  // API-specific methods
  async getResource() {...}
  async createResource() {...}
}
```

### Integration Points

The external API integration connects with the Bell24h codebase at several points:

1. **API Routes** - Express routes that expose external API functionality
2. **Service Layer** - Business logic that orchestrates API calls
3. **UI Components** - React components that display and interact with API data

### Authentication & Security

All API clients implement robust security measures:

- API keys and secrets stored in environment variables
- HTTPS for all API communications
- Rate limiting to prevent abuse
- Request signing for APIs that require it

## Implementation

### Base API Client

The base client implements common functionality:

```javascript
export class BaseApiClient {
  constructor(config) {
    this.validateConfig(config);
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bell24h/1.0'
      }
    });
    
    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(
      this.requestInterceptor.bind(this)
    );
    
    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      response => response,
      this.errorInterceptor.bind(this)
    );
  }
  
  validateConfig(config) {
    const requiredFields = ['apiKey', 'apiSecret', 'baseUrl'];
    requiredFields.forEach(field => {
      if (!config[field]) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    });
  }
  
  requestInterceptor(config) {
    // Add authentication headers
    // Implementation varies by API
    return config;
  }
  
  errorInterceptor(error) {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      error.apiMessage = error.response.data?.message || 'Unknown API error';
      error.statusCode = error.response.status;
    } else if (error.request) {
      // Request made but no response received
      error.apiMessage = 'No response from server';
    } else {
      // Request setup error
      error.apiMessage = 'Request configuration error';
    }
    
    // Log error for monitoring
    console.error(`API Error: ${error.apiMessage}`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.statusCode
    });
    
    return Promise.reject(error);
  }
  
  // Common HTTP methods
  async get(endpoint, params = {}, headers = {}) {
    return this.httpClient.get(endpoint, { params, headers });
  }
  
  async post(endpoint, data = {}, headers = {}) {
    return this.httpClient.post(endpoint, data, { headers });
  }
  
  async put(endpoint, data = {}, headers = {}) {
    return this.httpClient.put(endpoint, data, { headers });
  }
  
  async delete(endpoint, params = {}, headers = {}) {
    return this.httpClient.delete(endpoint, { params, headers });
  }
  
  // Utility methods
  generateSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
  
  generateNonce() {
    return Date.now().toString();
  }
}
```

### FSAT API Client Implementation

```javascript
export class FsatApiClient extends BaseApiClient {
  constructor(config) {
    super({
      apiKey: config.apiKey || process.env.FSAT_API_KEY,
      apiSecret: config.apiSecret || process.env.FSAT_API_SECRET,
      baseUrl: config.baseUrl || process.env.FSAT_BASE_URL || 'https://api.fsat.com/v1'
    });
  }
  
  requestInterceptor(config) {
    const timestamp = Date.now();
    const nonce = this.generateNonce();
    
    // Create signature
    const payload = `${timestamp}${nonce}${config.method}${config.url}`;
    const signature = this.generateSignature(payload, this.config.apiSecret);
    
    // Set headers
    config.headers['X-FSAT-API-Key'] = this.config.apiKey;
    config.headers['X-FSAT-Timestamp'] = timestamp;
    config.headers['X-FSAT-Nonce'] = nonce;
    config.headers['X-FSAT-Signature'] = signature;
    
    return config;
  }
  
  // API methods
  async getServices() {
    const response = await this.get('/services');
    return response.data;
  }
  
  async getOrders(status = null) {
    const params = status ? { status } : {};
    const response = await this.get('/orders', params);
    return response.data;
  }
  
  async createOrder(orderData) {
    const response = await this.post('/orders', orderData);
    return response.data;
  }
  
  async getOrder(orderId) {
    const response = await this.get(`/orders/${orderId}`);
    return response.data;
  }
  
  async cancelOrder(orderId) {
    const response = await this.delete(`/orders/${orderId}`);
    return response.data;
  }
  
  async getAccountBalance() {
    const response = await this.get('/account/balance');
    return response.data;
  }
}
```

### Express Routes Integration

```javascript
// Routes integration
import express from 'express';
import { FsatApiClient } from './api-clients/fsat-client.js';
import { KotakSecuritiesClient } from './api-clients/kotak-client.js';
import { KredXClient } from './api-clients/kredx-client.js';
import { RazorpayXClient } from './api-clients/razorpayx-client.js';

const router = express.Router();

// Initialize API clients
const fsatClient = new FsatApiClient({});
const kotakClient = new KotakSecuritiesClient({});
const kredxClient = new KredXClient({});
const razorpayxClient = new RazorpayXClient({});

// FSAT routes
router.get('/fsat/services', async (req, res) => {
  try {
    const services = await fsatClient.getServices();
    res.json({
      status: 'success',
      data: services
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.apiMessage || 'Failed to fetch FSAT services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/fsat/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await fsatClient.getOrders(status);
    res.json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.apiMessage || 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kotak Securities routes
router.get('/kotak/market-data', async (req, res) => {
  try {
    const { symbol } = req.query;
    const marketData = await kotakClient.getMarketData(symbol);
    res.json({
      status: 'success',
      data: marketData
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.apiMessage || 'Failed to fetch market data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Status endpoint
router.get('/status', async (req, res) => {
  const apiClients = [
    { name: 'FSAT', client: fsatClient },
    { name: 'Kotak Securities', client: kotakClient },
    { name: 'KredX', client: kredxClient },
    { name: 'RazorpayX', client: razorpayxClient }
  ];
  
  const statuses = apiClients.map(({ name, client }) => ({
    name,
    configured: client.isConfigured(),
    endpoints: client.getEndpoints()
  }));
  
  const configuredCount = statuses.filter(s => s.configured).length;
  
  res.json({
    status: 'success',
    message: `${configuredCount} of ${statuses.length} external APIs are configured`,
    apis: statuses
  });
});

export default router;
```

## Frontend Integration

The frontend components follow best practices for React integration:

1. Use React Query for data fetching and caching
2. Implement loading states for all API interactions
3. Handle errors gracefully with user-friendly messages
4. Use TypeScript interfaces for API responses

Example component implementation:

```jsx
function ApiStatus() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['/api/external/status'],
    staleTime: 60000 // 1 minute
  });
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  return (
    <div className="api-status-panel">
      <h3>External API Status</h3>
      <p>{data.message}</p>
      <ul>
        {data.apis.map(api => (
          <li key={api.name} className={api.configured ? 'configured' : 'not-configured'}>
            {api.name}: {api.configured ? 'Connected' : 'Not Connected'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Error Handling Strategy

The API integration implements a comprehensive error handling strategy:

1. **Error Categorization**:
   - Authentication errors
   - Rate limiting errors
   - Server errors
   - Network errors
   - Validation errors

2. **Retry Mechanism**:
   - Automatically retry on network errors and rate limits
   - Exponential backoff strategy
   - Maximum retry limit

3. **Error Reporting**:
   - Structured error logging
   - User-friendly error messages
   - Detailed error information in development mode

4. **Fallback Mechanisms**:
   - Circuit breaker pattern for failing APIs
   - Cache-based fallbacks for critical data
   - Graceful degradation of UI when APIs are unavailable

## Testing Strategy

1. **Unit Tests**:
   - Test each API client method individually
   - Mock HTTP requests using `jest-fetch-mock`
   - Test error handling and retry mechanisms

2. **Integration Tests**:
   - Test API routes with mock clients
   - Test the complete request flow

3. **End-to-End Tests**:
   - Test the complete user journey
   - Use Cypress to simulate user interactions

## Monitoring and Logging

1. **API Call Logging**:
   - Log all API requests and responses
   - Track response times and error rates

2. **Performance Monitoring**:
   - Monitor API call performance
   - Set up alerts for API failures

3. **User Analytics**:
   - Track user interactions with API-related features
   - Identify bottlenecks and improve user experience

## Deployment Considerations

1. **Environment Variables**:
   - Securely store API keys and secrets
   - Use different credentials for each environment

2. **Rate Limiting**:
   - Implement client-side rate limiting
   - Respect API provider rate limits

3. **Caching Strategy**:
   - Cache responses for non-critical data
   - Use stale-while-revalidate pattern

## Next Steps

1. Implement the base API client
2. Create client implementations for each external API
3. Integrate API routes with the Express server
4. Build React components for API data visualization
5. Implement error handling and logging
6. Set up monitoring and alerting
7. Deploy with proper environment configuration