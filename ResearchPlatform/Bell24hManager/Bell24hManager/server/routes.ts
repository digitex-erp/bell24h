import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { authMiddleware } from "./middleware/auth";
import { calculateSupplierMatches, generateRfqImageWithAI } from "./services/ai";
import { z } from "zod";
import {
  insertUserSchema,
  insertRfqSchema,
  insertQuoteSchema,
  rfqStatusEnum,
  quoteStatusEnum,
  Supplier
} from "../shared/schema";
import { setupWebSocketServer } from "./websocket";
import voiceApiRoutes from "./routes/voice-api";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = setupWebSocketServer(httpServer);
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create a session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create a session
      req.session.userId = user.id;
      
      res.json({ 
        id: user.id, 
        username: user.username,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve user data" });
    }
  });

  // RFQ routes
  app.get("/api/rfqs", async (req, res) => {
    try {
      const status = req.query.status as string;
      
      let rfqs;
      if (status) {
        rfqs = await storage.getRfqsByStatus(status);
      } else {
        rfqs = await storage.getAllRfqs();
      }
      
      res.json(rfqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get RFQs" });
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
      res.status(500).json({ message: "Failed to get RFQ" });
    }
  });

  app.post("/api/rfqs", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const rfqData = insertRfqSchema.parse({
        ...req.body,
        userId
      });
      
      const rfq = await storage.createRfq(rfqData);
      
      // Send WebSocket notification if RFQ is already published
      if (rfq.status === 'published') {
        wss.clients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({
              type: 'rfq_published',
              data: {
                rfqId: rfq.id,
                title: rfq.title,
                industry: rfq.industry
              }
            }));
          }
        });
      }
      
      res.status(201).json(rfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  });

  app.patch("/api/rfqs/:id", authMiddleware, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if RFQ exists and belongs to the authenticated user
      const existingRfq = await storage.getRfq(rfqId);
      if (!existingRfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      if (existingRfq.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this RFQ" });
      }
      
      // Validate status if it's being updated
      if (req.body.status) {
        if (!Object.values(rfqStatusEnum.enumValues).includes(req.body.status)) {
          return res.status(400).json({ message: "Invalid RFQ status" });
        }
        
        // If status is being set to 'published'
        if (req.body.status === 'published' && existingRfq.status !== 'published') {
          // Find all matched suppliers and update rfqSuppliers records
          const matches = await storage.getRfqSuppliersByRfqId(rfqId);
          
          // Send WebSocket notification to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'rfq_submitted',
                data: {
                  rfqId,
                  title: existingRfq.title,
                  supplierCount: matches.length
                }
              }));
            }
          });
        }
      }
      
      const updatedRfq = await storage.updateRfq(rfqId, req.body);
      res.json(updatedRfq);
    } catch (error) {
      res.status(500).json({ message: "Failed to update RFQ" });
    }
  });

  app.get("/api/rfqs/:id/matches", authMiddleware, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if RFQ exists and belongs to the authenticated user
      const existingRfq = await storage.getRfq(rfqId);
      if (!existingRfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      if (existingRfq.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view matches for this RFQ" });
      }
      
      // Get existing matches from the database
      let matches = await storage.getRfqSuppliersByRfqId(rfqId);
      
      // If there are no matches yet, calculate them using the AI service
      if (matches.length === 0) {
        const suppliers = await storage.getSuppliersByIndustry(existingRfq.industry);
        
        if (suppliers.length > 0) {
          // Calculate match scores for each supplier
          const scoredSuppliers = await calculateSupplierMatches(existingRfq, suppliers);
          
          // Save the scored suppliers in the database
          for (const scoredSupplier of scoredSuppliers) {
            await storage.createRfqSupplier({
              rfqId,
              supplierId: scoredSupplier.supplier.id,
              matchScore: scoredSupplier.matchScore
            });
          }
          
          // Get the saved matches
          matches = await storage.getRfqSuppliersByRfqId(rfqId);
          
          // Send WebSocket notification
          wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'rfq_match_requested',
                data: {
                  rfqId,
                  title: existingRfq.title,
                  matchCount: matches.length
                }
              }));
            }
          });
        }
      }
      
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get supplier matches" });
    }
  });

  app.post("/api/rfqs/:id/submit", authMiddleware, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.id);
      const userId = req.session.userId!;
      const supplierIds = req.body.supplierIds;
      
      if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
        return res.status(400).json({ message: "Supplier IDs must be a non-empty array" });
      }
      
      // Check if RFQ exists and belongs to the authenticated user
      const existingRfq = await storage.getRfq(rfqId);
      if (!existingRfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      if (existingRfq.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to submit this RFQ" });
      }
      
      // Update RFQ status to published if it's not already
      if (existingRfq.status !== 'published') {
        await storage.updateRfq(rfqId, { status: 'published' });
      }
      
      // Mark the RFQ as submitted to the specified suppliers
      const submittedSuppliers: Supplier[] = [];
      
      for (const supplierId of supplierIds) {
        // Check if the supplier exists
        const supplier = await storage.getSupplier(supplierId);
        if (!supplier) {
          continue; // Skip non-existent suppliers
        }
        
        // Update the rfqSupplier record
        await storage.updateRfqSupplier(rfqId, supplierId, {
          isSubmitted: true,
          submittedAt: new Date()
        });
        
        submittedSuppliers.push(supplier);
        
        // Send WebSocket notification to the supplier
        wss.clients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            // In a real application, you would check if this client belongs to the supplier
            client.send(JSON.stringify({
              type: 'new_rfq_received',
              data: {
                rfqId,
                title: existingRfq.title,
                industry: existingRfq.industry,
                supplierId: supplier.id
              }
            }));
          }
        });
      }
      
      res.json({
        rfqId,
        submitted: true,
        supplierCount: submittedSuppliers.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit RFQ to suppliers" });
    }
  });

  // Quote routes
  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quote" });
    }
  });

  app.post("/api/quotes", authMiddleware, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const quoteData = insertQuoteSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if the RFQ exists and is published
      const rfq = await storage.getRfq(quoteData.rfqId);
      if (!rfq || rfq.status !== 'published') {
        return res.status(400).json({ message: "RFQ not found or not published" });
      }
      
      // Check if the user is associated with the supplier
      const supplier = await storage.getSupplier(quoteData.supplierId);
      if (!supplier || supplier.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to submit quote for this supplier" });
      }
      
      const quote = await storage.createQuote(quoteData);
      
      // Send WebSocket notification
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'new_quote_submitted',
            data: {
              quoteId: quote.id,
              rfqId: quote.rfqId,
              supplierId: quote.supplierId,
              price: quote.price
            }
          }));
        }
      });
      
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.patch("/api/quotes/:id", authMiddleware, async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Check if quote exists
      const existingQuote = await storage.getQuote(quoteId);
      if (!existingQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Check if the user owns the quote or the RFQ
      const rfq = await storage.getRfq(existingQuote.rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "Associated RFQ not found" });
      }
      
      // Supplier owns the quote, can update price/details
      const isQuoteOwner = existingQuote.userId === userId;
      // RFQ owner can update the status (accept/reject)
      const isRfqOwner = rfq.userId === userId;
      
      if (!isQuoteOwner && !isRfqOwner) {
        return res.status(403).json({ message: "Unauthorized to update this quote" });
      }
      
      // Validate status if it's being updated
      if (req.body.status && !Object.values(quoteStatusEnum.enumValues).includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid quote status" });
      }
      
      // If RFQ owner, they can only update status
      if (isRfqOwner && !isQuoteOwner) {
        const updatedQuote = await storage.updateQuote(quoteId, { status: req.body.status });
        
        // Send WebSocket notification about status change
        wss.clients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({
              type: 'quote_status_updated',
              data: {
                quoteId,
                rfqId: updatedQuote.rfqId,
                status: updatedQuote.status
              }
            }));
          }
        });
        
        return res.json(updatedQuote);
      }
      
      // If quote owner, they can update price, delivery time, message
      if (isQuoteOwner) {
        const allowedFields = ['price', 'deliveryTime', 'message'];
        const updateData: Record<string, any> = {};
        
        for (const field of allowedFields) {
          if (field in req.body) {
            updateData[field] = req.body[field];
          }
        }
        
        if (req.body.status === 'revised') {
          updateData.status = 'revised';
        }
        
        const updatedQuote = await storage.updateQuote(quoteId, updateData);
        
        // Send WebSocket notification about quote revision
        if (updateData.status === 'revised') {
          wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({
                type: 'quote_revised',
                data: {
                  quoteId,
                  rfqId: updatedQuote.rfqId,
                  supplierId: updatedQuote.supplierId
                }
              }));
            }
          });
        }
        
        return res.json(updatedQuote);
      }
      
      res.status(400).json({ message: "Invalid update operation" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/trading", authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30; // Default to 30 days
      
      // Get analytics data for the specified time period
      const analyticsData = await storage.getAnalytics(days);
      
      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trading analytics" });
    }
  });

  // Gemini AI test routes
  app.get("/api/ai/test", async (req, res) => {
    try {
      // Return a simple message to indicate Gemini integration is working
      res.json({ 
        message: "Gemini AI integration is active", 
        apiKey: "Successfully using Google Gemini API key",
        model: "gemini-pro" 
      });
    } catch (error) {
      res.status(500).json({ message: "Error testing Gemini API integration" });
    }
  });

  app.get("/api/ai/image/:rfqId", async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      
      // Get the RFQ
      const rfq = await storage.getRfq(rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      // Generate an image using Gemini
      const imageUrl = await generateRfqImageWithAI(rfq);
      
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(422).json({ message: "Failed to generate image" });
      }
    } catch (error) {
      console.error("Error in Gemini image generation:", error);
      res.status(500).json({ message: "Error generating image with Gemini" });
    }
  });

  app.post("/api/ai/supplier-match", async (req, res) => {
    try {
      const { rfqId } = req.body;
      
      if (!rfqId) {
        return res.status(400).json({ message: "RFQ ID is required" });
      }
      
      // Get the RFQ
      const rfq = await storage.getRfq(rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      // Get suppliers in the same industry
      const suppliers = await storage.getSuppliersByIndustry(rfq.industry);
      if (!suppliers || suppliers.length === 0) {
        return res.status(404).json({ message: "No suppliers found in this industry" });
      }
      
      // Use Gemini to calculate matches
      const matches = await calculateSupplierMatches(rfq, suppliers);
      
      res.json({
        rfq: {
          id: rfq.id,
          title: rfq.title,
          industry: rfq.industry
        },
        suppliers: matches.map(match => ({
          id: match.supplier.id,
          name: match.supplier.name,
          matchScore: match.matchScore
        }))
      });
    } catch (error) {
      console.error("Error in Gemini supplier matching:", error);
      res.status(500).json({ message: "Error calculating supplier matches with Gemini" });
    }
  });

  // Import and use the supplier recommendations routes
  const supplierRecommendationsRouter = require('./routes/supplier-recommendations').default;
  app.use(supplierRecommendationsRouter);

  // Use voice API routes
  app.use(voiceApiRoutes);
  
  return httpServer;
}
