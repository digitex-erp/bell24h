const BaseApiClient = require('./base-client');
const crypto = require('crypto');

/**
 * Kotak Securities API client
 */
class KotakSecuritiesClient extends BaseApiClient {
  /**
   * Constructor for the Kotak Securities API client
   * 
   * @param {string} apiKey - The API key for Kotak Securities
   * @param {string} apiSecret - The API secret for Kotak Securities
   */
  constructor(apiKey, apiSecret) {
    // Initialize the base client with the Kotak Securities API base URL
    super('https://tradeapi.kotaksecurities.com/apim/v1');
    
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    // Set up authorization header with API key
    this.headers['X-API-KEY'] = this.apiKey;
  }
  
  /**
   * Generate signature for Kotak Securities API
   * 
   * @param {string} method - The HTTP method for the request
   * @param {string} endpoint - The endpoint for the request
   * @param {string} timestamp - The timestamp for the request
   * @param {Object} data - Optional data to include in the signature
   * @returns {string} - The generated signature
   * @private
   */
  _generateSignature(method, endpoint, timestamp, data = null) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    let payload = `${method.toUpperCase()}${path}${timestamp}`;
    
    if (data && Object.keys(data).length > 0) {
      payload += JSON.stringify(data);
    }
    
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');
  }
  
  /**
   * Make a request to the Kotak Securities API with authentication
   * 
   * @param {string} method - The HTTP method for the request
   * @param {string} endpoint - The endpoint for the request
   * @param {Object} data - Data to include in the request body (for POST, PUT, PATCH)
   * @param {Object} queryParams - Query parameters to include in the URL
   * @returns {Promise<Object>} - The response from the API
   * @private
   */
  async _makeAuthenticatedRequest(method, endpoint, data = null, queryParams = {}) {
    const timestamp = new Date().toISOString();
    const signature = this._generateSignature(method, endpoint, timestamp, data);
    
    const customHeaders = {
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    };
    
    switch (method.toUpperCase()) {
      case 'GET':
        return this.get(endpoint, queryParams, customHeaders);
      case 'POST':
        return this.post(endpoint, data || {}, customHeaders);
      case 'PUT':
        return this.put(endpoint, data || {}, customHeaders);
      case 'PATCH':
        return this.patch(endpoint, data || {}, customHeaders);
      case 'DELETE':
        return this.delete(endpoint, customHeaders);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
  
  /**
   * Get market data for a symbol
   * 
   * @param {string} symbol - The symbol to get market data for
   * @returns {Promise<Object>} - Market data for the symbol
   */
  async getMarketData(symbol) {
    return this._makeAuthenticatedRequest('GET', `/market-data/${symbol}`);
  }
  
  /**
   * Get order book
   * 
   * @returns {Promise<Object>} - Order book
   */
  async getOrderBook() {
    return this._makeAuthenticatedRequest('GET', '/orders');
  }
  
  /**
   * Get order details
   * 
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Order details
   */
  async getOrder(orderId) {
    return this._makeAuthenticatedRequest('GET', `/orders/${orderId}`);
  }
  
  /**
   * Place a new order
   * 
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Placed order
   */
  async placeOrder(orderData) {
    return this._makeAuthenticatedRequest('POST', '/orders', orderData);
  }
  
  /**
   * Modify an existing order
   * 
   * @param {string} orderId - The order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} - Modified order
   */
  async modifyOrder(orderId, orderData) {
    return this._makeAuthenticatedRequest('PUT', `/orders/${orderId}`, orderData);
  }
  
  /**
   * Cancel an order
   * 
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Cancelled order
   */
  async cancelOrder(orderId) {
    return this._makeAuthenticatedRequest('DELETE', `/orders/${orderId}`);
  }
  
  /**
   * Get trade book
   * 
   * @returns {Promise<Object>} - Trade book
   */
  async getTradeBook() {
    return this._makeAuthenticatedRequest('GET', '/trades');
  }
  
  /**
   * Get trade details
   * 
   * @param {string} tradeId - The trade ID
   * @returns {Promise<Object>} - Trade details
   */
  async getTrade(tradeId) {
    return this._makeAuthenticatedRequest('GET', `/trades/${tradeId}`);
  }
  
  /**
   * Get positions
   * 
   * @returns {Promise<Object>} - Positions
   */
  async getPositions() {
    return this._makeAuthenticatedRequest('GET', '/positions');
  }
  
  /**
   * Get funds
   * 
   * @returns {Promise<Object>} - Funds
   */
  async getFunds() {
    return this._makeAuthenticatedRequest('GET', '/funds');
  }
  
  /**
   * Get holdings
   * 
   * @returns {Promise<Object>} - Holdings
   */
  async getHoldings() {
    return this._makeAuthenticatedRequest('GET', '/holdings');
  }
  
  /**
   * Get user profile
   * 
   * @returns {Promise<Object>} - User profile
   */
  async getProfile() {
    return this._makeAuthenticatedRequest('GET', '/profile');
  }
  
  /**
   * Get margin required for order
   * 
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Margin required
   */
  async getMarginRequired(orderData) {
    return this._makeAuthenticatedRequest('POST', '/margin-required', orderData);
  }
  
  /**
   * Get order history
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - Order history
   */
  async getOrderHistory(queryParams = {}) {
    return this._makeAuthenticatedRequest('GET', '/order-history', null, queryParams);
  }
  
  /**
   * Get instruments
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - Instruments
   */
  async getInstruments(queryParams = {}) {
    return this._makeAuthenticatedRequest('GET', '/instruments', null, queryParams);
  }
}

module.exports = KotakSecuritiesClient;