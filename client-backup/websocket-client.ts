/**
 * Bell24H WebSocket Client Example
 * Features:
 * - Auto-reconnection
 * - Batch message handling
 * - Performance metrics
 */

import * as WebSocket from 'ws';
import { performance } from 'perf_hooks';

// Client configuration
interface ClientConfig {
  serverUrl: string;
  reconnectIntervalMs: number;
  maxReconnectAttempts: number;
  pingIntervalMs: number;
}

// Client metrics
interface ClientMetrics {
  messagesSent: number;
  messagesReceived: number;
  reconnects: number;
  errors: number;
  latencyMs: {
    avg: number;
    min: number;
    max: number;
    samples: number[];
  };
  startTime: number;
}

// Default configuration
const DEFAULT_CONFIG: ClientConfig = {
  serverUrl: 'ws://localhost:8080',
  reconnectIntervalMs: 1000,
  maxReconnectAttempts: 5,
  pingIntervalMs: 5000
};

// Initialize metrics
const metrics: ClientMetrics = {
  messagesSent: 0,
  messagesReceived: 0,
  reconnects: 0,
  errors: 0,
  latencyMs: {
    avg: 0,
    min: Number.MAX_VALUE,
    max: 0,
    samples: []
  },
  startTime: performance.now()
};

// Client state
let ws: WebSocket | null = null;
let clientId: string | null = null;
let reconnectAttempts = 0;
let pingInterval: NodeJS.Timeout | null = null;

// Update latency metrics
const updateLatencyMetrics = (latencyMs: number): void => {
  const { latencyMs: latency } = metrics;
  
  // Add to samples (keep last 100 samples)
  latency.samples.push(latencyMs);
  if (latency.samples.length > 100) {
    latency.samples.shift();
  }
  
  // Update min/max
  latency.min = Math.min(latency.min, latencyMs);
  latency.max = Math.max(latency.max, latencyMs);
  
  // Update average
  latency.avg = latency.samples.reduce((sum, val) => sum + val, 0) / latency.samples.length;
};

// Connect to WebSocket server
const connect = (): void => {
  // Create WebSocket connection
  ws = new WebSocket(DEFAULT_CONFIG.serverUrl);
  
  // Handle connection open
  ws.on('open', () => {
    console.log('Connected to server');
    reconnectAttempts = 0;
    
    // Start ping interval
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(sendPing, DEFAULT_CONFIG.pingIntervalMs);
  });
  
  // Handle incoming messages
  ws.on('message', (data: WebSocket.Data) => {
    try {
      const message = JSON.parse(data.toString());
      metrics.messagesReceived++;
      
      // Handle welcome message
      if (message.type === 'welcome') {
        clientId = message.clientId;
        console.log(`Received client ID: ${clientId}`);
      }
      // Handle pong message
      else if (message.type === 'pong' && message.pingTimestamp) {
        const latency = Date.now() - message.pingTimestamp;
        updateLatencyMetrics(latency);
        console.log(`Ping latency: ${latency}ms`);
      }
      // Handle batch messages
      else if (message.type === 'batch') {
        console.log(`Received batch with ${message.messages.length} messages`);
        // Process each message in the batch
        for (const msg of message.messages) {
          console.log(`- Batch message: ${JSON.stringify(msg)}`);
        }
      }
    } catch (error) {
      metrics.errors++;
      console.error(`Error processing message: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log('Disconnected from server');
    
    // Clear ping interval
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    
    // Attempt to reconnect
    if (reconnectAttempts < DEFAULT_CONFIG.maxReconnectAttempts) {
      reconnectAttempts++;
      metrics.reconnects++;
      console.log(`Reconnecting (attempt ${reconnectAttempts})...`);
      setTimeout(connect, DEFAULT_CONFIG.reconnectIntervalMs);
    } else {
      console.error('Max reconnect attempts reached');
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    metrics.errors++;
    console.error(`WebSocket error: ${error.message}`);
  });
};

// Send ping message
const sendPing = (): void => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const pingMessage = {
      type: 'ping',
      timestamp: Date.now(),
      clientId
    };
    ws.send(JSON.stringify(pingMessage));
    metrics.messagesSent++;
  }
};

// Send a test message
const sendTestMessage = (content: string): void => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const message = {
      type: 'message',
      content,
      timestamp: Date.now(),
      clientId
    };
    ws.send(JSON.stringify(message));
    metrics.messagesSent++;
    console.log(`Sent message: ${content}`);
  } else {
    console.error('Cannot send message: not connected');
  }
};

// Display client metrics
const displayMetrics = (): void => {
  console.log('\n--- WebSocket Client Metrics ---');
  console.log(`Uptime: ${((performance.now() - metrics.startTime) / 1000).toFixed(1)}s`);
  console.log(`Messages Sent: ${metrics.messagesSent}`);
  console.log(`Messages Received: ${metrics.messagesReceived}`);
  console.log(`Reconnects: ${metrics.reconnects}`);
  console.log(`Errors: ${metrics.errors}`);
  console.log(`Latency (avg): ${metrics.latencyMs.avg.toFixed(2)}ms`);
  console.log(`Latency (min): ${metrics.latencyMs.min === Number.MAX_VALUE ? 'N/A' : metrics.latencyMs.min.toFixed(2) + 'ms'}`);
  console.log(`Latency (max): ${metrics.latencyMs.max.toFixed(2)}ms`);
  console.log('-------------------------------\n');
};

// Disconnect from server
const disconnect = (): void => {
  if (ws) {
    ws.close();
    ws = null;
  }
};

// Connect to server
connect();

// Display metrics every 10 seconds
setInterval(displayMetrics, 10000);

// Export functions for external use
export {
  connect,
  disconnect,
  sendTestMessage,
  displayMetrics
};

// Example usage when running the file directly
if (require.main === module) {
  console.log('Bell24H WebSocket Client Example');
  console.log(`Connecting to ${DEFAULT_CONFIG.serverUrl}...`);
  
  // Send a test message every 3 seconds
  setInterval(() => {
    sendTestMessage(`Test message at ${new Date().toISOString()}`);
  }, 3000);
}
