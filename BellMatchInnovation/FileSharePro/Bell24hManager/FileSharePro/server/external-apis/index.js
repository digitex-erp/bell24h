import { ExternalApiConfig } from './config.js';
import { FSATClient } from './fsat-client.js';

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
  async initializeClients() {
    // Initialize FSAT client if credentials are available
    const fsatConfig = ExternalApiConfig.getFSATConfig();
    
    if (fsatConfig.isConfigured) {
      try {
        this.clients.fsat = new FSATClient(
          fsatConfig.apiKey,
          fsatConfig.apiSecret,
          fsatConfig.baseUrl
        );
        console.log('FSAT API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize FSAT API client:', error);
      }
    } else {
      console.warn('FSAT API credentials or base URL not found. Client not initialized.');
    }
    
    // Log initialization status
    const status = ExternalApiConfig.getApiConfigStatus();
    const unconfiguredApis = ExternalApiConfig.getUnconfiguredApis();
    
    console.log('External API configuration status:', status);
    
    if (unconfiguredApis.length > 0) {
      console.warn(`The following APIs are not configured: ${unconfiguredApis.join(', ')}`);
      console.warn('To fully enable all functionality, please set the necessary environment variables.');
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

// Export the factory
export default apiClientFactory;