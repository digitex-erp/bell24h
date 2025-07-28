import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { WebSocketServer } from 'ws';

// Load environment variables
dotenv.config();

// Import types from server.ts or define here
interface Notification {
  type: string;
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

// Global variables
let RECENT_NOTIFICATIONS: Notification[] = [];
const MAX_RECENT_NOTIFICATIONS = 50;

/**
 * Create a mock notification
 */
function createMockNotification(): Notification {
  const notificationTypes = [
    {
      type: 'notification',
      title: 'New bid received',
      message: 'A supplier has placed a new bid on your RFQ',
    },
    {
      type: 'notification',
      title: 'Price update',
      message: 'A supplier has updated their price on your active RFQ',
    },
    {
      type: 'notification',
      title: 'RFQ deadline approaching',
      message: 'Your RFQ #2025-0151 is closing in 24 hours',
    },
    {
      type: 'notification',
      title: 'New message',
      message: 'You have received a new message from Supplier XYZ',
    }
  ];
  
  const template = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  
  const notification: Notification = {
    ...template,
    id: randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  // Add to recent notifications
  RECENT_NOTIFICATIONS.unshift(notification);
  if (RECENT_NOTIFICATIONS.length > MAX_RECENT_NOTIFICATIONS) {
    RECENT_NOTIFICATIONS.pop();
  }
  
  console.log(`Created mock notification: ${notification.title}`);
  return notification;
}

/**
 * Get mock notifications or generate some if none exist
 */
function getMockNotifications(): Notification[] {
  if (RECENT_NOTIFICATIONS.length === 0) {
    // Generate a few mock notifications
    for (let i = 0; i < 3; i++) {
      createMockNotification();
    }
  }
  
  return RECENT_NOTIFICATIONS;
}

/**
 * Start the notification generator that creates notifications periodically
 */
async function startNotificationGenerator() {
  console.log('Started notification generator');
  
  const generateNotification = async () => {
    try {
      // Generate a random sleep time between 15-45 seconds
      const sleepTime = Math.floor(Math.random() * 30000) + 15000;
      await new Promise(resolve => setTimeout(resolve, sleepTime));
      
      // Create a notification
      const notification = createMockNotification();
      console.log(`Generated new notification: ${notification.title}`);
      
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
 * Create and configure the Express app
 */
function createProxyApp(wss?: WebSocketServer) {
  const app = express();
  
  // Middleware
  app.use(express.json());
  const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', '..', 'public')));
  
  // CORS middleware
  app.use(cors());
  
  // Routes
  
  // WebSocket test page
  app.get('/ws-test', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '..', '..', 'public', 'websocket-test.html');
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('WebSocket test page not found');
    }
  });
  
  // API to get notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json({
      type: 'notification_list',
      notifications: getMockNotifications(),
      timestamp: new Date().toISOString()
    });
  });
  
  // API to create a notification
  app.get('/api/notification/create', (req: Request, res: Response) => {
    const notification = createMockNotification();
    
    // Broadcast to WebSocket clients if available
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          try {
            client.send(JSON.stringify(notification));
          } catch (err) {
            console.error('Error broadcasting to client:', err);
          }
        }
      });
    }
    
    res.json(notification);
  });
  
  // API for server status
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      websocket_proxy: 'running',
      websocket_server: wss ? 'running' : 'not connected',
      polling_available: true,
      recent_notifications: RECENT_NOTIFICATIONS.length,
      timestamp: new Date().toISOString()
    });
  });
  
  // Simple ping endpoint
  app.get('/api/ping', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
  
  // Endpoint for polling-based message sending (fallback)
  app.get('/api/send', (req: Request, res: Response) => {
    const message = req.query.message as string || 'No message provided';
    
    const response = {
      type: 'echo',
      id: randomUUID(),
      message,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to WebSocket clients if available
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          try {
            client.send(JSON.stringify(response));
          } catch (err) {
            console.error('Error broadcasting to client:', err);
          }
        }
      });
    }
    
    res.json(response);
  });
  
  // Handle 404s
  app.use((req: Request, res: Response) => {
    res.status(404).send(`
      <html>
        <head><title>404 Not Found</title></head>
        <body>
          <h1>404 Not Found</h1>
          <p>The requested URL was not found on this server.</p>
          <p><a href='/ws-test'>Go to WebSocket Test Page</a></p>
        </body>
      </html>
    `);
  });
  
  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  });
  
  return app;
}

/**
 * Start the WebSocket proxy server
 */
export function startProxyServer(port = 5003, wss?: WebSocketServer) {
  const app = createProxyApp(wss);
  
  // Start the notification generator
  startNotificationGenerator();
  
  // Start the server
  return app.listen(port, () => {
    console.log(`WebSocket proxy server running on port ${port}`);
  });
}

// Run the server if this file is executed directly
if (require.main === module) {
  const PROXY_PORT = parseInt(process.env.PROXY_PORT || '5003', 10);
  startProxyServer(PROXY_PORT);
}
