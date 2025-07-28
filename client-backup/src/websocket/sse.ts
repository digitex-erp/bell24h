import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';

dotenv.config();

// Types
interface SSEClient {
  id: string;
  response: Response;
  lastEventId: string;
  remoteAddress: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

// Constants
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const SSE_CLIENTS: Map<string, SSEClient> = new Map();
const MAX_RECENT_NOTIFICATIONS = 100;
const RECENT_NOTIFICATIONS: Notification[] = [];
let NEXT_EVENT_ID = 1;
const JWT_SECRET = process.env.JWT_SECRET || 'bell24h_default_secret'; // Default for development only

/**
 * Validate JWT token
 */
function validateToken(token: string): { valid: boolean; userId?: string } {
  try {
    // Skip validation in development mode with special token
    if (process.env.NODE_ENV === 'development' && token === 'dev_token') {
      return { valid: true, userId: 'dev_user' };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return { 
      valid: true, 
      userId: typeof decoded === 'object' && decoded !== null ? decoded.sub as string : undefined 
    };
  } catch (err) {
    console.error('Token validation error:', err);
    return { valid: false };
  }
}

/**
 * Authentication middleware for SSE endpoints
 */
function authenticateSSE(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token as string || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }
  
  const authResult = validateToken(token);
  if (!authResult.valid) {
    return res.status(401).send('Unauthorized: Invalid token');
  }
  
  // Add userId to request object for use in route handlers
  (req as any).userId = authResult.userId;
  next();
}

/**
 * Send an SSE event to a specific client
 */
function sendEvent(client: SSEClient, data: any, event?: string) {
  try {
    // Use incrementing event ID for better resumption
    const eventId = NEXT_EVENT_ID++;
    let message = `id: ${eventId}\n`;
    
    if (event) {
      message += `event: ${event}\n`;
    }
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    message += `data: ${dataString}\n\n`;
    
    client.response.write(message);
    client.lastEventId = eventId.toString();
    
    return eventId;
  } catch (err) {
    console.error(`Error sending event to client ${client.id}:`, err);
    removeClient(client.id);
    return null;
  }
}

/**
 * Broadcast an event to all connected SSE clients
 */
function broadcastEvent(data: any, event?: string) {
  const disconnectedClients: string[] = [];
  let eventId: number | null = null;
  
  SSE_CLIENTS.forEach(client => {
    try {
      const id = sendEvent(client, data, event);
      if (id !== null) eventId = id;
    } catch (err) {
      console.error(`Error broadcasting to client ${client.id}:`, err);
      disconnectedClients.push(client.id);
    }
  });
  
  // Remove disconnected clients
  disconnectedClients.forEach(clientId => removeClient(clientId));
  
  return eventId;
}

/**
 * Remove a client from the connected clients list
 */
function removeClient(clientId: string) {
  if (SSE_CLIENTS.has(clientId)) {
    try {
      const client = SSE_CLIENTS.get(clientId)!;
      client.response.end();
    } catch (err) {
      console.error(`Error closing SSE connection for client ${clientId}:`, err);
    }
    
    SSE_CLIENTS.delete(clientId);
    console.log(`SSE client disconnected: ${clientId}. Total connected: ${SSE_CLIENTS.size}`);
  }
}

/**
 * Send heartbeat to keep SSE connections alive
 */
function startHeartbeat() {
  setInterval(() => {
    if (SSE_CLIENTS.size > 0) {
      console.log(`Sending heartbeat to ${SSE_CLIENTS.size} SSE clients`);
      broadcastEvent({
        type: "heartbeat",
        timestamp: new Date().toISOString()
      }, 'heartbeat');
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * Create a test notification
 */
function createNotification(): Notification {
  const notificationTypes = [
    {
      type: 'notification',
      title: 'New RFQ Posted',
      message: 'A new Request for Quote has been posted in your industry category',
    },
    {
      type: 'notification',
      title: 'Bid Status Updated',
      message: 'Your bid status has been updated to \'Under Review\'',
    },
    {
      type: 'notification',
      title: 'Payment Processed',
      message: 'Payment of ₹15,000 has been processed for order #45678',
    },
    {
      type: 'notification',
      title: 'New Message Received',
      message: 'You have received a new message from Buyer ABC',
    },
    {
      type: 'notification',
      title: 'Order Status Changed',
      message: 'Order #34567 status changed to \'Shipped\'',
    },
    {
      type: 'notification',
      title: 'Supplier Verification Completed',
      message: 'Your GST verification has been completed successfully',
    }
  ];
  
  const template = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  const timestamp = new Date().toISOString();
  const id = `${NEXT_EVENT_ID}-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const notification: Notification = {
    ...template,
    id,
    timestamp
  };
  
  // Add to recent notifications
  RECENT_NOTIFICATIONS.unshift(notification);
  if (RECENT_NOTIFICATIONS.length > MAX_RECENT_NOTIFICATIONS) {
    RECENT_NOTIFICATIONS.pop();
  }
  
  console.log(`Created notification: ${notification.title}`);
  return notification;
}

/**
 * Start the notification generator that creates notifications periodically
 */
function startNotificationGenerator() {
  console.log('Started notification generator');
  
  const generateNotification = async () => {
    try {
      // Generate a random sleep time between 15-45 seconds
      const sleepTime = Math.floor(Math.random() * 30000) + 15000;
      await new Promise(resolve => setTimeout(resolve, sleepTime));
      
      // Create a notification
      const notification = createNotification();
      
      // Broadcast to all connected clients
      broadcastEvent(notification, 'notification');
      console.log(`Generated notification: ${notification.title}`);
      
      // Continue generating notifications
      generateNotification();
    } catch (error) {
      console.error('Error generating notification:', error);
      // Wait 5 seconds after an error and try again
      setTimeout(generateNotification, 5000);
    }
  };
  
  // Start the generator
  generateNotification();
}

/**
 * Create and configure the Express app for SSE
 */
export function createSSEApp() {
  const app = express();
  
  // Middleware
  app.use(express.json());
  const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', '..', 'public')));
  app.use(cors());
  
  // SSE test page
  app.get('/sse-test', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '..', '..', 'public', 'sse-test.html');
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('SSE test page not found');
    }
  });
  
  // SSE endpoint with authentication
  app.get('/events', authenticateSSE, (req: Request, res: Response) => {
    const clientId = randomUUID();
    const remoteAddress = req.socket.remoteAddress || 'unknown';
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Flush headers immediately
    res.flushHeaders();
    
    // Get the last event ID if provided (for reconnections)
    const lastEventId = req.headers['last-event-id'] as string || '0';
    
    // Create a new client
    const client: SSEClient = {
      id: clientId,
      response: res,
      lastEventId,
      remoteAddress
    };
    
    // Add client to connected clients
    SSE_CLIENTS.set(clientId, client);
    console.log(`New SSE client connected: ${remoteAddress} (${clientId}). Total connected: ${SSE_CLIENTS.size}`);
    
    // Send initial connection message
    sendEvent(client, {
      type: "connection",
      message: 'Connected to Bell24H SSE server',
      timestamp: new Date().toISOString()
    }, 'connection');
    
    // Send recent notifications
    RECENT_NOTIFICATIONS.slice(0, 5).forEach(notification => {
      sendEvent(client, notification, 'notification');
    });
    
    // Handle client disconnect
    req.on('close', () => {
      removeClient(clientId);
    });
  });
  
  // Get recent notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json({
      type: 'notification_list',
      notifications: RECENT_NOTIFICATIONS,
      timestamp: new Date().toISOString()
    });
  });
  
  // Create a test notification
  app.get('/api/notification/create', (req: Request, res: Response) => {
    const notification = createNotification();
    
    // Broadcast to all connected clients
    broadcastEvent(notification, 'notification');
    
    res.json(notification);
  });
  
  // Send a custom notification via API
  app.post('/api/sse/notification', (req: Request, res: Response) => {
    try {
      const { event = 'notification', data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Missing data field in request body' });
      }
      
      // Add ID and timestamp if not provided
      if (!data.id) {
        data.id = `${NEXT_EVENT_ID}-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 9000) + 1000}`;
      }
      
      if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
      }
      
      // Add to recent notifications if it's a notification
      if (event === 'notification' || data.type === 'notification') {
        // Store a copy in case data is modified after broadcast
        const notificationCopy = { ...data };
        RECENT_NOTIFICATIONS.unshift(notificationCopy);
        if (RECENT_NOTIFICATIONS.length > MAX_RECENT_NOTIFICATIONS) {
          RECENT_NOTIFICATIONS.pop();
        }
      }
      
      // Broadcast to SSE clients
      const eventId = broadcastEvent(data, event);
      
      res.json({
        success: true,
        eventId,
        clients: SSE_CLIENTS.size,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error sending SSE notification:', err);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });
  
  // Status endpoint
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      sse_server: 'running',
      connected_clients: SSE_CLIENTS.size,
      recent_notifications: RECENT_NOTIFICATIONS.length,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle 404s
  app.use((req: Request, res: Response) => {
    res.status(404).send(`
      <html>
        <head><title>404 Not Found</title></head>
        <body>
          <h1>404 Not Found</h1>
          <p>The requested URL was not found on this server.</p>
          <p><a href='/sse-test'>Go to SSE Test Page</a></p>
        </body>
      </html>
    `);
  });
  
  return app;
}

/**
 * Start the SSE server
 */
export function startSSEServer(port = 5004) {
  const app = createSSEApp();
  
  // Start heartbeat
  startHeartbeat();
  
  // Start notification generator
  startNotificationGenerator();
  
  // Start the server
  return app.listen(port, () => {
    console.log(`SSE server running on port ${port}`);
  });
}

// Create an API for using the SSE system from other modules
export const SSEApi = {
  sendEvent: (clientId: string, data: any, event?: string) => {
    const client = SSE_CLIENTS.get(clientId);
    if (client) {
      return sendEvent(client, data, event);
    }
    return null;
  },
  broadcastEvent,
  createNotification,
  getRecentNotifications: () => [...RECENT_NOTIFICATIONS],
  getConnectedClients: () => SSE_CLIENTS.size,
  getConnectedClientIds: () => Array.from(SSE_CLIENTS.keys())
};

// Run the server if this file is executed directly
if (require.main === module) {
  const SSE_PORT = parseInt(process.env.SSE_PORT || '5004', 10);
  startSSEServer(SSE_PORT);
}
