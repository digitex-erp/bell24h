import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { User, Rfq, Quote, Message, Transaction } from '@shared/schema';

// Define message types that can be sent over the WebSocket
export type WebSocketMessage = {
  type: 'rfq_created' | 'rfq_updated' | 'quote_created' | 'quote_updated' | 
        'message_created' | 'transaction_created' | 'ping' | 'error' | 
        'authentication_success' | 'authenticate' | 'pong';
  payload: any;
  timestamp: number;
};

// Define client connections with associated user info
interface WebSocketClient extends WebSocket {
  userId?: number;
  role?: 'buyer' | 'supplier' | 'admin';
  isAlive: boolean;
}

// Class to manage WebSocket connections and messages
export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocketClient> = new Set();
  private pingInterval: NodeJS.Timeout;

  constructor(server: HttpServer, path: string = '/ws') {
    // Initialize WebSocket server on the given HTTP server
    this.wss = new WebSocketServer({ 
      server,
      path
    });

    // Set up connection handling
    this.setupConnectionHandlers();

    // Set up ping interval to detect dead connections
    this.pingInterval = setInterval(() => {
      this.pingAllClients();
    }, 30000); // Send ping every 30 seconds
  }

  private setupConnectionHandlers() {
    this.wss.on('connection', (ws: WebSocketClient) => {
      // Initialize client
      ws.isAlive = true;
      this.clients.add(ws);
      
      console.log(`WebSocket connection established. Total clients: ${this.clients.size}`);

      // Handle messages from clients
      ws.on('message', (data: RawData) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Handle authentication messages to associate the connection with a user
          if (message.type === 'authenticate') {
            ws.userId = message.payload.userId;
            ws.role = message.payload.role;
            console.log(`WebSocket client authenticated: ${ws.userId} as ${ws.role}`);
            
            // Send confirmation back to client
            this.sendToClient(ws, {
              type: 'authentication_success',
              payload: { userId: ws.userId, role: ws.role },
              timestamp: Date.now()
            });
          }
          
          // Handle pong messages (client responding to server pings)
          if (message.type === 'pong') {
            ws.isAlive = true;
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
          this.sendToClient(ws, {
            type: 'error',
            payload: { message: 'Invalid message format' },
            timestamp: Date.now()
          });
        }
      });

      // Handle connection close
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`WebSocket connection closed. Total clients: ${this.clients.size}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'ping',
        payload: { message: 'Welcome to Bell24h WebSocket Server' },
        timestamp: Date.now()
      });
    });

    // Log any server-level errors
    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  // Notify about new RFQ
  public notifyRfqCreated(rfq: Rfq) {
    // Clean the RFQ data to remove sensitive info
    const sanitizedRfq = { ...rfq };
    
    this.broadcast({
      type: 'rfq_created',
      payload: sanitizedRfq,
      timestamp: Date.now()
    });
  }

  // Notify about RFQ status update
  public notifyRfqUpdated(rfq: Rfq) {
    // Clean the RFQ data to remove sensitive info
    const sanitizedRfq = { ...rfq };
    
    this.broadcast({
      type: 'rfq_updated',
      payload: sanitizedRfq,
      timestamp: Date.now()
    });
  }

  // Notify about new quote
  public notifyQuoteCreated(quote: Quote, rfqOwnerId: number) {
    // Send to RFQ owner and quote supplier
    this.broadcastToUsers([rfqOwnerId, quote.supplierId], {
      type: 'quote_created',
      payload: quote,
      timestamp: Date.now()
    });
  }

  // Notify about quote status update
  public notifyQuoteUpdated(quote: Quote, rfqOwnerId: number) {
    // Send to RFQ owner and quote supplier
    this.broadcastToUsers([rfqOwnerId, quote.supplierId], {
      type: 'quote_updated',
      payload: quote,
      timestamp: Date.now()
    });
  }

  // Notify about new message
  public notifyMessageCreated(message: Message) {
    // Send to sender and receiver only
    this.broadcastToUsers([message.senderId, message.receiverId], {
      type: 'message_created',
      payload: message,
      timestamp: Date.now()
    });
  }

  // Notify about new transaction
  public notifyTransactionCreated(transaction: Transaction) {
    // Send to transaction owner only
    this.broadcastToUsers([transaction.userId], {
      type: 'transaction_created',
      payload: transaction,
      timestamp: Date.now()
    });
  }

  // Send a message to one specific client
  private sendToClient(client: WebSocketClient, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  }

  // Broadcast a message to all connected clients
  private broadcast(message: WebSocketMessage) {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }

  // Broadcast a message to specific users
  private broadcastToUsers(userIds: number[], message: WebSocketMessage) {
    this.clients.forEach(client => {
      if (client.userId && userIds.includes(client.userId)) {
        this.sendToClient(client, message);
      }
    });
  }

  // Broadcast to clients with a specific role
  private broadcastToRole(role: 'buyer' | 'supplier' | 'admin', message: WebSocketMessage) {
    this.clients.forEach(client => {
      if (client.role === role) {
        this.sendToClient(client, message);
      }
    });
  }

  // Send ping to all clients to detect dead connections
  private pingAllClients() {
    this.clients.forEach(client => {
      if (client.isAlive === false) {
        client.terminate();
        this.clients.delete(client);
        return;
      }

      client.isAlive = false;
      this.sendToClient(client, {
        type: 'ping',
        payload: null,
        timestamp: Date.now()
      });
    });
  }

  // Clean up resources when shutting down
  public close() {
    clearInterval(this.pingInterval);
    this.wss.close();
  }
}