import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { registerApiDocs } from "./api-docs";
import { insertUserSchema, insertRfqSchema, insertQuoteSchema, insertSupplierSchema, insertShipmentSchema, insertPaymentSchema, insertActivitySchema, insertSupplierRecommendationSchema } from "@shared/schema";
import { alphaVantageService } from "./services/alpha-vantage";
import { razorpayService } from "./services/razorpay";
import { kredxService } from "./services/kredx";
import { shiprocketService } from "./services/shiprocket";
import multer from 'multer';
import { cloudinaryService } from './services/cloudinary'; //Import cloudinary service
import { bidPredictionService } from './services/bid-prediction'; //Import bid prediction service
import { log } from "./vite";
import winston from 'winston';

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '.data/error.log', level: 'error' }),
    new winston.transports.File({ filename: '.data/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const upload = multer(); // Initialize multer

// Helper function to get the user ID from session or use a default for development
function getUserIdFromSession(req: Request): number {
  // If session has user ID, use it
  if (req.session && req.session.userId) {
    return req.session.userId;
  }

  // For development, use default ID 1 (should match a user in storage)
  console.log("No user in session, using demo user ID 1");
  return 1;
}

//Helper function to calculate complexity (replace with actual implementation)
function calculateComplexity(description: string): number {
  //Implementation to calculate complexity based on description
  return description.length / 10;
}

//Helper function to calculate urgency (replace with actual implementation)
function calculateUrgency(dueDate: Date): number {
  //Implementation to calculate urgency based on due date
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.max(0, Math.min(1, diff / (1000 * 60 * 60 * 24 * 7))); //Scale to 0-1 range for a week
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Register API documentation routes
  registerApiDocs(app);
  // User Authentication API
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    logger.info(`Login attempt: username=${username}`); // Log login attempt

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      logger.warn(`Login failed: username=${username}`); // Log login failure
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create a user session
    req.session.userId = user.id;
    logger.info(`Login successful: userId=${user.id}`); // Log successful login

    return res.status(200).json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      company: user.company,
      role: user.role
    });
  });

  app.get("/api/auth/current", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Fetching current user: userId=${userId}`); // Log user fetch attempt

      const user = await storage.getUser(userId);

      if (!user) {
        logger.warn(`User not found: userId=${userId}`); // Log user not found
        return res.status(404).json({ message: "User not found" });
      }

      logger.info(`User fetched successfully: userId=${user.id}`); // Log successful user fetch
      return res.status(200).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        company: user.company,
        role: user.role
      });
    } catch (error) {
      logger.error(`Error fetching user data: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching user data" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    logger.info(`Logout initiated: userId=${req.session.userId}`); // Log logout initiation

    req.session.destroy(() => {
      logger.info(`Logout successful: userId=${req.session.userId}`); // Log logout success
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const newUser = insertUserSchema.parse(req.body);
      logger.info(`Registering new user: username=${newUser.username}`); // Log registration attempt

      const existingUser = await storage.getUserByUsername(newUser.username);

      if (existingUser) {
        logger.warn(`Registration failed: username=${newUser.username} already exists`); // Log registration failure
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(newUser);
      logger.info(`User registered successfully: userId=${user.id}`); // Log registration success

      return res.status(201).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        company: user.company,
        role: user.role
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid user data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }

      logger.error(`Error creating user: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating user" });
    }
  });

  // User Wallet API
  app.get("/api/wallet", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Fetching wallet for user: userId=${userId}`); // Log wallet fetch attempt

      const user = await storage.getUser(userId);

      if (!user) {
        logger.warn(`User not found: userId=${userId}`); // Log user not found
        return res.status(404).json({ message: "User not found" });
      }

      // For demo purposes, return wallet from user object
      // In real implementation, fetch from RazorpayX
      logger.info(`Wallet fetched successfully: userId=${user.id}`); // Log successful wallet fetch
      return res.status(200).json({
        balance: user.walletBalance,
        currency: "INR"
      });
    } catch (error) {
      logger.error(`Error fetching wallet data: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching wallet data" });
    }
  });

  // RFQ API
  app.get("/api/rfqs", async (req: Request, res: Response) => {
    try {
      logger.info("Fetching all RFQs"); // Log RFQ fetch attempt
      const rfqs = await storage.getRfqs();
      logger.info("RFQs fetched successfully"); // Log successful RFQ fetch
      return res.status(200).json(rfqs);
    } catch (error) {
      logger.error(`Error fetching RFQs: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching RFQs" });
    }
  });

  app.get("/api/rfqs/:id", async (req: Request, res: Response) => {
    try {
      const rfqId = parseInt(req.params.id);
      logger.info(`Fetching RFQ: id=${rfqId}`); // Log RFQ fetch attempt

      const rfq = await storage.getRfq(rfqId);

      if (!rfq) {
        logger.warn(`RFQ not found: id=${rfqId}`); // Log RFQ not found
        return res.status(404).json({ message: "RFQ not found" });
      }

      logger.info(`RFQ fetched successfully: id=${rfqId}`); // Log successful RFQ fetch
      return res.status(200).json(rfq);
    } catch (error) {
      logger.error(`Error fetching RFQ: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching RFQ" });
    }
  });

  app.post("/api/rfqs", upload.single('video'), async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const rfqData = insertRfqSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      logger.info(`Creating new RFQ: userId=${req.session.userId}`); // Log RFQ creation attempt

      // Handle video upload if present
      if (req.file) {
        const videoUrl = await cloudinaryService.uploadVideo(
          req.file.buffer,
          req.file.originalname
        );
        rfqData.videoUrl = videoUrl;
      }

      // Predict RFQ success rate
      const prediction = await bidPredictionService.predictRFQSuccessRate({
        id: rfqData.id,
        estimatedValue: parseFloat(rfqData.budget),
        complexity: calculateComplexity(rfqData.description),
        urgency: calculateUrgency(rfqData.dueDate),
        categories: rfqData.categories || []
      });

      rfqData.successPrediction = prediction;
      let videoUrl = '';

      if (req.file) {
        try {
          videoUrl = await cloudinaryService.uploadVideo(
            req.file.buffer,
            req.file.originalname
          );
          rfqData.videoUrl = videoUrl;
        } catch (error) {
          console.error('Error uploading video:', error);
          return res.status(500).json({ error: 'Failed to upload video' });
        }
      }

      // Predict RFQ success rate
      const prediction = await bidPredictionService.predictRFQSuccessRate({
        id: rfqData.id,
        estimatedValue: parseFloat(rfqData.budget),
        complexity: calculateComplexity(rfqData.description),
        urgency: calculateUrgency(rfqData.dueDate),
        categories: rfqData.categories || []
      });

      rfqData.successPrediction = prediction;
      const rfq = await storage.createRfq(rfqData);
      logger.info(`RFQ created successfully: id=${rfq.id}`); // Log successful RFQ creation

      // Create activity record
      await storage.createActivity({
        userId: req.session.userId,
        type: "rfq_created",
        description: `Created a new RFQ for ${rfq.product}`,
        referenceId: rfq.id,
        referenceType: "rfq"
      });

      return res.status(201).json(rfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid RFQ data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid RFQ data", errors: error.errors });
      }

      logger.error(`Error creating RFQ: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating RFQ" });
    }
  });

  // Supplier API
  app.get("/api/suppliers", async (req: Request, res: Response) => {
    try {
      logger.info("Fetching all suppliers"); // Log supplier fetch attempt
      const suppliers = await storage.getSuppliers();
      logger.info("Suppliers fetched successfully"); // Log successful supplier fetch
      return res.status(200).json(suppliers);
    } catch (error) {
      logger.error(`Error fetching suppliers: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.id);
      logger.info(`Fetching supplier: id=${supplierId}`); // Log supplier fetch attempt

      const supplier = await storage.getSupplier(supplierId);

      if (!supplier) {
        logger.warn(`Supplier not found: id=${supplierId}`); // Log supplier not found
        return res.status(404).json({ message: "Supplier not found" });
      }

      logger.info(`Supplier fetched successfully: id=${supplierId}`); // Log successful supplier fetch
      return res.status(200).json(supplier);
    } catch (error) {
      logger.error(`Error fetching supplier: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching supplier" });
    }
  });

  app.post("/api/suppliers", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const supplierData = insertSupplierSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      logger.info(`Creating new supplier: userId=${req.session.userId}`); // Log supplier creation attempt

      const supplier = await storage.createSupplier(supplierData);
      logger.info(`Supplier created successfully: id=${supplier.id}`); // Log successful supplier creation

      return res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid supplier data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }

      logger.error(`Error creating supplier: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating supplier" });
    }
  });

  // Quote API
  app.get("/api/quotes/rfq/:rfqId", async (req: Request, res: Response) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      logger.info(`Fetching quotes for RFQ: id=${rfqId}`); // Log quote fetch attempt

      const quotes = await storage.getQuotesByRfqId(rfqId);
      logger.info(`Quotes fetched successfully for RFQ: id=${rfqId}`); // Log successful quote fetch
      return res.status(200).json(quotes);
    } catch (error) {
      logger.error(`Error fetching quotes: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching quotes" });
    }
  });

  app.post("/api/quotes", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      logger.info(`Creating new quote: userId=${req.session.userId}`); // Log quote creation attempt

      // Verify that the RFQ exists
      const rfq = await storage.getRfq(quoteData.rfqId);
      if (!rfq) {
        logger.warn(`RFQ not found: id=${quoteData.rfqId}`); // Log RFQ not found
        return res.status(404).json({ message: "RFQ not found" });
      }

      // Verify that the supplier exists
      const supplier = await storage.getSupplier(quoteData.supplierId);
      if (!supplier) {
        logger.warn(`Supplier not found: id=${quoteData.supplierId}`); // Log supplier not found
        return res.status(404).json({ message: "Supplier not found" });
      }

      const quote = await storage.createQuote(quoteData);
      logger.info(`Quote created successfully: id=${quote.id}`); // Log successful quote creation

      // Create activity record
      await storage.createActivity({
        userId: req.session.userId,
        type: "quote_submitted",
        description: `Submitted a quote for RFQ #${rfq.rfqNumber}`,
        referenceId: quote.id,
        referenceType: "quote"
      });

      return res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid quote data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }

      logger.error(`Error creating quote: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating quote" });
    }
  });

  // Shipment API
  app.get("/api/shipments", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Fetching shipments for user: userId=${userId}`); // Log shipment fetch attempt

      const shipments = await storage.getShipmentsByUserId(userId);
      logger.info(`Shipments fetched successfully for user: userId=${userId}`); // Log successful shipment fetch
      return res.status(200).json(shipments);
    } catch (error) {
      logger.error(`Error fetching shipments: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching shipments" });
    }
  });

  app.get("/api/shipments/:id", async (req: Request, res: Response) => {
    try {
      const shipmentId = parseInt(req.params.id);
      logger.info(`Fetching shipment: id=${shipmentId}`); // Log shipment fetch attempt

      const shipment = await storage.getShipment(shipmentId);

      if (!shipment) {
        logger.warn(`Shipment not found: id=${shipmentId}`); // Log shipment not found
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Get tracking information from Shiprocket
      try {
        const trackingInfo = await shiprocketService.trackShipment(shipment.shipmentNumber);

        // Update shipment status and progress if needed
        if (shipment.status !== trackingInfo.currentStatus ||
            shipment.trackingProgress !== trackingInfo.progressPercent) {

          await storage.updateShipmentStatus(
            shipment.id,
            trackingInfo.currentStatus,
            trackingInfo.progressPercent
          );
        }

        logger.info(`Shipment fetched successfully: id=${shipmentId}`); // Log successful shipment fetch
        return res.status(200).json({
          ...shipment,
          tracking: trackingInfo
        });
      } catch (error) {
        // Return shipment data even if tracking fails
        logger.warn(`Error fetching tracking info for shipment ${shipmentId}: ${error.message}`); // Log tracking error
        return res.status(200).json(shipment);
      }
    } catch (error) {
      logger.error(`Error fetching shipment: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching shipment" });
    }
  });

  app.post("/api/shipments", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const shipmentData = insertShipmentSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      logger.info(`Creating new shipment: userId=${req.session.userId}`); // Log shipment creation attempt

      const shipment = await storage.createShipment(shipmentData);
      logger.info(`Shipment created successfully: id=${shipment.id}`); // Log successful shipment creation

      // Create activity record
      await storage.createActivity({
        userId: req.session.userId,
        type: "shipment_created",
        description: `Created shipment #${shipment.shipmentNumber}`,
        referenceId: shipment.id,
        referenceType: "shipment"
      });

      return res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid shipment data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid shipment data", errors: error.errors });
      }

      logger.error(`Error creating shipment: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating shipment" });
    }
  });

  // Payment API
  app.get("/api/payments", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Fetching payments for user: userId=${userId}`); // Log payment fetch attempt

      const payments = await storage.getPaymentsByUserId(userId);
      logger.info(`Payments fetched successfully for user: userId=${userId}`); // Log successful payment fetch
      return res.status(200).json(payments);
    } catch (error) {
      logger.error(`Error fetching payments: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching payments" });
    }
  });

  app.post("/api/payments/milestone", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        userId: req.session.userId,
        type: "milestone"
      });
      logger.info(`Creating new milestone payment: userId=${req.session.userId}`); // Log milestone payment creation attempt

      // Create payment in Razorpay
      const razorpayPaymentId = await razorpayService.createMilestonePayment({
        ...paymentData,
        createdAt: new Date()
      });

      // Store payment in our system
      const payment = await storage.createPayment({
        ...paymentData,
        razorpayPaymentId
      });
      logger.info(`Milestone payment created successfully: id=${payment.id}`); // Log successful milestone payment creation

      // Create activity record
      await storage.createActivity({
        userId: req.session.userId,
        type: "payment_created",
        description: `Created milestone payment of ₹${paymentData.amount}`,
        referenceId: payment.id,
        referenceType: "payment"
      });

      return res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid payment data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }

      logger.error(`Error creating payment: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating payment" });
    }
  });

  app.post("/api/payments/invoice-discount", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { invoiceNumber, amount, dueDate, supplierId } = req.body;
      logger.info(`Creating new invoice discount payment: userId=${req.session.userId}`); // Log invoice discount creation attempt

      if (!invoiceNumber || !amount || !dueDate || !supplierId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create invoice discount request
      const discountResponse = await kredxService.createInvoiceDiscount({
        invoiceNumber,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        supplierId,
        buyerId: req.session.userId
      });

      // Store payment in our system
      const payment = await storage.createPayment({
        rfqId: 0, // Not directly tied to an RFQ
        userId: req.session.userId,
        supplierId,
        amount: discountResponse.originalAmount.toString(),
        status: "pending",
        type: "invoice",
        invoiceNumber,
        invoiceDueDate: new Date(dueDate),
        discountFee: discountResponse.discountFee.toString(),
        razorpayPaymentId: discountResponse.discountId
      });
      logger.info(`Invoice discount created successfully: id=${payment.id}`); // Log successful invoice discount creation

      return res.status(201).json({
        payment,
        discountDetails: discountResponse
      });
    } catch (error) {
      logger.error(`Error creating invoice discount: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating invoice discount" });
    }
  });

  // Activity Feed API
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Fetching activities for user: userId=${userId}`); // Log activity fetch attempt

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivitiesByUserId(userId, limit);
      logger.info(`Activities fetched successfully for user: userId=${userId}`); // Log successful activity fetch
      return res.status(200).json(activities);
    } catch (error) {
      logger.error(`Error fetching activities: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching activities" });
    }
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const activityData = insertActivitySchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      logger.info(`Creating new activity: userId=${req.session.userId}`); // Log activity creation attempt

      const activity = await storage.createActivity(activityData);
      logger.info(`Activity created successfully: id=${activity.id}`); // Log successful activity creation
      return res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid activity data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }

      logger.error(`Error creating activity: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating activity" });
    }
  });

  // AI Feature APIs
  app.get("/api/supplier-recommendations/:rfqId", async (req: Request, res: Response) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      logger.info(`Fetching supplier recommendations for RFQ: id=${rfqId}`); // Log supplier recommendation fetch attempt

      // First check if we have existing recommendations
      let recommendations = await storage.getSupplierRecommendations(rfqId);

      // If no recommendations exist yet or force refresh is requested, generate them
      if (recommendations.length === 0 || req.query.refresh === 'true') {
        const rfq = await storage.getRfq(rfqId);

        if (!rfq) {
          logger.warn(`RFQ not found: id=${rfqId}`); // Log RFQ not found
          return res.status(404).json({ message: "RFQ not found" });
        }

        // Generate recommendations using the enhanced algorithm
        const supplierMatchingService = (await import('./services/supplier-matching')).default;
        recommendations = await supplierMatchingService.findMatchingSuppliers(rfq);
      }

      logger.info(`Supplier recommendations fetched successfully for RFQ: id=${rfqId}`); // Log successful supplier recommendation fetch
      return res.status(200).json(recommendations);
    } catch (error) {
      logger.error(`Error fetching supplier recommendations: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching supplier recommendations" });
    }
  });

  app.post("/api/supplier-recommendations", async (req: Request, res: Response) => {
    try {
      // Check for generate mode
      if (req.body.generate === true && req.body.rfqId) {
        const rfqId = parseInt(req.body.rfqId.toString());
        logger.info(`Generating supplier recommendations for RFQ: id=${rfqId}`); // Log supplier recommendation generation attempt

        const rfq = await storage.getRfq(rfqId);

        if (!rfq) {
          logger.warn(`RFQ not found: id=${rfqId}`); // Log RFQ not found
          return res.status(404).json({ message: "RFQ not found" });
        }

        // Use the enhanced algorithm to generate recommendations
        const supplierMatchingService = (await import('./services/supplier-matching')).default;
        const recommendations = await supplierMatchingService.findMatchingSuppliers(
          rfq,
          req.body.limit ? parseInt(req.body.limit.toString()) : 5
        );
        logger.info(`Supplier recommendations generated successfully for RFQ: id=${rfqId}`); // Log successful supplier recommendation generation

        return res.status(200).json(recommendations);
      }

      // Handle manual recommendation creation
      const recommendationData = insertSupplierRecommendationSchema.parse(req.body);
      logger.info(`Creating new supplier recommendation`); // Log supplier recommendation creation attempt

      const recommendation = await storage.createSupplierRecommendation(recommendationData);
      logger.info(`Supplier recommendation created successfully: id=${recommendation.id}`); // Log successful supplier recommendation creation
      return res.status(201).json(recommendation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid recommendation data: ${error.message}`); // Log validation error
        return res.status(400).json({ message: "Invalid recommendation data", errors: error.errors });
      }

      logger.error(`Error creating recommendation: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error creating recommendation" });
    }
  });

  // Bid Prediction API
  app.get("/api/bid-prediction/:rfqId", async (req: Request, res: Response) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      logger.info(`Predicting bid price for RFQ: id=${rfqId}`); // Log bid price prediction attempt

      // Get the RFQ
      const rfq = await storage.getRfq(rfqId);

      if (!rfq) {
        logger.warn(`RFQ not found: id=${rfqId}`); // Log RFQ not found
        return res.status(404).json({ message: "RFQ not found" });
      }

      // Get bid price prediction
      const prediction = await bidPredictionService.predictBidPrice(rfq);
      logger.info(`Bid price prediction successful for RFQ: id=${rfqId}`); // Log successful bid price prediction

      return res.status(200).json(prediction);
    } catch (error) {
      logger.error(`Error predicting bid price: ${error.message}`); // Log error
      return res.status(500).json({
        message: "Error predicting bid price",
        error: error.message
      });
    }
  });

  app.post("/api/detect-price-anomaly", async (req: Request, res: Response) => {
    try {
      const { quoteId } = req.body;
      logger.info(`Detecting price anomaly for quote: id=${quoteId}`); // Log price anomaly detection attempt

      if (!quoteId) {
        return res.status(400).json({ message: "Quote ID is required" });
      }

      // Get the quote
      const quote = await storage.getQuote(parseInt(quoteId));

      if (!quote) {
        logger.warn(`Quote not found: id=${quoteId}`); // Log quote not found
        return res.status(404).json({ message: "Quote not found" });
      }

      // Get associated RFQ and supplier
      const rfq = await storage.getRfq(quote.rfqId || 0);
      const supplier = await storage.getSupplier(quote.supplierId || 0);

      if (!rfq || !supplier) {
        return res.status(404).json({
          message: !rfq ?> "Associated RFQ not found" : "Associated supplier not found"
        });
      }

      // Detect price anomaly
      const anomalyResult = await bidPredictionService.detectPriceAnomaly(quote, rfq, supplier);
      logger.info(`Price anomaly detection successful for quote: id=${quoteId}`); // Log successful price anomaly detection

      return res.status(200).json(anomalyResult);
    } catch (error) {
      logger.error(`Error detecting price anomaly: ${error.message}`); // Log error
      return res.status(500).json({
        message: "Error detecting price anomaly",
        error: error.message
      });
    }
  });

  // Market Trends API
  app.get("/api/market-trends", async (req: Request, res: Response) => {
    try {
      const sector = req.query.sector as string;
      logger.info(`Fetching market trends for sector: ${sector}`); // Log market trend fetch attempt

      if (sector) {
        const trend = await storage.getMarketTrends(sector);

        if (!trend) {
          // If no data in storage, fetch from Alpha Vantage
          try {
            const insights = await alphaVantageService.generateMarketInsights(sector);

            // Store the data for future use
            const newTrend = await storage.createOrUpdateMarketTrend({
              sector,
              data: {},
              insights
            });
            logger.info(`Market trends fetched and stored for sector: ${sector}`); // Log successful market trend fetch and storage

            return res.status(200).json(newTrend);
          } catch (error) {
            logger.error(`Error fetching market data from provider: ${error.message}`); // Log error
            return res.status(500).json({ message: "Error fetching market data from provider" });
          }
        }

        logger.info(`Market trends fetched successfully for sector: ${sector}`); // Log successful market trend fetch
        return res.status(200).json(trend);
      } else {
        logger.info("Fetching all market trends"); // Log market trend fetch attempt
        const trends = await storage.getAllMarketTrends();
        logger.info("All market trends fetched successfully"); // Log successful market trend fetch
        return res.status(200).json(trends);
      }
    } catch (error) {
      logger.error(`Error fetching market trends: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching market trends" });
    }
  });

  // Stock API
  app.get("/api/stock/:symbol", async (req: Request, res: Response) => {
    try {
      const symbol = req.params.symbol;
      logger.info(`Fetching stock data for symbol: ${symbol}`); // Log stock data fetch attempt

      const stockData = await alphaVantageService.getStockData(symbol);
      logger.info(`Stock data fetched successfully for symbol: ${symbol}`); // Log successful stock data fetch
      return res.status(200).json(stockData);
    } catch (error) {
      logger.error(`Error fetching stock data: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching stock data" });
    }
  });

  // GST Validation APIs
  app.post("/api/validate/gst", async (req: Request, res: Response) => {
    try {
      const { gstNumber } = req.body;
      logger.info(`Validating GST number: ${gstNumber}`); // Log GST validation attempt

      if (!gstNumber) {
        return res.status(400).json({ message: "GST number is required" });
      }

      const gstValidationService = (await import('./services/gst-validation')).default;
      const result = await gstValidationService.validateGST(gstNumber);
      logger.info(`GST validation successful: ${gstNumber} - valid=${result.valid}`); // Log GST validation result

      return res.status(result.valid ? 200 : 400).json(result);
    } catch (error) {
      logger.error(`Error validating GST number: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error validating GST number", error: error.message });
    }
  });

  app.get("/api/business-details/gst/:gstNumber", async (req: Request, res: Response) => {
    try {
      const { gstNumber } = req.params;
      logger.info(`Fetching business details for GST number: ${gstNumber}`); // Log business details fetch attempt

      if (!gstNumber) {
        return res.status(400).json({ message: "GST number is required" });
      }

      const gstValidationService = (await import('./services/gst-validation')).default;
      const result = await gstValidationService.getBusinessDetailsByGST(gstNumber);
      logger.info(`Business details fetched successfully for GST number: ${gstNumber}`); // Log successful business details fetch

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error(`Error fetching business details: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error fetching business details", error: error.message });
    }
  });

  app.post("/api/verify/business-match", async (req: Request, res: Response) => {
    try {
      const { gstNumber, businessName, state } = req.body;
      logger.info(`Verifying business match: gstNumber=${gstNumber}, businessName=${businessName}`); // Log business match verification attempt

      if (!gstNumber || !businessName) {
        return res.status(400).json({ message: "GST number and business name are required" });
      }

      const gstValidationService = (await import('./services/gst-validation')).default;
      const result = await gstValidationService.verifyBusinessMatch(gstNumber, businessName, state);
      logger.info(`Business match verification successful: gstNumber=${gstNumber}, businessName=${businessName}, result=${result.match}`); // Log business match verification result

      return res.status(200).json(result);
    } catch (error) {
      logger.error(`Error verifying business match: ${error.message}`); // Log error
      return res.status(500).json({ message: "Error verifying business match", error: error.message });
    }
  });

  // Blockchain API Routes
  app.get("/api/blockchain/token-balance", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Fetching token balance for user: userId=${userId}`); // Log token balance fetch attempt

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.walletAddress) {
        return res.status(400).json({ error: "User wallet not set up" });
      }

      const blockchainService = (await import('./services/blockchain')).default;
      const result = await blockchainService.getTokenBalance(user.walletAddress);
      logger.info(`Token balance fetched successfully for user: userId=${userId}`); // Log successful token balance fetch

      res.json(result);
    } catch (error) {
      logger.error(`Error fetching token balance: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blockchain/create-rfq", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Creating RFQ on blockchain: userId=${userId}`); // Log blockchain RFQ creation attempt

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { rfqNumber, product, quantity, dueDate, description, documentHash } = req.body;
      const blockchainService = (await import('./services/blockchain')).default;

      const result = await blockchainService.createRFQ(
        rfqNumber,
        product,
        quantity,
        dueDate,
        description,
        documentHash
      );
      logger.info(`RFQ created successfully on blockchain: rfqNumber=${rfqNumber}`); // Log successful blockchain RFQ creation

      res.json(result);
    } catch (error) {
      logger.error(`Error creating RFQ on blockchain: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blockchain/submit-quote", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Submitting quote on blockchain: userId=${userId}`); // Log blockchain quote submission attempt

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { rfqId, price, deliveryTime, documentHash } = req.body;
      const blockchainService = (await import('./services/blockchain')).default;

      const result = await blockchainService.submitQuote(
        rfqId,
        price,
        deliveryTime,
        documentHash
      );
      logger.info(`Quote submitted successfully on blockchain: rfqId=${rfqId}`); // Log successful blockchain quote submission

      res.json(result);
    } catch (error) {
      logger.error(`Error submitting quote on blockchain: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blockchain/create-payment", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Creating payment on blockchain: userId=${userId}`); // Log blockchain payment creation attempt

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const {
        rfqId,
        supplier,
        amount,
        paymentType,
        milestoneNumber,
        totalMilestones,
        documentHash
      } = req.body;

      const blockchainService = (await import('./services/blockchain')).default;

      // Convert payment type to enum value
      const paymentTypeValue = paymentType === 'full' ? 0 : 1;

      const result = await blockchainService.createPayment(
        rfqId,
        supplier,
        amount,
        paymentTypeValue,
        milestoneNumber || 1,
        totalMilestones || 1,
        documentHash,
        amount // Same value for ETH sent
      );
      logger.info(`Payment created successfully on blockchain: rfqId=${rfqId}`); // Log successful blockchain payment creation

      res.json(result);
    } catch (error) {
      logger.error(`Error creating payment on blockchain: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blockchain/store-document", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Storing document on blockchain: userId=${userId}`); // Log blockchain document storage attempt

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { content, referenceId, documentType, description } = req.body;

      // Convert document type to enum value
      let documentTypeValue = 5; // Default to "Other"
      switch (documentType) {
        case 'rfq': documentTypeValue = 0; break;
        case 'quote': documentTypeValue = 1; break;
        case 'shipment': documentTypeValue = 2; break;
        case 'payment': documentTypeValue = 3; break;
        case 'dispute': documentTypeValue = 4; break;
      }

      // Upload to IPFS first
      const ipfsService = (await import('./services/ipfs')).default;
      const ipfsResult = await ipfsService.uploadContent(content);

      if ('error' in ipfsResult) {
        throw new Error(`IPFS upload failed: ${ipfsResult.error}`);
      }

      // Then store on blockchain
      const blockchainService = (await import('./services/blockchain')).default;
      const blockchainResult = await blockchainService.storeDocument(
        content,
        ipfsResult.cid,
        referenceId,
        documentTypeValue,
        description
      );
      logger.info(`Document stored successfully on blockchain: referenceId=${referenceId}`); // Log successful blockchain document storage

      res.json({
        contentHash: blockchainResult.contentHash,
        ipfsHash: ipfsResult.cid,
        ipfsUrl: ipfsResult.url,
        txHash: blockchainResult.txHash,
        success: true
      });
    } catch (error) {
      logger.error(`Error storing document on blockchain: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blockchain/verify-document", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromSession(req);
      logger.info(`Verifying document on blockchain: userId=${userId}`); // Log blockchain document verification attempt

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { contentHash } = req.body;
      const blockchainService = (await import('./services/blockchain')).default;

      const result = await blockchainService.verifyDocument(contentHash);
      logger.info(`Document verification successful on blockchain: contentHash=${contentHash}, result=${result.valid}`); // Log blockchain document verification result

      res.json(result);
    } catch (error) {
      logger.error(`Error verifying document on blockchain: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/blockchain/check-document/:contentHash", async (req: Request, res: Response) => {
    try {
      const { contentHash } = req.params;
      logger.info(`Checking document on blockchain: contentHash=${contentHash}`); // Log blockchain document check attempt

      const blockchainService = (await import('./services/blockchain')).default;

      const result = await blockchainService.checkDocument(contentHash);

      if (result.success && result.exists && result.ipfsHash) {
        // Get document content from IPFS
        const ipfsService = (await import('./services/ipfs')).default;
        const ipfsResult = await ipfsService.getContent(result.ipfsHash);

        if ('content' in ipfsResult) {
          result.content = ipfsResult.content;
          result.ipfsUrl = ipfsService.getIpfsUrl(result.ipfsHash);
        }
      }

      logger.info(`Document check successful on blockchain: contentHash=${contentHash}`); // Log successful blockchain document check
      res.json(result);
    } catch (error) {
      logger.error(`Error checking document on blockchain: ${error.message}`); // Log error
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}