import express from 'express';
import apiClientFactory from '../../api-clients.js';

const router = express.Router();

/**
 * Check API client status
 * 
 * @route GET /api/external/status
 * @returns {Object} JSON response with API client status
 */
router.get('/status', (req, res) => {
  const initializedClients = apiClientFactory.getInitializedClientNames();
  
  return res.json({
    success: true,
    data: {
      initializedClients,
      availableClients: {
        kotakSecurities: apiClientFactory.hasClient('kotakSecurities'),
        kredx: apiClientFactory.hasClient('kredx'),
        razorpayx: apiClientFactory.hasClient('razorpayx'),
        fsat: apiClientFactory.hasClient('fsat')
      }
    }
  });
});

/**
 * Kotak Securities API routes
 */
router.get('/kotak/market-data/:symbol', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('kotakSecurities')) {
      return res.status(503).json({
        success: false,
        error: 'Kotak Securities API client not initialized'
      });
    }
    
    const kotakClient = apiClientFactory.getClient('kotakSecurities');
    const { symbol } = req.params;
    
    const marketData = await kotakClient.getMarketData(symbol);
    
    return res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch market data'
    });
  }
});

router.get('/kotak/order-book', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('kotakSecurities')) {
      return res.status(503).json({
        success: false,
        error: 'Kotak Securities API client not initialized'
      });
    }
    
    const kotakClient = apiClientFactory.getClient('kotakSecurities');
    
    const orderBook = await kotakClient.getOrderBook();
    
    return res.json({
      success: true,
      data: orderBook
    });
  } catch (error) {
    console.error('Error fetching order book:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch order book'
    });
  }
});

/**
 * KredX API routes
 */
router.get('/kredx/invoices', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('kredx')) {
      return res.status(503).json({
        success: false,
        error: 'KredX API client not initialized'
      });
    }
    
    const kredxClient = apiClientFactory.getClient('kredx');
    
    const invoices = await kredxClient.listInvoices(req.query);
    
    return res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch invoices'
    });
  }
});

router.get('/kredx/invoices/:invoiceId', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('kredx')) {
      return res.status(503).json({
        success: false,
        error: 'KredX API client not initialized'
      });
    }
    
    const kredxClient = apiClientFactory.getClient('kredx');
    const { invoiceId } = req.params;
    
    const invoice = await kredxClient.getInvoice(invoiceId);
    
    return res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch invoice'
    });
  }
});

/**
 * RazorpayX API routes
 */
router.get('/razorpayx/contacts', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('razorpayx')) {
      return res.status(503).json({
        success: false,
        error: 'RazorpayX API client not initialized'
      });
    }
    
    const razorpayxClient = apiClientFactory.getClient('razorpayx');
    
    const contacts = await razorpayxClient.listContacts(req.query);
    
    return res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch contacts'
    });
  }
});

router.post('/razorpayx/contacts', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('razorpayx')) {
      return res.status(503).json({
        success: false,
        error: 'RazorpayX API client not initialized'
      });
    }
    
    const razorpayxClient = apiClientFactory.getClient('razorpayx');
    
    const contact = await razorpayxClient.createContact(req.body);
    
    return res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create contact'
    });
  }
});

/**
 * FSAT API routes
 */
router.get('/fsat/services', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('fsat')) {
      return res.status(503).json({
        success: false,
        error: 'FSAT API client not initialized'
      });
    }
    
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

router.get('/fsat/orders', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('fsat')) {
      return res.status(503).json({
        success: false,
        error: 'FSAT API client not initialized'
      });
    }
    
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

router.post('/fsat/orders', async (req, res) => {
  try {
    if (!apiClientFactory.hasClient('fsat')) {
      return res.status(503).json({
        success: false,
        error: 'FSAT API client not initialized'
      });
    }
    
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

export default router;