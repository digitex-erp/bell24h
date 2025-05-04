import express from 'express';
import apiClientFactory from './index.js';
import { ExternalApiConfig } from './config.js';

// Create a router for external API routes
const router = express.Router();

/**
 * Check API client status
 * 
 * @route GET /api/external/status
 * @returns {Object} JSON response with API client status
 */
router.get('/status', (req, res) => {
  const initializedClients = apiClientFactory.getInitializedClientNames();
  const apiConfigStatus = ExternalApiConfig.getApiConfigStatus();
  const sanitizedConfigs = ExternalApiConfig.getSanitizedApiConfigs();
  
  return res.json({
    success: true,
    data: {
      initializedClients,
      configStatus: apiConfigStatus,
      configDetails: sanitizedConfigs
    }
  });
});

/**
 * FSAT API endpoints
 */
if (ExternalApiConfig.getFSATConfig().isConfigured) {
  // Get available services
  router.get('/fsat/services', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const services = await fsatClient.getAvailableServices();
      
      return res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Error fetching FSAT services:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch FSAT services'
      });
    }
  });
  
  // Get service pricing
  router.get('/fsat/services/:serviceId/pricing', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const { serviceId } = req.params;
      
      const pricing = await fsatClient.getServicePricing(serviceId);
      
      return res.json({
        success: true,
        data: pricing
      });
    } catch (error) {
      console.error('Error fetching service pricing:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch service pricing'
      });
    }
  });
  
  // List orders
  router.get('/fsat/orders', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const orders = await fsatClient.listOrders(req.query);
      
      return res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching FSAT orders:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch FSAT orders'
      });
    }
  });
  
  // Create a new order
  router.post('/fsat/orders', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const order = await fsatClient.createOrder(req.body);
      
      return res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error creating FSAT order:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create FSAT order'
      });
    }
  });
  
  // Get order details
  router.get('/fsat/orders/:orderId', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const { orderId } = req.params;
      
      const order = await fsatClient.getOrder(orderId);
      
      return res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch order details'
      });
    }
  });
  
  // Cancel an order
  router.post('/fsat/orders/:orderId/cancel', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const { orderId } = req.params;
      
      const result = await fsatClient.cancelOrder(orderId);
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error canceling order:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel order'
      });
    }
  });
  
  // Track an order
  router.get('/fsat/orders/:orderId/track', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      const { orderId } = req.params;
      
      const tracking = await fsatClient.trackOrder(orderId);
      
      return res.json({
        success: true,
        data: tracking
      });
    } catch (error) {
      console.error('Error tracking order:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to track order'
      });
    }
  });
  
  // Get user profile
  router.get('/fsat/user/profile', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      
      const profile = await fsatClient.getUserProfile();
      
      return res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch user profile'
      });
    }
  });
  
  // Get account balance
  router.get('/fsat/user/balance', async (req, res) => {
    try {
      const fsatClient = apiClientFactory.getClient('fsat');
      
      const balance = await fsatClient.getAccountBalance();
      
      return res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Error fetching account balance:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch account balance'
      });
    }
  });
}

export default router;