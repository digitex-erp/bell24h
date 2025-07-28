import { WebSocketServer } from 'ws';
import * as dotenv from 'dotenv';
import { startProxyServer } from './proxy';
import { createServer } from 'http';
import express from 'express';

// Load environment variables
dotenv.config();

// Constants from environment
const WS_PORT = parseInt(process.env.WS_PORT || '8080', 10);
const PROXY_PORT = parseInt(process.env.PROXY_PORT || '5003', 10);

/**
 * Initialize and start the WebSocket server and proxy
 */
export async function initializeWebSockets() {
  // Create Express app and HTTP server (for WebSocket)
  const app = express();
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server });
  
  // Connected clients
  const CONNECTED_CLIENTS: Set<any> = new Set();
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    // Add to connected clients
    CONNECTED_CLIENTS.add(ws);
    
    // Handle messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'perplexity_update':
            // Handle perplexity-related updates
            broadcast({
              type: 'perplexity_update',
              data: data.data
            }, ws);
            break;
            
          case 'rfq_update':
            // Broadcast RFQ updates
            broadcast({
              type: 'rfq_update',
              data: data.data
            }, ws);
            break;
            
          case 'bid_placed':
            // Notify about new bids
            broadcast({
              type: 'new_bid',
              data: data.data
            }, ws);
            break;
            
          case 'ping':
            // Respond with pong
            send(ws, { 
              type: 'pong', 
              timestamp: new Date().toISOString() 
            });
            break;
            
          default:
            // Echo back unknown messages
            send(ws, {
              type: 'echo',
              message: data,
              timestamp: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('Client disconnected');
      CONNECTED_CLIENTS.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      CONNECTED_CLIENTS.delete(ws);
    });
    
    // Send welcome message
    send(ws, {
      type: 'connection_established',
      message: 'Successfully connected to Bell24H WebSocket server',
      timestamp: new Date().toISOString()
    });
  });
  
  // Helper to broadcast messages to all clients except sender
  function broadcast(message: any, excludeWs?: any) {
    const msgString = JSON.stringify(message);
    
    wss.clients.forEach(client => {
      if (client !== excludeWs && client.readyState === 1) { // OPEN
        try {
          client.send(msgString);
        } catch (err) {
          console.error('Error broadcasting message:', err);
        }
      }
    });
  }
  
  // Helper to send message to specific client
  function send(ws: any, message: any) {
    try {
      if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify(message));
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }
  
  // Start the WebSocket server
  await new Promise<void>(resolve => {
    server.listen(WS_PORT, () => {
      console.log(`WebSocket server running on port ${WS_PORT}`);
      resolve();
    });
  });
  
  // Start the WebSocket proxy server
  startProxyServer(PROXY_PORT, wss);
  
  return { wss, server };
}

// Run the server if this file is executed directly
if (require.main === module) {
  initializeWebSockets().catch(err => {
    console.error('Failed to initialize WebSockets:', err);
    process.exit(1);
  });
}
