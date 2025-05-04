// Simple startup script for Bell24h RFQ Marketplace
// This script helps bridge the existing code with our external API integrations

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { WebSocketServer } from 'ws';

// Convert ESM-specific variables 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Map();

// WebSocket event handlers
wss.on('connection', (ws) => {
  const id = Date.now().toString();
  clients.set(ws, { id });
  
  console.log(`WebSocket client connected: ${id}`);
  
  // Handle messages from clients
  ws.on('message', (messageAsString) => {
    try {
      const message = JSON.parse(messageAsString.toString());
      console.log(`Received message from client ${id}:`, message.type);
      
      // Simple echo response
      ws.send(JSON.stringify({
        type: 'response',
        message: `Echo: ${message.type}`,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle disconnections
  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${id}`);
    clients.delete(ws);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Bell24h API',
    timestamp: new Date().toISOString()
  }));
});

// Broadcast function for sending messages to all clients
function broadcast(message) {
  const data = JSON.stringify(message);
  
  clients.forEach((client, ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });
}

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bell24h API is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// External API status route
app.get('/api/external/status', (req, res) => {
  // Check for configured API keys
  const externalApis = {
    'FSAT': {
      configured: !!(process.env.FSAT_API_KEY && process.env.FSAT_API_SECRET && process.env.FSAT_BASE_URL),
      endpoints: ['/api/external/fsat/services', '/api/external/fsat/orders']
    },
    'KredX': {
      configured: !!(process.env.KREDX_API_KEY && process.env.KREDX_API_SECRET),
      endpoints: ['/api/external/kredx/invoices', '/api/external/kredx/vendors']
    },
    'RazorpayX': {
      configured: !!(process.env.RAZORPAYX_API_KEY && process.env.RAZORPAYX_API_SECRET),
      endpoints: ['/api/external/razorpayx/contacts', '/api/external/razorpayx/payouts']
    },
    'Kotak Securities': {
      configured: !!(process.env.KOTAK_SECURITIES_API_KEY && process.env.KOTAK_SECURITIES_API_SECRET),
      endpoints: ['/api/external/kotak/market-data', '/api/external/kotak/orders']
    }
  };
  
  res.json({
    status: 'success',
    data: {
      externalApis,
      unconfiguredApis: Object.keys(externalApis).filter(api => !externalApis[api].configured)
    }
  });
});

// Simple RFQ route
app.get('/api/rfqs', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { 
        id: 1, 
        title: 'Industrial Valves Supply', 
        description: 'Need industrial-grade valves for oil pipeline project',
        status: 'published',
        buyerId: 101
      },
      { 
        id: 2, 
        title: 'Electrical Components for Automation', 
        description: 'Seeking electrical components for industrial automation',
        status: 'published',
        buyerId: 102
      }
    ]
  });
});

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'index.html');
  
  // Check if the index.html file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
===========================================
Bell24h RFQ Marketplace
===========================================
Server running on: http://localhost:${PORT}
API available at: http://localhost:${PORT}/api
External APIs:    http://localhost:${PORT}/api/external
Health check:     http://localhost:${PORT}/api/health
WebSocket ready:  ws://localhost:${PORT}
===========================================
  `);
  
  // Broadcast startup notification
  broadcast({
    type: 'system',
    message: 'Server started successfully',
    timestamp: new Date().toISOString()
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});