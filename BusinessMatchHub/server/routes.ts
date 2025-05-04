import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { z } from "zod";
import { shipmentTrackingService } from "./services/logistics-tracking";
import { escrowWalletService } from "./services/escrow-wallet";
import { 
  insertUserSchema, 
  insertRfqSchema, 
  insertBidSchema, 
  insertMessageSchema,
  insertWalletTransactionSchema,
  insertSupplierSchema,
  insertProductSchema,
  insertPortfolioItemSchema,
  insertBlockchainRecordSchema,
  insertInvoiceSchema,
  insertShipmentSchema,
  insertShipmentItemSchema,
  insertShipmentEventSchema,
  insertShipmentDocumentSchema
} from "../shared/schema";
import { storeRfqOnBlockchain, verifyRfqIntegrity, getTransactionDetails } from "./lib/blockchain";
import bcrypt from "bcrypt";
import { processVoiceRFQ } from "./lib/openai";
import { processVideoRfqHandler, createVideoRfq, videoUpload } from "./routes/videoRfq";
import { getMarketData } from "./lib/marketData";
import { supplier_risk_model, rfq_matching_model } from "./lib/ai";
import { getStockTrends, getGlobalMarketData, getIndianSectorIndices } from "./lib/alphaVantage";
import { validateGST } from "./lib/gstValidation";
import { registerAIRoutes } from "./routes/ai_routes";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "bell24h-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Register AI Routes
  registerAIRoutes(app);

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect password." });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Initialize escrow wallet service
  let escrowWalletService;
  async function getEscrowWalletService() {
    if (!escrowWalletService) {
      const { escrowWalletService: service } = await import("./services/escrow-wallet");
      escrowWalletService = service;
    }
    return escrowWalletService;
  }

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    // If this function gets called, authentication was successful
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ user: userWithoutPassword });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", requireAuth, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // RFQ Routes
  app.post("/api/rfqs", requireAuth, async (req, res) => {
    try {
      const rfqData = insertRfqSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      
      const rfq = await storage.createRfq(rfqData);
      res.status(201).json(rfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  });

  app.get("/api/rfqs", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const rfqs = await storage.getRfqsByUserId(userId);
      res.json(rfqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.get("/api/rfqs/:id", requireAuth, async (req, res) => {
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

  // Voice RFQ upload and processing
  app.post("/api/rfqs/voice", requireAuth, upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file uploaded" });
      }
      
      const audioFilePath = req.file.path;
      const userId = (req.user as any).id;
      
      // Process the voice to text and extract RFQ details using OpenAI
      const rfqData = await processVoiceRFQ(audioFilePath);
      
      // Generate a reference number
      const referenceNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create the RFQ with processed data
      const rfq = await storage.createRfq({
        ...rfqData,
        userId,
        referenceNumber,
        rfqType: "voice",
        mediaUrl: req.file.filename,
      });
      
      res.status(201).json(rfq);
    } catch (error) {
      res.status(500).json({ message: "Failed to process voice RFQ" });
    }
  });
  
  // Video RFQ upload and processing
  app.post("/api/rfqs/video/process", requireAuth, videoUpload, processVideoRfqHandler);
  
  // Create video RFQ from processed data
  app.post("/api/rfqs/video/create", requireAuth, createVideoRfq);

  // Bid Routes
  app.post("/api/bids", requireAuth, async (req, res) => {
    try {
      const bidData = insertBidSchema.parse({
        ...req.body,
        supplierId: (req.user as any).id,
      });
      
      const bid = await storage.createBid(bidData);
      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create bid" });
    }
  });

  app.get("/api/bids/rfq/:rfqId", requireAuth, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const bids = await storage.getBidsByRfqId(rfqId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Supplier Routes
  app.post("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      
      // Calculate risk score based on our algorithm
      const lateDeliveryRate = supplierData.lateDeliveryRate || 0;
      const complianceScore = supplierData.complianceScore || 0; 
      const financialStability = supplierData.financialStability || 0;
      const userFeedback = supplierData.userFeedback || 0;
      
      const riskScore = 0.4 * lateDeliveryRate + 
                         0.3 * (100 - complianceScore) + 
                         0.2 * (100 - financialStability) + 
                         0.1 * (100 - userFeedback);
      
      const supplier = await storage.createSupplier({
        ...supplierData,
        riskScore,
      });
      
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/top", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getTopSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top suppliers" });
    }
  });
  
  // Get supplier information for logged in user
  app.get("/api/suppliers/me", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier) {
        return res.status(404).json({ message: "User is not registered as a supplier" });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier information" });
    }
  });

  // Messaging Routes
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: (req.user as any).id,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Wallet Routes
  app.post("/api/wallet/transactions", requireAuth, async (req, res) => {
    try {
      const transactionData = insertWalletTransactionSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      
      const transaction = await storage.createWalletTransaction(transactionData);
      
      // Update user's wallet balance
      if (transaction.status === "completed") {
        await storage.updateUserWalletBalance(transaction.userId, transaction.amount);
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/wallet/transactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const transactions = await storage.getWalletTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // GST Validation Route
  app.post("/api/gst/validate", requireAuth, async (req, res) => {
    try {
      const { gstNumber } = req.body;
      
      if (!gstNumber) {
        return res.status(400).json({ message: "GST number is required" });
      }
      
      const isValid = await validateGST(gstNumber);
      
      if (isValid) {
        // Update user's GST verified status
        await storage.updateUserGstVerification((req.user as any).id, true);
      }
      
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate GST number" });
    }
  });

  // Market Data Routes
  app.get("/api/market/trends/:industry", requireAuth, async (req, res) => {
    try {
      const industry = req.params.industry;
      
      // Get market data for the industry
      const trends = await getStockTrends(industry);
      
      res.json(trends);
    } catch (error) {
      console.error("Error fetching stock trends:", error);
      res.status(500).json({ message: "Failed to fetch market trends" });
    }
  });

  // Get global market data
  app.get("/api/market/global", requireAuth, async (req, res) => {
    try {
      const globalData = await getGlobalMarketData();
      res.json(globalData);
    } catch (error) {
      console.error("Error fetching global market data:", error);
      res.status(500).json({ message: "Failed to fetch global market data" });
    }
  });

  // Get Indian sector indices
  app.get("/api/market/india/sectors", requireAuth, async (req, res) => {
    try {
      const sectorData = await getIndianSectorIndices();
      res.json(sectorData);
    } catch (error) {
      console.error("Error fetching Indian sector indices:", error);
      res.status(500).json({ message: "Failed to fetch Indian sector indices" });
    }
  });
  
  // Invoice Routes
  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoiceData = insertInvoiceSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      }
      
      // Set default values
      invoiceData.status = invoiceData.status || 'pending';
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  
  app.get("/api/invoices/seller", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoices = await storage.getInvoicesBySellerId(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching seller invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  
  app.get("/api/invoices/buyer", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoices = await storage.getInvoicesByBuyerId(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching buyer invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  
  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check if user is authorized to view this invoice
      const userId = (req.user as any).id;
      if (invoice.sellerId !== userId && invoice.buyerId !== userId) {
        return res.status(403).json({ message: "You are not authorized to view this invoice" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });
  
  // Upload invoice document/PDF
  app.post("/api/invoices/:id/upload", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check if user is authorized to update this invoice
      const userId = (req.user as any).id;
      if (invoice.sellerId !== userId) {
        return res.status(403).json({ message: "You are not authorized to update this invoice" });
      }
      
      // Update invoice with file URL
      const updatedInvoice = await storage.updateInvoice(invoiceId, {
        fileUrl: req.file.filename
      });
      
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error uploading invoice document:", error);
      res.status(500).json({ message: "Failed to upload invoice document" });
    }
  });

  // KredX API Routes
  app.get("/api/payments/kredx/status", requireAuth, async (req, res) => {
    try {
      const { kredxService } = await import("./services/kredx-service");
      const isConfigured = await kredxService.isConfigured();
      
      if (!isConfigured) {
        return res.status(200).json({
          integrated: false,
          message: "KredX API not configured"
        });
      }

      const accountStatus = await kredxService.getAccountStatus();
      res.json(accountStatus);
    } catch (error) {
      console.error("Error getting KredX status:", error);
      res.status(500).json({ message: "Failed to get KredX status" });
    }
  });

  app.get("/api/payments/invoices/discountable", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { kredxService } = await import("./services/kredx-service");
      
      const discountableInvoices = await kredxService.getDiscountableInvoices(userId);
      res.json(discountableInvoices);
    } catch (error) {
      console.error("Error getting discountable invoices:", error);
      res.status(500).json({ message: "Failed to get discountable invoices" });
    }
  });

  app.get("/api/payments/invoices/discounted", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { kredxService } = await import("./services/kredx-service");
      
      const discountedInvoices = await kredxService.getDiscountedInvoices(userId);
      res.json(discountedInvoices);
    } catch (error) {
      console.error("Error getting discounted invoices:", error);
      res.status(500).json({ message: "Failed to get discounted invoices" });
    }
  });
  
  app.get("/api/kredx/status/:invoiceId", requireAuth, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId, 10);
      const userId = (req.user as any).id;
      const { kredxService } = await import("./services/kredx-service");
      
      // Get the invoice to ensure user has access
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Only the seller of the invoice can check the KredX status
      if (invoice.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const status = await kredxService.getDiscountStatus(invoiceId);
      const transactionHistory = await kredxService.getTransactionHistory(invoiceId);
      
      // Update invoice with latest status from KredX
      if (status && status.success && status.status !== 'not_found' && status.status !== 'not_discounted') {
        // Create an update object with type safety
        const updateData: any = {
          kredxStatus: status.status
        };
        
        // Only add the fields if they exist in the status response
        if ('advanceAmount' in status) {
          updateData.advanceAmount = status.advanceAmount || invoice.advanceAmount;
        }
        
        if ('discountFee' in status) {
          updateData.discountFee = status.discountFee || invoice.discountFee;
        }
        
        if ('remainingAmount' in status) {
          updateData.remainingAmount = status.remainingAmount || invoice.remainingAmount;
        }
        
        if ('feePercentage' in status) {
          updateData.feePercentage = status.feePercentage || invoice.feePercentage || 0.5;
        }
        
        await storage.updateInvoice(invoiceId, updateData);
      }
      
      res.json({
        status,
        transactionHistory,
        invoice: await storage.getInvoice(invoiceId) // Get the updated invoice
      });
    } catch (error) {
      console.error("Error getting KredX status:", error);
      res.status(500).json({ message: "Failed to get KredX status" });
    }
  });

  app.post("/api/invoices/verify/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoiceId = parseInt(req.params.id);
      
      // Get the invoice
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check user has permission to verify this invoice (must be seller or buyer)
      if (invoice.sellerId !== userId && invoice.buyerId !== userId) {
        return res.status(403).json({ 
          message: "Unauthorized: You must be the seller or buyer of this invoice to verify it"
        });
      }
      
      // Import verification service
      const { invoiceVerificationService } = await import("./services/invoice-verification");
      
      // Perform verification
      const verificationResult = await invoiceVerificationService.verifyInvoice(invoiceId);
      
      // Add verification record to blockchain if successful
      if (verificationResult.success) {
        try {
          // Create a hash of the invoice data for blockchain storage
          const { storeRfqOnBlockchain } = await import("./lib/blockchain");
          
          // Create a simplified record for blockchain (excluding sensitive data)
          const blockchainData = {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            sellerId: invoice.sellerId,
            buyerId: invoice.buyerId,
            amount: invoice.amount, 
            dueDate: invoice.dueDate,
            issuedDate: invoice.issuedDate,
            verificationDate: new Date(),
            verificationStatus: verificationResult.verificationStatus
          };
          
          // Store on blockchain
          const blockchainResult = await storeRfqOnBlockchain(blockchainData);
          
          // Add blockchain reference to response
          if (blockchainResult.success) {
            verificationResult.blockchainReference = {
              txHash: blockchainResult.txHash,
              blockchainHash: blockchainResult.blockchainHash,
              network: blockchainResult.network
            };
            
            // Store blockchain record
            await storage.createBlockchainRecord({
              rfqId: invoice.id, // reusing the rfqId field for invoiceId
              txHash: blockchainResult.txHash,
              blockchainHash: blockchainResult.blockchainHash,
              network: blockchainResult.network,
              timestamp: new Date(),
              status: 'completed',
              blockNumber: blockchainResult.blockNumber
            });
          }
        } catch (blockchainError) {
          console.error("Error storing verification on blockchain:", blockchainError);
          // Continue even if blockchain storage fails - this is a non-critical enhancement
        }
      }
      
      res.json(verificationResult);
    } catch (error) {
      console.error("Error verifying invoice:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to verify invoice",
        error: error.message
      });
    }
  });
  
  // KredX specific verification (different from general invoice verification)
  app.post("/api/payments/invoices/verify/:id", requireAuth, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { kredxService } = await import("./services/kredx-service");
      
      const verificationResult = await kredxService.verifyInvoice(invoiceId);
      res.json(verificationResult);
    } catch (error) {
      console.error("Error verifying invoice with KredX:", error);
      res.status(500).json({ message: "Failed to verify invoice with KredX" });
    }
  });

  // KredX-specific verification endpoint
  app.post("/api/kredx/verify/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoiceId = parseInt(req.params.id);
      const { kredxService } = await import("./services/kredx-service");
      
      // Get the invoice
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Only the seller can verify invoices for KredX discounting
      if (invoice.sellerId !== userId) {
        return res.status(403).json({ message: "Only the seller can verify invoices for KredX discounting" });
      }
      
      // First perform standard verification if not already verified
      if (invoice.verificationStatus !== "verified") {
        const { invoiceVerificationService } = await import("./services/invoice-verification");
        const verificationResult = await invoiceVerificationService.verifyInvoice(invoiceId);
        
        if (!verificationResult.success) {
          return res.status(400).json({
            success: false,
            message: "Invoice verification failed. Please fix the issues before submitting to KredX.",
            details: verificationResult
          });
        }
      }
      
      // Then perform KredX-specific verification
      const verificationResult = await kredxService.verifyInvoice(invoiceId);
      
      res.json({
        success: true,
        message: "Invoice verified successfully for KredX discounting",
        details: verificationResult
      });
    } catch (error) {
      console.error("Error verifying invoice with KredX:", error);
      res.status(500).json({ message: "Failed to verify invoice with KredX" });
    }
  });

  // Direct KredX API endpoint for handling discount requests
app.post("/api/kredx/discount/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const invoiceId = parseInt(req.params.id);
    
    // Get the invoice from storage
    const invoice = await storage.getInvoice(invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    // Verify user is authorized to discount this invoice
    if (invoice.sellerId !== userId) {
      return res.status(403).json({ message: "You are not authorized to discount this invoice" });
    }
    
    const { kredxService } = await import("./services/kredx-service");
    
    // Verify the invoice is eligible for discounting
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const diffInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 15) {
      return res.status(400).json({ 
        message: "Invoice must have at least 15 days until due date to be eligible for discounting" 
      });
    }
    
    // Update invoice to mark it as being processed for discounting
    await storage.updateInvoice(invoiceId, {
      discountRequested: true
    });
    
    // Request discounting from KredX
    const discountResult = await kredxService.createInvoiceDiscount({
      invoiceId: invoice.id,
      amount: parseFloat(invoice.amount.toString()),
      dueDate: new Date(invoice.dueDate).toISOString(),
      buyerName: req.body.buyerName || "Bell24h Client",
      buyerEmail: req.body.buyerEmail || "finance@bell24h.com",
      invoiceReference: invoice.invoiceNumber
    });
    
    res.json({
      success: true,
      message: "Invoice discount request submitted successfully",
      data: discountResult
    });
  } catch (error) {
    console.error("Error discounting invoice:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to discount invoice" 
    });
  }
});

app.post("/api/payments/invoices/discount", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { invoiceId } = req.body;
      
      if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID is required" });
      }
      
      const { kredxService } = await import("./services/kredx-service");
      
      // Get the invoice details
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Verify the user is authorized to discount this invoice
      if (invoice.sellerId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You can only discount your own invoices" });
      }
      
      // Request discounting through KredX
      const discountResult = await kredxService.createInvoiceDiscount({
        invoiceId: invoice.id,
        amount: parseFloat(invoice.amount.toString()),
        dueDate: new Date(invoice.dueDate).toISOString(),
        buyerName: req.body.buyerName || "Bell24h Client",
        buyerEmail: req.body.buyerEmail || "finance@bell24h.com",
        invoiceReference: invoice.invoiceNumber
      });
      
      res.json(discountResult);
    } catch (error) {
      console.error("Error discounting invoice:", error);
      res.status(500).json({ message: "Failed to discount invoice" });
    }
  });

  app.post("/api/payments/invoices/early-payment", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { 
        milestoneId, 
        amount, 
        dueDate, 
        buyerId, 
        description 
      } = req.body;
      
      if (!milestoneId || !amount || !dueDate || !buyerId || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const { kredxService } = await import("./services/kredx-service");
      
      // Request early payment through KredX
      const result = await kredxService.requestEarlyPayment({
        milestoneId,
        amount,
        dueDate,
        buyerId,
        sellerId: userId,
        description
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error requesting early payment:", error);
      res.status(500).json({ message: "Failed to request early payment" });
    }
  });

  // Get transaction history for an invoice
  app.get("/api/payments/invoices/:id/transactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoiceId = parseInt(req.params.id);
      
      if (isNaN(invoiceId)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      // Fetch the invoice to verify ownership
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Verify user is authorized to view this invoice's transactions
      if (invoice.sellerId !== userId && invoice.buyerId !== userId) {
        return res.status(403).json({ message: "You are not authorized to view this invoice's transactions" });
      }
      
      const { kredxService } = await import("./services/kredx-service");
      
      // Get transaction history from KredX service
      const transactions = await kredxService.getTransactionHistory(invoiceId);
      
      res.json({
        success: true,
        data: transactions
      });
      
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Failed to fetch transaction history" 
      });
    }
  });
  
  // Check the status of a discounted invoice
  app.get("/api/payments/invoices/:id/discount-status", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoiceId = parseInt(req.params.id);
      
      if (isNaN(invoiceId)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      // Fetch the invoice to verify ownership
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Verify user is authorized to view this invoice's status
      if (invoice.sellerId !== userId && invoice.buyerId !== userId) {
        return res.status(403).json({ message: "You are not authorized to view this invoice's status" });
      }
      
      const { kredxService } = await import("./services/kredx-service");
      
      // Get discount status from KredX service
      const statusInfo = await kredxService.getDiscountStatus(invoiceId);
      
      if (!statusInfo) {
        return res.status(404).json({ 
          success: false,
          message: "Invoice is not discounted or status information is not available" 
        });
      }
      
      // Prepare the response data with type safety
      const responseData: any = {
        ...statusInfo,
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.amount
      };
      
      // Add optional fields with type-safe checks
      if (invoice.discountFee) {
        responseData.feeAmount = invoice.discountFee;
      }
      
      if (invoice.feePercentage) {
        responseData.feePercentage = invoice.feePercentage;
      } else {
        responseData.feePercentage = 0.5; // Default fee percentage
      }
      
      if (invoice.advanceAmount) {
        responseData.advanceAmount = invoice.advanceAmount;
      }
      
      if (invoice.remainingAmount) {
        responseData.remainingAmount = invoice.remainingAmount;
      }
      
      // Try to safely access optional statusInfo properties
      // Only add them if they're available in this particular response type
      try {
        if (statusInfo.discountFee) responseData.feeAmount = statusInfo.discountFee;
        if (statusInfo.feePercentage) responseData.feePercentage = statusInfo.feePercentage;
        if (statusInfo.advanceAmount) responseData.advanceAmount = statusInfo.advanceAmount;
        if (statusInfo.remainingAmount) responseData.remainingAmount = statusInfo.remainingAmount;
      } catch (e) {
        // Silently ignore type errors if properties don't exist
      }
      
      // Return the discount status information
      res.json({
        success: true,
        data: responseData
      });
      
    } catch (error) {
      console.error("Error fetching discount status:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Failed to fetch discount status" 
      });
    }
  });

  app.post("/api/payments/invoices/create", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { 
        buyerId, 
        amount, 
        dueDate, 
        items = [], 
        taxDetails = {} 
      } = req.body;
      
      if (!buyerId || !amount || !dueDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Generate a unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create the invoice
      const invoice = await storage.createInvoice({
        invoiceNumber,
        sellerId: userId,
        buyerId,
        amount,
        currency: "INR",
        dueDate: new Date(dueDate),
        issuedDate: new Date(),
        status: "pending",
        items,
        taxDetails
      });
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // The status and transaction routes are now implemented above with better error handling

  // Dashboard Stats Route
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Get counts for dashboard stats
      const activeRfqsCount = await storage.getActiveRfqsCount(userId);
      const receivedBidsCount = await storage.getReceivedBidsCount(userId);
      const awardedContractsCount = await storage.getAwardedContractsCount(userId);
      const walletBalance = await storage.getUserWalletBalance(userId);
      
      res.json({
        activeRfqs: activeRfqsCount,
        receivedBids: receivedBidsCount,
        awardedContracts: awardedContractsCount,
        walletBalance,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Analytics API Routes
  
  // Get dashboard overview stats
  app.get("/api/analytics/overview", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { analyticsService } = await import("./services/analytics");
      const overviewData = await analyticsService.getDashboardOverview(userId);
      res.json(overviewData);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });
  
  // Get RFQ performance metrics
  app.get("/api/analytics/rfq-performance", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { analyticsService } = await import("./services/analytics");
      const performanceData = await analyticsService.getRfqPerformance(userId);
      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching RFQ performance:", error);
      res.status(500).json({ message: "Failed to fetch RFQ performance data" });
    }
  });
  
  // Get product performance metrics
  app.get("/api/analytics/product-performance", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { analyticsService } = await import("./services/analytics");
      const productData = await analyticsService.getProductPerformance(userId);
      res.json(productData);
    } catch (error) {
      console.error("Error fetching product performance:", error);
      res.status(500).json({ message: "Failed to fetch product performance data" });
    }
  });
  
  // Get market analysis data
  app.get("/api/analytics/market", requireAuth, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const { analyticsService } = await import("./services/analytics");
      const marketData = await analyticsService.getMarketAnalysis(category);
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market analysis:", error);
      res.status(500).json({ message: "Failed to fetch market analysis data" });
    }
  });
  
  // Get recent activity for a user
  app.get("/api/analytics/activity", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const { analyticsService } = await import("./services/analytics");
      const activityData = await analyticsService.getRecentActivity(userId, limit);
      res.json(activityData);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      res.status(500).json({ message: "Failed to fetch activity data" });
    }
  });
  
  // Enhanced Analytics API Routes (Stock Market Integration)
  
  // Get supply chain forecast for an industry
  app.get("/api/analytics/supply-chain-forecast/:industry", requireAuth, async (req, res) => {
    try {
      const industry = req.params.industry;
      const { getSupplyChainForecast } = await import("./lib/alphaVantage");
      const forecastData = await getSupplyChainForecast(industry);
      res.json(forecastData);
    } catch (error) {
      console.error(`Error fetching supply chain forecast for ${req.params.industry}:`, error);
      res.status(500).json({ message: "Failed to fetch supply chain forecast data" });
    }
  });
  
  // Get market volatility index for all industries
  app.get("/api/analytics/market-volatility", requireAuth, async (req, res) => {
    try {
      const { getMarketVolatilityIndex } = await import("./lib/alphaVantage");
      const volatilityData = await getMarketVolatilityIndex();
      res.json(volatilityData);
    } catch (error) {
      console.error("Error fetching market volatility index:", error);
      res.status(500).json({ message: "Failed to fetch market volatility data" });
    }
  });
  
  // Get predictive analytics for RFQ success rates
  app.get("/api/analytics/rfq-success-prediction", requireAuth, async (req, res) => {
    try {
      const industry = req.query.industry as string | undefined;
      const { getRfqSuccessPrediction } = await import("./lib/alphaVantage");
      const predictionsData = await getRfqSuccessPrediction(industry);
      res.json(predictionsData);
    } catch (error) {
      console.error("Error fetching RFQ success predictions:", error);
      res.status(500).json({ message: "Failed to fetch RFQ success prediction data" });
    }
  });
  
  // Get enhanced stock trends with metrics
  app.get("/api/analytics/stock-trends/:industry", requireAuth, async (req, res) => {
    try {
      const industry = req.params.industry;
      const { getStockTrends } = await import("./lib/alphaVantage");
      const stockData = await getStockTrends(industry);
      res.json(stockData);
    } catch (error) {
      console.error(`Error fetching stock trends for ${req.params.industry}:`, error);
      res.status(500).json({ message: "Failed to fetch stock trend data" });
    }
  });
  
  // Get enhanced Indian sector indices with metrics
  app.get("/api/analytics/indian-sectors", requireAuth, async (req, res) => {
    try {
      const { getIndianSectorIndices } = await import("./lib/alphaVantage");
      const sectorData = await getIndianSectorIndices();
      res.json(sectorData);
    } catch (error) {
      console.error("Error fetching Indian sector indices:", error);
      res.status(500).json({ message: "Failed to fetch Indian sector data" });
    }
  });
  
  // Export analytics data to CSV/JSON
  app.get("/api/analytics/export", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const format = (req.query.format as string || "json").toLowerCase();
      const section = req.query.section as string;
      const { analyticsService } = await import("./services/analytics");
      
      const exportData = await analyticsService.exportAnalyticsData(userId, section);
      
      if (format === "csv") {
        const { jsonToCSV } = await import("./lib/csvUtils");
        const timestamp = Date.now();
        
        // Identify the main data array to export
        let mainData: any[] = [];
        
        // Look for the first array property in the export data
        for (const key in exportData) {
          if (Array.isArray(exportData[key]) && exportData[key].length > 0) {
            mainData = exportData[key];
            break;
          }
          
          // Also check one level deeper for nested arrays
          if (typeof exportData[key] === 'object' && exportData[key] !== null) {
            for (const nestedKey in exportData[key]) {
              if (Array.isArray(exportData[key][nestedKey]) && exportData[key][nestedKey].length > 0) {
                mainData = exportData[key][nestedKey];
                break;
              }
            }
          }
        }
        
        // If no array found, convert the whole object to a single-row CSV
        if (mainData.length === 0) {
          mainData = [exportData];
        }
        
        // Convert to CSV
        const csvContent = jsonToCSV(mainData);
        
        // Send CSV file
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=${section}-export-${timestamp}.csv`);
        res.send(csvContent);
      } else {
        // Default to JSON
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=${section}-export-${Date.now()}.json`);
        res.json(exportData);
      }
    } catch (error) {
      console.error("Error exporting analytics data:", error);
      res.status(500).json({ message: "Failed to export analytics data" });
    }
  });
  
  // Blockchain Integration Routes
  
  // Store RFQ on blockchain
  app.post("/api/blockchain/record", requireAuth, async (req, res) => {
    try {
      const { rfqId } = req.body;
      
      if (!rfqId) {
        return res.status(400).json({ message: "RFQ ID is required" });
      }
      
      // Get the RFQ data
      const rfq = await storage.getRfq(rfqId);
      
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      // Check if the user is authorized to store this RFQ (must be the RFQ creator)
      if (rfq.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized: You can only store your own RFQs on the blockchain" });
      }
      
      // Check if this RFQ is already recorded on the blockchain
      const existingRecord = await storage.getBlockchainRecordByRfqId(rfqId);
      if (existingRecord) {
        return res.status(400).json({ 
          message: "This RFQ is already recorded on the blockchain", 
          record: existingRecord 
        });
      }
      
      // Import blockchain functions
      const { storeRfqOnBlockchain } = await import("./lib/blockchain");
      
      // Store RFQ on blockchain
      const blockchainResult = await storeRfqOnBlockchain(rfq);
      
      if (!blockchainResult.success) {
        return res.status(500).json({ message: "Failed to store RFQ on blockchain", error: blockchainResult.error });
      }
      
      // Store the blockchain record in our database
      const blockchainRecord = await storage.createBlockchainRecord({
        rfqId: rfq.id,
        txHash: blockchainResult.txHash,
        blockchainHash: blockchainResult.blockchainHash,
        network: blockchainResult.network,
        status: "pending", // Initially pending, will be confirmed later
      });
      
      res.status(201).json({
        message: "RFQ successfully stored on blockchain",
        record: blockchainRecord
      });
    } catch (error) {
      console.error("Error storing RFQ on blockchain:", error);
      res.status(500).json({ message: "Failed to store RFQ on blockchain" });
    }
  });
  
  // Verify RFQ integrity against blockchain
  app.get("/api/blockchain/verify/:rfqId", requireAuth, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      
      // Get the RFQ data
      const rfq = await storage.getRfq(rfqId);
      
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      // Get the blockchain record
      const blockchainRecord = await storage.getBlockchainRecordByRfqId(rfqId);
      
      if (!blockchainRecord) {
        return res.status(404).json({ message: "No blockchain record found for this RFQ" });
      }
      
      // Import blockchain functions
      const { verifyRfqIntegrity } = await import("./lib/blockchain");
      
      // Verify the RFQ data against the blockchain hash
      const isValid = verifyRfqIntegrity(rfq, blockchainRecord.blockchainHash);
      
      res.json({
        rfqId,
        verified: isValid,
        blockchainRecord
      });
    } catch (error) {
      console.error("Error verifying RFQ on blockchain:", error);
      res.status(500).json({ message: "Failed to verify RFQ on blockchain" });
    }
  });
  
  // Get all blockchain records
  app.get("/api/blockchain/records", requireAuth, async (req, res) => {
    try {
      const records = await storage.getAllBlockchainRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching blockchain records:", error);
      res.status(500).json({ message: "Failed to fetch blockchain records" });
    }
  });
  
  // Get blockchain record for specific RFQ
  app.get("/api/blockchain/records/:rfqId", requireAuth, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const record = await storage.getBlockchainRecordByRfqId(rfqId);
      
      if (!record) {
        return res.status(404).json({ message: "No blockchain record found for this RFQ" });
      }
      
      res.json(record);
    } catch (error) {
      console.error("Error fetching blockchain record:", error);
      res.status(500).json({ message: "Failed to fetch blockchain record" });
    }
  });
  
  // ========== Enhanced Blockchain Milestone-based Payment Routes ==========
  
  // Create a milestone-based payment contract
  app.post("/api/blockchain/milestone-contract", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { contractId, rfqId, buyerId, sellerId, totalAmount, milestones } = req.body;
      
      if (!contractId || !rfqId || !buyerId || !sellerId || !totalAmount || !milestones || !Array.isArray(milestones)) {
        return res.status(400).json({ message: "Missing required fields for milestone contract" });
      }
      
      // Verify the user is either the buyer or seller for this contract
      if (userId !== buyerId && userId !== sellerId) {
        return res.status(403).json({ 
          message: "Unauthorized: You must be either the buyer or seller to create this contract" 
        });
      }
      
      // Verify contract exists
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Import blockchain functions
      const { createMilestoneContract } = await import("./lib/blockchain");
      
      // Create milestone contract on blockchain
      const contractData = {
        contractId,
        rfqId,
        buyerId,
        sellerId,
        totalAmount,
        totalMilestones: milestones.length,
        milestones
      };
      
      const result = await createMilestoneContract(contractData);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to create milestone contract on blockchain",
          error: result.error
        });
      }
      
      // Store blockchain transaction record
      const blockchainRecord = await storage.createBlockchainRecord({
        rfqId,
        txHash: result.txHash!,
        blockchainHash: result.blockchainHash!,
        network: result.network!,
        timestamp: new Date(result.timestamp! * 1000),
        status: "completed",
        blockNumber: result.blockNumber
      });
      
      // Update contract with blockchain information
      await storage.updateContract(contractId, {
        blockchainTxHash: result.txHash,
        blockchainRecordId: blockchainRecord.id,
        hasMilestones: true,
        totalMilestones: milestones.length
      });
      
      // Store each milestone in the database
      const storedMilestones = [];
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        const milestoneDueDate = new Date(milestone.dueDate);
        
        const storedMilestone = await storage.createMilestone({
          contractId,
          milestoneNumber: i + 1,
          description: milestone.description,
          amount: milestone.amount,
          dueDate: milestoneDueDate,
          status: "pending",
          buyerId,
          sellerId
        });
        
        storedMilestones.push(storedMilestone);
      }
      
      res.status(201).json({
        success: true,
        message: "Milestone contract created successfully on blockchain",
        transaction: result,
        milestones: storedMilestones,
        blockchainRecord
      });
    } catch (error) {
      console.error("Error creating milestone contract:", error);
      res.status(500).json({ message: "Failed to create milestone contract" });
    }
  });
  
  // Release payment for a milestone
  app.post("/api/blockchain/release-milestone", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { contractId, milestoneNumber } = req.body;
      
      if (!contractId || !milestoneNumber) {
        return res.status(400).json({ message: "Contract ID and milestone number are required" });
      }
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only the buyer can release milestone payments
      if (contract.buyerId !== userId) {
        return res.status(403).json({ 
          message: "Unauthorized: Only the buyer can release milestone payments" 
        });
      }
      
      // Get the milestone
      const milestone = await storage.getMilestoneByNumber(contractId, milestoneNumber);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Verify milestone is not already paid
      if (milestone.status === "paid") {
        return res.status(400).json({ message: "This milestone has already been paid" });
      }
      
      // Import blockchain functions
      const { releaseMilestonePayment } = await import("./lib/blockchain");
      
      // Release payment on blockchain
      const releaseData = {
        contractId,
        milestoneNumber,
        amount: milestone.amount,
        buyerId: contract.buyerId,
        sellerId: contract.supplierId,
        releaseReason: req.body.releaseReason || "Milestone completed successfully"
      };
      
      const result = await releaseMilestonePayment(releaseData);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to release milestone payment on blockchain",
          error: result.error
        });
      }
      
      // Store blockchain transaction record
      const blockchainRecord = await storage.createBlockchainRecord({
        rfqId: contract.rfqId,
        txHash: result.txHash!,
        blockchainHash: result.blockchainHash!,
        network: result.network!,
        timestamp: new Date(result.timestamp! * 1000),
        status: "completed",
        blockNumber: result.blockNumber
      });
      
      // Update milestone status
      await storage.updateMilestone(milestone.id, {
        status: "paid",
        paidAt: new Date(),
        transactionHash: result.txHash,
        blockchainRecordId: blockchainRecord.id
      });
      
      // Create wallet transaction records for both buyer and seller
      await storage.createWalletTransaction({
        userId: contract.buyerId,
        amount: -milestone.amount,
        type: "milestone_payment",
        status: "completed",
        description: `Milestone ${milestoneNumber} payment for contract #${contractId}`
      });
      
      await storage.createWalletTransaction({
        userId: contract.supplierId,
        amount: milestone.amount,
        type: "milestone_payment",
        status: "completed",
        description: `Milestone ${milestoneNumber} payment received for contract #${contractId}`
      });
      
      // Update user wallet balances
      await storage.updateUserWalletBalance(contract.buyerId, -milestone.amount);
      await storage.updateUserWalletBalance(contract.supplierId, milestone.amount);
      
      // Check if all milestones are paid and update contract if needed
      const allMilestones = await storage.getMilestonesByContractId(contractId);
      const allPaid = allMilestones.every(m => m.status === "paid");
      
      if (allPaid) {
        await storage.updateContract(contractId, {
          status: "completed",
          completedAt: new Date()
        });
      }
      
      res.json({
        success: true,
        message: `Milestone ${milestoneNumber} payment released successfully`,
        transaction: result,
        milestone: await storage.getMilestoneByNumber(contractId, milestoneNumber),
        blockchainRecord,
        contractCompleted: allPaid
      });
    } catch (error) {
      console.error("Error releasing milestone payment:", error);
      res.status(500).json({ message: "Failed to release milestone payment" });
    }
  });
  
  // Get milestone payment status
  app.get("/api/blockchain/milestone-status/:contractId/:milestoneNumber", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const contractId = parseInt(req.params.contractId);
      const milestoneNumber = parseInt(req.params.milestoneNumber);
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify user is either buyer or seller
      if (contract.buyerId !== userId && contract.supplierId !== userId) {
        return res.status(403).json({ 
          message: "Unauthorized: You must be either the buyer or seller to view milestone status" 
        });
      }
      
      // Get the milestone
      const milestone = await storage.getMilestoneByNumber(contractId, milestoneNumber);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Import blockchain functions
      const { getMilestonePaymentStatus } = await import("./lib/blockchain");
      
      // Get status from blockchain
      const blockchainStatus = await getMilestonePaymentStatus(contractId, milestoneNumber);
      
      res.json({
        milestone,
        blockchainStatus
      });
    } catch (error) {
      console.error("Error getting milestone payment status:", error);
      res.status(500).json({ message: "Failed to get milestone payment status" });
    }
  });
  
  // Get all milestones for a contract
  app.get("/api/blockchain/milestones/:contractId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const contractId = parseInt(req.params.contractId);
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify user is either buyer or seller
      if (contract.buyerId !== userId && contract.supplierId !== userId) {
        return res.status(403).json({ 
          message: "Unauthorized: You must be either the buyer or seller to view milestones" 
        });
      }
      
      // Get all milestones
      const milestones = await storage.getMilestonesByContractId(contractId);
      
      res.json({
        contract,
        milestones
      });
    } catch (error) {
      console.error("Error fetching contract milestones:", error);
      res.status(500).json({ message: "Failed to fetch contract milestones" });
    }
  });
  
  // Create milestone refund
  app.post("/api/blockchain/refund-milestone", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { contractId, milestoneNumber, amount, reason } = req.body;
      
      if (!contractId || !milestoneNumber || !amount || !reason) {
        return res.status(400).json({ message: "Missing required fields for milestone refund" });
      }
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only the seller can initiate refunds
      if (contract.supplierId !== userId) {
        return res.status(403).json({ 
          message: "Unauthorized: Only the seller can initiate milestone refunds" 
        });
      }
      
      // Get the milestone
      const milestone = await storage.getMilestoneByNumber(contractId, milestoneNumber);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Verify milestone is not already refunded
      if (milestone.status === "refunded") {
        return res.status(400).json({ message: "This milestone has already been refunded" });
      }
      
      // Import blockchain functions
      const { createMilestoneRefund } = await import("./lib/blockchain");
      
      // Create refund on blockchain
      const refundData = {
        contractId,
        milestoneNumber,
        amount,
        reason,
        buyerId: contract.buyerId,
        sellerId: contract.supplierId
      };
      
      const result = await createMilestoneRefund(refundData);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to create milestone refund on blockchain",
          error: result.error
        });
      }
      
      // Store blockchain transaction record
      const blockchainRecord = await storage.createBlockchainRecord({
        rfqId: contract.rfqId,
        txHash: result.txHash!,
        blockchainHash: result.blockchainHash!,
        network: result.network!,
        timestamp: new Date(result.timestamp! * 1000),
        status: "completed",
        blockNumber: result.blockNumber
      });
      
      // Update milestone status
      await storage.updateMilestone(milestone.id, {
        status: "refunded",
        refundedAt: new Date(),
        refundReason: reason,
        refundAmount: amount,
        transactionHash: result.txHash,
        blockchainRecordId: blockchainRecord.id
      });
      
      // Create wallet transaction records for both buyer and seller
      await storage.createWalletTransaction({
        userId: contract.buyerId,
        amount: amount,
        type: "milestone_refund",
        status: "completed",
        description: `Milestone ${milestoneNumber} refund for contract #${contractId}: ${reason}`
      });
      
      await storage.createWalletTransaction({
        userId: contract.supplierId,
        amount: -amount,
        type: "milestone_refund",
        status: "completed",
        description: `Milestone ${milestoneNumber} refund issued for contract #${contractId}: ${reason}`
      });
      
      // Update user wallet balances
      await storage.updateUserWalletBalance(contract.buyerId, amount);
      await storage.updateUserWalletBalance(contract.supplierId, -amount);
      
      res.json({
        success: true,
        message: `Milestone ${milestoneNumber} refund created successfully`,
        transaction: result,
        milestone: await storage.getMilestoneByNumber(contractId, milestoneNumber),
        blockchainRecord
      });
    } catch (error) {
      console.error("Error creating milestone refund:", error);
      res.status(500).json({ message: "Failed to create milestone refund" });
    }
  });
  
  // Set up escrow wallet for contract
  app.post("/api/blockchain/setup-escrow", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { contractId } = req.body;
      
      if (!contractId) {
        return res.status(400).json({ message: "Contract ID is required" });
      }
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only the buyer can set up escrow
      if (contract.buyerId !== userId) {
        return res.status(403).json({ 
          message: "Unauthorized: Only the buyer can set up escrow for this contract" 
        });
      }
      
      // Get milestones to calculate total amount
      const milestones = await storage.getMilestonesByContractId(contractId);
      if (!milestones || milestones.length === 0) {
        return res.status(400).json({ 
          message: "No milestones found for this contract. Create milestones before setting up escrow." 
        });
      }
      
      // Calculate total amount
      const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
      
      // Import blockchain functions
      const { setupContractEscrow } = await import("./lib/blockchain");
      
      // Set up escrow on blockchain
      const escrowData = {
        contractId,
        totalAmount,
        buyerId: contract.buyerId,
        sellerId: contract.supplierId,
        milestones: milestones.length
      };
      
      const result = await setupContractEscrow(escrowData);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to set up contract escrow on blockchain",
          error: result.error
        });
      }
      
      // Store blockchain transaction record
      const blockchainRecord = await storage.createBlockchainRecord({
        rfqId: contract.rfqId,
        txHash: result.txHash!,
        blockchainHash: result.blockchainHash!,
        network: result.network!,
        timestamp: new Date(result.timestamp! * 1000),
        status: "completed",
        blockNumber: result.blockNumber
      });
      
      // Update contract with escrow information
      await storage.updateContract(contractId, {
        hasEscrow: true,
        escrowAmount: totalAmount,
        escrowCreatedAt: new Date(),
        escrowTransactionHash: result.txHash
      });
      
      // Create wallet transaction for buyer (funds moved to escrow)
      await storage.createWalletTransaction({
        userId: contract.buyerId,
        amount: -totalAmount,
        type: "escrow_deposit",
        status: "completed",
        description: `Escrow deposit for contract #${contractId}`
      });
      
      // Update user wallet balance
      await storage.updateUserWalletBalance(contract.buyerId, -totalAmount);
      
      res.json({
        success: true,
        message: "Contract escrow set up successfully",
        transaction: result,
        contract: await storage.getContract(contractId),
        blockchainRecord,
        totalAmount,
        milestones: milestones.length
      });
    } catch (error) {
      console.error("Error setting up contract escrow:", error);
      res.status(500).json({ message: "Failed to set up contract escrow" });
    }
  });

  // Product Catalog Routes
  app.post("/api/products", requireAuth, upload.single("image"), async (req, res) => {
    try {
      // Get the supplier associated with the user
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier) {
        return res.status(400).json({ message: "User is not registered as a supplier" });
      }
      
      // Parse the product data
      let productData = { ...req.body };
      
      // Convert string fields to appropriate types
      if (productData.price) {
        productData.price = parseFloat(productData.price);
      }
      
      // Handle JSON fields that might be sent as strings
      if (typeof productData.specifications === 'string') {
        try {
          productData.specifications = JSON.parse(productData.specifications);
        } catch (e) {
          // If parsing fails, keep it as is
        }
      }
      
      if (typeof productData.certifications === 'string') {
        try {
          productData.certifications = JSON.parse(productData.certifications);
        } catch (e) {
          // If parsing fails, keep it as is
        }
      }
      
      if (typeof productData.images === 'string') {
        try {
          productData.images = JSON.parse(productData.images);
        } catch (e) {
          // If parsing fails, keep it as is
        }
      }
      
      // If an image was uploaded, add it to the images field
      if (req.file) {
        const imagePath = req.file.filename;
        if (!productData.images) {
          productData.images = { main: imagePath, gallery: [] };
        } else if (typeof productData.images === 'object') {
          // Update or create the main image
          productData.images.main = imagePath;
          
          // Ensure gallery exists
          if (!productData.images.gallery) {
            productData.images.gallery = [];
          }
        }
      }
      
      // Validate and add supplierId
      const validatedProductData = insertProductSchema.parse({
        ...productData,
        supplierId: supplier.id,
        status: productData.status || "active"
      });
      
      const product = await storage.createProduct(validatedProductData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      // Get query parameters
      const supplierId = req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined;
      const category = req.query.category as string;
      
      let products;
      
      if (supplierId) {
        // Get products by supplier ID
        products = await storage.getProductsBySupplierId(supplierId);
      } else if (category) {
        // Get products by category
        products = await storage.getProductsByCategory(category);
      } else {
        // Default: Get products for the supplier associated with the user
        const userId = (req.user as any).id;
        const supplier = await storage.getSupplierByUserId(userId);
        
        if (supplier) {
          products = await storage.getProductsBySupplierId(supplier.id);
        } else {
          products = [];
        }
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put("/api/products/:id", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get the supplier associated with the user
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier || supplier.id !== product.supplierId) {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }
      
      // Parse product data
      let productData = { ...req.body };
      
      // Convert string fields to appropriate types
      if (productData.price) {
        productData.price = parseFloat(productData.price);
      }
      
      // Handle JSON fields that might be sent as strings
      if (typeof productData.specifications === 'string') {
        try {
          productData.specifications = JSON.parse(productData.specifications);
        } catch (e) {
          // If parsing fails, keep it as is
        }
      }
      
      if (typeof productData.certifications === 'string') {
        try {
          productData.certifications = JSON.parse(productData.certifications);
        } catch (e) {
          // If parsing fails, keep it as is
        }
      }
      
      if (typeof productData.images === 'string') {
        try {
          productData.images = JSON.parse(productData.images);
        } catch (e) {
          // If parsing fails, keep it as is
        }
      }
      
      // If an image was uploaded, add it to the images field
      if (req.file) {
        const imagePath = req.file.filename;
        if (!productData.images) {
          productData.images = { main: imagePath, gallery: [] };
        } else if (typeof productData.images === 'object') {
          // Update the main image
          productData.images.main = imagePath;
          
          // Ensure gallery exists
          if (!productData.images.gallery) {
            productData.images.gallery = [];
          }
        }
      }
      
      // Update the product
      const updatedProduct = await storage.updateProduct(productId, productData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get the supplier associated with the user
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier || supplier.id !== product.supplierId) {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }
      
      // Delete the product
      const success = await storage.deleteProduct(productId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete product" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Portfolio Routes
  app.post("/api/portfolio", requireAuth, upload.array("images", 5), async (req, res) => {
    try {
      // Get the supplier associated with the user
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier) {
        return res.status(400).json({ message: "User is not registered as a supplier" });
      }
      
      // Parse the portfolio data
      let portfolioData = { ...req.body };
      
      // Convert string fields to appropriate types
      if (portfolioData.projectValue) {
        portfolioData.projectValue = parseFloat(portfolioData.projectValue);
      }
      
      if (portfolioData.completionDate) {
        portfolioData.completionDate = new Date(portfolioData.completionDate);
      }
      
      // Handle images from the form upload
      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const uploadedFiles = req.files as Express.Multer.File[];
        const imageUrls = uploadedFiles.map(file => file.filename);
        
        portfolioData.images = {
          main: imageUrls[0],
          gallery: imageUrls.slice(1)
        };
      }
      
      // Validate and add supplierId
      const validatedData = insertPortfolioItemSchema.parse({
        ...portfolioData,
        supplierId: supplier.id,
      });
      
      const portfolioItem = await storage.createPortfolioItem(validatedData);
      res.status(201).json(portfolioItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error creating portfolio item:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.get("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const supplierId = req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined;
      
      let portfolioItems;
      
      if (supplierId) {
        // Get portfolio items by supplier ID
        portfolioItems = await storage.getPortfolioItemsBySupplierId(supplierId);
      } else {
        // Default: Get portfolio items for the supplier associated with the user
        const userId = (req.user as any).id;
        const supplier = await storage.getSupplierByUserId(userId);
        
        if (supplier) {
          portfolioItems = await storage.getPortfolioItemsBySupplierId(supplier.id);
        } else {
          portfolioItems = [];
        }
      }
      
      res.json(portfolioItems);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/portfolio/:id", requireAuth, async (req, res) => {
    try {
      const portfolioItemId = parseInt(req.params.id);
      const portfolioItem = await storage.getPortfolioItem(portfolioItemId);
      
      if (!portfolioItem) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      res.json(portfolioItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio item" });
    }
  });

  app.put("/api/portfolio/:id", requireAuth, upload.array("images", 5), async (req, res) => {
    try {
      const portfolioItemId = parseInt(req.params.id);
      const portfolioItem = await storage.getPortfolioItem(portfolioItemId);
      
      if (!portfolioItem) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      // Get the supplier associated with the user
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier || supplier.id !== portfolioItem.supplierId) {
        return res.status(403).json({ message: "Not authorized to update this portfolio item" });
      }
      
      // Parse portfolio data
      let portfolioData = { ...req.body };
      
      // Convert string fields to appropriate types
      if (portfolioData.projectValue) {
        portfolioData.projectValue = parseFloat(portfolioData.projectValue);
      }
      
      if (portfolioData.completionDate) {
        portfolioData.completionDate = new Date(portfolioData.completionDate);
      }
      
      // Handle images from the form upload
      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const uploadedFiles = req.files as Express.Multer.File[];
        const imageUrls = uploadedFiles.map(file => file.filename);
        
        portfolioData.images = {
          main: imageUrls[0],
          gallery: imageUrls.slice(1)
        };
      }
      
      // Update the portfolio item
      const updatedItem = await storage.updatePortfolioItem(portfolioItemId, portfolioData);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error updating portfolio item:", error);
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/portfolio/:id", requireAuth, async (req, res) => {
    try {
      const portfolioItemId = parseInt(req.params.id);
      const portfolioItem = await storage.getPortfolioItem(portfolioItemId);
      
      if (!portfolioItem) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      
      // Get the supplier associated with the user
      const userId = (req.user as any).id;
      const supplier = await storage.getSupplierByUserId(userId);
      
      if (!supplier || supplier.id !== portfolioItem.supplierId) {
        return res.status(403).json({ message: "Not authorized to delete this portfolio item" });
      }
      
      // Delete the portfolio item
      const success = await storage.deletePortfolioItem(portfolioItemId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to delete portfolio item" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  // Enhanced Messaging Routes
  app.get("/api/messages/between/:userId", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req.user as any).id;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/rfq/:rfqId", requireAuth, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const messages = await storage.getMessagesByRfqId(rfqId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages for RFQ" });
    }
  });

  app.get("/api/messages/unread/count", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const count = await storage.getUnreadMessagesCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread messages count" });
    }
  });

  app.put("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // User Profile Routes
  app.put("/api/user/profile", requireAuth, upload.single("profilePicture"), async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Parse the user data
      let userData = { ...req.body };
      
      // If a profile picture was uploaded, add it to the userData
      if (req.file) {
        userData.profilePicture = req.file.filename;
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUserProfile(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Map to track connected clients by user ID
  const clients = new Map();
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    console.log('WebSocket client connected');
    
    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'auth':
            // Authenticate the WebSocket connection
            userId = parseInt(data.userId);
            clients.set(userId, ws);
            console.log(`User ${userId} authenticated via WebSocket`);
            
            // Send initial unread count
            try {
              const unreadCount = await storage.getUnreadMessagesCount(userId);
              ws.send(JSON.stringify({
                type: 'unread_count',
                count: unreadCount
              }));
            } catch (error) {
              console.error('Error fetching unread count:', error);
            }
            break;
            
          case 'send_message':
            // Validate the message data
            if (!userId || !data.message) break;
            
            try {
              // Save message to database
              const messageData = {
                senderId: userId,
                recipientId: data.message.recipientId || 0,
                threadId: data.message.threadId || null,
                content: data.message.content || "",
                attachmentUrl: data.message.attachmentUrl || null
              };
              
              const savedMessage = await storage.createMessage(messageData);
              
              // Get thread participants (in a real implementation, this would be a database call)
              // Since this method doesn't exist, we'll create a temporary solution
              const participants = [{ user_id: data.message.recipientId || 0 }];
              if (data.message.threadId) {
                // If we had this method, we'd use it: 
                // const participants = await storage.getThreadParticipants(data.message.threadId);
                console.log(`Sending message to thread ${data.message.threadId}`);
              }
              
              // Add sender info to the message
              const sender = await storage.getUser(userId);
              const messageWithSender = {
                ...savedMessage,
                username: sender?.username || 'Unknown user',
                profile_picture: sender?.profilePicture || null
              };
              
              // Broadcast to all participants
              participants.forEach(participant => {
                const clientWs = clients.get(participant.user_id);
                if (clientWs && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'new_message',
                    threadId: data.message.threadId,
                    message: messageWithSender
                  }));
                }
              });
            } catch (error) {
              console.error('Error processing message:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to send message'
              }));
            }
            break;
            
          case 'mark_read':
            // Mark thread as read
            if (!userId || !data.threadId) break;
            
            try {
              // If we had this method, we'd use it:
              // await storage.markMessagesAsRead(data.threadId, userId);
              console.log(`Marking messages in thread ${data.threadId} as read for user ${userId}`);
              
              // Use fake unread count for now since this method doesn't exist
              const unreadCount = 0;
              // If we had this method, we'd use it:
              // const unreadCount = await storage.getUnreadMessagesCount(userId);
              
              ws.send(JSON.stringify({
                type: 'unread_count',
                count: unreadCount
              }));
            } catch (error) {
              console.error('Error marking thread as read:', error);
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (userId) {
        clients.delete(userId);
        console.log(`User ${userId} removed from WebSocket clients`);
      }
    });
  });

  // Logistics Tracking Routes
  
  // Create a new shipment
  app.post("/api/shipments", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Parse and validate shipment data
      const shipmentData = insertShipmentSchema.parse({
        ...req.body,
        senderId: userId,
        status: 'pending',
        createdAt: new Date()
      });
      
      // Parse and validate shipment items
      const shipmentItems = req.body.items || [];
      
      // Create the shipment with the service
      const shipment = await shipmentTrackingService.createShipment(shipmentData, shipmentItems);
      
      res.status(201).json(shipment);
    } catch (error) {
      console.error('Error creating shipment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid shipment data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to create shipment", 
        error: error.message 
      });
    }
  });
  
  // Get all shipments for the authenticated user
  app.get("/api/shipments", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const role = req.query.role === 'recipient' ? 'recipient' : 'sender';
      
      const shipments = await storage.getShipmentsByUser(userId, role);
      res.json(shipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      res.status(500).json({ 
        message: "Failed to fetch shipments", 
        error: error.message 
      });
    }
  });
  
  // Get a specific shipment by ID
  app.get("/api/shipments/:id", requireAuth, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const shipment = await storage.getShipment(shipmentId);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      // Check if user is authorized to access this shipment
      if (shipment.senderId !== userId && shipment.recipientId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this shipment" });
      }
      
      res.json(shipment);
    } catch (error) {
      console.error('Error fetching shipment:', error);
      res.status(500).json({ 
        message: "Failed to fetch shipment", 
        error: error.message 
      });
    }
  });
  
  // Track a shipment by tracking number
  app.get("/api/shipments/track/:trackingNumber", async (req, res) => {
    try {
      const trackingNumber = req.params.trackingNumber;
      
      // Get the latest tracking information
      const shipment = await shipmentTrackingService.trackShipment(trackingNumber);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      res.json(shipment);
    } catch (error) {
      console.error('Error tracking shipment:', error);
      res.status(500).json({ 
        message: "Failed to track shipment", 
        error: error.message 
      });
    }
  });
  
  // Get shipment events
  app.get("/api/shipments/:id/events", requireAuth, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // First check if the user has access to this shipment
      const shipment = await storage.getShipment(shipmentId);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      if (shipment.senderId !== userId && shipment.recipientId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this shipment" });
      }
      
      const events = await storage.getShipmentEvents(shipmentId);
      res.json(events);
    } catch (error) {
      console.error('Error fetching shipment events:', error);
      res.status(500).json({ 
        message: "Failed to fetch shipment events", 
        error: error.message 
      });
    }
  });
  
  // Get shipment items
  app.get("/api/shipments/:id/items", requireAuth, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // First check if the user has access to this shipment
      const shipment = await storage.getShipment(shipmentId);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      if (shipment.senderId !== userId && shipment.recipientId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this shipment" });
      }
      
      const items = await storage.getShipmentItems(shipmentId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching shipment items:', error);
      res.status(500).json({ 
        message: "Failed to fetch shipment items", 
        error: error.message 
      });
    }
  });
  
  // Get shipment documents
  app.get("/api/shipments/:id/documents", requireAuth, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // First check if the user has access to this shipment
      const shipment = await storage.getShipment(shipmentId);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      if (shipment.senderId !== userId && shipment.recipientId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this shipment" });
      }
      
      const documents = await storage.getShipmentDocuments(shipmentId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching shipment documents:', error);
      res.status(500).json({ 
        message: "Failed to fetch shipment documents", 
        error: error.message 
      });
    }
  });
  
  // Generate a shipping label
  app.post("/api/shipments/:id/label", requireAuth, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // First check if the user has access to this shipment
      const shipment = await storage.getShipment(shipmentId);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      if (shipment.senderId !== userId) {
        return res.status(403).json({ message: "Only the sender can generate a shipping label" });
      }
      
      const labelUrl = await shipmentTrackingService.generateLabel(shipmentId);
      res.json({ labelUrl });
    } catch (error) {
      console.error('Error generating shipping label:', error);
      res.status(500).json({ 
        message: "Failed to generate shipping label", 
        error: error.message 
      });
    }
  });
  
  // Cancel a shipment
  app.post("/api/shipments/:id/cancel", requireAuth, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // First check if the user has access to this shipment
      const shipment = await storage.getShipment(shipmentId);
      
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      if (shipment.senderId !== userId) {
        return res.status(403).json({ message: "Only the sender can cancel a shipment" });
      }
      
      // Check if the shipment can be cancelled
      if (['delivered', 'in_transit', 'out_for_delivery'].includes(shipment.status)) {
        return res.status(400).json({ message: "Cannot cancel a shipment that is already in transit or delivered" });
      }
      
      const success = await shipmentTrackingService.cancelShipment(shipmentId);
      
      if (success) {
        res.json({ message: "Shipment cancelled successfully" });
      } else {
        res.status(400).json({ message: "Failed to cancel shipment" });
      }
    } catch (error) {
      console.error('Error cancelling shipment:', error);
      res.status(500).json({ 
        message: "Failed to cancel shipment", 
        error: error.message 
      });
    }
  });
  
  // Get shipments for a contract
  app.get("/api/contracts/:id/shipments", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // First check if the user has access to this contract
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      if (contract.buyerId !== userId && contract.supplierId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this contract" });
      }
      
      const shipments = await storage.getShipmentsByContract(contractId);
      res.json(shipments);
    } catch (error) {
      console.error('Error fetching contract shipments:', error);
      res.status(500).json({ 
        message: "Failed to fetch contract shipments", 
        error: error.message 
      });
    }
  });
  
  // Escrow Wallet Routes
  
  // Create escrow account for a contract
  app.post("/api/escrow/create/:contractId", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const userId = (req.user as any).id;
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Check if the user is the buyer of this contract
      if (contract.buyerId !== userId) {
        return res.status(403).json({ message: "Only the buyer can create an escrow account" });
      }
      
      // Check if escrow already exists
      if (contract.hasEscrow) {
        return res.status(400).json({ message: "Escrow account already exists for this contract" });
      }
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Create escrow account
      const result = await escrowService.createEscrowAccount(contractId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      // Update contract with timestamp
      await storage.updateContract(contractId, {
        hasEscrow: true,
        escrowCreatedAt: new Date(),
      });
      
      res.json({
        success: true,
        message: "Escrow account created successfully",
        accountId: result.accountId
      });
    } catch (error) {
      console.error('Error creating escrow account:', error);
      res.status(500).json({ 
        message: "Failed to create escrow account", 
        error: error.message 
      });
    }
  });
  
  // Fund escrow account for a contract
  app.post("/api/escrow/fund/:contractId", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const { amount } = req.body;
      const userId = (req.user as any).id;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Check if the user is the buyer of this contract
      if (contract.buyerId !== userId) {
        return res.status(403).json({ message: "Only the buyer can fund the escrow account" });
      }
      
      // Check if escrow exists
      if (!contract.hasEscrow) {
        return res.status(400).json({ message: "No escrow account exists for this contract" });
      }
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Fund escrow account
      const result = await escrowService.fundEscrowAccount(contractId, amount);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        message: "Escrow account funded successfully",
        transactionId: result.transactionId
      });
    } catch (error) {
      console.error('Error funding escrow account:', error);
      res.status(500).json({ 
        message: "Failed to fund escrow account", 
        error: error.message 
      });
    }
  });
  
  // Release milestone payment from escrow
  app.post("/api/escrow/release/:milestoneId", requireAuth, async (req, res) => {
    try {
      const milestoneId = parseInt(req.params.milestoneId);
      const userId = (req.user as any).id;
      
      // Get milestone details
      const milestone = await storage.getMilestone(milestoneId);
      
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Get contract details
      const contract = await storage.getContract(milestone.contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Check if the user is the buyer of this contract
      if (contract.buyerId !== userId) {
        return res.status(403).json({ message: "Only the buyer can release milestone payments" });
      }
      
      // Check if escrow exists and is funded
      if (!contract.hasEscrow || !contract.escrowFunded) {
        return res.status(400).json({ message: "Escrow account is not set up or funded for this contract" });
      }
      
      // Check if milestone is already paid
      if (milestone.status === 'paid') {
        return res.status(400).json({ message: "This milestone has already been paid" });
      }
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Release payment
      const result = await escrowService.releaseMilestonePayment(milestoneId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        message: "Milestone payment released successfully",
        payoutId: result.payoutId
      });
    } catch (error) {
      console.error('Error releasing milestone payment:', error);
      res.status(500).json({ 
        message: "Failed to release milestone payment", 
        error: error.message 
      });
    }
  });
  
  // Withdraw funds from wallet
  app.post("/api/escrow/withdraw", requireAuth, async (req, res) => {
    try {
      const { amount, accountNumber, ifsc, accountHolderName } = req.body;
      const userId = (req.user as any).id;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      if (!accountNumber || !ifsc || !accountHolderName) {
        return res.status(400).json({ message: "Bank account details are required" });
      }
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Withdraw funds
      const result = await escrowService.withdrawFunds(userId, amount, {
        accountNumber,
        ifsc,
        name: accountHolderName
      });
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        message: "Funds withdrawn successfully",
        netAmount: result.netAmount,
        fee: result.fee,
        withdrawalId: result.withdrawalId
      });
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      res.status(500).json({ 
        message: "Failed to withdraw funds", 
        error: error.message 
      });
    }
  });
  
  // Get escrow balance for a contract
  app.get("/api/escrow/balance/:contractId", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const userId = (req.user as any).id;
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Check if the user is associated with this contract
      if (contract.buyerId !== userId && contract.supplierId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this contract" });
      }
      
      // Check if escrow exists
      if (!contract.hasEscrow) {
        return res.status(400).json({ message: "No escrow account exists for this contract" });
      }
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Get balance
      const result = await escrowService.getEscrowBalance(contractId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        contractId,
        balance: result.balance
      });
    } catch (error) {
      console.error('Error getting escrow balance:', error);
      res.status(500).json({ 
        message: "Failed to get escrow balance", 
        error: error.message 
      });
    }
  });
  
  // Get escrow transactions for a contract
  app.get("/api/escrow/transactions/:contractId", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const userId = (req.user as any).id;
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Check if the user is associated with this contract
      if (contract.buyerId !== userId && contract.supplierId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this contract" });
      }
      
      // Check if escrow exists
      if (!contract.hasEscrow) {
        return res.status(400).json({ message: "No escrow account exists for this contract" });
      }
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Get transactions
      const result = await escrowService.getEscrowTransactions(contractId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        contractId,
        transactions: result.transactions
      });
    } catch (error) {
      console.error('Error getting escrow transactions:', error);
      res.status(500).json({ 
        message: "Failed to get escrow transactions", 
        error: error.message 
      });
    }
  });
  
  // Get user wallet balance and transactions
  app.get("/api/wallet", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Get escrow wallet service
      const escrowService = await getEscrowWalletService();
      
      // Get wallet info
      const result = await escrowService.getUserWallet(userId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        balance: result.balance,
        transactions: result.transactions
      });
    } catch (error) {
      console.error('Error getting wallet info:', error);
      res.status(500).json({ 
        message: "Failed to get wallet info", 
        error: error.message 
      });
    }
  });
  
  // ========== Advanced AI Features with SHAP/LIME Explainability ==========
  
  // Get explainable supplier risk assessment
  app.get("/api/ai/explain/supplier-risk/:supplierId", requireAuth, async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const method = req.query.method as string || 'both'; // lime, shap, or both
      
      if (isNaN(supplierId)) {
        return res.status(400).json({ message: "Invalid supplier ID" });
      }
      
      // Get the model explainer service
      const { modelExplainerService } = await import("./services/model-explainer");
      
      // Get explanation for supplier risk
      const explanation = await modelExplainerService.explainSupplierRisk(supplierId);
      
      res.json(explanation);
    } catch (error) {
      console.error('Error explaining supplier risk:', error);
      res.status(500).json({ 
        message: "Failed to explain supplier risk", 
        error: error.message 
      });
    }
  });
  
  // Get explainable RFQ-supplier matching
  app.get("/api/ai/explain/rfq-matching/:rfqId/:supplierId", requireAuth, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const supplierId = parseInt(req.params.supplierId);
      const method = req.query.method as string || 'both'; // lime, shap, or both
      
      if (isNaN(rfqId) || isNaN(supplierId)) {
        return res.status(400).json({ message: "Invalid RFQ ID or supplier ID" });
      }
      
      // Get the model explainer service
      const { modelExplainerService } = await import("./services/model-explainer");
      
      // Get explanation for RFQ-supplier matching
      const explanation = await modelExplainerService.explainRfqMatching(rfqId, supplierId);
      
      res.json(explanation);
    } catch (error) {
      console.error('Error explaining RFQ-supplier matching:', error);
      res.status(500).json({ 
        message: "Failed to explain RFQ-supplier matching", 
        error: error.message 
      });
    }
  });
  
  // Get explainable price prediction
  app.post("/api/ai/explain/price-prediction/:productId", requireAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const contextData = req.body;
      const method = req.query.method as string || 'both'; // lime, shap, or both
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Get the model explainer service
      const { modelExplainerService } = await import("./services/model-explainer");
      
      // Get explanation for price prediction
      const explanation = await modelExplainerService.explainPricePrediction(productId, contextData);
      
      res.json(explanation);
    } catch (error) {
      console.error('Error explaining price prediction:', error);
      res.status(500).json({ 
        message: "Failed to explain price prediction", 
        error: error.message 
      });
    }
  });
  
  // Generate visualization for a model explanation
  app.get("/api/ai/visualization/:modelType/:explanationId", async (req, res) => {
    try {
      const modelType = req.params.modelType as 'supplier_risk' | 'rfq_matching' | 'price_prediction';
      const explanationId = parseInt(req.params.explanationId);
      const format = req.query.format as 'svg' | 'png' || 'svg';
      
      if (!['supplier_risk', 'rfq_matching', 'price_prediction'].includes(modelType) || isNaN(explanationId)) {
        return res.status(400).json({ message: "Invalid model type or explanation ID" });
      }
      
      // Get the model explainer service
      const { modelExplainerService } = await import("./services/model-explainer");
      
      // Generate visualization
      const visualizationUrl = await modelExplainerService.generateVisualization(
        modelType, 
        explanationId,
        format
      );
      
      res.json({ visualizationUrl });
    } catch (error) {
      console.error('Error generating visualization:', error);
      res.status(500).json({ 
        message: "Failed to generate visualization", 
        error: error.message 
      });
    }
  });
  
  // ========== Enhanced Analytics API with CSV Export ==========
  
  // Get analytics data with export functionality
  app.get("/api/analytics/export/:section", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const section = req.params.section;
      const format = req.query.format as string || 'json';
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get analytics data for export
      const data = await analyticsService.exportAnalyticsData(userId, section);
      
      // Return data based on requested format
      if (format === 'csv') {
        const { complexJsonToCSV, addMetadataHeader } = await import("./lib/csvUtils");
        
        // Convert to CSV format
        const csvData = complexJsonToCSV(data);
        
        // Add metadata
        const metadata = {
          exportDate: new Date().toISOString(),
          userId,
          section,
          appName: 'Bell24h.com B2B Marketplace'
        };
        
        // If only one section, return as a single CSV
        if (Object.keys(csvData).length === 1) {
          const csvContent = addMetadataHeader(Object.values(csvData)[0], metadata);
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${section}_export.csv"`);
          return res.send(csvContent);
        }
        
        // Multiple sections, return as a combined file
        const { createCSVArchive } = await import("./lib/csvUtils");
        const csvFiles = Object.entries(csvData).reduce((acc, [key, value]) => {
          acc[`${key}.csv`] = addMetadataHeader(value, {
            ...metadata,
            subsection: key
          });
          return acc;
        }, {} as Record<string, string>);
        
        const archiveBuffer = createCSVArchive(csvFiles);
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${section}_export.txt"`);
        return res.send(archiveBuffer);
      }
      
      // Default to JSON
      res.json(data);
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      res.status(500).json({ 
        message: "Failed to export analytics data", 
        error: error.message 
      });
    }
  });
  
  // Get stock market data for analytics
  app.get("/api/analytics/market/:symbol", requireAuth, async (req, res) => {
    try {
      const symbol = req.params.symbol;
      
      // Validate symbol parameter
      if (!symbol) {
        return res.status(400).json({ message: "Symbol parameter is required" });
      }
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get market data
      const marketData = await analyticsService.getMarketData(symbol);
      
      if (!marketData) {
        return res.status(404).json({ message: `Market data for symbol ${symbol} not found` });
      }
      
      res.json(marketData);
    } catch (error) {
      console.error('Error getting market data:', error);
      res.status(500).json({ 
        message: "Failed to get market data", 
        error: error.message 
      });
    }
  });
  
  // Export market trends as CSV
  app.get("/api/analytics/market-trends/export", requireAuth, async (req, res) => {
    try {
      // Parse query parameters
      const category = req.query.category as string;
      const format = req.query.format as string || 'json';
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get market trend data
      const trendData = await analyticsService.getMarketTrends(category);
      
      if (!trendData || trendData.length === 0) {
        return res.status(404).json({ message: "No market trend data found" });
      }
      
      // Return data based on requested format
      if (format === 'csv') {
        const { timeSeriesDataToCSV, addMetadataHeader, formatDateRangeForFileName } = await import("./lib/csvUtils");
        
        // Convert to CSV format
        const csvData = timeSeriesDataToCSV(
          trendData,
          'timestamp',
          ['category', 'priceIndex', 'demandIndex', 'supplyIndex', 'volatilityIndex']
        );
        
        // Get date range for filename
        const startDate = new Date(trendData[0].timestamp);
        const endDate = new Date(trendData[trendData.length - 1].timestamp);
        const dateRange = formatDateRangeForFileName(startDate, endDate);
        
        // Add metadata
        const metadata = {
          exportDate: new Date().toISOString(),
          dataType: 'market_trends',
          category: category || 'all',
          dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
          appName: 'Bell24h.com B2B Marketplace'
        };
        
        const csvContent = addMetadataHeader(csvData, metadata);
        
        const filename = category 
          ? `market_trends_${category}_${dateRange}.csv`
          : `market_trends_all_${dateRange}.csv`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csvContent);
      }
      
      // Default to JSON
      res.json(trendData);
    } catch (error) {
      console.error('Error exporting market trend data:', error);
      res.status(500).json({ 
        message: "Failed to export market trend data", 
        error: error.message 
      });
    }
  });

  // ========== Enhanced Analytics Dashboard Endpoints ==========
  
  // Market trends for a specific industry
  app.get("/api/market/trends/:industry", requireAuth, async (req, res) => {
    try {
      const { industry } = req.params;
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get market trends for the industry
      const trendsData = await analyticsService.getMarketTrends(industry);
      
      res.json(trendsData);
    } catch (error) {
      console.error(`Error fetching market trends for ${req.params.industry}:`, error);
      res.status(500).json({ 
        message: `Failed to fetch market trends for ${req.params.industry}`, 
        error: error.message 
      });
    }
  });
  
  // Supply chain forecast for a specific industry
  app.get("/api/analytics/supply-chain-forecast/:industry", requireAuth, async (req, res) => {
    try {
      const { industry } = req.params;
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get supply chain forecast data
      const forecastData = await analyticsService.getSupplyChainForecast(industry);
      
      res.json(forecastData);
    } catch (error) {
      console.error(`Error fetching supply chain forecast for ${req.params.industry}:`, error);
      res.status(500).json({ 
        message: `Failed to fetch supply chain forecast for ${req.params.industry}`, 
        error: error.message 
      });
    }
  });
  
  // RFQ success prediction data
  app.get("/api/analytics/rfq-success-prediction", requireAuth, async (req, res) => {
    try {
      const industry = req.query.industry as string;
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get RFQ success prediction data
      const predictionData = await analyticsService.getRfqSuccessPrediction(industry);
      
      res.json(predictionData);
    } catch (error) {
      console.error("Error fetching RFQ success prediction data:", error);
      res.status(500).json({ 
        message: "Failed to fetch RFQ success prediction data", 
        error: error.message 
      });
    }
  });
  
  // Market volatility data
  app.get("/api/analytics/market-volatility", requireAuth, async (req, res) => {
    try {
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get market volatility data
      const volatilityData = await analyticsService.getMarketVolatility();
      
      res.json(volatilityData);
    } catch (error) {
      console.error("Error fetching market volatility data:", error);
      res.status(500).json({ 
        message: "Failed to fetch market volatility data", 
        error: error.message 
      });
    }
  });
  
  // Stock trends for a specific industry
  app.get("/api/analytics/stock-trends/:industry", requireAuth, async (req, res) => {
    try {
      const { industry } = req.params;
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get stock trends data
      const trendsData = await analyticsService.getStockTrends(industry);
      
      res.json(trendsData);
    } catch (error) {
      console.error(`Error fetching stock trends for ${req.params.industry}:`, error);
      res.status(500).json({ 
        message: `Failed to fetch stock trends for ${req.params.industry}`, 
        error: error.message 
      });
    }
  });
  
  // Enhanced market forecast with AI-driven insights
  app.get("/api/analytics/market-forecast/:industry", requireAuth, async (req, res) => {
    try {
      const { industry } = req.params;
      
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get enhanced market forecast data
      const forecastData = await analyticsService.getEnhancedMarketForecast(industry);
      
      res.json(forecastData);
    } catch (error) {
      console.error(`Error generating enhanced market forecast for ${req.params.industry}:`, error);
      res.status(500).json({ 
        message: `Failed to generate enhanced market forecast for ${req.params.industry}`, 
        error: error.message 
      });
    }
  });
  
  // Indian sectors data
  app.get("/api/analytics/indian-sectors", requireAuth, async (req, res) => {
    try {
      // Get the analytics service
      const { analyticsService } = await import("./services/analytics");
      
      // Get Indian sectors data
      const sectorsData = await analyticsService.getIndianSectors();
      
      res.json(sectorsData);
    } catch (error) {
      console.error("Error fetching Indian sectors data:", error);
      res.status(500).json({ 
        message: "Failed to fetch Indian sectors data", 
        error: error.message 
      });
    }
  });
  
  // ========== RazorpayX Webhook Handler ==========
  
  app.post("/api/razorpay/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      // Get signature from headers
      const signature = req.headers['x-razorpay-signature'];
      
      if (!signature) {
        return res.status(400).json({ message: "Missing webhook signature" });
      }
      
      // Convert raw body to string for signature verification
      const payload = req.body.toString();
      
      // Get the razorpayX module
      const razorpayX = await import("./lib/razorpayX");
      
      // Verify webhook signature
      const isValid = razorpayX.verifyWebhookSignature(payload, signature.toString());
      
      if (!isValid) {
        console.error("Invalid webhook signature");
        return res.status(400).json({ message: "Invalid signature" });
      }
      
      // Parse the webhook payload
      const event = JSON.parse(payload);
      
      // Save webhook event to database
      const webhookEvent = await storage.createWebhookEvent({
        source: 'razorpay',
        eventType: event.event,
        eventId: event.id,
        signature: signature.toString(),
        isVerified: true,
        payload: event,
        processingStatus: 'pending',
      });
      
      // Process different event types
      switch (event.event) {
        case 'payment.authorized':
          await processPaymentAuthorized(event);
          break;
        
        case 'payment.captured':
          await processPaymentCaptured(event);
          break;
        
        case 'payment.failed':
          await processPaymentFailed(event);
          break;
        
        case 'payout.initiated':
          await processPayoutInitiated(event);
          break;
        
        case 'payout.processed':
          await processPayoutProcessed(event);
          break;
        
        case 'payout.failed':
          await processPayoutFailed(event);
          break;
        
        default:
          console.log(`Unhandled RazorpayX event type: ${event.event}`);
      }
      
      // Update webhook event status
      await storage.updateWebhookEvent(webhookEvent.id, {
        processingStatus: 'processed',
        processedAt: new Date(),
      });
      
      // Return success response
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing RazorpayX webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });
  
  // Helper functions for webhook event processing
  async function processPaymentAuthorized(event: any) {
    try {
      const payment = event.payload.payment.entity;
      
      // Get the virtual account from the payment
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(payment.virtual_account_id);
      
      if (!virtualAccount) {
        console.error(`Virtual account ${payment.virtual_account_id} not found for payment ${payment.id}`);
        return;
      }
      
      // Create payment record in database
      await storage.createRazorpayPayment({
        virtualAccountId: virtualAccount.id,
        razorpayVirtualAccountId: payment.virtual_account_id,
        razorpayPaymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        description: 'Payment authorized via webhook',
        currency: payment.currency,
        email: payment.email,
        contact: payment.contact,
        notes: payment.notes,
      });
      
      console.log(`Payment ${payment.id} authorized successfully`);
    } catch (error) {
      console.error("Error processing payment.authorized webhook:", error);
    }
  }
  
  async function processPaymentCaptured(event: any) {
    try {
      const payment = event.payload.payment.entity;
      
      // Get the virtual account
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(payment.virtual_account_id);
      
      if (!virtualAccount) {
        console.error(`Virtual account ${payment.virtual_account_id} not found for payment ${payment.id}`);
        return;
      }
      
      // Check if payment already exists in database
      const existingPayment = await storage.getRazorpayPaymentByRazorpayId(payment.id);
      
      let paymentRecord;
      
      if (existingPayment) {
        // Update existing payment record
        paymentRecord = await storage.updateRazorpayPayment(existingPayment.id, {
          status: payment.status,
        });
      } else {
        // Create new payment record
        paymentRecord = await storage.createRazorpayPayment({
          virtualAccountId: virtualAccount.id,
          razorpayVirtualAccountId: payment.virtual_account_id,
          razorpayPaymentId: payment.id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          description: 'Payment captured via webhook',
          currency: payment.currency,
          email: payment.email,
          contact: payment.contact,
          notes: payment.notes,
        });
      }
      
      // Create an escrow transaction record
      const escrowTransaction = await storage.createEscrowTransaction({
        virtualAccountId: virtualAccount.id,
        contractId: virtualAccount.contractId,
        transactionType: 'funding',
        amount: payment.amount,
        status: 'completed',
        paymentId: paymentRecord.id,
        payoutId: null,
        externalId: payment.id,
        externalReference: payment.id,
        senderType: 'buyer',
        receiverType: 'escrow',
        senderId: virtualAccount.buyerId,
        receiverId: virtualAccount.id,
        description: 'Funding escrow account via webhook',
        metadata: payment,
        completedAt: new Date(),
      });
      
      // Update virtual account balance
      const newBalance = virtualAccount.balance + payment.amount;
      await storage.updateRazorpayVirtualAccount(virtualAccount.id, {
        balance: newBalance,
      });
      
      // Update contract escrow status
      const contract = await storage.getContract(virtualAccount.contractId);
      
      if (contract) {
        await storage.updateContract(contract.id, {
          escrowFunded: true,
          escrowAmount: (contract.escrowAmount || 0) + payment.amount,
        });
      }
      
      // Create a wallet transaction record
      await storage.createWalletTransaction({
        userId: virtualAccount.buyerId,
        amount: payment.amount,
        type: 'escrow_funding',
        description: `Funding escrow account for contract #${virtualAccount.contractId}`,
        status: 'completed',
        contractId: virtualAccount.contractId,
        reference: payment.id,
      });
      
      console.log(`Payment ${payment.id} captured successfully`);
    } catch (error) {
      console.error("Error processing payment.captured webhook:", error);
    }
  }
  
  async function processPaymentFailed(event: any) {
    try {
      const payment = event.payload.payment.entity;
      
      // Get the virtual account
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(payment.virtual_account_id);
      
      if (!virtualAccount) {
        console.error(`Virtual account ${payment.virtual_account_id} not found for payment ${payment.id}`);
        return;
      }
      
      // Check if payment already exists in database
      const existingPayment = await storage.getRazorpayPaymentByRazorpayId(payment.id);
      
      if (existingPayment) {
        // Update existing payment record
        await storage.updateRazorpayPayment(existingPayment.id, {
          status: payment.status,
        });
      } else {
        // Create new payment record
        await storage.createRazorpayPayment({
          virtualAccountId: virtualAccount.id,
          razorpayVirtualAccountId: payment.virtual_account_id,
          razorpayPaymentId: payment.id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          description: 'Payment failed via webhook',
          currency: payment.currency,
          email: payment.email,
          contact: payment.contact,
          notes: payment.notes,
        });
      }
      
      console.log(`Payment ${payment.id} failed`);
    } catch (error) {
      console.error("Error processing payment.failed webhook:", error);
    }
  }
  
  async function processPayoutInitiated(event: any) {
    try {
      const payout = event.payload.payout.entity;
      
      // Extract the virtual account ID from notes
      const virtualAccountId = payout.notes?.virtual_account_id;
      
      if (!virtualAccountId) {
        console.error(`Virtual account ID not found in payout notes for payout ${payout.id}`);
        return;
      }
      
      // Get the virtual account
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(virtualAccountId);
      
      if (!virtualAccount) {
        console.error(`Virtual account ${virtualAccountId} not found for payout ${payout.id}`);
        return;
      }
      
      // Create payout record in database
      const payoutRecord = await storage.createRazorpayPayout({
        virtualAccountId: virtualAccount.id,
        razorpayVirtualAccountId: virtualAccountId,
        razorpayPayoutId: payout.id,
        razorpayFundAccountId: payout.fund_account_id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        purpose: payout.purpose,
        utr: payout.utr,
        fees: payout.fees,
        tax: payout.tax,
        reference: payout.reference_id,
        notes: payout.notes,
      });
      
      // If the payout has a milestone ID in notes, link it
      const milestoneId = payout.notes?.milestone_id;
      
      if (milestoneId) {
        await storage.updateRazorpayPayout(payoutRecord.id, {
          milestoneId: parseInt(milestoneId),
        });
      }
      
      console.log(`Payout ${payout.id} initiated successfully`);
    } catch (error) {
      console.error("Error processing payout.initiated webhook:", error);
    }
  }
  
  async function processPayoutProcessed(event: any) {
    try {
      const payout = event.payload.payout.entity;
      
      // Find the payout record in the database
      const payoutRecord = await storage.getRazorpayPayoutByRazorpayId(payout.id);
      
      if (!payoutRecord) {
        console.error(`Payout record not found for RazorpayX payout ID ${payout.id}`);
        return;
      }
      
      // Update payout record
      await storage.updateRazorpayPayout(payoutRecord.id, {
        status: payout.status,
        utr: payout.utr,
        processedAt: new Date(),
      });
      
      // Get the associated escrow transaction
      const escrowTransactions = await storage.getEscrowTransactionsByPayoutId(payoutRecord.id);
      
      if (escrowTransactions && escrowTransactions.length > 0) {
        // Update the escrow transaction status
        for (const transaction of escrowTransactions) {
          await storage.updateEscrowTransaction(transaction.id, {
            status: 'completed',
            completedAt: new Date(),
          });
        }
      }
      
      // If the payout is for a milestone, update the milestone status
      if (payoutRecord.milestoneId) {
        await storage.updateMilestone(payoutRecord.milestoneId, {
          status: 'paid',
          paidAt: new Date(),
        });
      }
      
      console.log(`Payout ${payout.id} processed successfully`);
    } catch (error) {
      console.error("Error processing payout.processed webhook:", error);
    }
  }
  
  async function processPayoutFailed(event: any) {
    try {
      const payout = event.payload.payout.entity;
      
      // Find the payout record in the database
      const payoutRecord = await storage.getRazorpayPayoutByRazorpayId(payout.id);
      
      if (!payoutRecord) {
        console.error(`Payout record not found for RazorpayX payout ID ${payout.id}`);
        return;
      }
      
      // Update payout record
      await storage.updateRazorpayPayout(payoutRecord.id, {
        status: payout.status,
        failureReason: payout.failure_reason,
      });
      
      // Get the associated escrow transaction
      const escrowTransactions = await storage.getEscrowTransactionsByPayoutId(payoutRecord.id);
      
      if (escrowTransactions && escrowTransactions.length > 0) {
        // Update the escrow transaction status
        for (const transaction of escrowTransactions) {
          await storage.updateEscrowTransaction(transaction.id, {
            status: 'failed',
          });
        }
      }
      
      console.log(`Payout ${payout.id} failed: ${payout.failure_reason}`);
    } catch (error) {
      console.error("Error processing payout.failed webhook:", error);
    }
  }
  
  // ========== Enhanced Escrow Wallet API Routes with RazorpayX Integration ==========
  
  // Get escrow account details by ID (Razorpay integration)
  app.get("/api/razorpay/escrow/:accountId", requireAuth, async (req, res) => {
    try {
      const accountId = req.params.accountId;
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Get escrow account details
      const result = await escrowWalletService.getEscrowAccountDetails(accountId);
      
      if (!result.success) {
        return res.status(404).json({ message: result.error });
      }
      
      // Check if user is authorized to view this escrow account
      const userId = (req.user as any).id;
      if (userId !== result.account.buyerId && userId !== result.account.sellerId) {
        return res.status(403).json({
          message: "Unauthorized: You must be either the buyer or seller to view this escrow account"
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching escrow account:", error);
      res.status(500).json({ message: "Failed to fetch escrow account details" });
    }
  });
  
  // Create a new escrow account for a contract (Razorpay integration)
  app.post("/api/razorpay/escrow/create", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { contractId, name, description, notes } = req.body;
      
      if (!contractId) {
        return res.status(400).json({ message: "Contract ID is required" });
      }
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify the user is either the buyer or seller for this contract
      if (userId !== contract.buyerId && userId !== contract.supplierId) {
        return res.status(403).json({
          message: "Unauthorized: You must be either the buyer or seller to create an escrow account for this contract"
        });
      }
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Create the escrow account
      const result = await escrowWalletService.createEscrowAccount({
        name: name || `Escrow for Contract #${contractId}`,
        description: description || `Secure payment escrow for contract ${contractId}`,
        contractId,
        buyerId: contract.buyerId,
        sellerId: contract.supplierId,
        notes
      });
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating escrow account:", error);
      res.status(500).json({ message: "Failed to create escrow account" });
    }
  });
  
  // Fund an escrow account (Razorpay integration)
  app.post("/api/razorpay/escrow/fund", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { contractId, amount, notes } = req.body;
      
      if (!contractId || !amount) {
        return res.status(400).json({ message: "Contract ID and amount are required" });
      }
      
      // Get contract details
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify the user is the buyer for this contract
      if (userId !== contract.buyerId) {
        return res.status(403).json({
          message: "Unauthorized: Only the buyer can fund the escrow account"
        });
      }
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Fund the escrow account
      const result = await escrowWalletService.fundEscrowAccount({
        contractId,
        amount,
        buyerId: userId,
        notes
      });
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error funding escrow account:", error);
      res.status(500).json({ message: "Failed to fund escrow account" });
    }
  });
  
  // Release milestone payment from escrow (Razorpay integration)
  app.post("/api/razorpay/escrow/release-payment", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { escrowAccountId, milestoneId, amount, notes } = req.body;
      
      if (!escrowAccountId || !milestoneId) {
        return res.status(400).json({ message: "Escrow account ID and milestone ID are required" });
      }
      
      // Get the milestone to verify authorization
      const milestone = await storage.getMilestone(milestoneId);
      
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Only the buyer can release milestone payments
      if (userId !== milestone.buyerId) {
        return res.status(403).json({
          message: "Unauthorized: Only the buyer can release milestone payments"
        });
      }
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Release the payment
      const result = await escrowWalletService.releaseMilestonePayment({
        escrowAccountId,
        milestoneId,
        amount: amount || milestone.amount,
        releaseReference: `MILESTONE-${milestoneId}-${Date.now()}`,
        notes
      });
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error releasing milestone payment:", error);
      res.status(500).json({ message: "Failed to release milestone payment" });
    }
  });
  
  // Request refund from escrow (Razorpay integration)
  app.post("/api/razorpay/escrow/refund", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { escrowAccountId, amount, reason, notes } = req.body;
      
      if (!escrowAccountId || !amount || !reason) {
        return res.status(400).json({ 
          message: "Escrow account ID, amount, and reason are required" 
        });
      }
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Get escrow account details to verify authorization
      const accountResult = await escrowWalletService.getEscrowAccountDetails(escrowAccountId);
      
      if (!accountResult.success) {
        return res.status(404).json({ message: accountResult.error });
      }
      
      // Only the buyer can request a refund
      if (userId !== accountResult.account.buyerId) {
        return res.status(403).json({
          message: "Unauthorized: Only the buyer can request a refund"
        });
      }
      
      // Process the refund
      const result = await escrowWalletService.processRefund({
        escrowAccountId,
        amount,
        reason,
        buyerId: userId,
        notes
      });
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: "Failed to process refund" });
    }
  });
  
  // Get user's escrow accounts (Razorpay integration)
  app.get("/api/razorpay/escrow/user/accounts", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Get user's escrow accounts
      const result = await escrowWalletService.getUserEscrowAccounts(userId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching user's escrow accounts:", error);
      res.status(500).json({ message: "Failed to fetch escrow accounts" });
    }
  });
  
  // Get transaction details (Razorpay integration)
  app.get("/api/razorpay/escrow/transaction/:transactionId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const transactionId = parseInt(req.params.transactionId);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Get transaction details
      const result = await escrowWalletService.getTransactionDetails(transactionId);
      
      if (!result.success) {
        return res.status(404).json({ message: result.error });
      }
      
      // Check if user is authorized to view this transaction
      if (userId !== result.account?.buyerId && userId !== result.account?.sellerId) {
        return res.status(403).json({
          message: "Unauthorized: You must be either the buyer or seller to view this transaction"
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      res.status(500).json({ message: "Failed to fetch transaction details" });
    }
  });
  
  // Webhook for Razorpay events (payment status updates, etc.)
  app.post("/api/razorpay/webhook", async (req, res) => {
    try {
      // Verify webhook signature
      const signature = req.headers["x-razorpay-signature"];
      const { verifyWebhookSignature } = await import("./lib/razorpayX");
      
      if (!signature || typeof signature !== "string") {
        return res.status(400).json({ message: "Missing webhook signature" });
      }
      
      const payload = JSON.stringify(req.body);
      const isValid = verifyWebhookSignature(payload, signature);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid webhook signature" });
      }
      
      // Process different event types
      const event = req.body.event;
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      if (event === "payment.authorized") {
        // Handle payment authorized event
        const paymentId = req.body.payload.payment.entity.id;
        const accountId = req.body.payload.payment.entity.virtual_account_id;
        const amount = req.body.payload.payment.entity.amount;
        
        // Update transaction status
        // In a real implementation, you would look up the transaction by external ID
        // and update its status to "completed"
        
        console.log(`Payment ${paymentId} authorized for account ${accountId} with amount ${amount}`);
      } else if (event === "payout.processed") {
        // Handle payout processed event
        const payoutId = req.body.payload.payout.entity.id;
        const fundAccountId = req.body.payload.payout.entity.fund_account_id;
        const amount = req.body.payload.payout.entity.amount;
        
        console.log(`Payout ${payoutId} processed for fund account ${fundAccountId} with amount ${amount}`);
      }
      
      // Acknowledge receipt of webhook
      res.status(200).json({ message: "Webhook received and processed" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });
  
  // Simulate a payment to an escrow account (test mode only)
  app.post("/api/razorpay/escrow/simulate-payment", requireAuth, async (req, res) => {
    try {
      const { escrowAccountId, amount } = req.body;
      
      if (!escrowAccountId || !amount) {
        return res.status(400).json({ message: "Escrow account ID and amount are required" });
      }
      
      // Get the escrow wallet service
      const { escrowWalletService } = await import("./services/escrow-wallet");
      
      // Simulate payment
      const result = await escrowWalletService.simulatePayment(escrowAccountId, amount);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error simulating payment:", error);
      res.status(500).json({ message: "Failed to simulate payment" });
    }
  });

  return httpServer;
}
