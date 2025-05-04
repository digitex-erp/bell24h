import { z } from 'zod';

type MessageCallback = (message: WebSocketMessage) => void;
type StatusCallback = (status: ConnectionStatus) => void;

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSED = 'closed',
  ERROR = 'error'
}

export enum MessageType {
  CHAT = 'chat',
  NOTIFICATION = 'notification',
  QUOTE_UPDATE = 'quote_update',
  RFQ_UPDATE = 'rfq_update',
  PAYMENT_UPDATE = 'payment_update'
}

export interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: string;
}

const messageSchema = z.object({
  type: z.nativeEnum(MessageType),
  data: z.any(),
  timestamp: z.string()
});

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private messageListeners: Set<MessageCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectTimeout: number = 2000; // Start with 2 seconds
  private maxReconnectTimeout: number = 30000; // Max 30 seconds
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private _status: ConnectionStatus = ConnectionStatus.CLOSED;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.socket = new WebSocket(wsUrl);
      this.setStatus(ConnectionStatus.CONNECTING);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setStatus(ConnectionStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  private handleOpen() {
    this.setStatus(ConnectionStatus.OPEN);
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 2000; // Reset timeout on successful connection
    console.log('WebSocket connection established');
  }

  private handleMessage(event: MessageEvent) {
    try {
      const parsedData = JSON.parse(event.data);
      const validatedMessage = messageSchema.parse(parsedData);
      
      // Notify all listeners
      this.messageListeners.forEach(listener => {
        listener(validatedMessage);
      });
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    this.setStatus(ConnectionStatus.CLOSED);
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    
    // Attempt to reconnect unless it was a clean closure
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event) {
    this.setStatus(ConnectionStatus.ERROR);
    console.error('WebSocket error:', event);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      return;
    }

    this.reconnectAttempts++;
    
    // Exponential backoff with jitter
    const jitter = Math.random() * 0.3 + 0.85; // Random between 0.85 and 1.15
    const timeout = Math.min(this.reconnectTimeout * jitter, this.maxReconnectTimeout);
    
    console.log(`Scheduling reconnect in ${Math.round(timeout)}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})`);
      this.connect();
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, this.maxReconnectTimeout);
    }, timeout);
  }

  public send(type: MessageType, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  public addMessageListener(callback: MessageCallback) {
    this.messageListeners.add(callback);
  }

  public removeMessageListener(callback: MessageCallback) {
    this.messageListeners.delete(callback);
  }
  
  public addStatusListener(callback: StatusCallback) {
    this.statusListeners.add(callback);
    // Immediately notify about current status
    callback(this._status);
  }

  public removeStatusListener(callback: StatusCallback) {
    this.statusListeners.delete(callback);
  }
  
  private setStatus(status: ConnectionStatus) {
    if (this._status !== status) {
      this._status = status;
      this.statusListeners.forEach(listener => listener(status));
    }
  }

  public get status(): ConnectionStatus {
    return this._status;
  }

  public close() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting normally');
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Singleton instance
let wsInstance: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsInstance) {
    wsInstance = new WebSocketClient();
  }
  return wsInstance;
};
