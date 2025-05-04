const BaseApiClient = require('./base-client');

/**
 * RazorpayX API client
 */
class RazorpayXClient extends BaseApiClient {
  /**
   * Constructor for the RazorpayX API client
   * 
   * @param {string} apiKey - The API key for RazorpayX
   * @param {string} apiSecret - The API secret for RazorpayX
   */
  constructor(apiKey, apiSecret) {
    // Initialize the base client with the RazorpayX API base URL
    super('https://api.razorpay.com/v2');
    
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    // Set up basic authentication headers
    const authString = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    this.headers.Authorization = `Basic ${authString}`;
  }
  
  /**
   * List all contacts
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of contacts
   */
  async listContacts(queryParams = {}) {
    return this.get('/contacts', queryParams);
  }
  
  /**
   * Get a specific contact by ID
   * 
   * @param {string} contactId - The contact ID
   * @returns {Promise<Object>} - Contact details
   */
  async getContact(contactId) {
    return this.get(`/contacts/${contactId}`);
  }
  
  /**
   * Create a new contact
   * 
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} - Created contact
   */
  async createContact(contactData) {
    return this.post('/contacts', contactData);
  }
  
  /**
   * Update a contact
   * 
   * @param {string} contactId - The contact ID
   * @param {Object} contactData - Updated contact data
   * @returns {Promise<Object>} - Updated contact
   */
  async updateContact(contactId, contactData) {
    return this.patch(`/contacts/${contactId}`, contactData);
  }
  
  /**
   * List all fund accounts
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of fund accounts
   */
  async listFundAccounts(queryParams = {}) {
    return this.get('/fund_accounts', queryParams);
  }
  
  /**
   * Get a specific fund account by ID
   * 
   * @param {string} fundAccountId - The fund account ID
   * @returns {Promise<Object>} - Fund account details
   */
  async getFundAccount(fundAccountId) {
    return this.get(`/fund_accounts/${fundAccountId}`);
  }
  
  /**
   * Create a new fund account
   * 
   * @param {Object} fundAccountData - Fund account data
   * @returns {Promise<Object>} - Created fund account
   */
  async createFundAccount(fundAccountData) {
    return this.post('/fund_accounts', fundAccountData);
  }
  
  /**
   * List all payouts
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of payouts
   */
  async listPayouts(queryParams = {}) {
    return this.get('/payouts', queryParams);
  }
  
  /**
   * Get a specific payout by ID
   * 
   * @param {string} payoutId - The payout ID
   * @returns {Promise<Object>} - Payout details
   */
  async getPayout(payoutId) {
    return this.get(`/payouts/${payoutId}`);
  }
  
  /**
   * Create a new payout
   * 
   * @param {Object} payoutData - Payout data
   * @returns {Promise<Object>} - Created payout
   */
  async createPayout(payoutData) {
    return this.post('/payouts', payoutData);
  }
  
  /**
   * Cancel a payout
   * 
   * @param {string} payoutId - The payout ID
   * @returns {Promise<Object>} - Cancelled payout
   */
  async cancelPayout(payoutId) {
    return this.post(`/payouts/${payoutId}/cancel`);
  }
  
  /**
   * List all transactions
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of transactions
   */
  async listTransactions(queryParams = {}) {
    return this.get('/transactions', queryParams);
  }
  
  /**
   * Get a specific transaction by ID
   * 
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransaction(transactionId) {
    return this.get(`/transactions/${transactionId}`);
  }
  
  /**
   * Create a new transaction
   * 
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  async createTransaction(transactionData) {
    return this.post('/transactions', transactionData);
  }
  
  /**
   * List all balances
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of balances
   */
  async listBalances(queryParams = {}) {
    return this.get('/balances', queryParams);
  }
  
  /**
   * Get account balance
   * 
   * @returns {Promise<Object>} - Account balance
   */
  async getAccountBalance() {
    return this.get('/accounts/me/balances');
  }
  
  /**
   * List all invoices
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of invoices
   */
  async listInvoices(queryParams = {}) {
    return this.get('/invoices', queryParams);
  }
  
  /**
   * Get a specific invoice by ID
   * 
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} - Invoice details
   */
  async getInvoice(invoiceId) {
    return this.get(`/invoices/${invoiceId}`);
  }
  
  /**
   * Create a new invoice
   * 
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} - Created invoice
   */
  async createInvoice(invoiceData) {
    return this.post('/invoices', invoiceData);
  }
  
  /**
   * List all virtual accounts
   * 
   * @param {Object} queryParams - Query parameters for filtering
   * @returns {Promise<Object>} - List of virtual accounts
   */
  async listVirtualAccounts(queryParams = {}) {
    return this.get('/virtual_accounts', queryParams);
  }
  
  /**
   * Get a specific virtual account by ID
   * 
   * @param {string} virtualAccountId - The virtual account ID
   * @returns {Promise<Object>} - Virtual account details
   */
  async getVirtualAccount(virtualAccountId) {
    return this.get(`/virtual_accounts/${virtualAccountId}`);
  }
  
  /**
   * Create a new virtual account
   * 
   * @param {Object} virtualAccountData - Virtual account data
   * @returns {Promise<Object>} - Created virtual account
   */
  async createVirtualAccount(virtualAccountData) {
    return this.post('/virtual_accounts', virtualAccountData);
  }
  
  /**
   * Close a virtual account
   * 
   * @param {string} virtualAccountId - The virtual account ID
   * @returns {Promise<Object>} - Closed virtual account
   */
  async closeVirtualAccount(virtualAccountId) {
    return this.post(`/virtual_accounts/${virtualAccountId}/close`);
  }
}

module.exports = RazorpayXClient;