const KotakSecuritiesClient = require('./kotak-securities-client');
const KredXClient = require('./kredx-client');
const RazorpayXClient = require('./razorpayx-client');
const FSATClient = require('./fsat-client');

/**
 * API client factory to create and manage external API clients
 */
class ApiClientFactory {
  constructor() {
    this.clients = {};
  }

  /**
   * Initialize all API clients based on environment variables
   */
  initializeClients() {
    // Initialize Kotak Securities client if credentials are available
    const kotakApiKey = process.env.KOTAK_SECURITIES_API_KEY;
    const kotakApiSecret = process.env.KOTAK_SECURITIES_API_SECRET;
    
    if (kotakApiKey && kotakApiSecret) {
      try {
        this.clients.kotakSecurities = new KotakSecuritiesClient(
          kotakApiKey,
          kotakApiSecret
        );
        console.log('Kotak Securities API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Kotak Securities API client:', error);
      }
    } else {
      console.warn('Kotak Securities API credentials not found. Client not initialized.');
    }

    // Initialize KredX client if credentials are available
    const kredxApiKey = process.env.KREDX_API_KEY;
    const kredxApiSecret = process.env.KREDX_API_SECRET;
    
    if (kredxApiKey && kredxApiSecret) {
      try {
        this.clients.kredx = new KredXClient(
          kredxApiKey,
          kredxApiSecret
        );
        console.log('KredX API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize KredX API client:', error);
      }
    } else {
      console.warn('KredX API credentials not found. Client not initialized.');
    }

    // Initialize RazorpayX client if credentials are available
    const razorpayxApiKey = process.env.RAZORPAYX_API_KEY;
    const razorpayxApiSecret = process.env.RAZORPAYX_API_SECRET;
    
    if (razorpayxApiKey && razorpayxApiSecret) {
      try {
        this.clients.razorpayx = new RazorpayXClient(
          razorpayxApiKey,
          razorpayxApiSecret
        );
        console.log('RazorpayX API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize RazorpayX API client:', error);
      }
    } else {
      console.warn('RazorpayX API credentials not found. Client not initialized.');
    }

    // Initialize FSAT client if credentials are available
    const fsatApiKey = process.env.FSAT_API_KEY;
    const fsatApiSecret = process.env.FSAT_API_SECRET;
    const fsatBaseUrl = process.env.FSAT_BASE_URL;
    
    if (fsatApiKey && fsatApiSecret && fsatBaseUrl) {
      try {
        this.clients.fsat = new FSATClient(
          fsatApiKey,
          fsatApiSecret,
          fsatBaseUrl
        );
        console.log('FSAT API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize FSAT API client:', error);
      }
    } else {
      console.warn('FSAT API credentials or base URL not found. Client not initialized.');
    }
  }

  /**
   * Get a specific API client
   * 
   * @param {string} clientName - The name of the client to get
   * @returns {Object} - The requested API client
   */
  getClient(clientName) {
    const client = this.clients[clientName];
    
    if (!client) {
      throw new Error(`API client '${clientName}' not found or not initialized`);
    }
    
    return client;
  }

  /**
   * Check if a specific API client is available
   * 
   * @param {string} clientName - The name of the client to check
   * @returns {boolean} - Whether the client is available
   */
  hasClient(clientName) {
    return !!this.clients[clientName];
  }

  /**
   * Get all initialized API clients
   * 
   * @returns {Object} - All API clients
   */
  getAllClients() {
    return this.clients;
  }

  /**
   * Get the names of all initialized API clients
   * 
   * @returns {Array<string>} - Names of all initialized clients
   */
  getInitializedClientNames() {
    return Object.keys(this.clients);
  }
}

// Create a singleton instance
const apiClientFactory = new ApiClientFactory();

// Initialize clients when this module is imported
apiClientFactory.initializeClients();

module.exports = apiClientFactory;