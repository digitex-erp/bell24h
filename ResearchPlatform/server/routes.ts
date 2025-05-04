import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";

// Import controllers
import { registerGstRoutes } from "./controllers/gst.controller";
import { registerVoiceRoutes } from "./controllers/voice.controller";
import { registerPaymentRoutes } from "./controllers/payment.controller";
import { registerDashboardRoutes } from "./controllers/dashboard.controller";
import { registerKredxRoutes } from "./controllers/kredx.controller";
import { registerBlockchainRoutes } from "./controllers/blockchain.controller";
import { registerIndustryTrendsRoutes } from "./controllers/industry-trends.routes";
import { registerRfqCategorizationRoutes } from "./controllers/rfq-categorization.routes";
import { registerAlertRoutes } from "./controllers/alerts.controller";
import { registerGeminiRoutes } from "./controllers/gemini.routes";
import globalTradeRoutes from "./controllers/global-trade.routes";
import { registerStockAnalysisRoutes } from "./controllers/stock-analysis.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server with specific path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial message
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to Bell24h WebSocket server' }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        switch(data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          case 'kredx-notification':
            // Broadcast KredX notifications to all connected clients
            broadcast({ type: 'kredx-update', data: data.data });
            break;
          case 'blockchain-transaction':
            // Broadcast blockchain transaction updates to all connected clients
            broadcast({ type: 'blockchain-update', data: data.data });
            break;
          // Add other message type handlers as needed
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Register API routes
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Register module routes
  registerGstRoutes(app);
  registerVoiceRoutes(app);
  registerPaymentRoutes(app);
  registerDashboardRoutes(app);
  registerKredxRoutes(app);  // Add KredX routes
  registerBlockchainRoutes(app);  // Add Blockchain routes
  registerIndustryTrendsRoutes(app);  // Add Industry Trends routes
  registerRfqCategorizationRoutes(app);  // Add RFQ Categorization routes
  registerAlertRoutes(app);  // Add Alert System routes
  registerGeminiRoutes(app);  // Add Google Gemini AI routes
  registerStockAnalysisRoutes(app);  // Add Stock Analysis routes
  app.use('/api/global-trade', globalTradeRoutes);  // Add Global Trade routes

  return httpServer;
}
