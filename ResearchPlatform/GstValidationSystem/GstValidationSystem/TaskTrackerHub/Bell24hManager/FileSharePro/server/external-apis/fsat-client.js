import { BaseApiClient } from './base-client.js';
import crypto from 'crypto';

/**
 * FSAT API client
 */
export class FSATClient extends BaseApiClient {
  /**
   * Constructor for the FSAT API client
   * 
   * @param {string} apiKey - The API key for FSAT
   * @param {string} apiSecret - The API secret for FSAT
   * @param {string} baseUrl - The base URL for the FSAT API
   */
  constructor(apiKey, apiSecret, baseUrl) {
    // Initialize the base client with the base URL
    super(baseUrl);
    
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  
  /**
   * Get authentication headers for FSAT API
   * 
   * @param {string} method - The HTTP method for the request
   * @param {string} endpoint - The endpoint for the request
   * @param {Object} data - Optional data to include in the signature
   * @returns {Object} - Headers with authentication information
   * @private
   */
  _getAuthHeaders(method, endpoint, data = null) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    let payload = `${method.toUpperCase()}${path}${timestamp}`;
    
    if (data && Object.keys(data).length > 0) {
      payload += JSON.stringify(data);
    }
    
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');
    
    return {
      'X-FSAT-API-KEY': this.apiKey,
      'X-FSAT-TIMESTAMP': timestamp,
      'X-FSAT-SIGNATURE': signature
    };
  }
  
  /**
   * Get available services
   * 
   * @returns {Promise<Object>} - Available services
   */
  async getAvailableServices() {
    const endpoint = '/services';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Get service pricing
   * 
   * @param {string} serviceId - The service ID
   * @returns {Promise<Object>} - Service pricing
   */
  async getServicePricing(serviceId) {
    const endpoint = `/services/${serviceId}/pricing`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Create a service order
   * 
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} - Created order
   */
  async createOrder(orderData) {
    const endpoint = '/orders';
    const authHeaders = this._getAuthHeaders('POST', endpoint, orderData);
    
    return this.post(endpoint, orderData, authHeaders);
  }
  
  /**
   * Get order details
   * 
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Order details
   */
  async getOrder(orderId) {
    const endpoint = `/orders/${orderId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * List orders
   * 
   * @param {Object} filters - Filtering parameters
   * @returns {Promise<Object>} - Orders list
   */
  async listOrders(filters = {}) {
    const endpoint = '/orders';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, filters, authHeaders);
  }
  
  /**
   * Cancel an order
   * 
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Cancellation response
   */
  async cancelOrder(orderId) {
    const endpoint = `/orders/${orderId}/cancel`;
    const authHeaders = this._getAuthHeaders('POST', endpoint);
    
    return this.post(endpoint, {}, authHeaders);
  }
  
  /**
   * Track an order
   * 
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Tracking information
   */
  async trackOrder(orderId) {
    const endpoint = `/orders/${orderId}/track`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Get order receipt
   * 
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Order receipt
   */
  async getOrderReceipt(orderId) {
    const endpoint = `/orders/${orderId}/receipt`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Get transaction history
   * 
   * @param {Object} filters - Filtering parameters
   * @returns {Promise<Object>} - Transaction history
   */
  async getTransactionHistory(filters = {}) {
    const endpoint = '/transactions';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, filters, authHeaders);
  }
  
  /**
   * Get transaction details
   * 
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransaction(transactionId) {
    const endpoint = `/transactions/${transactionId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Get user profile
   * 
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfile() {
    const endpoint = '/user/profile';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Update user profile
   * 
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} - Updated profile
   */
  async updateUserProfile(profileData) {
    const endpoint = '/user/profile';
    const authHeaders = this._getAuthHeaders('PATCH', endpoint, profileData);
    
    return this.patch(endpoint, profileData, authHeaders);
  }
  
  /**
   * Get account balance
   * 
   * @returns {Promise<Object>} - Account balance
   */
  async getAccountBalance() {
    const endpoint = '/user/balance';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Add funds to account
   * 
   * @param {Object} fundData - Fund details
   * @returns {Promise<Object>} - Funding response
   */
  async addFunds(fundData) {
    const endpoint = '/user/funds/add';
    const authHeaders = this._getAuthHeaders('POST', endpoint, fundData);
    
    return this.post(endpoint, fundData, authHeaders);
  }
  
  /**
   * Withdraw funds from account
   * 
   * @param {Object} withdrawalData - Withdrawal details
   * @returns {Promise<Object>} - Withdrawal response
   */
  async withdrawFunds(withdrawalData) {
    const endpoint = '/user/funds/withdraw';
    const authHeaders = this._getAuthHeaders('POST', endpoint, withdrawalData);
    
    return this.post(endpoint, withdrawalData, authHeaders);
  }
}