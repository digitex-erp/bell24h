import { BaseApiClient } from './base-client.js';
import crypto from 'crypto';

/**
 * FSAT API client
 */
export class FSATClient extends BaseApiClient {
  private apiKey: string;
  private apiSecret: string;

  /**
   * Constructor for the FSAT API client
   * 
   * @param apiKey - The API key for FSAT
   * @param apiSecret - The API secret for FSAT
   * @param baseUrl - The base URL for the FSAT API
   */
  constructor(apiKey: string, apiSecret: string, baseUrl: string) {
    super(baseUrl);
    
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  
  /**
   * Get authentication headers for FSAT API
   * 
   * @param method - The HTTP method for the request
   * @param endpoint - The endpoint for the request
   * @param data - Optional data to include in the signature
   * @returns Headers with authentication information
   * @private
   */
  private _getAuthHeaders(method: string, endpoint: string, data: Record<string, any> | null = null): Record<string, string> {
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
   * @returns Available services
   */
  async getAvailableServices<T>(): Promise<T> {
    const endpoint = '/services';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Get service pricing
   * 
   * @param serviceId - The service ID
   * @returns Service pricing
   */
  async getServicePricing<T>(serviceId: string): Promise<T> {
    const endpoint = `/services/${serviceId}/pricing`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Create a service order
   * 
   * @param orderData - Order details
   * @returns Created order
   */
  async createOrder<T>(orderData: Record<string, any>): Promise<T> {
    const endpoint = '/orders';
    const authHeaders = this._getAuthHeaders('POST', endpoint, orderData);
    
    return this.post<T>(endpoint, orderData, authHeaders);
  }
  
  /**
   * Get order details
   * 
   * @param orderId - The order ID
   * @returns Order details
   */
  async getOrder<T>(orderId: string): Promise<T> {
    const endpoint = `/orders/${orderId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * List orders
   * 
   * @param filters - Filtering parameters
   * @returns Orders list
   */
  async listOrders<T>(filters: Record<string, any> = {}): Promise<T> {
    const endpoint = '/orders';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, filters, authHeaders);
  }
  
  /**
   * Cancel an order
   * 
   * @param orderId - The order ID
   * @returns Cancellation response
   */
  async cancelOrder<T>(orderId: string): Promise<T> {
    const endpoint = `/orders/${orderId}/cancel`;
    const authHeaders = this._getAuthHeaders('POST', endpoint);
    
    return this.post<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Track an order
   * 
   * @param orderId - The order ID
   * @returns Tracking information
   */
  async trackOrder<T>(orderId: string): Promise<T> {
    const endpoint = `/orders/${orderId}/track`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Get order receipt
   * 
   * @param orderId - The order ID
   * @returns Order receipt
   */
  async getOrderReceipt<T>(orderId: string): Promise<T> {
    const endpoint = `/orders/${orderId}/receipt`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Get transaction history
   * 
   * @param filters - Filtering parameters
   * @returns Transaction history
   */
  async getTransactionHistory<T>(filters: Record<string, any> = {}): Promise<T> {
    const endpoint = '/transactions';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, filters, authHeaders);
  }
  
  /**
   * Get transaction details
   * 
   * @param transactionId - The transaction ID
   * @returns Transaction details
   */
  async getTransaction<T>(transactionId: string): Promise<T> {
    const endpoint = `/transactions/${transactionId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Get user profile
   * 
   * @returns User profile
   */
  async getUserProfile<T>(): Promise<T> {
    const endpoint = '/user/profile';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Update user profile
   * 
   * @param profileData - Updated profile data
   * @returns Updated profile
   */
  async updateUserProfile<T>(profileData: Record<string, any>): Promise<T> {
    const endpoint = '/user/profile';
    const authHeaders = this._getAuthHeaders('PATCH', endpoint, profileData);
    
    return this.patch<T>(endpoint, profileData, authHeaders);
  }
  
  /**
   * Get account balance
   * 
   * @returns Account balance
   */
  async getAccountBalance<T>(): Promise<T> {
    const endpoint = '/user/balance';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get<T>(endpoint, {}, authHeaders);
  }
  
  /**
   * Add funds to account
   * 
   * @param fundData - Fund details
   * @returns Funding response
   */
  async addFunds<T>(fundData: Record<string, any>): Promise<T> {
    const endpoint = '/user/funds/add';
    const authHeaders = this._getAuthHeaders('POST', endpoint, fundData);
    
    return this.post<T>(endpoint, fundData, authHeaders);
  }
  
  /**
   * Withdraw funds from account
   * 
   * @param withdrawalData - Withdrawal details
   * @returns Withdrawal response
   */
  async withdrawFunds<T>(withdrawalData: Record<string, any>): Promise<T> {
    const endpoint = '/user/funds/withdraw';
    const authHeaders = this._getAuthHeaders('POST', endpoint, withdrawalData);
    
    return this.post<T>(endpoint, withdrawalData, authHeaders);
  }
}