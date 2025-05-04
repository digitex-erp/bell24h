/**
 * WebSocket Test Client for Bell24h
 * 
 * This script tests the WebSocket functionality by connecting to the WebSocket server
 * and simulating voice commands to verify server responses.
 */

const WebSocket = require('ws');

// Function to format log messages
function log(type, message) {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',  // Cyan
    success: '\x1b[32m%s\x1b[0m',  // Green
    error: '\x1b[31m%s\x1b[0m',    // Red
    receive: '\x1b[35m%s\x1b[0m',  // Purple
    send: '\x1b[33m%s\x1b[0m'      // Yellow
  };
  
  console.log(colors[type], `[${type.toUpperCase()}]`, message);
}

// Sample voice commands to test
const testCommands = [
  'hello',
  'show my rfqs',
  'create new rfq',
  'find suppliers for manufacturing',
  'show trading analytics',
  'supplier ranking',
  'what can you do',
  'this is an unknown command'
];

// Create WebSocket connection
function connectWebSocket() {
  log('info', 'Connecting to WebSocket server...');
  
  const ws = new WebSocket('ws://localhost:3000/ws');
  let sessionId = null;
  
  ws.on('open', () => {
    log('success', 'Connected to Bell24h WebSocket server');
    
    // Start sending test commands after a brief delay
    setTimeout(runTests, 1000, ws);
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    // Store session ID when received
    if (message.type === 'welcome') {
      sessionId = message.data.sessionId;
      log('info', `Received session ID: ${sessionId}`);
    }
    
    // Log the received message
    log('receive', `Received message: ${message.type}`);
    console.log(JSON.stringify(message.data, null, 2));
    console.log('-----------------------------------');
  });
  
  ws.on('error', (error) => {
    log('error', `WebSocket error: ${error.message}`);
  });
  
  ws.on('close', () => {
    log('info', 'Connection closed');
  });
  
  return ws;
}

// Run through test commands
async function runTests(ws) {
  log('info', 'Starting WebSocket test sequence');
  
  // Send ping to check connection
  sendMessage(ws, 'ping', { timestamp: Date.now() });
  
  // Send each test command with a delay between them
  for (let i = 0; i < testCommands.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const command = testCommands[i];
    log('info', `Testing voice command: "${command}"`);
    
    sendMessage(ws, 'voice_command', {
      command: command,
      confidence: 0.9,
      timestamp: Date.now()
    });
  }
  
  // Close the connection after all tests
  setTimeout(() => {
    log('info', 'Test sequence completed. Closing connection.');
    ws.close();
    process.exit(0);
  }, 3000);
}

// Helper to send a message
function sendMessage(ws, type, data) {
  const message = JSON.stringify({ type, data });
  ws.send(message);
  log('send', `Sent message: ${type}`);
  console.log(JSON.stringify(data, null, 2));
}

// Start the test
const wsClient = connectWebSocket();

// Handle script termination
process.on('SIGINT', () => {
  log('info', 'Test interrupted. Closing connection.');
  if (wsClient.readyState === WebSocket.OPEN) {
    wsClient.close();
  }
  process.exit(0);
});