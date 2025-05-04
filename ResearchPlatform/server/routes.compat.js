const { createServer } = require("http");
const { WebSocketServer, WebSocket } = require("ws");
const { storage } = require("./storage.compat.js");

// For simplicity, we'll omit the controller imports and use a simplified approach
// In a real scenario, we would create compatible versions of each controller

async function registerRoutes(app) {
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
  function broadcast(data) {
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

  // Industry Trends Routes - Simple Implementation
  app.get('/api/industry-trends/featured', (req, res) => {
    // Return mock data for testing
    res.json({
      success: true,
      industries: [
        {
          id: 1,
          name: "Electric Vehicles",
          description: "The rapidly growing electric vehicle industry",
          icon: "zap",
          marketSize: "$500B",
          growth: "+24.5% YoY",
          keyCompetitors: ["Tesla", "BYD", "Volkswagen", "Rivian"],
          riskLevel: "medium"
        },
        {
          id: 2,
          name: "Renewable Energy",
          description: "Clean energy solutions including solar, wind and hydroelectric",
          icon: "sun",
          marketSize: "$2.5T",
          growth: "+18.2% YoY",
          keyCompetitors: ["NextEra Energy", "Orsted", "Iberdrola"],
          riskLevel: "low"
        }
      ]
    });
  });

  // Alert Routes - Simple Implementation for Testing
  app.post('/api/alerts/create', (req, res) => {
    const alertConfig = req.body;
    console.log('Creating alert:', alertConfig);
    // In a real implementation, this would save to the database
    res.json({
      success: true,
      message: "Alert created successfully",
      alertId: Date.now()
    });
  });

  // Test route for our audio implementation
  app.get('/api/test-audio', (req, res) => {
    res.json({
      success: true,
      message: "Audio system working correctly",
      sounds: ["success", "notification"]
    });
  });

  return httpServer;
}

module.exports = {
  registerRoutes
};