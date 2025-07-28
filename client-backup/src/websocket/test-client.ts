/**
 * Bell24H WebSocket Test Client
 * 
 * This script helps test the WebSocket server implementation by connecting
 * to the server, authenticating, and testing various message types.
 */
import WebSocket from 'ws';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Configuration
const WS_PORT = process.env.WS_PORT || 8080;
const WS_HOST = process.env.WS_HOST || 'localhost';
const WS_URL = `ws://${WS_HOST}:${WS_PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'bell24h_default_secret';

// Setup readline interface for interactive testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Logging utilities
function log(message: string, data?: any) {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Generate a JWT token for authentication
function generateToken(userId: number, username: string, role: string): string {
  return jwt.sign(
    { 
      userId, 
      username, 
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    },
    JWT_SECRET
  );
}

// Create a WebSocket connection
function createWebSocketConnection(token: string): WebSocket {
  log(`Connecting to WebSocket server at ${WS_URL}`);
  
  const ws = new WebSocket(WS_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Setup event handlers
  ws.on('open', () => {
    log('Connected to WebSocket server');
    showCommandMenu(ws);
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      log('Received message:', message);
    } catch (error) {
      log('Received non-JSON message:', data.toString());
    }
  });
  
  ws.on('error', (error) => {
    log('WebSocket error:', error);
  });
  
  ws.on('close', (code, reason) => {
    log(`WebSocket connection closed: ${code} ${reason}`);
    process.exit(0);
  });
  
  return ws;
}

// Display available test commands
function showCommandMenu(ws: WebSocket) {
  console.log('\n----- Bell24H WebSocket Test Commands -----');
  console.log('1. Send ping');
  console.log('2. Subscribe to RFQ updates');
  console.log('3. Send RFQ update notification');
  console.log('4. Send bid notification');
  console.log('5. Get presence status');
  console.log('6. Close connection');
  console.log('----------------------------------------\n');
  
  rl.question('Enter command number: ', (answer) => {
    switch (answer) {
      case '1':
        sendPing(ws);
        break;
      case '2':
        subscribeToRfq(ws);
        break;
      case '3':
        sendRfqUpdate(ws);
        break;
      case '4':
        sendBidNotification(ws);
        break;
      case '5':
        getPresenceStatus(ws);
        break;
      case '6':
        ws.close();
        rl.close();
        return;
      default:
        console.log('Invalid command');
    }
    
    // Show menu again after command executes
    setTimeout(() => showCommandMenu(ws), 1000);
  });
}

// Test commands
function sendPing(ws: WebSocket) {
  const message = { type: 'ping', timestamp: new Date().toISOString() };
  ws.send(JSON.stringify(message));
  log('Sent ping message');
}

function subscribeToRfq(ws: WebSocket) {
  rl.question('Enter RFQ ID to subscribe to: ', (rfqId) => {
    const message = { 
      type: 'subscribe', 
      rfqId: parseInt(rfqId),
      timestamp: new Date().toISOString() 
    };
    ws.send(JSON.stringify(message));
    log(`Subscribed to RFQ ${rfqId}`);
  });
}

function sendRfqUpdate(ws: WebSocket) {
  rl.question('Enter RFQ ID: ', (rfqId) => {
    rl.question('Enter action (created/updated/closed): ', (action) => {
      const message = {
        type: 'rfq_update',
        rfqId: parseInt(rfqId),
        action,
        data: { status: action === 'closed' ? 'closed' : 'active' },
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(message));
      log(`Sent RFQ update for RFQ ${rfqId}`);
    });
  });
}

function sendBidNotification(ws: WebSocket) {
  rl.question('Enter RFQ ID: ', (rfqId) => {
    rl.question('Enter Bid ID: ', (bidId) => {
      rl.question('Enter action (placed/updated/accepted/rejected): ', (action) => {
        const message = {
          type: 'bid_notification',
          rfqId: parseInt(rfqId),
          bidId: parseInt(bidId),
          action,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(message));
        log(`Sent bid notification for Bid ${bidId} on RFQ ${rfqId}`);
      });
    });
  });
}

function getPresenceStatus(ws: WebSocket) {
  const message = { type: 'get_presence', timestamp: new Date().toISOString() };
  ws.send(JSON.stringify(message));
  log('Requested presence status');
}

// Start the test client
function startTestClient() {
  console.log('========================================');
  console.log('Bell24H WebSocket Test Client');
  console.log('========================================');
  
  rl.question('Select user role for testing:\n1. Admin\n2. Buyer\n3. Supplier\nEnter choice (1-3): ', (roleChoice) => {
    let userId = 1;
    let username = 'testuser';
    let role = 'admin';
    
    switch (roleChoice) {
      case '1':
        userId = 1;
        username = 'admin';
        role = 'admin';
        break;
      case '2':
        userId = 2;
        username = 'buyer';
        role = 'buyer';
        break;
      case '3':
        userId = 3;
        username = 'supplier';
        role = 'supplier';
        break;
      default:
        console.log('Invalid choice, using admin by default');
    }
    
    log(`Testing as: ${username} (${role})`);
    const token = generateToken(userId, username, role);
    log(`Generated JWT token: ${token}`);
    
    // Create WebSocket connection with the token
    createWebSocketConnection(token);
  });
}

// Run the test client
startTestClient();
