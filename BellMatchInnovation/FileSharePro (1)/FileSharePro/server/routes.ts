import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import {
  insertUserSchema,
  insertRfqSchema,
  insertQuoteSchema,
  insertMessageSchema,
  insertSupplierProfileSchema,
  insertPaymentSchema,
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import memorystore from "memorystore";
import bcrypt from "bcrypt";
import { fetchMarketData } from "./market-data";
import { generateAIMatches, explainMatch } from "./ai";
import voiceRoutes from "./voice-routes";
import { registerTradingRoutes } from "./trading-routes";
import { createShowcaseRoutes } from "./showcase-routes";
import { createSubscriptionRoutes } from "./subscription-routes";

// Register showcase routes
createShowcaseRoutes(app);

// Register subscription routes
createSubscriptionRoutes(app);

const MemoryStore = memorystore(session);

// WebSocket clients map
interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

let wsClients: Map<number, ExtendedWebSocket[]> = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "bell24h-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password" });
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

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on("connection", (ws: ExtendedWebSocket) => {
    ws.isAlive = true;

    // Handle ping/pong for connection health check
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Authentication message
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Authentication message
        if (data.type === "auth" && data.userId) {
          ws.userId = data.userId;
          
          if (!wsClients.has(data.userId)) {
            wsClients.set(data.userId, []);
          }
          
          wsClients.get(data.userId)?.push(ws);
          
          // Send connection confirmation
          ws.send(JSON.stringify({
            type: "connection",
            status: "connected",
            message: "Connected to WebSocket server"
          }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    // Handle disconnect
    ws.on("close", () => {
      if (ws.userId) {
        const userClients = wsClients.get(ws.userId);
        if (userClients) {
          const index = userClients.indexOf(ws);
          if (index !== -1) {
            userClients.splice(index, 1);
          }
          
          if (userClients.length === 0) {
            wsClients.delete(ws.userId);
          }
        }
      }
    });
  });

  // Health check interval for WebSocket connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (!ws.isAlive) return ws.terminate();
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  // Send message to specific user via WebSocket
  const sendWebSocketMessage = (userId: number, data: any) => {
    const userClients = wsClients.get(userId);
    
    if (userClients && userClients.length > 0) {
      const message = JSON.stringify(data);
      
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  };

  // Send message to multiple users
  const broadcastToUsers = (userIds: number[], data: any) => {
    const message = JSON.stringify(data);
    
    userIds.forEach(userId => {
      const userClients = wsClients.get(userId);
      
      if (userClients && userClients.length > 0) {
        userClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    });
  };

  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // RFQ ROUTES
  app.get("/api/rfqs", async (req, res) => {
    try {
      const status = req.query.status as string;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      const rfqs = await storage.getRFQs({
        status: status as any,
        categoryId
      });
      
      res.json(rfqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.get("/api/rfqs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rfq = await storage.getRFQ(id);
      
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      res.json(rfq);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFQ" });
    }
  });

  app.post("/api/rfqs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const rfqData = insertRfqSchema.parse(req.body);
      
      const rfq = await storage.createRFQ({
        ...rfqData,
        userId
      });
      
      // Generate AI matches for suppliers
      generateAIMatches(rfq.id);
      
      // Notify matched suppliers via WebSocket
      // This will be populated by the AI matching function
      
      res.status(201).json(rfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create RFQ" });
      }
    }
  });

  app.put("/api/rfqs/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Verify ownership
      const existingRfq = await storage.getRFQ(id);
      if (!existingRfq || existingRfq.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this RFQ" });
      }
      
      const rfqData = insertRfqSchema.partial().parse(req.body);
      const updatedRfq = await storage.updateRFQ(id, rfqData);
      
      res.json(updatedRfq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update RFQ" });
      }
    }
  });

  // QUOTE ROUTES
  app.get("/api/rfqs/:rfqId/quotes", async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const quotes = await storage.getQuotesByRFQId(rfqId);
      
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post("/api/rfqs/:rfqId/quotes", isAuthenticated, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const userId = (req.user as any).id;
      
      // Verify RFQ exists
      const rfq = await storage.getRFQ(rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      const quoteData = insertQuoteSchema.parse(req.body);
      
      const quote = await storage.createQuote({
        ...quoteData,
        rfqId,
        userId
      });
      
      // Notify RFQ owner of new quote via WebSocket
      sendWebSocketMessage(rfq.userId, {
        type: "new-quote",
        data: {
          quoteId: quote.id,
          rfqId: rfq.id,
          rfqTitle: rfq.title,
          supplierId: userId
        }
      });
      
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create quote" });
      }
    }
  });

  app.put("/api/quotes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Verify ownership
      const existingQuote = await storage.getQuote(id);
      if (!existingQuote || existingQuote.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this quote" });
      }
      
      const quoteData = insertQuoteSchema.partial().parse(req.body);
      const updatedQuote = await storage.updateQuote(id, quoteData);
      
      // Get RFQ info to notify owner
      const rfq = await storage.getRFQ(existingQuote.rfqId);
      if (rfq) {
        sendWebSocketMessage(rfq.userId, {
          type: "quote-updated",
          data: {
            quoteId: updatedQuote.id,
            rfqId: rfq.id,
            rfqTitle: rfq.title,
            supplierId: userId
          }
        });
      }
      
      res.json(updatedQuote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update quote" });
      }
    }
  });

  // MESSAGING ROUTES
  app.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const currentUserId = (req.user as any).id;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessages(currentUserId, otherUserId);
      
      // Mark messages as read
      messages.forEach(async (message) => {
        if (message.receiverId === currentUserId && message.status !== 'read') {
          await storage.updateMessageStatus(message.id, 'read');
        }
      });
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const senderId = (req.user as any).id;
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
      const message = await storage.createMessage(messageData);
      
      // Send real-time notification to recipient
      sendWebSocketMessage(messageData.receiverId, {
        type: "new-message",
        data: message
      });
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // CATEGORY ROUTES
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // SUPPLIER ROUTES
  app.get("/api/suppliers", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      if (categoryId) {
        const suppliers = await storage.getSuppliersByCategory(categoryId);
        return res.json(suppliers);
      }
      
      // If no category filter, return all suppliers (to be implemented)
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profile = await storage.getSupplierProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Supplier profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier profile" });
    }
  });

  app.post("/api/suppliers/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if user is a supplier
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'supplier') {
        return res.status(403).json({ message: "Only suppliers can create profiles" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getSupplierProfile(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      
      const profileData = insertSupplierProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createSupplierProfile(profileData);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create supplier profile" });
      }
    }
  });

  app.put("/api/suppliers/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if profile exists
      const existingProfile = await storage.getSupplierProfile(userId);
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const profileData = insertSupplierProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateSupplierProfile(userId, profileData);
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update supplier profile" });
      }
    }
  });

  // AI MATCH ROUTES
  app.get("/api/rfqs/:rfqId/matches", isAuthenticated, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      
      // Verify RFQ exists and ownership
      const rfq = await storage.getRFQ(rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      
      const userId = (req.user as any).id;
      if (rfq.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view matches for this RFQ" });
      }
      
      const matches = await storage.getAIMatchesByRFQ(rfqId);
      
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI matches" });
    }
  });

  app.get("/api/ai/explain-match/:matchId", isAuthenticated, async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      
      // This would call the AI service to get detailed explanation
      const explanation = await explainMatch(matchId);
      
      res.json(explanation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get match explanation" });
    }
  });

  // PAYMENT ROUTES
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const buyerId = (req.user as any).id;
      
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        buyerId
      });
      
      // Verify quote exists
      const quote = await storage.getQuote(paymentData.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Create payment
      const payment = await storage.createPayment(paymentData);
      
      // Notify supplier of payment
      sendWebSocketMessage(paymentData.supplierId, {
        type: "new-payment",
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          quoteId: payment.quoteId,
          status: payment.status
        }
      });
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create payment" });
      }
    }
  });

  // MARKET DATA ROUTES
  app.get("/api/market-data", async (req, res) => {
    try {
      const marketData = await storage.getAllMarketData();
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Fetch market data every hour
  setInterval(async () => {
    try {
      await fetchMarketData();
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    }
  }, 60 * 60 * 1000);

  // VOICE API ROUTES
  app.use('/api/voice', voiceRoutes);
  
  // TRADING API ROUTES
  await registerTradingRoutes(app);

  // Initial market data fetch on startup
  fetchMarketData().catch(err => console.error("Initial market data fetch failed:", err));

  return httpServer;
}
