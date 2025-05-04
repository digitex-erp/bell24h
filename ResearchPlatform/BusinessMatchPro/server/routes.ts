import { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertRfqSchema, insertQuoteSchema, insertMessageSchema, insertTransactionSchema } from "@shared/schema";
import { WebSocketServer } from "ws";
import { WebSocketManager } from "./websocket";
import { KotakSecuritiesService } from "./services/kotak-securities";
import { PaymentService } from "./services/payment";

const kotakService = new KotakSecuritiesService();
const paymentService = new PaymentService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // RFQ routes
  app.post("/api/rfqs", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertRfqSchema.parse(req.body);
      const newRfq = await storage.createRfq(validatedData, req.user!.id);
      res.status(201).json(newRfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid RFQ data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  });

  app.get("/api/rfqs", async (req, res) => {
    try {
      const rfqs = await storage.getAllRfqs();
      res.json(rfqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.get("/api/rfqs/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const userRfqs = await storage.getRfqsByUser(req.user!.id);
      res.json(userRfqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user RFQs" });
    }
  });

  app.get("/api/rfqs/:id", async (req, res) => {
    try {
      const rfqId = parseInt(req.params.id);
      const rfq = await storage.getRfq(rfqId);
      
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      res.json(rfq);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFQ" });
    }
  });

  app.patch("/api/rfqs/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const rfqId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['open', 'matched', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const rfq = await storage.getRfq(rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      if (rfq.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this RFQ" });
      }
      
      const updatedRfq = await storage.updateRfqStatus(rfqId, status);
      res.json(updatedRfq);
    } catch (error) {
      res.status(500).json({ message: "Failed to update RFQ status" });
    }
  });

  // Quote routes
  app.post("/api/quotes", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user!.role !== 'supplier') return res.status(403).json({ message: "Only suppliers can submit quotes" });
    
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote({
        ...validatedData,
        supplierId: req.user!.id
      });
      
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.get("/api/rfqs/:rfqId/quotes", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const rfqId = parseInt(req.params.rfqId);
      const rfq = await storage.getRfq(rfqId);
      
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      // Only allow the RFQ owner or the quote supplier to see quotes
      if (rfq.userId !== req.user!.id && req.user!.role !== 'supplier') {
        return res.status(403).json({ message: "Not authorized to view these quotes" });
      }
      
      const quotes = await storage.getQuotesByRfq(rfqId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.patch("/api/quotes/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const quoteId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedQuote = await storage.updateQuoteStatus(quoteId, status);
      res.json(updatedQuote);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quote status" });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...validatedData,
        senderId: req.user!.id
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const otherUserId = parseInt(req.params.userId);
      const messages = await storage.getMessagesBetweenUsers(req.user!.id, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      
      // Remove sensitive information
      const sanitizedSuppliers = suppliers.map(supplier => {
        const { password, ...supplierWithoutPassword } = supplier;
        return supplierWithoutPassword;
      });
      
      res.json(sanitizedSuppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/verified", async (req, res) => {
    try {
      const verifiedSuppliers = await storage.getVerifiedSuppliers();
      
      // Remove sensitive information
      const sanitizedSuppliers = verifiedSuppliers.map(supplier => {
        const { password, ...supplierWithoutPassword } = supplier;
        return supplierWithoutPassword;
      });
      
      res.json(sanitizedSuppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verified suppliers" });
    }
  });

  // Wallet routes
  app.post("/api/wallet/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...validatedData,
        userId: req.user!.id
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const transactions = await storage.getTransactionsByUser(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // User profile update
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { username, password, ...updateData } = req.body; // Prevent username/password changes
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // GST verification (simplified version)
  app.post("/api/verify-gst", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    if (req.user!.role !== 'supplier') return res.status(403).json({ message: "Only suppliers can verify GST" });
    
    try {
      const { gstNumber } = req.body;
      
      if (!gstNumber || gstNumber.length !== 15) {
        return res.status(400).json({ message: "Invalid GST number" });
      }
      
      // Simplified validation (in a real app, you would call an actual GST validation API)
      const isValid = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/.test(gstNumber);
      
      if (isValid) {
        await storage.updateUser(req.user!.id, { 
          gstNumber,
          gstVerified: true
        });
        res.json({ success: true, message: "GST verification successful" });
      } else {
        res.status(400).json({ success: false, message: "Invalid GST number format" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to verify GST" });
    }
  });
  
  // Test WebSocket notification (for development purposes only)
  app.get("/api/test-websocket", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Create a test RFQ
      const testRfq = await storage.createRfq({
        title: "WebSocket Test RFQ",
        description: "This is a test RFQ to verify WebSocket notifications",
        category: "Test",
        budget: "1000",
        quantity: 10, // Add required quantity field
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "Test Location"
        // Remove status field as it's not in the schema
      }, req.user!.id);
      
      res.json({ success: true, message: "WebSocket test notification sent", rfq: testRfq });
    } catch (error) {
      console.error("Error in test WebSocket route:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize WebSocket server on a different path to avoid conflict with Vite's HMR
  const wsManager = new WebSocketManager(httpServer, '/ws');
  
  // Add WebSocket notifications to existing routes
  const originalCreateRfq = storage.createRfq;
  storage.createRfq = async (rfq, userId) => {
    const newRfq = await originalCreateRfq.call(storage, rfq, userId);
    wsManager.notifyRfqCreated(newRfq);
    return newRfq;
  };
  
  const originalUpdateRfqStatus = storage.updateRfqStatus;
  storage.updateRfqStatus = async (id, status) => {
    const updatedRfq = await originalUpdateRfqStatus.call(storage, id, status);
    if (updatedRfq) {
      wsManager.notifyRfqUpdated(updatedRfq);
    }
    return updatedRfq;
  };
  
  const originalCreateQuote = storage.createQuote;
  storage.createQuote = async (quote) => {
    const newQuote = await originalCreateQuote.call(storage, quote);
    const rfq = await storage.getRfq(newQuote.rfqId);
    if (rfq) {
      wsManager.notifyQuoteCreated(newQuote, rfq.userId);
    }
    return newQuote;
  };
  
  const originalUpdateQuoteStatus = storage.updateQuoteStatus;
  storage.updateQuoteStatus = async (id, status) => {
    const updatedQuote = await originalUpdateQuoteStatus.call(storage, id, status);
    if (updatedQuote) {
      const rfq = await storage.getRfq(updatedQuote.rfqId);
      if (rfq) {
        wsManager.notifyQuoteUpdated(updatedQuote, rfq.userId);
      }
    }
    return updatedQuote;
  };
  
  const originalCreateMessage = storage.createMessage;
  storage.createMessage = async (message) => {
    const newMessage = await originalCreateMessage.call(storage, message);
    wsManager.notifyMessageCreated(newMessage);
    return newMessage;
  };
  
  const originalCreateTransaction = storage.createTransaction;
  storage.createTransaction = async (transaction) => {
    const newTransaction = await originalCreateTransaction.call(storage, transaction);
    wsManager.notifyTransactionCreated(newTransaction);
    return newTransaction;
  };

  // Market data endpoints
  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const data = await kotakService.getMarketData(req.params.symbol);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.get("/api/stock-price/:symbol", async (req, res) => {
    try {
      const price = await kotakService.getStockPrice(req.params.symbol);
      res.json(price);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock price" });
    }
  });

  // Payment endpoints
  app.post("/api/payments/create-order", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const { amount, currency } = req.body;
      const order = await paymentService.createOrder(amount, currency);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { orderId, paymentId, signature } = req.body;
      const isValid = await paymentService.verifyPayment(orderId, paymentId, signature);
      
      if (isValid) {
        res.json({ status: "success" });
      } else {
        res.status(400).json({ message: "Invalid payment signature" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  return httpServer;
}
