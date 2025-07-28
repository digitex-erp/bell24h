/**
 * Optimized WebSocket Client for Bell24H Dashboard
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Connection pooling for multiple subscriptions
 * - Batch message handling
 * - Subscription management
 * - Event-based interface
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

// Client options
export interface WebSocketClientOptions {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  initialReconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectBackoffMultiplier?: number;
  connectionTimeout?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

// Client subscription options
export interface SubscriptionOptions {
  id?: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  autoResubscribe?: boolean;
}

// Shipment subscription options
export interface ShipmentSubscriptionOptions extends SubscriptionOptions {
  shipmentId: number;
}

// Optimized WebSocket client
export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  // Pending message queue for messages sent while disconnected
  private messageQueue: { data: any; timeout: number }[] = [];
  // Track last pong timestamp for heartbeat monitoring
  private lastPong: number = Date.now();
  // User-provided error callback
  public onError: ((error: Error) => void) | null = null;
  private options: Required<WebSocketClientOptions>;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: number | NodeJS.Timeout | null = null;
  private heartbeatTimer: number | NodeJS.Timeout | null = null;
  private connectionTimeoutTimer: number | NodeJS.Timeout | null = null;
  private pendingMessages: Map<string, { resolve: Function, reject: Function, timeout: number | NodeJS.Timeout }> = new Map();
  private subscriptions: Map<string, { type: string, data: any, options: SubscriptionOptions }> = new Map();
  private connectionPromise: Promise<WebSocket> | null = null;
  private connectionPromiseResolvers: { resolve: Function, reject: Function } | null = null;
  private clientId: string = uuidv4();

  constructor(options: WebSocketClientOptions) {
    super();
    
    // Set default options
    this.options = {
      url: options.url,
      token: options.token || '',
      autoReconnect: options.autoReconnect !== false,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      initialReconnectDelay: options.initialReconnectDelay || 1000,
      maxReconnectDelay: options.maxReconnectDelay || 30000,
      reconnectBackoffMultiplier: options.reconnectBackoffMultiplier || 1.5,
      connectionTimeout: options.connectionTimeout || 10000,
      heartbeatInterval: options.heartbeatInterval || 30000,
      debug: options.debug || false
    };
    
    // Initialize event listeners
    this.on('error', this.handleError.bind(this));
  }

  /**
   * Connect to the WebSocket server
   */
  public async connect(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return this.ws;
    }
    
    // If we're already connecting, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    // Create a new connection promise
    this.connectionPromise = new Promise<WebSocket>((resolve, reject) => {
      this.connectionPromiseResolvers = { resolve, reject };
      this.connectToServer();
    });
    
    return this.connectionPromise;
  }

  /**
   * Internal method to establish a connection to the server
   */
  private connectToServer(): void {
    // Update state
    this.state = ConnectionState.CONNECTING;
    this.emit('stateChange', this.state);

    // Clear any existing timers
    this.clearTimers();

    // Build URL with token if provided
    let url = this.options.url;
    if (this.options.token) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}token=${this.options.token}`;
    }

    try {
      // Create WebSocket connection
      this.ws = new WebSocket(url);
      
      // Set up event listeners
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = (event) => {
        this.handleMessage(event);
        // Heartbeat: update last pong timestamp if pong received
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            this.lastPong = Date.now();
          }
        } catch (e) {}
      };
      
      // Set connection timeout
      this.connectionTimeoutTimer = setTimeout(() => {
        if (this.state === ConnectionState.CONNECTING) {
          this.log('Connection timeout');
          if (this.ws) {
            this.ws.close();
          }
          if (this.connectionPromiseResolvers) {
            this.connectionPromiseResolvers.reject(new Error('Connection timeout'));
            this.connectionPromiseResolvers = null;
          }
          this.emit('error', new Error('Connection timeout'));
          this.state = ConnectionState.DISCONNECTED;
          this.emit('stateChange', this.state);
          this.tryReconnect();
        }
      }, this.options.connectionTimeout);
    } catch (error) {
      this.log('Error creating WebSocket:', error);
      this.state = ConnectionState.DISCONNECTED;
      this.emit('stateChange', this.state);
      if (this.connectionPromiseResolvers) {
        this.connectionPromiseResolvers.reject(error);
        this.connectionPromiseResolvers = null;
      }
      this.emit('error', error);
      this.tryReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    this.log('Connected to WebSocket server');
    
    // Clear connection timeout
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer as number);
      this.connectionTimeoutTimer = null;
    }
    
    // Update state
    this.state = ConnectionState.CONNECTED;
    this.emit('stateChange', this.state);
    this.emit('connected');
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Resolve connection promise
    if (this.connectionPromiseResolvers) {
      this.connectionPromiseResolvers.resolve(this.ws);
      this.connectionPromiseResolvers = null;
    }
    
    // Resubscribe to previous subscriptions
    this.resubscribeAll();
    // After reconnect, flush any queued messages
    this.flushPendingMessages();
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    
    // Clean up resources
    this.ws = null;
    this.clearTimers();
    
    // Update state
    this.state = ConnectionState.DISCONNECTED;
    this.emit('stateChange', this.state);
    this.emit('disconnected', event);
    
    // Reject any pending messages
    for (const [id, pending] of this.pendingMessages.entries()) {
      clearTimeout(pending.timeout as number);
      pending.reject(new Error('Connection closed'));
      this.pendingMessages.delete(id);
    }
    
    // Reject connection promise if still connecting
    if (this.connectionPromiseResolvers) {
      this.connectionPromiseResolvers.reject(new Error('Connection closed'));
      this.connectionPromiseResolvers = null;
    }
    
    this.connectionPromise = null;
    
    // Try to reconnect
    this.tryReconnect();
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event | Error): void {
    // Surface error to onError callback if provided
    if (this.onError) {
      this.onError(event instanceof Error ? event : new Error('WebSocket error'));
    }
    const error = event instanceof Error ? event : new Error('WebSocket error');
    this.log('WebSocket error:', error);
    this.emit('error', error);
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.log('Received message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'pong':
          // Heartbeat response
          this.emit('pong', data);
          break;
          
        case 'connection_established':
          // Connection established
          this.emit('ready', data);
          break;
          
        case 'shipment_update':
        case 'shipment_status_change':
        case 'shipment_location_update':
          // Handle shipment-related messages
          this.handleShipmentMessage(data);
          break;
          
        case 'batch_update':
          // Handle batch updates
          if (Array.isArray(data.updates)) {
            for (const update of data.updates) {
              this.handleShipmentMessage(update);
            }
          }
          break;
          
        case 'error':
          // Handle error response
          if (data.originalMessageId && this.pendingMessages.has(data.originalMessageId)) {
            const pending = this.pendingMessages.get(data.originalMessageId)!;
            clearTimeout(pending.timeout as number);
            pending.reject(new Error(data.error || 'Unknown error'));
            this.pendingMessages.delete(data.originalMessageId);
          }
          this.emit('serverError', data);
          break;
          
        case 'ack':
          // Handle acknowledgment
          if (data.originalMessageId && this.pendingMessages.has(data.originalMessageId)) {
            const pending = this.pendingMessages.get(data.originalMessageId)!;
            clearTimeout(pending.timeout as number);
            pending.resolve(data);
            this.pendingMessages.delete(data.originalMessageId);
          }
          break;
          
        default:
          // Handle other message types
          this.emit('message', data);
          break;
      }
    } catch (error) {
      this.log('Error parsing message:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle shipment-related messages
   */
  private handleShipmentMessage(data: any): void {
    if (!data.shipmentId) {
      return;
    }
    
    // Find subscriptions for this shipment
    const shipmentSubscriptions = Array.from(this.subscriptions.entries())
      .filter(([_, sub]) => sub.type === 'shipment' && sub.data.shipmentId === data.shipmentId);
    
    // Emit events for each subscription
    for (const [id, subscription] of shipmentSubscriptions) {
      try {
        if (subscription.options.onMessage) {
          subscription.options.onMessage(data);
        }
        this.emit(`subscription:${id}`, data);
      } catch (error) {
        this.log(`Error in subscription handler for ${id}:`, error);
        if (subscription.options.onError) {
          subscription.options.onError(error);
        }
      }
    }
    
    // Emit general event
    this.emit(`shipment:${data.shipmentId}`, data);
  }

  /**
   * Try to reconnect to the server
   */
  private tryReconnect(): void {
    if (!this.options.autoReconnect || this.state === ConnectionState.RECONNECTING) {
      return;
    }
    
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log(`Maximum reconnect attempts (${this.options.maxReconnectAttempts}) reached`);
      this.state = ConnectionState.FAILED;
      this.emit('stateChange', this.state);
      this.emit('reconnectFailed');
      return;
    }
    
    this.reconnectAttempts++;
    this.state = ConnectionState.RECONNECTING;
    this.emit('stateChange', this.state);
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.initialReconnectDelay * Math.pow(this.options.reconnectBackoffMultiplier, this.reconnectAttempts - 1),
      this.options.maxReconnectDelay
    );
    
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });
    
    this.reconnectTimer = setTimeout(() => {
      this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
      this.reconnectTimer = null;
      this.connectToServer();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    // Heartbeat interval
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() })
          .catch(error => this.log('Error sending heartbeat:', error));
      }
      // Check for missed pong
      if (Date.now() - this.lastPong > 2 * this.options.heartbeatInterval) {
        this.log('Missed pong/heartbeat, reconnecting...');
        this.ws?.close(); // Force reconnect
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Clear heartbeat timer
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer as number);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer as number);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer as number);
      this.connectionTimeoutTimer = null;
    }
  }

  /**
   * Send a message to the server
   */
  public async send(data: any, timeout: number = 10000): Promise<any> {
    // If not connected, queue the message
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push({ data, timeout });
      this.log('WebSocket not open, message queued:', data);
      throw new Error('WebSocket not open, message queued');
    }
    // If not connected, try to connect first
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Add message ID if not provided
        if (!data.messageId) {
          data.messageId = uuidv4();
        }
        
        // Send message
        this.ws!.send(JSON.stringify(data));
        
        // Set up timeout for response
        const timeoutId = setTimeout(() => {
          if (this.pendingMessages.has(data.messageId)) {
            this.pendingMessages.delete(data.messageId);
            reject(new Error('Response timeout'));
          }
        }, timeout);
        
        // Store pending message
        this.pendingMessages.set(data.messageId, {
          resolve,
          reject,
          timeout: timeoutId
        });
        
        this.log('Sent message:', data);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to shipment updates
   */
  public async subscribeToShipment(
    shipmentId: number,
    options: Omit<ShipmentSubscriptionOptions, 'shipmentId'> = {}
  ): Promise<string> {
    const subscriptionId = options.id || `shipment-${shipmentId}-${uuidv4()}`;
    
    // Store subscription
    this.subscriptions.set(subscriptionId, {
      type: 'shipment',
      data: { shipmentId },
      options: {
        ...options,
        id: subscriptionId,
        autoResubscribe: options.autoResubscribe !== false
      }
    });
    
    // Send subscription request if connected
    if (this.state === ConnectionState.CONNECTED) {
      try {
        await this.send({
          type: 'subscribe_shipment',
          shipmentId,
          timestamp: new Date().toISOString()
        });
        
        this.log(`Subscribed to shipment ${shipmentId} with ID ${subscriptionId}`);
      } catch (error) {
        this.log(`Error subscribing to shipment ${shipmentId}:`, error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }
    }
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from shipment updates
   */
  public async unsubscribeFromShipment(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription || subscription.type !== 'shipment') {
      throw new Error(`Subscription ${subscriptionId} not found or not a shipment subscription`);
    }
    
    const { shipmentId } = subscription.data;
    
    // Remove subscription
    this.subscriptions.delete(subscriptionId);
    
    // Send unsubscribe request if connected
    if (this.state === ConnectionState.CONNECTED) {
      try {
        await this.send({
          type: 'unsubscribe_shipment',
          shipmentId,
          timestamp: new Date().toISOString()
        });
        
        this.log(`Unsubscribed from shipment ${shipmentId} with ID ${subscriptionId}`);
      } catch (error) {
        this.log(`Error unsubscribing from shipment ${shipmentId}:`, error);
        throw error;
      }
    }
  }

  /**
   * Resubscribe to all active subscriptions
   */
  private async resubscribeAll(): Promise<void> {
    const shipmentSubscriptions = Array.from(this.subscriptions.entries())
      .filter(([_, sub]) => sub.type === 'shipment' && sub.options.autoResubscribe);
    
    for (const [id, subscription] of shipmentSubscriptions) {
      try {
        await this.send({
          type: 'subscribe_shipment',
          shipmentId: subscription.data.shipmentId,
          timestamp: new Date().toISOString()
        });
        
        this.log(`Resubscribed to shipment ${subscription.data.shipmentId} with ID ${id}`);
      } catch (error) {
        this.log(`Error resubscribing to shipment ${subscription.data.shipmentId}:`, error);
        if (subscription.options.onError) {
          subscription.options.onError(error);
        }
      }
    }
  }

  /**
   * Disconnect from the server
   */
  public disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnected');
      }
      this.ws = null;
    }
    
    this.state = ConnectionState.DISCONNECTED;
    this.emit('stateChange', this.state);
    this.emit('disconnected', { code: 1000, reason: 'Client disconnected' });
    
    this.connectionPromise = null;
    
    if (this.connectionPromiseResolvers) {
      this.connectionPromiseResolvers.reject(new Error('Client disconnected'));
      this.connectionPromiseResolvers = null;
    }
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Get active subscriptions
   */
  public getSubscriptions(): Map<string, { type: string, data: any, options: SubscriptionOptions }> {
    return new Map(this.subscriptions);
  }

  /**
   * Log message if debug is enabled
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log(`[WebSocketClient ${this.clientId}]`, ...args);
    }
  }
}

/**
 * Create a shipment tracking client
 */
export function createShipmentTrackingClient(baseUrl: string, token?: string): WebSocketClient {
  // Use the shipment tracking endpoint
  const url = baseUrl.endsWith('/') 
    ? `${baseUrl}shipment-tracking` 
    : `${baseUrl}/shipment-tracking`;
  
  return new WebSocketClient({
    url,
    token,
    autoReconnect: true,
    debug: process.env.NODE_ENV !== 'production'
  });
}
