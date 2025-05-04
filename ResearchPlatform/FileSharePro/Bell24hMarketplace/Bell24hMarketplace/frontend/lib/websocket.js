// Websocket client for real-time updates
class WebSocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.listeners = new Map();
    this.connected = false;
  }

  connect() {
    if (typeof window === 'undefined') return; // Don't run on server-side

    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        
        if (this.listeners.has(type)) {
          this.listeners.get(type).forEach(callback => {
            callback(payload);
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    this.socket.onclose = () => {
      this.connected = false;
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.socket.close();
    };
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    console.log(`Reconnecting in ${delay}ms...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connected = false;
  }
  
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type).push(callback);
  }
  
  off(type, callback) {
    if (!this.listeners.has(type)) return;
    
    const callbacks = this.listeners.get(type);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    if (callbacks.length === 0) {
      this.listeners.delete(type);
    }
  }
  
  send(type, payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    
    const message = JSON.stringify({ type, payload });
    this.socket.send(message);
  }
}

export const webSocketClient = new WebSocketClient();
export default webSocketClient;
