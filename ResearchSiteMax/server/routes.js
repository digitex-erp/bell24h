const { createServer } = require('http');
const express = require('express');
const { storage } = require('./storage');
const { z } = require('zod');
const { insertProductSchema, insertPortfolioItemSchema } = require('../shared/schema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Import routers
const userRolesRouter = require('./routes/user-roles');
const industryTrendsRouter = require('./routes/industry-trends');
const messagingRouter = require('./routes/messaging');

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique file name to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images, documents and audio files
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|mp3|wav|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
    }
  }
});

async function registerRoutes(app) {
  // Use routers
  app.use(userRolesRouter);
  app.use(industryTrendsRouter);
  app.use(messagingRouter);
  
  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // User search for messaging
  app.get('/api/users/search', async (req, res) => {
    try {
      const query = req.query.q || '';
      
      if (query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }
      
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  });

  // User routes
  app.post('/api/register', async (req, res) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Create user
      const user = await storage.createUser(req.body);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Get user from database
      const user = await storage.getUserByUsername(username);
      
      // Check if user exists and password matches
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // RFQ routes
  app.post('/api/rfqs', async (req, res) => {
    try {
      // Generate a reference number for the RFQ
      const referenceNumber = 'RFQ-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      
      // Add reference number to request body
      const rfqData = {
        ...req.body,
        referenceNumber,
      };
      
      const rfq = await storage.createRfq(rfqData);
      res.status(201).json(rfq);
    } catch (error) {
      console.error('Error creating RFQ:', error);
      res.status(500).json({ error: 'Failed to create RFQ' });
    }
  });

  app.get('/api/rfqs/:id', async (req, res) => {
    try {
      const rfq = await storage.getRfq(req.params.id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }
      res.json(rfq);
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      res.status(500).json({ error: 'Failed to fetch RFQ' });
    }
  });

  app.get('/api/users/:userId/rfqs', async (req, res) => {
    try {
      const rfqs = await storage.getRfqsByUserId(req.params.userId);
      res.json(rfqs);
    } catch (error) {
      console.error('Error fetching user RFQs:', error);
      res.status(500).json({ error: 'Failed to fetch user RFQs' });
    }
  });

  // Bid routes
  app.post('/api/bids', async (req, res) => {
    try {
      const bid = await storage.createBid(req.body);
      res.status(201).json(bid);
    } catch (error) {
      console.error('Error creating bid:', error);
      res.status(500).json({ error: 'Failed to create bid' });
    }
  });

  app.get('/api/rfqs/:rfqId/bids', async (req, res) => {
    try {
      const bids = await storage.getBidsByRfqId(req.params.rfqId);
      res.json(bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
      res.status(500).json({ error: 'Failed to fetch bids' });
    }
  });

  // Supplier routes
  app.post('/api/suppliers', async (req, res) => {
    try {
      const supplier = await storage.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      res.status(500).json({ error: 'Failed to create supplier' });
    }
  });

  app.get('/api/suppliers', async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  });

  app.get('/api/suppliers/top', async (req, res) => {
    try {
      const topSuppliers = await storage.getTopSuppliers();
      res.json(topSuppliers);
    } catch (error) {
      console.error('Error fetching top suppliers:', error);
      res.status(500).json({ error: 'Failed to fetch top suppliers' });
    }
  });

  app.get('/api/suppliers/:id', async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      res.status(500).json({ error: 'Failed to fetch supplier' });
    }
  });

  app.get('/api/users/:userId/supplier', async (req, res) => {
    try {
      const supplier = await storage.getSupplierByUserId(req.params.userId);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found for this user' });
      }
      res.json(supplier);
    } catch (error) {
      console.error('Error fetching user supplier profile:', error);
      res.status(500).json({ error: 'Failed to fetch supplier profile' });
    }
  });

  app.patch('/api/suppliers/:id', async (req, res) => {
    try {
      const supplier = await storage.updateSupplierProfile(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(500).json({ error: 'Failed to update supplier' });
    }
  });

  // Contract routes
  app.post('/api/contracts', async (req, res) => {
    try {
      const contract = await storage.createContract(req.body);
      res.status(201).json(contract);
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).json({ error: 'Failed to create contract' });
    }
  });

  app.get('/api/users/:userId/contracts', async (req, res) => {
    try {
      const contracts = await storage.getContractsByUserId(req.params.userId);
      res.json(contracts);
    } catch (error) {
      console.error('Error fetching user contracts:', error);
      res.status(500).json({ error: 'Failed to fetch user contracts' });
    }
  });

  // Dashboard data routes
  app.get('/api/users/:userId/dashboard', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get counts of active RFQs, received bids, and awarded contracts
      const activeRfqsCount = await storage.getActiveRfqsCount(userId);
      const receivedBidsCount = await storage.getReceivedBidsCount(userId);
      const awardedContractsCount = await storage.getAwardedContractsCount(userId);
      const unreadMessagesCount = await storage.getUnreadMessagesCount(userId);
      const walletBalance = await storage.getUserWalletBalance(userId);
      
      res.json({
        activeRfqs: activeRfqsCount,
        receivedBids: receivedBidsCount,
        awardedContracts: awardedContractsCount,
        unreadMessages: unreadMessagesCount,
        walletBalance
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // Market data routes
  app.post('/api/market-data', async (req, res) => {
    try {
      const marketData = await storage.saveMarketData(req.body);
      res.status(201).json(marketData);
    } catch (error) {
      console.error('Error saving market data:', error);
      res.status(500).json({ error: 'Failed to save market data' });
    }
  });

  app.get('/api/market-data/:industry', async (req, res) => {
    try {
      const marketData = await storage.getMarketDataByIndustry(req.params.industry);
      res.json(marketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // User profile routes
  app.patch('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.updateUserProfile(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // GST verification route
  app.post('/api/verify-gst', async (req, res) => {
    try {
      const { userId, gstNumber } = req.body;
      
      // Implement GST verification logic here
      // For now, we'll simulate successful verification
      const isVerified = true;
      
      // Update user's GST verification status
      const user = await storage.updateUserGstVerification(userId, isVerified);
      
      res.json({ verified: isVerified });
    } catch (error) {
      console.error('Error verifying GST number:', error);
      res.status(500).json({ error: 'Failed to verify GST number' });
    }
  });

  // File upload route
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ fileUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Wallet routes
  app.post('/api/wallet/add-funds', async (req, res) => {
    try {
      const { userId, amount } = req.body;
      
      // Update user's wallet balance
      const user = await storage.updateUserWalletBalance(userId, amount);
      
      // Create a wallet transaction record
      const transaction = await storage.createWalletTransaction({
        userId,
        type: 'deposit',
        amount,
        status: 'completed',
        description: 'Funds added to wallet'
      });
      
      res.json({ 
        transaction,
        newBalance: user.walletBalance
      });
    } catch (error) {
      console.error('Error adding funds to wallet:', error);
      res.status(500).json({ error: 'Failed to add funds to wallet' });
    }
  });

  app.get('/api/users/:userId/wallet/transactions', async (req, res) => {
    try {
      const transactions = await storage.getWalletTransactionsByUserId(req.params.userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      res.status(500).json({ error: 'Failed to fetch wallet transactions' });
    }
  });

  // Message routes
  app.post('/api/messages', async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.get('/api/users/:userId/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByUserId(req.params.userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching user messages:', error);
      res.status(500).json({ error: 'Failed to fetch user messages' });
    }
  });

  app.get('/api/messages/between/:senderId/:receiverId', async (req, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(
        req.params.senderId,
        req.params.receiverId
      );
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages between users:', error);
      res.status(500).json({ error: 'Failed to fetch messages between users' });
    }
  });

  app.get('/api/rfqs/:rfqId/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByRfqId(req.params.rfqId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching RFQ messages:', error);
      res.status(500).json({ error: 'Failed to fetch RFQ messages' });
    }
  });

  app.patch('/api/messages/:id/read', async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  // Product catalog routes
  app.post('/api/products', async (req, res) => {
    try {
      // Validate request body
      const productData = insertProductSchema.parse(req.body);
      
      // Create product
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid product data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.get('/api/suppliers/:supplierId/products', async (req, res) => {
    try {
      const products = await storage.getProductsBySupplierId(req.params.supplierId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      res.status(500).json({ error: 'Failed to fetch supplier products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.patch('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Product not found or could not be deleted' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/api/products/category/:category', async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products by category' });
    }
  });

  // Portfolio routes
  app.post('/api/portfolio-items', async (req, res) => {
    try {
      // Validate request body
      const portfolioData = insertPortfolioItemSchema.parse(req.body);
      
      // Create portfolio item
      const portfolioItem = await storage.createPortfolioItem(portfolioData);
      res.status(201).json(portfolioItem);
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid portfolio item data', details: error.errors });
      }
      
      res.status(500).json({ error: 'Failed to create portfolio item' });
    }
  });

  app.get('/api/suppliers/:supplierId/portfolio', async (req, res) => {
    try {
      const portfolioItems = await storage.getPortfolioItemsBySupplierId(req.params.supplierId);
      res.json(portfolioItems);
    } catch (error) {
      console.error('Error fetching supplier portfolio:', error);
      res.status(500).json({ error: 'Failed to fetch supplier portfolio' });
    }
  });

  app.get('/api/portfolio-items/:id', async (req, res) => {
    try {
      const portfolioItem = await storage.getPortfolioItem(req.params.id);
      if (!portfolioItem) {
        return res.status(404).json({ error: 'Portfolio item not found' });
      }
      res.json(portfolioItem);
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio item' });
    }
  });

  app.patch('/api/portfolio-items/:id', async (req, res) => {
    try {
      const portfolioItem = await storage.updatePortfolioItem(req.params.id, req.body);
      if (!portfolioItem) {
        return res.status(404).json({ error: 'Portfolio item not found' });
      }
      res.json(portfolioItem);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      res.status(500).json({ error: 'Failed to update portfolio item' });
    }
  });

  app.delete('/api/portfolio-items/:id', async (req, res) => {
    try {
      const success = await storage.deletePortfolioItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Portfolio item not found or could not be deleted' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      res.status(500).json({ error: 'Failed to delete portfolio item' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

module.exports = { registerRoutes };