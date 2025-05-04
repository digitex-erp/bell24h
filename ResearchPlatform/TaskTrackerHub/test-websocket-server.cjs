/**
 * Standalone WebSocket Test Server for Bell24h
 * 
 * This script creates a minimal server that implements the WebSocket functionality
 * for testing the voice command feature without requiring the full application.
 */

const http = require('http');
const { WebSocketServer } = require('ws');
const WebSocket = require('ws');
const url = require('url');

// Track connected clients with their session IDs
const clients = [];

// Store messages for offline users
const messageQueue = {};

// Track messages sent to clients
const messageTracker = {};

// Create simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bell24h WebSocket Test Server. Connect with a WebSocket client to /ws');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Set up ping interval to detect dead connections
const pingInterval = setInterval(() => {
  clients.forEach((client) => {
    if (!client.isAlive) {
      client.ws.terminate();
      return;
    }
    
    client.isAlive = false;
    client.ws.ping();
  });
}, 30000);

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  console.log('New WebSocket connection established');
  
  // Parse session ID from query parameters or generate a new one
  const urlParams = url.parse(request.url, true).query;
  const sessionId = urlParams.sessionId || Math.random().toString(36).substring(2, 15);
  
  // Add client to our tracking array
  const client = {
    ws,
    sessionId,
    isAlive: true
  };
  
  clients.push(client);
  console.log(`Client added with session ID: ${sessionId}`);

  // Initialize message tracker for the session
  messageTracker[sessionId] = {};

  // Send any queued messages to the client
  if (messageQueue[sessionId] && messageQueue[sessionId].length > 0) {
    console.log(`Sending queued messages to client with session ID: ${sessionId}`);
    messageQueue[sessionId].forEach(message => {
      // Track the message as sent
      trackMessage(sessionId, message);
      ws.send(JSON.stringify(message));
    });
    messageQueue[sessionId] = []; // Clear the queue
  }
  
  // Send a welcome message to the client
  const welcomeMessage = {
    type: 'welcome',
    data: {
      message: 'Connected to Bell24h WebSocket Test Server',
      sessionId
    }
  };
  trackMessage(sessionId, welcomeMessage);
  ws.send(JSON.stringify(welcomeMessage));

  // Set up pong responder
  ws.on('pong', () => {
    const clientIndex = clients.findIndex(c => c.ws === ws);
    if (clientIndex !== -1) {
      clients[clientIndex].isAlive = true;
    }
  });

  // Set up message handler
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      console.log('Received message:', parsedMessage.type);
      
      // Handle different message types
      switch (parsedMessage.type) {
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            data: {
              timestamp: Date.now()
            }
          }));
          break;

        // Handle read receipt
        case 'read_receipt':
          handleReadReceipt(ws, parsedMessage.data);
          break;
          
        case 'voice_command':
          // Process voice commands from client
          handleVoiceCommand(ws, parsedMessage.data, client.sessionId);
          break;

        default:
          console.log('Unknown message type:', parsedMessage.type);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('Connection closed');
    // Remove client from tracking array
    const index = clients.findIndex(client => client.ws === ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// Track messages
function trackMessage(sessionId, message) {
  const messageId = Math.random().toString(36).substring(2, 15);
  messageTracker[sessionId][messageId] = {
    message: message,
    read: false
  };
  return messageId;
}

// Handle read receipts
function handleReadReceipt(ws, data) {
  const { messageId, sessionId } = data;
  if (messageTracker[sessionId] && messageTracker[sessionId][messageId]) {
    messageTracker[sessionId][messageId].read = true;
    console.log(`Read receipt received for message ${messageId}`);
  } else {
    console.log(`Message ${messageId} not found in tracker`);
  }
}

// Handle voice commands received from clients
function handleVoiceCommand(ws, data, sessionId) {
  console.log('Voice command received:', data.command);

  // Acknowledge the command
  const ackMessage = {
    type: 'voice_command_received',
    data: {
      command: data.command,
      timestamp: Date.now()
    }
  };
  ws.send(JSON.stringify(ackMessage));
  
  // If the client is not connected, queue the message
  if (!clients.find(c => c.ws === ws)) {
    if (!messageQueue[sessionId]) {
      messageQueue[sessionId] = [];
    }
    messageQueue[sessionId].push(ackMessage);
    console.log(`Client ${sessionId} is offline. Queueing message.`);
    return;
  }
  
  // Process the command based on content
  const command = data.command.toLowerCase();
  let response = '';
  
  // RFQ related commands
  if (command.includes('rfq list') || command.includes('show rfqs') || command.includes('my rfqs')) {
    response = 'Retrieving your RFQ list. You can view all your active RFQs in the dashboard.';
  } 
  else if (command.includes('create rfq') || command.includes('new rfq')) {
    response = 'Ready to create a new RFQ. You can specify industry, quantity, and other requirements.';
  }
  else if (command.includes('supplier match') || command.includes('find supplier') || command.includes('match suppliers')) {
    response = 'Matching your RFQ with potential suppliers based on capabilities, ratings, and past performance.';
  }
  else if (command.includes('submit rfq') || command.includes('send rfq')) {
    response = 'Your RFQ is being prepared for submission to selected suppliers. They will be notified immediately.';
  }
  
  // Bell24h specific procurement commands
  else if (command.includes('trading analytics') || command.includes('trade analytics')) {
    response = 'Opening trading analytics dashboard with insights into supplier performance and market trends.';
  }
  else if (command.includes('supplier ranking') || command.includes('rank suppliers')) {
    response = 'Generating supplier rankings based on quality, delivery time, price competitiveness, and communication responsiveness.';
  }
  else if (command.includes('industry insights') || command.includes('market insights')) {
    response = 'Displaying industry insights for your procurement category with trend analysis and pricing benchmarks.';
  }
  else if (command.includes('quote comparison') || command.includes('compare quotes')) {
    response = 'Comparing received quotes with side-by-side analysis of price, delivery time, and supplier ratings.';
  }
  else if (command.includes('procurement forecast') || command.includes('demand forecast')) {
    response = 'Generating procurement forecast based on historical data, seasonality, and market conditions.';
  }
  
  // Analytics related commands
  else if (command.includes('analytics') || command.includes('statistics')) {
    response = 'Displaying procurement analytics dashboard with KPIs, supplier performance metrics, and cost analysis.';
  }
  else if (command.includes('performance') || command.includes('metrics')) {
    response = 'Generating performance reports with key metrics on supplier delivery times, quality scores, and pricing trends.';
  }
  else if (command.includes('cost savings') || command.includes('savings report')) {
    response = 'Calculating cost savings based on negotiated prices compared to market benchmarks. Generating detailed report.';
  }
  
  // General system commands
  else if (command.includes('help') || command.includes('what can you do')) {
    response = 'I can help with RFQ management, supplier matching, analytics, and procurement insights. Try commands like "Show RFQs", "Find suppliers", "Trading analytics", or "Compare quotes".';
  }
  else if (command.includes('status') || command.includes('system status')) {
    response = 'All Bell24h platform components are operational. Backend services and databases are running normally.';
  }
  else if (command.includes('hello') || command.includes('hi')) {
    response = 'Hello! How can I assist with your procurement needs on Bell24h today?';
  }
  
  // Unknown command
  else {
    response = `I'm not sure how to handle "${data.command}". Try saying "help" for a list of available procurement commands.`;
  }
  
  // Send the response back to the client after a short delay
  const responseMessage = {
    type: 'voice_command_response',
    data: {
      originalCommand: data.command,
      response: response,
      timestamp: Date.now()
    }
  };

  // Track the message
  const messageId = trackMessage(sessionId, responseMessage);
  responseMessage.messageId = messageId;

  setTimeout(() => {
    ws.send(JSON.stringify(responseMessage));
  }, 800); // Slight delay to simulate processing time
}

// Broadcast a message to all connected clients
function broadcastMessage(message) {
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bell24h WebSocket Test Server running on port ${PORT}`);
  console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  clearInterval(pingInterval);
  
  // Close all WebSocket connections
  wss.clients.forEach(client => {
    client.terminate();
  });
  
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});
