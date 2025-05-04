const BaseApiClient = require('./base-client');
const crypto = require('crypto');

/**
 * KredX API client
 */
class KredXClient extends BaseApiClient {
  /**
   * Constructor for the KredX API client
   * 
   * @param {string} apiKey - The API key for KredX
   * @param {string} apiSecret - The API secret for KredX
   */
  constructor(apiKey, apiSecret) {
    // Initialize the base client with the KredX API base URL
    super('https://api.kredx.com/v1');
    
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  
  /**
   * Get authentication headers for KredX API
   * 
   * @param {string} method - The HTTP method for the request
   * @param {string} endpoint - The endpoint for the request
   * @param {Object} data - Optional data to include in the signature
   * @returns {Object} - Headers with authentication information
   * @private
   */
  _getAuthHeaders(method, endpoint, data = null) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    let payload = `${method.toUpperCase()}${path}${timestamp}${nonce}`;
    
    if (data && Object.keys(data).length > 0) {
      payload += JSON.stringify(data);
    }
    
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');
    
    return {
      'X-KREDX-API-KEY': this.apiKey,
      'X-KREDX-TIMESTAMP': timestamp,
      'X-KREDX-NONCE': nonce,
      'X-KREDX-SIGNATURE': signature
    };
  }
  
  /**
   * List invoices
   * 
   * @param {Object} filters - Filtering parameters
   * @returns {Promise<Object>} - Invoices list
   */
  async listInvoices(filters = {}) {
    const endpoint = '/invoices';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, filters, authHeaders);
  }
  
  /**
   * Get invoice details
   * 
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} - Invoice details
   */
  async getInvoice(invoiceId) {
    const endpoint = `/invoices/${invoiceId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Create a new invoice
   * 
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} - Created invoice
   */
  async createInvoice(invoiceData) {
    const endpoint = '/invoices';
    const authHeaders = this._getAuthHeaders('POST', endpoint, invoiceData);
    
    return this.post(endpoint, invoiceData, authHeaders);
  }
  
  /**
   * Update an invoice
   * 
   * @param {string} invoiceId - The invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @returns {Promise<Object>} - Updated invoice
   */
  async updateInvoice(invoiceId, invoiceData) {
    const endpoint = `/invoices/${invoiceId}`;
    const authHeaders = this._getAuthHeaders('PATCH', endpoint, invoiceData);
    
    return this.patch(endpoint, invoiceData, authHeaders);
  }
  
  /**
   * Delete an invoice
   * 
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} - Deletion response
   */
  async deleteInvoice(invoiceId) {
    const endpoint = `/invoices/${invoiceId}`;
    const authHeaders = this._getAuthHeaders('DELETE', endpoint);
    
    return this.delete(endpoint, authHeaders);
  }
  
  /**
   * List vendors
   * 
   * @param {Object} filters - Filtering parameters
   * @returns {Promise<Object>} - Vendors list
   */
  async listVendors(filters = {}) {
    const endpoint = '/vendors';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, filters, authHeaders);
  }
  
  /**
   * Get vendor details
   * 
   * @param {string} vendorId - The vendor ID
   * @returns {Promise<Object>} - Vendor details
   */
  async getVendor(vendorId) {
    const endpoint = `/vendors/${vendorId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Create a new vendor
   * 
   * @param {Object} vendorData - Vendor data
   * @returns {Promise<Object>} - Created vendor
   */
  async createVendor(vendorData) {
    const endpoint = '/vendors';
    const authHeaders = this._getAuthHeaders('POST', endpoint, vendorData);
    
    return this.post(endpoint, vendorData, authHeaders);
  }
  
  /**
   * Update a vendor
   * 
   * @param {string} vendorId - The vendor ID
   * @param {Object} vendorData - Updated vendor data
   * @returns {Promise<Object>} - Updated vendor
   */
  async updateVendor(vendorId, vendorData) {
    const endpoint = `/vendors/${vendorId}`;
    const authHeaders = this._getAuthHeaders('PATCH', endpoint, vendorData);
    
    return this.patch(endpoint, vendorData, authHeaders);
  }
  
  /**
   * List transactions
   * 
   * @param {Object} filters - Filtering parameters
   * @returns {Promise<Object>} - Transactions list
   */
  async listTransactions(filters = {}) {
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
   * Get account balance
   * 
   * @returns {Promise<Object>} - Account balance
   */
  async getAccountBalance() {
    const endpoint = '/account/balance';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * List payments
   * 
   * @param {Object} filters - Filtering parameters
   * @returns {Promise<Object>} - Payments list
   */
  async listPayments(filters = {}) {
    const endpoint = '/payments';
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, filters, authHeaders);
  }
  
  /**
   * Get payment details
   * 
   * @param {string} paymentId - The payment ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPayment(paymentId) {
    const endpoint = `/payments/${paymentId}`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Create a new payment
   * 
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Created payment
   */
  async createPayment(paymentData) {
    const endpoint = '/payments';
    const authHeaders = this._getAuthHeaders('POST', endpoint, paymentData);
    
    return this.post(endpoint, paymentData, authHeaders);
  }
  
  /**
   * List financing options for an invoice
   * 
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} - Financing options
   */
  async listFinancingOptions(invoiceId) {
    const endpoint = `/invoices/${invoiceId}/financing-options`;
    const authHeaders = this._getAuthHeaders('GET', endpoint);
    
    return this.get(endpoint, {}, authHeaders);
  }
  
  /**
   * Request financing for an invoice
   * 
   * @param {string} invoiceId - The invoice ID
   * @param {Object} financingData - Financing request data
   * @returns {Promise<Object>} - Financing request response
   */
  async requestFinancing(invoiceId, financingData) {
    const endpoint = `/invoices/${invoiceId}/request-financing`;
    const authHeaders = this._getAuthHeaders('POST', endpoint, financingData);
    
    return this.post(endpoint, financingData, authHeaders);
  }
}

module.exports = KredXClient;