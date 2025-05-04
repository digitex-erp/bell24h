export type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.startPingInterval();
    
    // Notify all connection handlers
    this.notifyHandlers('connection', { status: 'connected' });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Handle the message based on its type
      this.notifyHandlers(message.type, message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log(`WebSocket closed: ${event.code} ${event.reason}`);
    this.stopPingInterval();
    
    // Notify all disconnection handlers
    this.notifyHandlers('disconnection', { 
      status: 'disconnected', 
      code: event.code, 
      reason: event.reason 
    });
    
    // Attempt to reconnect
    this.attemptReconnect();
  }

  private handleError(event: Event) {
    console.error('WebSocket error:', event);
    
    // Notify all error handlers
    this.notifyHandlers('error', { error: 'WebSocket error occurred' });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      
      // Notify all reconnection failure handlers
      this.notifyHandlers('reconnection_failure', { 
        attempts: this.reconnectAttempts 
      });
      
      return;
    }
    
    this.reconnectAttempts++;
    
    // Notify all reconnection attempt handlers
    this.notifyHandlers('reconnection_attempt', { 
      attempt: this.reconnectAttempts, 
      maxAttempts: this.maxReconnectAttempts 
    });
    
    // Exponential backoff for reconnect delay
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startPingInterval() {
    this.stopPingInterval();
    
    // Send a ping message every 30 seconds to keep the connection alive
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(message: WebSocketMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  on(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
  }

  off(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) return;
    
    const handlers = this.messageHandlers.get(type)!;
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    if (handlers.length === 0) {
      this.messageHandlers.delete(type);
    }
  }

  private notifyHandlers(type: string, data: any) {
    if (!this.messageHandlers.has(type)) return;
    
    this.messageHandlers.get(type)!.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket ${type} handler:`, error);
      }
    });
  }

  disconnect() {
    this.stopPingInterval();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();
