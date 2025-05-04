import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { promises as fs } from 'fs';
import { z } from "zod";
import { storage } from "./storage";
import { rfqController } from "./controllers/rfq-controller";
import { suppliersController } from "./controllers/suppliers-controller";
import { paymentsController } from "./controllers/payments-controller";
import { m1exchangeController } from "./controllers/m1exchange-controller";
import { userController } from "./controllers/user-controller";
import { userPreferencesController } from "./controllers/user-preferences-controller";
import { 
  handleChatbotMessage, 
  getSupplierMatchExplanation, 
  getProcurementInsights,
  optimizeRfq,
  getSupplierCompatibility,
  getNegotiationTalkingPoints
} from "./controllers/chatbot-controller";

import { procurementInsightsService } from './services/procurement-insights-service';

// Import supplier matching service and recommendation service
import supplierMatchingService from "./services/supplier-matching";
import { recommendationService } from "./services/recommendation-service";

// Import new services for document processing and stock market data
import documentProcessingService from "./services/documentProcessingService";
import indianStockService from "./services/indianStockService";
import usStockService from "./services/usStockService";
import pdfReportService from "./services/pdfReportService";

// Import procurement challenge controller
import { procurementChallengeController } from "./controllers/procurement-challenge-controller";

// Import OpenAI service
import { openAIService } from "./services/openai-service";

// Import GST validation service
import gstValidationService from "./services/gst-validation-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server on a separate path from Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'notification',
      data: { message: 'Connected to Bell24h WebSocket server' },
      timestamp: new Date().toISOString()
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        // Handle message based on type
        if (parsedMessage.type && parsedMessage.data) {
          // Echo back for now
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: `${parsedMessage.type}_response`,
              data: parsedMessage.data,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast to all connected clients
  const broadcastMessage = (type: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString()
        }));
      }
    });
  };
  
  // Broadcast a complete message payload to all connected clients
  const broadcastToWebSocketClients = (message: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
  
  // API prefix
  const apiPrefix = '/api';
  
  // RFQ routes
  app.get(`${apiPrefix}/rfqs`, rfqController.getRfqs);
  app.get(`${apiPrefix}/rfqs/:id`, rfqController.getRfqById);
  app.post(`${apiPrefix}/rfqs`, rfqController.createRfq);
  app.put(`${apiPrefix}/rfqs/:id`, rfqController.updateRfq);
  app.delete(`${apiPrefix}/rfqs/:id`, rfqController.deleteRfq);
  app.get(`${apiPrefix}/rfqs/:id/suppliers`, rfqController.getMatchedSuppliers);
  app.post(`${apiPrefix}/rfqs/:id/invite/:supplierId`, rfqController.inviteSupplier);
  app.post(`${apiPrefix}/rfqs/new/invite/:supplierId`, rfqController.inviteSupplierWithNewRfq);
  
  // Supplier routes
  app.get(`${apiPrefix}/suppliers`, suppliersController.getSuppliers);
  app.get(`${apiPrefix}/suppliers/matched`, suppliersController.getMatchedSuppliers);
  app.get(`${apiPrefix}/suppliers/risk`, suppliersController.getSuppliersWithRisk);
  app.get(`${apiPrefix}/suppliers/:id`, suppliersController.getSupplierById);
  app.post(`${apiPrefix}/suppliers`, suppliersController.createSupplier);
  app.put(`${apiPrefix}/suppliers/:id`, suppliersController.updateSupplier);
  
  // Payment routes
  app.get(`${apiPrefix}/payments/wallet`, paymentsController.getWallet);
  app.get(`${apiPrefix}/payments/transactions`, paymentsController.getTransactions);
  app.post(`${apiPrefix}/payments/add-funds`, paymentsController.addFunds);
  app.post(`${apiPrefix}/payments/withdraw`, paymentsController.withdrawFunds);
  app.post(`${apiPrefix}/payments/escrow/create`, paymentsController.createEscrow);
  app.post(`${apiPrefix}/payments/escrow/release/:id`, paymentsController.releaseEscrow);
  app.get(`${apiPrefix}/payments/invoices`, paymentsController.getInvoices);
  app.post(`${apiPrefix}/payments/invoices/create`, paymentsController.createInvoice);
  app.post(`${apiPrefix}/payments/invoices/discount/:id`, paymentsController.discountInvoice);
  app.get(`${apiPrefix}/payments/kredx/status`, paymentsController.getKredxStatus);
  
  // Milestone payment routes
  app.get(`${apiPrefix}/payments/milestones`, paymentsController.getMilestonePayments);
  app.get(`${apiPrefix}/payments/milestones/rfq/:rfqId`, paymentsController.getRfqMilestonePayments);
  app.get(`${apiPrefix}/payments/milestones/supplier/:supplierId`, paymentsController.getSupplierMilestonePayments);
  app.post(`${apiPrefix}/payments/milestones/create`, paymentsController.createMilestonePayment);
  app.post(`${apiPrefix}/payments/milestones/approve/:id`, paymentsController.approveMilestonePayment);
  app.post(`${apiPrefix}/payments/milestones/release/:id`, paymentsController.releaseMilestonePayment);
  app.post(`${apiPrefix}/payments/milestones/early-payment/:milestoneId`, paymentsController.requestEarlyMilestonePayment);
  
  // M1 Exchange integration routes
  app.get(`${apiPrefix}/m1exchange/status`, m1exchangeController.getStatus);
  app.post(`${apiPrefix}/m1exchange/early-payment/:milestoneId`, m1exchangeController.requestEarlyPayment);
  app.get(`${apiPrefix}/m1exchange/transactions/supplier/:supplierId`, m1exchangeController.getSupplierTransactions);
  app.get(`${apiPrefix}/m1exchange/transactions/:transactionId`, m1exchangeController.checkTransactionStatus);
  
  // User routes
  app.get(`${apiPrefix}/users/me`, userController.getCurrentUser);
  app.get(`${apiPrefix}/users/:id`, userController.getUserById);
  app.patch(`${apiPrefix}/users/profile`, userController.updateProfile);
  app.get(`${apiPrefix}/users/settings`, userController.getUserSettings);
  app.patch(`${apiPrefix}/users/settings/notifications`, userController.updateNotificationSettings);
  app.patch(`${apiPrefix}/users/settings/supplier`, userController.updateSupplierSettings);
  
  // User preferences routes
  app.get(`${apiPrefix}/users/:userId/preferences`, userPreferencesController.getUserPreferences);
  app.put(`${apiPrefix}/users/:userId/preferences`, userPreferencesController.updateUserPreferences);
  app.post(`${apiPrefix}/users/:userId/preferences/generate`, userPreferencesController.generateUserPreferences);
  
  // Dashboard stats
  app.get(`${apiPrefix}/dashboard/stats`, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });
  
  // Activity feed
  app.get(`${apiPrefix}/activity/recent`, async (req, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent activity' });
    }
  });
  
  // Market insights
  app.get(`${apiPrefix}/market-insights`, async (req, res) => {
    const { timeframe = 'monthly' } = req.query;
    try {
      const insights = await storage.getMarketInsights(timeframe as string);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch market insights' });
    }
  });
  
  // Notification count
  app.get(`${apiPrefix}/notifications/count`, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationsCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notification count' });
    }
  });
  
  // Messages unread count
  app.get(`${apiPrefix}/messages/unread-count`, async (req, res) => {
    try {
      const count = await storage.getUnreadMessagesCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch unread messages count' });
    }
  });
  
  // Chatbot endpoints
  app.post(`${apiPrefix}/chatbot`, handleChatbotMessage);
  
  // Gemini chatbot and API endpoints
  app.get(`${apiPrefix}/chatbot/supplier-match/:rfqId/:supplierId`, getSupplierMatchExplanation);
  app.post(`${apiPrefix}/chatbot/procurement-insights`, getProcurementInsights);
  app.post(`${apiPrefix}/chatbot/rfq-optimization`, optimizeRfq);
  app.post(`${apiPrefix}/chatbot/supplier-compatibility`, getSupplierCompatibility);
  app.post(`${apiPrefix}/chatbot/negotiation-talking-points`, getNegotiationTalkingPoints);
  
  // OpenAI endpoints
  app.post(`${apiPrefix}/openai/transcribe`, async (req, res) => {
    const { audio, language } = req.body;
    
    // Validate request parameters
    if (!audio) {
      return res.status(400).json({ 
        success: false, 
        error: 'Audio data is required'
      });
    }
    
    // Validate audio data format (quick check if it looks like base64)
    if (typeof audio !== 'string' || !(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(audio))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid audio data format. Must be a valid base64 string.'
      });
    }
    
    // Optional language validation
    if (language && typeof language !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'If provided, language must be a string (e.g., "en", "hi")'
      });
    }
    
    try {
      // Check if OpenAI service is available
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return res.status(503).json({
          success: false,
          error: 'Speech-to-text service is not configured. Please contact the administrator.'
        });
      }
      
      // Use the OpenAI service to transcribe the audio
      const result = await openAIService.transcribeAudio(audio, language);
      res.json(result);
    } catch (error: any) {
      console.error('Transcription error:', error);
      
      // Determine if it's a rate limit issue, auth issue, or other
      if (error.message?.includes('rate limit')) {
        return res.status(429).json({ 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.'
        });
      } else if (error.message?.includes('auth') || error.message?.includes('key')) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed with the AI service. Please contact support.'
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to transcribe audio', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
  
  app.post(`${apiPrefix}/openai/extract-rfq`, async (req, res) => {
    const { text, language } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    try {
      // Use the OpenAI service to extract RFQ data
      const result = await openAIService.extractRfqFromText(text, language);
      res.json(result);
    } catch (error) {
      console.error('RFQ extraction error:', error);
      res.status(500).json({ message: 'Failed to extract RFQ data' });
    }
  });
  
  app.post(`${apiPrefix}/openai/match-explanation`, async (req, res) => {
    const { rfqId, supplierId } = req.body;
    
    if (!rfqId || !supplierId) {
      return res.status(400).json({ message: 'RFQ ID and supplier ID are required' });
    }
    
    try {
      // Use the OpenAI service to get the supplier match explanation
      const result = await openAIService.getSupplierMatchExplanation(rfqId, supplierId);
      res.json(result);
    } catch (error) {
      console.error('Match explanation error:', error);
      res.status(500).json({ message: 'Failed to get match explanation' });
    }
  });
  
  app.post(`${apiPrefix}/openai/process-video`, async (req, res) => {
    const { video } = req.body;
    
    if (!video) {
      return res.status(400).json({ message: 'Video data is required' });
    }
    
    try {
      // Use the OpenAI service to process the video
      const result = await openAIService.processVideoRfq(video);
      res.json(result);
    } catch (error) {
      console.error('Video processing error:', error);
      res.status(500).json({ message: 'Failed to process video' });
    }
  });
  
  // Advanced supplier matching routes
  app.post(`${apiPrefix}/supplier-matching/:rfqId`, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const useAdvancedAlgorithms = req.body.useAdvancedAlgorithms !== false; // Default to true
      
      if (isNaN(rfqId)) {
        return res.status(400).json({ message: 'Invalid RFQ ID' });
      }
      
      console.log(`Finding suppliers for RFQ #${rfqId} with${useAdvancedAlgorithms ? '' : 'out'} advanced algorithms, limit: ${limit}`);
      
      const matchedSuppliers = await supplierMatchingService.findMatchingSuppliers(
        rfqId, 
        limit,
        useAdvancedAlgorithms
      );
      
      // Send notification to all connected WebSocket clients
      broadcastToWebSocketClients({
        type: 'supplier_matching_complete',
        data: {
          rfqId: rfqId,
          supplierCount: matchedSuppliers.length,
          timestamp: new Date().toISOString()
        }
      });
      
      res.json(matchedSuppliers);
    } catch (error) {
      console.error('Supplier matching error:', error);
      res.status(500).json({ message: 'Failed to find matching suppliers', error: String(error) });
    }
  });
  
  // Legacy route for backward compatibility
  app.get(`${apiPrefix}/supplier-matching/:rfqId`, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (isNaN(rfqId)) {
        return res.status(400).json({ message: 'Invalid RFQ ID' });
      }
      
      // Use basic algorithm for GET requests
      const matchedSuppliers = await supplierMatchingService.findMatchingSuppliers(rfqId, limit, false);
      res.json(matchedSuppliers);
    } catch (error) {
      console.error('Supplier matching error:', error);
      res.status(500).json({ message: 'Failed to find matching suppliers', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/supplier-recommendations/:rfqId`, async (req, res) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (isNaN(rfqId)) {
        return res.status(400).json({ message: 'Invalid RFQ ID' });
      }
      
      const recommendations = await supplierMatchingService.getRecommendationsWithSuppliers(rfqId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error('Supplier recommendations error:', error);
      res.status(500).json({ message: 'Failed to get supplier recommendations', error: String(error) });
    }
  });
  
  app.post(`${apiPrefix}/supplier-matching/historical-feedback`, async (req, res) => {
    try {
      const { rfqId, supplierId, wasSuccessful, buyerFeedback, supplierFeedback, feedbackNotes } = req.body;
      
      if (!rfqId || !supplierId) {
        return res.status(400).json({ message: 'RFQ ID and supplier ID are required' });
      }
      
      if (typeof wasSuccessful !== 'boolean') {
        return res.status(400).json({ message: 'wasSuccessful must be a boolean' });
      }
      
      const result = await supplierMatchingService.updateHistoricalMatch(
        rfqId,
        supplierId,
        wasSuccessful,
        buyerFeedback,
        supplierFeedback,
        feedbackNotes
      );
      
      res.json(result);
    } catch (error) {
      console.error('Historical match update error:', error);
      res.status(500).json({ message: 'Failed to update historical match', error: String(error) });
    }
  });
  
  // WebSocket route for real-time supplier matching notifications
  app.post(`${apiPrefix}/supplier-matching/notify`, async (req, res) => {
    try {
      const { rfqId, message } = req.body;
      
      if (!rfqId || !message) {
        return res.status(400).json({ message: 'RFQ ID and notification message are required' });
      }
      
      // Broadcast the notification to all connected clients
      broadcastMessage('supplier_match_notification', {
        rfqId,
        message,
        timestamp: new Date().toISOString()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Supplier match notification error:', error);
      res.status(500).json({ message: 'Failed to send notification', error: String(error) });
    }
  });

  // Recommendation carousel routes
  // Get personalized RFQ recommendations for a user
  app.get(`${apiPrefix}/recommendations/rfqs/personalized`, async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const excludeRfqIds = req.query.exclude 
        ? (req.query.exclude as string).split(',').map(id => parseInt(id))
        : [];
      const language = (req.query.language as string) || 'en';
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid user ID is required' });
      }
      
      const recommendations = await recommendationService.getPersonalizedRfqRecommendations(
        userId,
        limit,
        excludeRfqIds,
        language
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error('Personalized RFQ recommendations error:', error);
      res.status(500).json({ 
        message: 'Failed to get personalized RFQ recommendations',
        error: String(error)
      });
    }
  });
  
  // Get trending RFQs
  app.get(`${apiPrefix}/recommendations/rfqs/trending`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const language = (req.query.language as string) || 'en';
      
      const trendingRfqs = await recommendationService.getTrendingRfqs(limit, userId, language);
      res.json(trendingRfqs);
    } catch (error) {
      console.error('Trending RFQs error:', error);
      res.status(500).json({ 
        message: 'Failed to get trending RFQs',
        error: String(error)
      });
    }
  });
  
  // Send WebSocket updates for new recommendations
  app.post(`${apiPrefix}/recommendations/notify`, async (req, res) => {
    try {
      const { userId, recommendationType, count } = req.body;
      
      if (!userId || !recommendationType) {
        return res.status(400).json({ 
          message: 'User ID and recommendation type are required'
        });
      }
      
      // Broadcast recommendation notification to all connected clients
      broadcastMessage('new_recommendations', {
        userId,
        recommendationType,
        count: count || 1,
        timestamp: new Date().toISOString()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Recommendation notification error:', error);
      res.status(500).json({ 
        message: 'Failed to send recommendation notification',
        error: String(error)
      });
    }
  });
  
  // Document Processing API routes
  app.post(`${apiPrefix}/document-processing/analyze`, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: 'Image data is required' });
      }
      
      const result = await documentProcessingService.analyzeProcurementDocument(imageBase64);
      res.json(result);
    } catch (error) {
      console.error('Document analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze document', error: String(error) });
    }
  });
  
  app.post(`${apiPrefix}/document-processing/extract-line-items`, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: 'Image data is required' });
      }
      
      const result = await documentProcessingService.extractLineItems(imageBase64);
      res.json(result);
    } catch (error) {
      console.error('Line item extraction error:', error);
      res.status(500).json({ message: 'Failed to extract line items', error: String(error) });
    }
  });
  
  app.post(`${apiPrefix}/document-processing/summarize`, async (req, res) => {
    try {
      const { documentBase64 } = req.body;
      
      if (!documentBase64) {
        return res.status(400).json({ message: 'Document data is required' });
      }
      
      const result = await documentProcessingService.summarizeDocument(documentBase64);
      res.json({ summary: result });
    } catch (error) {
      console.error('Document summarization error:', error);
      res.status(500).json({ message: 'Failed to summarize document', error: String(error) });
    }
  });
  
  app.post(`${apiPrefix}/document-processing/custom-extraction`, async (req, res) => {
    try {
      const { imageBase64, extractionPrompt } = req.body;
      
      if (!imageBase64 || !extractionPrompt) {
        return res.status(400).json({ message: 'Image data and extraction prompt are required' });
      }
      
      const result = await documentProcessingService.extractDataFromImage(imageBase64, extractionPrompt);
      res.json(result);
    } catch (error) {
      console.error('Custom data extraction error:', error);
      res.status(500).json({ message: 'Failed to extract custom data', error: String(error) });
    }
  });
  
  // Indian Stock Market API routes
  app.get(`${apiPrefix}/market/india/stock/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
      }
      
      const result = await indianStockService.getStockData(symbol);
      res.json(result);
    } catch (error) {
      console.error(`Error fetching Indian stock data for ${req.params.symbol}:`, error);
      res.status(500).json({ message: 'Failed to fetch stock data', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/india/indices`, async (req, res) => {
    try {
      const result = await indianStockService.getMarketIndices();
      res.json(result);
    } catch (error) {
      console.error('Error fetching Indian market indices:', error);
      res.status(500).json({ message: 'Failed to fetch market indices', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/india/gainers-losers`, async (req, res) => {
    try {
      const result = await indianStockService.getTopGainersLosers();
      res.json(result);
    } catch (error) {
      console.error('Error fetching Indian market gainers/losers:', error);
      res.status(500).json({ message: 'Failed to fetch gainers/losers', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/india/company/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Company symbol is required' });
      }
      
      const result = await indianStockService.getCompanyInfo(symbol);
      res.json(result);
    } catch (error) {
      console.error(`Error fetching Indian company info for ${req.params.symbol}:`, error);
      res.status(500).json({ message: 'Failed to fetch company info', error: String(error) });
    }
  });
  
  // US Stock Market API routes
  app.get(`${apiPrefix}/market/us/quote/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
      }
      
      const result = await usStockService.getStockQuote(symbol);
      res.json(result);
    } catch (error) {
      console.error(`Error fetching US stock quote for ${req.params.symbol}:`, error);
      res.status(500).json({ message: 'Failed to fetch stock quote', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/us/historical/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval = 'daily' } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
      }
      
      const validInterval = ['daily', 'weekly', 'monthly'].includes(interval as string) 
        ? (interval as 'daily' | 'weekly' | 'monthly') 
        : 'daily';
        
      const result = await usStockService.getHistoricalData(symbol, validInterval);
      res.json(result);
    } catch (error) {
      console.error(`Error fetching US historical data for ${req.params.symbol}:`, error);
      res.status(500).json({ message: 'Failed to fetch historical data', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/us/company/:symbol`, async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Company symbol is required' });
      }
      
      const result = await usStockService.getCompanyOverview(symbol);
      res.json(result);
    } catch (error) {
      console.error(`Error fetching US company overview for ${req.params.symbol}:`, error);
      res.status(500).json({ message: 'Failed to fetch company overview', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/us/indices`, async (req, res) => {
    try {
      const result = await usStockService.getMarketIndices();
      res.json(result);
    } catch (error) {
      console.error('Error fetching US market indices:', error);
      res.status(500).json({ message: 'Failed to fetch market indices', error: String(error) });
    }
  });
  
  app.get(`${apiPrefix}/market/us/search`, async (req, res) => {
    try {
      const { keywords } = req.query;
      
      if (!keywords) {
        return res.status(400).json({ message: 'Search keywords are required' });
      }
      
      const result = await usStockService.searchStocks(keywords as string);
      res.json(result);
    } catch (error) {
      console.error(`Error searching US stocks for "${req.query.keywords}":`, error);
      res.status(500).json({ message: 'Failed to search stocks', error: String(error) });
    }
  });
  
  // PDF Report Generation API routes
  app.post(`${apiPrefix}/reports/supplier-performance/:supplierId`, async (req, res) => {
    try {
      const { supplierId } = req.params;
      
      if (!supplierId) {
        return res.status(400).json({ message: 'Supplier ID is required' });
      }
      
      const reportPath = await pdfReportService.generateSupplierPerformanceReport(supplierId);
      
      // For the HTML fallback, use a direct file download approach
      const reportContent = await fs.readFile(reportPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="supplier-performance-${supplierId}.html"`);
      
      return res.send(reportContent);
    } catch (error) {
      console.error(`Error generating supplier performance report:`, error);
      res.status(500).json({ message: 'Failed to generate report', error: String(error) });
    }
  });
  
  app.post(`${apiPrefix}/reports/rfq-match-history/:rfqId`, async (req, res) => {
    try {
      const { rfqId } = req.params;
      
      if (!rfqId) {
        return res.status(400).json({ message: 'RFQ ID is required' });
      }
      
      const reportPath = await pdfReportService.generateRfqMatchHistoryReport(rfqId);
      
      // For the HTML fallback, use a direct file download approach
      const reportContent = await fs.readFile(reportPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="rfq-match-history-${rfqId}.html"`);
      
      return res.send(reportContent);
    } catch (error) {
      console.error(`Error generating RFQ match history report:`, error);
      res.status(500).json({ message: 'Failed to generate report', error: String(error) });
    }
  });
  
  app.post(`${apiPrefix}/reports/daily-summary`, async (req, res) => {
    try {
      const reportPath = await pdfReportService.generateDailySummaryReport();
      
      // For the HTML fallback, use a direct file download approach
      const reportContent = await fs.readFile(reportPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="daily-summary-${new Date().toISOString().split('T')[0]}.html"`);
      
      return res.send(reportContent);
    } catch (error) {
      console.error(`Error generating daily summary report:`, error);
      res.status(500).json({ message: 'Failed to generate report', error: String(error) });
    }
  });

  // M1 Exchange API Routes
  
  // Check M1 Exchange service status
  app.get(`${apiPrefix}/m1exchange/status`, m1exchangeController.getStatus);
  
  // Request early payment for a milestone
  app.post(`${apiPrefix}/m1exchange/early-payment/:milestoneId`, m1exchangeController.requestEarlyPayment);
  
  // Get transaction details by ID
  app.get(`${apiPrefix}/m1exchange/transactions/:transactionId`, m1exchangeController.getTransactionById);
  
  // Get all transactions for a supplier
  app.get(`${apiPrefix}/m1exchange/transactions/supplier/:supplierId`, m1exchangeController.getSupplierTransactions);
  
  // Update transaction status
  app.patch(`${apiPrefix}/m1exchange/transactions/:transactionId/status`, m1exchangeController.updateTransactionStatus);
  
  // Generate payment report
  app.get(`${apiPrefix}/m1exchange/reports/payments`, m1exchangeController.generatePaymentReport);
  
  app.post(`${apiPrefix}/reports/document-analysis`, async (req, res) => {
    try {
      const { documentBase64 } = req.body;
      
      if (!documentBase64) {
        return res.status(400).json({ message: 'Document data is required' });
      }
      
      const reportPath = await pdfReportService.generateReportFromDocument(documentBase64);
      
      // For the HTML fallback, use a direct file download approach
      const reportContent = await fs.readFile(reportPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="document-analysis-${new Date().toISOString().split('T')[0]}.html"`);
      
      return res.send(reportContent);
    } catch (error) {
      console.error(`Error generating document analysis report:`, error);
      res.status(500).json({ message: 'Failed to generate report', error: String(error) });
    }
  });
  
  // Procurement Challenge Routes
  app.get(`${apiPrefix}/procurement/challenges`, procurementChallengeController.getChallenges);
  app.get(`${apiPrefix}/procurement/challenges/:id`, procurementChallengeController.getChallengeById);
  app.post(`${apiPrefix}/procurement/challenges/:id/start`, procurementChallengeController.startChallenge);
  app.post(`${apiPrefix}/procurement/challenges/:challengeId/steps/:stepId/submit`, procurementChallengeController.submitStepAnswer);
  app.post(`${apiPrefix}/procurement/challenges/:id/complete`, procurementChallengeController.completeChallenge);
  app.get(`${apiPrefix}/procurement/user/progress`, procurementChallengeController.getUserChallengeProgress);
  app.get(`${apiPrefix}/procurement/user/achievements`, procurementChallengeController.getUserAchievements);
  app.get(`${apiPrefix}/procurement/leaderboard`, procurementChallengeController.getLeaderboard);
  
  // GST Validation Routes
  app.post(`${apiPrefix}/gst/validate`, async (req: Request, res: Response) => {
    try {
      const { gstin } = req.body;
      
      if (!gstin) {
        return res.status(400).json({ 
          valid: false, 
          message: "GST number is required" 
        });
      }
      
      const result = await gstValidationService.validateGSTIN(gstin);
      return res.status(result.valid ? 200 : 400).json(result);
    } catch (error: any) {
      console.error(`Error validating GST number:`, error);
      return res.status(500).json({ 
        valid: false,
        message: "Error validating GST number", 
        error: error.message 
      });
    }
  });

  app.get(`${apiPrefix}/gst/business-details/:gstin`, async (req: Request, res: Response) => {
    try {
      const { gstin } = req.params;
      
      if (!gstin) {
        return res.status(400).json({ 
          success: false, 
          message: "GST number is required" 
        });
      }
      
      const result = await gstValidationService.getBusinessDetails(gstin);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error(`Error fetching business details:`, error);
      return res.status(500).json({ 
        success: false,
        message: "Error fetching business details", 
        error: error.message 
      });
    }
  });

  app.post(`${apiPrefix}/gst/verify-invoice`, async (req: Request, res: Response) => {
    try {
      const { gstin, invoiceNumber, invoiceDate } = req.body;
      
      if (!gstin || !invoiceNumber || !invoiceDate) {
        return res.status(400).json({ 
          valid: false, 
          message: "GST number, invoice number, and invoice date are required" 
        });
      }
      
      const result = await gstValidationService.verifyInvoice(gstin, invoiceNumber, invoiceDate);
      return res.status(result.valid ? 200 : 400).json(result);
    } catch (error: any) {
      console.error(`Error verifying invoice:`, error);
      return res.status(500).json({ 
        valid: false,
        message: "Error verifying invoice", 
        error: error.message 
      });
    }
  });

  app.post(`${apiPrefix}/gst/bulk-validate`, async (req: Request, res: Response) => {
    try {
      const { gstinList } = req.body;
      
      if (!gstinList || !Array.isArray(gstinList) || gstinList.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "List of GST numbers is required", 
          results: [] 
        });
      }
      
      const result = await gstValidationService.bulkValidateGSTINs(gstinList);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error(`Error in bulk GST validation:`, error);
      return res.status(500).json({ 
        success: false,
        message: "Error in bulk GST validation", 
        error: error.message,
        results: []
      });
    }
  });

  // Supplier registration with GST validation
  app.post(`${apiPrefix}/suppliers/register`, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          message: "Authentication required" 
        });
      }
      
      // Check if this user already has a supplier profile
      const existingProfile = await storage.getSupplierByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({ 
          message: "Supplier profile already exists. Use the update endpoint to modify." 
        });
      }
      
      // Parse and validate the request data
      const supplierData = {
        ...req.body,
        userId,
      };
      
      // Special handling for GST validation fields
      if (supplierData.gstin) {
        // If GST number is provided but not verified through our system, verify it now
        if (!supplierData.gstinVerified) {
          const validationResult = await gstValidationService.validateGSTIN(supplierData.gstin);
          
          if (validationResult.valid) {
            // Update with valid GST information
            supplierData.gstinVerified = true;
            supplierData.gstinVerificationDate = new Date();
            supplierData.legalName = validationResult.legal_name;
            supplierData.tradeName = validationResult.trade_name;
            supplierData.taxPayerType = validationResult.tax_payer_type;
            supplierData.businessType = validationResult.business_type;
            supplierData.registrationDate = validationResult.registration_date ? new Date(validationResult.registration_date) : undefined;
          } else {
            // GST validation failed
            return res.status(400).json({
              message: "GST validation failed. Please provide a valid GSTIN.",
              details: validationResult.message
            });
          }
        }
      }
      
      const newSupplier = await storage.createSupplier(supplierData);
      
      // Broadcast new supplier registration to WebSocket clients
      broadcastToWebSocketClients({
        type: 'supplier_registered',
        data: {
          supplierId: newSupplier.id,
          companyName: newSupplier.companyName,
          verified: newSupplier.gstinVerified || false,
          timestamp: new Date().toISOString()
        }
      });
      
      res.status(201).json(newSupplier);
    } catch (error) {
      console.error("Error in supplier registration:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid supplier data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to register supplier profile", 
          error: (error as Error).message 
        });
      }
    }
  });
  
  return httpServer;
}
