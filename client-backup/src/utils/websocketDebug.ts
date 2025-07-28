import { io, Socket } from 'socket.io-client';

/**
 * WebSocket debug utilities for monitoring and debugging WebSocket connections
 */

interface WebSocketStats {
  connectTime?: number;
  lastPingTime?: number;
  lastPongTime?: number;
  messageCount: number;
  errorCount: number;
  reconnectCount: number;
  messages: Array<{
    type: string;
    timestamp: number;
    payload?: any;
  }>;
}

/**
 * Creates a WebSocket debugger that tracks connection stats and events
 */
export function createWebSocketDebugger(socket: Socket) {
  const stats: WebSocketStats = {
    messageCount: 0,
    errorCount: 0,
    reconnectCount: 0,
    messages: [],
  };

  // Track connection time
  socket.on('connect', () => {
    stats.connectTime = Date.now();
    stats.reconnectCount += 1;
    logEvent('connect', { socketId: socket.id });
  });

  // Track disconnections
  socket.on('disconnect', (reason) => {
    logEvent('disconnect', { reason });
  });

  // Track errors
  socket.on('connect_error', (error) => {
    stats.errorCount += 1;
    logEvent('connect_error', { error: error.message });
  });

  // Track pings
  socket.on('ping', () => {
    stats.lastPingTime = Date.now();
    logEvent('ping');
  });

  // Track pongs
  socket.on('pong', (latency) => {
    stats.lastPongTime = Date.now();
    logEvent('pong', { latency });
  });

  // Track reconnection attempts
  socket.io.on('reconnect_attempt', (attempt) => {
    logEvent('reconnect_attempt', { attempt });
  });

  // Track reconnection failures
  socket.io.on('reconnect_failed', () => {
    logEvent('reconnect_failed');
  });

  // Track custom events
  const originalEmit = socket.emit.bind(socket);
  socket.emit = (event: string, ...args: any[]) => {
    logEvent(`emit_${event}`, args[0]);
    return originalEmit(event, ...args);
  };

  // Track incoming messages
  const originalOn = socket.on.bind(socket);
  socket.on = (event: string, callback: (...args: any[]) => void) => {
    const wrappedCallback = (...args: any[]) => {
      stats.messageCount += 1;
      logEvent(`on_${event}`, args[0]);
      return callback(...args);
    };
    return originalOn(event, wrappedCallback);
  };

  // Helper to log events
  function logEvent(type: string, payload?: any) {
    const event = {
      type,
      timestamp: Date.now(),
      payload,
    };

    stats.messages.push(event);

    // Keep only the last 100 messages
    if (stats.messages.length > 100) {
      stats.messages.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WebSocket ${type}]`, payload || '');
    }

    return event;
  }

  // Public API
  return {
    /**
     * Get current connection statistics
     */
    getStats: (): WebSocketStats => ({
      ...stats,
      // Calculate latency if we have both ping and pong times
      latency: stats.lastPingTime && stats.lastPongTime
        ? stats.lastPongTime - stats.lastPingTime
        : undefined,
    }),

    /**
     * Get recent messages (optionally filtered by type)
     */
    getMessages: (type?: string) =>
      type
        ? stats.messages.filter(msg => msg.type === type)
        : [...stats.messages],

    /**
     * Reset all statistics
     */
    reset: () => {
      stats.messageCount = 0;
      stats.errorCount = 0;
      stats.reconnectCount = 0;
      stats.messages = [];
      delete stats.connectTime;
      delete stats.lastPingTime;
      delete stats.lastPongTime;
    },

    /**
     * Generate a connection health report
     */
    getHealthReport: () => {
      const now = Date.now();
      const connectionAge = stats.connectTime ? now - stats.connectTime : 0;
      const lastActivity = stats.messages[stats.messages.length - 1]?.timestamp || 0;
      const timeSinceLastActivity = lastActivity ? now - lastActivity : 0;

      return {
        connected: socket.connected,
        connectionAge,
        messageRate: connectionAge > 0
          ? (stats.messageCount / (connectionAge / 1000)).toFixed(2) + ' msgs/sec'
          : 'N/A',
        lastActivity: new Date(lastActivity).toLocaleTimeString(),
        timeSinceLastActivity,
        errorRate: stats.messageCount > 0
          ? ((stats.errorCount / stats.messageCount) * 100).toFixed(2) + '%'
          : '0%',
        reconnectCount: stats.reconnectCount,
      };
    },
  };
}

/**
 * Utility to format WebSocket messages for display
 */
export function formatWebSocketMessage(message: any): string {
  try {
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return message;
      }
    }
    return JSON.stringify(message, null, 2);
  } catch (error) {
    return String(message);
  }
}

/**
 * Create a WebSocket connection with debugging enabled
 */
export function createDebugWebSocket(uri: string, options: any = {}) {
  // Enable debugging options
  const socket = io(uri, {
    ...options,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: true,
  });

  const debuggerInstance = createWebSocketDebugger(socket);

  return {
    socket,
    ...debuggerInstance,
  };
}
