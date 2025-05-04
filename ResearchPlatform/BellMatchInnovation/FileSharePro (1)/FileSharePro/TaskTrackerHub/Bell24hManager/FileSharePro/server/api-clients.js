import apiClientFactory from './external-apis/index.js';

// Initialize the API clients on import
apiClientFactory.initializeClients().catch(error => {
  console.error('Error initializing API clients:', error);
});

export default apiClientFactory;