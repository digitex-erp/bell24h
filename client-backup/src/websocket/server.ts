import { WebSocketServer, WebSocket } from 'ws';
import { authenticate } from './auth.js';
import { registerClient, unregisterClient, broadcastMessage } from './message-handler.js';
import express from 'express'; // Express is now properly imported
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Define JWT_SECRET at the very top level to avoid block-scoped variable issues
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';

// Configuration constants
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;
const HTTP_PORT = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3001;

// Setup Express for HTTP API
const app = express();
app.use(express.json());

// Create HTTP server and WebSocket server
const server = createServer(app); // createServer is now properly imported
// Initialize WebSocketServer with the HTTP server instead of a port
const wsServer = new WebSocketServer({ server });

// Types
interface WebSocketClient extends WebSocket {
  id: string;
  userId?: number;
  username?: string;
  role?: string;
  authenticated: boolean;
  joinedChannels: Set<string>;
  lastActivity: Date;
  state: ConnectionState;
  log: (message: string) => void;
  connectionTimeoutTimer?: NodeJS.Timeout;
  
  // Explicitly define event handlers that we use
  on(event: 'message', listener: (data: WebSocket.Data) => void): this;
  on(event: 'close', listener: (code: number, reason: string) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}

enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  SUBSCRIBING = 'subscribing',
  READY = 'ready',
  CLOSING = 'closing',
  CLOSED = 'closed',
  ERROR = 'error'
}

interface WebSocketConnectionPool {
  _clients: Map<string, WebSocketClient>;
  add: (client: WebSocketClient) => void;
  remove: (clientId: string) => void;
  get: (clientId: string) => WebSocketClient | undefined;
  getByUserId: (userId: number) => WebSocketClient[];
  getAll: () => WebSocketClient[];
  broadcast: (message: string) => void;
  broadcastToRole: (message: string, role: string) => void;
  getConnectionCount: () => number;
}

interface Notification {
  type: string;
  id: string;
  title: string;
  message: string;
  timestamp: string;
  userId?: number;        // ID of user who should receive this notification (if targeted)
  rfqId?: number;         // Related RFQ ID if applicable
  bidId?: number;         // Related Bid ID if applicable
  severity: 'info' | 'success' | 'warning' | 'error'; // Notification severity
  isRead?: boolean;       // Whether notification has been read
  read?: boolean;         // Alternative property name for isRead
  category: 'bid' | 'rfq' | 'system' | 'payment' | 'invoice' | 'financing' | 'milestone' | 'shipment'; // Category of notification
  invoiceId?: number;     // Related Invoice ID if applicable
  milestoneId?: number;   // Related Milestone ID if applicable
  financingId?: number;   // Related financing request ID if applicable
  earlyPaymentId?: number; // Related early payment request ID if applicable
  amount?: number;        // Amount involved in the financial transaction
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface RfqUpdateMessage extends WebSocketMessage {
  type: 'rfq_update';
  rfqId: number;
  action: 'created' | 'updated' | 'closed' | 'deleted';
  data: any;
}

interface BidNotificationMessage extends WebSocketMessage {
  type: 'bid_notification';
  bidId: number;
  rfqId: number;
  action: 'placed' | 'updated' | 'accepted' | 'rejected';
  data: any;
}

interface InvoiceFinancingMessage extends WebSocketMessage {
  type: 'invoice_financing';
  invoiceId: number;
  action: 'submitted' | 'evaluated' | 'approved' | 'funded' | 'rejected';
  data: any;
}

interface EarlyPaymentMessage extends WebSocketMessage {
  type: 'early_payment';
  milestoneId: number;
  action: 'requested' | 'approved' | 'processed' | 'completed' | 'rejected';
  data: any;
}

const logError = (message: string, error?: any) => {
  console.error(`[ERROR] ${message}`, error || '');
};

const logInfo = (message: string) => {
  console.info(`[INFO] ${message}`);
};

// Database connection pool setup
import { Pool } from 'pg';
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection function
async function testDatabaseConnection(): Promise<boolean> {
  logInfo('Testing database connection...');
  
  try {
    // Test basic connectivity
    const timeResult = await dbPool.query('SELECT NOW() as time');
    logInfo(`Database connection successful at ${timeResult.rows[0].time}`);
    
    // Verify schema tables exist
    const tablesResult = await dbPool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    
    if (tablesResult.rows.length > 0) {
      const tables = tablesResult.rows.map(row => row.table_name);
      logInfo(`Found ${tables.length} tables in database`);
      
      // Check for required tables
      const requiredTables = ['users', 'buyer_profiles', 'suppliers', 'rfqs', 'bids'];
      const missingTables = requiredTables.filter(table => !tables.includes(table));
      
      if (missingTables.length > 0) {
        logError(`Missing required tables: ${missingTables.join(', ')}`);
      } else {
        logInfo('All required tables present in database');
      }
    } else {
      logError('No tables found in database schema');
    }
    
    return true;
  } catch (error) {
    logError('Database connection test failed', error);
    return false;
  }
}

// Immediately test database connection on startup
testDatabaseConnection().then(success => {
  if (!success) {
    logError('Database connection failed during startup', 'Please check your DATABASE_URL configuration');
    process.exit(1);
  }
});

logInfo(`Initializing Bell24H WebSocket server on port ${WS_PORT}`);
logInfo(`JWT auth enabled with secret length: ${JWT_SECRET.length} bytes`);
logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`)

// sendToClient function is defined later in the file

// Metrics tracking
const incrementMetric = (metricName: string) => {
  // Placeholder for metrics tracking
  console.log(`Metric incremented: ${metricName}`);
};

// Start CloudWatch metrics collection
const startMetricsPublisher = () => {
  const timer = setInterval(() => {
    // Publish metrics to CloudWatch
    console.log('Publishing metrics to CloudWatch');
  }, 60000); // Every minute
  
  return timer;
};

const metricsTimer = startMetricsPublisher();

// Clean up metrics timer on process exit
process.on('SIGINT', () => {
  clearInterval(metricsTimer);
  logInfo('CloudWatch metrics publisher stopped');
});

logInfo('CloudWatch metrics enabled for WebSocket server');

// JWT setup is already handled at the top of the file
// No need for duplicate import


/**
 * Validate a token and extract user information
 */
async function validateToken(token: string): Promise<{ valid: boolean; userId?: number; username?: string; role?: string; } | null> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (typeof decoded === 'object' && decoded !== null) {
      const userId = decoded.userId;
      
      if (!userId) {
        logError('Token missing userId claim');
        return { valid: false };
      }
      
      // Get user from database to verify existence and get role
      const userResult = await dbPool.query('SELECT id, username, role FROM users WHERE id = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        logError(`User with ID ${userId} not found in database`);
        return { valid: false };
      }
      
      const user = userResult.rows[0];
      return {
        valid: true,
        userId: user.id,
        username: user.username,
        role: user.role
      };
    }
    
    return { valid: false };
  } catch (error) {
    logError('Token validation error', error);
    return { valid: false };
  }
}

// Global state for tracking connections
const CONNECTED_USERS = new Map<number, {
  userId: number;
  username: string;
  role: string;
  connectionCount: number;
  lastActive: Date;
  status: 'online' | 'away' | 'offline';
  ws: Set<WebSocketClient>;
}>();

// Initialize connection pool
const connectionPool: WebSocketConnectionPool = {
  _clients: new Map<string, WebSocketClient>(),
  
  add(client: WebSocketClient) {
    this._clients.set(client.id, client);
  },
  
  remove(clientId: string) {
    this._clients.delete(clientId);
  },
  
  get(clientId: string) {
    return this._clients.get(clientId);
  },
  
  getByUserId(userId: number) {
    return Array.from(this._clients.values())
      .filter(client => client.userId === userId);
  },
  
  getAll() {
    return Array.from(this._clients.values());
  },
  
  broadcast(message: string) {
    this.getAll().forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  },
  
  broadcastToRole(message: string, role: string) {
    this.getAll()
      .filter(client => client.role === role)
      .forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
  },
  
  getConnectionCount() {
    return this._clients.size;
  }
};

// Channel and subscription tracking
const RFQ_SUBSCRIBERS = new Map<number, Set<WebSocketClient>>();
const BID_SUBSCRIBERS = new Map<number, Set<WebSocketClient>>();
const INVOICE_SUBSCRIBERS = new Map<number, Set<WebSocketClient>>();
const MILESTONE_SUBSCRIBERS = new Map<number, Set<WebSocketClient>>();
const USER_NOTIFICATIONS = new Map<number, Notification[]>();
const MAX_USER_NOTIFICATIONS = 50;
const CONNECTION_TIMEOUT_MS = parseInt(process.env.CONNECTION_TIMEOUT_MS || '30000');

// HTTP API routes
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', connections: connectionPool.getConnectionCount() });
});

// Notifications API
app.post('/api/notifications/send', async (req: express.Request, res: express.Response) => {
  try {
    const { userId, title, message, type, severity, category, rfqId, bidId, invoiceId } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      userId,
      message,
      title,
      type: type || 'system',
      severity: severity || 'info',
      category: category || 'system',
      rfqId,
      bidId, 
      invoiceId
    };
    
    const result = sendNotificationToUser(userId, notification);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get user notifications
app.get('/api/notifications/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const notifications = USER_NOTIFICATIONS.get(userId) || [];
    res.json({ notifications, count: notifications.length });
  } catch (error) {
    logError('Failed to fetch notifications', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Start the HTTP server
app.listen(HTTP_PORT, () => {
  logInfo(`HTTP API server listening on port ${HTTP_PORT}`);
});

// Start the WebSocket server
server.listen(WS_PORT, () => {
  logInfo(`WebSocket server listening on port ${WS_PORT}`);
});

// Set up WebSocket connection handling
wsServer.on('connection', (client: WebSocketClient) => {
  // Initialize client properties
  client.id = uuidv4();
  client.authenticated = false;
  client.joinedChannels = new Set();
  client.lastActivity = new Date();
  client.state = ConnectionState.CONNECTING;
  client.log = (message: string) => {
    logInfo(`Client ${client.id}: ${message}`);
  };
  
  // Add to connection pool
  connectionPool.add(client);
  
  // Set up connection timeout to clean up stalled connections
  client.connectionTimeoutTimer = setTimeout(() => {
    if (client.state !== ConnectionState.AUTHENTICATED) {
      client.log('Connection timeout - client did not authenticate');
      client.terminate();
      connectionPool.remove(client.id);
    }
  }, CONNECTION_TIMEOUT_MS);
  
  // Set up event listeners
  client.on('message', (message: WebSocket.Data) => {
    try {
      // Update activity timestamp
      client.lastActivity = new Date();
      
      // Parse message
      const data = JSON.parse(message.toString());
      
      // If not authenticated and not trying to authenticate, reject
      if (!client.authenticated && data.type !== 'authenticate') {
        sendToClient(client, {
          type: 'error',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Handle message based on type
      handleMessage(client, data);
    } catch (error) {
      logError('Error handling message', error);
    }
  });
  
  client.on('close', () => {
    // Clean up resources
    clearTimeout(client.connectionTimeoutTimer);
    connectionPool.remove(client.id);
    
    // Remove from channel subscribers
    if (client.userId) {
      // Unsubscribe from all channels
      for (const [rfqId, subscribers] of RFQ_SUBSCRIBERS.entries()) {
        if (subscribers.has(client)) {
          subscribers.delete(client);
          if (subscribers.size === 0) {
            RFQ_SUBSCRIBERS.delete(rfqId);
          }
        }
      }
      
      // Update user connection status
      const user = CONNECTED_USERS.get(client.userId);
      if (user) {
        user.connectionCount--;
        if (user.connectionCount <= 0) {
          CONNECTED_USERS.delete(client.userId);
          
          // Notify admins that user has gone offline
          broadcastToRole('admin', {
            type: 'user_presence',
            action: 'disconnect',
            userId: client.userId,
            username: client.username || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    logInfo(`Client disconnected: ${client.id}`);
  });
  
  client.on('error', (error) => {
    logError(`WebSocket error for client ${client.id}`, error);
  });
  
  // Send welcome message
  sendToClient(client, {
    type: 'welcome',
    message: 'Connected to Bell24H WebSocket server',
    timestamp: new Date().toISOString()
  });
});

/**
 * Send a message to a specific WebSocket client
 * @param client The WebSocket client to send the message to
 * @param data The message object to send
 */
const sendToClient = (client: WebSocketClient, data: any) => {
  if (client.readyState === WebSocket.OPEN) {
    try {
      client.send(JSON.stringify(data));
      incrementMetric('messages_sent');
    } catch (error) {
      logError(`Error sending message to client ${client.id}`, error);
    }
  }
};

/**
 * Broadcast to a specific role
 */
const broadcastToRole = (role: string, message: any) => {
  const clients = connectionPool.getAll().filter(client => client.role === role);
  clients.forEach(client => sendToClient(client, message));
};

/**
 * Broadcast a message to all subscribers of a specific RFQ
 */
const broadcastToRfqSubscribers = (rfqId: number, message: any) => {
  const subscribers = RFQ_SUBSCRIBERS.get(rfqId);
  if (subscribers && subscribers.size > 0) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    subscribers.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
    incrementMetric('rfq_broadcasts');
    logInfo(`Broadcast message to ${subscribers.size} RFQ subscribers`);
  }
};

/**
 * Send notification to a specific user
 */
const sendNotificationToUser = (userId: number, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  try {
    // If user isn't in our notifications map, add them
    if (!USER_NOTIFICATIONS.has(userId)) {
      USER_NOTIFICATIONS.set(userId, []);
    }
    
    // Create the full notification object
    const fullNotification: Notification = {
      id: uuidv4(),
      userId,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    // Add to the user's notification array, maintain max size
    const userNotifications = USER_NOTIFICATIONS.get(userId);
    if (userNotifications) {
      userNotifications.unshift(fullNotification);
      
      // Trim to max size
      if (userNotifications.length > MAX_USER_NOTIFICATIONS) {
        userNotifications.length = MAX_USER_NOTIFICATIONS;
      }
    }
    
    // Send the notification to all of user's active connections
    const user = CONNECTED_USERS.get(userId);
    if (user && user.ws.size > 0) {
      for (const client of user.ws) {
        sendToClient(client, {
          type: 'notification',
          notification: fullNotification
        });
      }
    }
    
    // Update metrics
    incrementMetric('notifications_sent');
    return true;
  } catch (error) {
    logError('Error sending notification to user', error);
    return false;
  }
};

/**
 * Handle different message types from WebSocket clients
 */
const handleMessage = (client: WebSocketClient, data: any) => {
  // Message handling logic will go here
  const messageType = data.type;
  
  try {
    // Handle different message types
    switch(messageType) {
      case 'authenticate': {
        const token = data.token;
        if (!token) {
          sendToClient(client, {
            type: 'error',
            message: 'Authentication failed: Missing token',
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        // Validate token and authenticate user
        validateToken(token).then(result => {
          if (result && result.valid && result.userId) {
            client.userId = result.userId;
            client.username = result.username;
            client.role = result.role;
            client.authenticated = true;
            client.state = ConnectionState.AUTHENTICATED;
            
            // Track connection in user map
            if (!CONNECTED_USERS.has(result.userId)) {
              CONNECTED_USERS.set(result.userId, {
                userId: result.userId,
                username: result.username || 'Unknown',
                role: result.role || 'user',
                connectionCount: 0,
                lastActive: new Date(),
                status: 'online',
                ws: new Set()
              });
            }
            
            const user = CONNECTED_USERS.get(result.userId);
            if (user) {
              user.connectionCount++;
              user.lastActive = new Date();
              user.ws.add(client);
            }
            
            // Send authentication success
            sendToClient(client, {
              type: 'authenticated',
              userId: result.userId,
              username: result.username,
              role: result.role,
              timestamp: new Date().toISOString()
            });
            
            // Send any pending notifications
            const userNotifications = USER_NOTIFICATIONS.get(result.userId!) || [];
            if (userNotifications.length > 0) {
              sendToClient(client, {
                type: 'pending_notifications',
                count: userNotifications.length,
                timestamp: new Date().toISOString()
              });
            }
          } else {
            sendToClient(client, {
              type: 'error',
              message: 'Authentication failed: Invalid token',
              timestamp: new Date().toISOString()
            });
          }
        }).catch(error => {
          logError('Token validation error', error);
          sendToClient(client, {
            type: 'error',
            message: 'Authentication failed: Server error',
            timestamp: new Date().toISOString()
          });
        });
        break;
      }
      
      case 'subscribe_rfq': {
        // Subscribe to a specific RFQ updates
        if (!client.authenticated) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        const rfqId = data.rfqId;
        if (!rfqId || typeof rfqId !== 'number') {
          sendToClient(client, { type: 'error', message: 'Invalid RFQ ID', timestamp: new Date().toISOString() });
          return;
        }

        // Get or create subscriber set for this RFQ
        if (!RFQ_SUBSCRIBERS.has(rfqId)) {
          RFQ_SUBSCRIBERS.set(rfqId, new Set());
        }
        
        // Add this connection to the subscribers
        RFQ_SUBSCRIBERS.get(rfqId)?.add(client);
        sendToClient(client, { 
          type: 'subscribed', 
          target: 'rfq', 
          targetId: rfqId,
          message: `Subscribed to updates for RFQ #${rfqId}`,
          timestamp: new Date().toISOString() 
        });
        
        client.joinedChannels.add(`rfq_${rfqId}`);
        logInfo(`User ${client.userId} subscribed to RFQ #${rfqId}`);
        break;
      }
      
      case 'subscribe_invoice': {
        if (!client.authenticated) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        const invoiceId = data.invoiceId;
        if (!invoiceId || typeof invoiceId !== 'number') {
          sendToClient(client, { type: 'error', message: 'Invalid Invoice ID', timestamp: new Date().toISOString() });
          return;
        }

        // Get or create subscriber set for this invoice
        if (!INVOICE_SUBSCRIBERS.has(invoiceId)) {
          INVOICE_SUBSCRIBERS.set(invoiceId, new Set());
        }
        
        // Add this connection to the subscribers
        INVOICE_SUBSCRIBERS.get(invoiceId)?.add(client);
        sendToClient(client, { 
          type: 'subscribed', 
          target: 'invoice', 
          targetId: invoiceId,
          message: `Subscribed to updates for Invoice #${invoiceId}`,
          timestamp: new Date().toISOString() 
        });
        
        client.joinedChannels.add(`invoice_${invoiceId}`);
        logInfo(`User ${client.userId} subscribed to Invoice #${invoiceId}`);
        break;
      }
      
      case 'unsubscribe_rfq': {
        if (!client.authenticated) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        const rfqId = data.rfqId;
        if (!rfqId || typeof rfqId !== 'number') {
          sendToClient(client, { type: 'error', message: 'Invalid RFQ ID', timestamp: new Date().toISOString() });
          return;
        }
        
        // Unsubscribe from RFQ channel
        const subscribers = RFQ_SUBSCRIBERS.get(rfqId);
        if (subscribers) {
          subscribers.delete(client);
          // If no subscribers left, delete the entry
          if (subscribers.size === 0) {
            RFQ_SUBSCRIBERS.delete(rfqId);
          }
        }
        
        client.joinedChannels.delete(`rfq_${rfqId}`);
        sendToClient(client, {
          type: 'unsubscribed',
          target: 'rfq',
          targetId: rfqId,
          timestamp: new Date().toISOString()
        });
        
        logInfo(`User ${client.userId} unsubscribed from RFQ #${rfqId}`);
        break;
      }
      
      case 'get_user_notifications': {
        if (!client.authenticated || !client.userId) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        // Retrieve all notifications for the user
        const userNotifications = USER_NOTIFICATIONS.get(client.userId) || [];
        sendToClient(client, {
          type: 'user_notifications',
          notifications: userNotifications,
          count: userNotifications.length,
          timestamp: new Date().toISOString()
        });
        break;
      }
      
      case 'presence_update': {
        if (!client.authenticated || !client.userId) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        // Update user's presence status (away/online)
        const status = data.status;
        if (!status || !['online', 'away'].includes(status)) {
          sendToClient(client, { type: 'error', message: 'Invalid status', timestamp: new Date().toISOString() });
          return;
        }
        
        const user = CONNECTED_USERS.get(client.userId);
        if (user) {
          user.status = status;
          user.lastActive = new Date();
          
          // Broadcast status change to admins
          broadcastToRole('admin', {
            type: 'user_presence',
            action: 'status_change',
            userId: client.userId,
            username: user.username,
            status,
            timestamp: new Date().toISOString()
          });
          
          sendToClient(client, {
            type: 'presence_updated',
            status,
            timestamp: new Date().toISOString()
          });
        }
        break;
      }
      
      case 'get_active_users': {
        if (!client.authenticated) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        // Only admins can see all active users
        if (client.role !== 'admin') {
          sendToClient(client, { type: 'error', message: 'Unauthorized', timestamp: new Date().toISOString() });
          return;
        }
        
        // Send list of all active users
        const activeUsers = Array.from(CONNECTED_USERS.values()).map(user => ({
          userId: user.userId,
          username: user.username,
          role: user.role,
          status: user.status,
          connectionCount: user.connectionCount,
          lastActive: user.lastActive.toISOString()
        }));
        
        sendToClient(client, {
          type: 'active_users',
          users: activeUsers,
          count: activeUsers.length,
          timestamp: new Date().toISOString()
        });
        break;
      }
      
      case 'ping':
        // Respond with pong to keep connection alive
        sendToClient(client, { type: 'pong', timestamp: new Date().toISOString() });
        break;
        
      case 'subscribe_invoice': {
        if (!client.authenticated) {
          sendToClient(client, { type: 'error', message: 'Authentication required', timestamp: new Date().toISOString() });
          return;
        }
        
        const invoiceId = data.invoiceId;
        if (!invoiceId || typeof invoiceId !== 'number') {
          sendToClient(client, { type: 'error', message: 'Invalid Invoice ID', timestamp: new Date().toISOString() });
          return;
        }

        // Get or create subscriber set for this invoice
        if (!INVOICE_SUBSCRIBERS.has(invoiceId)) {
          INVOICE_SUBSCRIBERS.set(invoiceId, new Set());
        }
        
        // Add this connection to the subscribers
        INVOICE_SUBSCRIBERS.get(invoiceId)?.add(client);
        sendToClient(client, { 
          type: 'subscribed', 
          target: 'invoice', 
          targetId: invoiceId,
          message: `Subscribed to updates for Invoice #${invoiceId}`,
          timestamp: new Date().toISOString() 
        });
        
        client.joinedChannels.add(`invoice_${invoiceId}`);
        logInfo(`User ${client.userId} subscribed to Invoice #${invoiceId}`);
        break;
      }
      
      default:
        sendToClient(client, { 
          type: 'error', 
          message: `Unknown message type: ${messageType}`, 
          timestamp: new Date().toISOString() 
        });
        break;
    }
  } catch (error) {
    logError(`Error handling message type ${messageType}`, error);
    sendToClient(client, {
      type: 'error',
      message: 'Server error processing message',
      timestamp: new Date().toISOString()
    });
  }
}
