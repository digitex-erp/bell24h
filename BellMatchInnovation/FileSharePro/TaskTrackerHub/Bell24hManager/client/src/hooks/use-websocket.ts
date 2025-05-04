import { useState, useEffect, useCallback, useRef } from 'react';

// Message handlers type definition
type MessageHandlers = {
  [type: string]: (message: any) => void;
};

/**
 * Custom hook for WebSocket connection and voice command handling
 * @param messageHandlers Object of handler functions keyed by message type
 * @returns Object with connection status and methods to interact with WebSocket
 */
export function useWebSocket(messageHandlers: MessageHandlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Setup WebSocket connection
  useEffect(() => {
    // Create WebSocket URL using the correct protocol based on page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      ws.current = socket;
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        setError(null);
      });
      
      // Listen for messages
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check if we have a handler for this message type
          if (data.type && messageHandlers[data.type]) {
            messageHandlers[data.type](data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });
      
      // Connection closed
      socket.addEventListener('close', (event) => {
        setIsConnected(false);
        console.log('WebSocket connection closed', event.code, event.reason);
        
        // Don't reconnect if closed normally
        if (event.code !== 1000) {
          // Reconnect with exponential backoff
          const reconnectDelay = Math.min(30000, 1000 * Math.pow(2, Math.min(5, 1)));
          console.log(`Reconnecting in ${reconnectDelay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay);
        }
      });
      
      // Connection error
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error. Please try again later.');
      });
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [messageHandlers]);
  
  /**
   * Send a voice command to the server
   * @param text The text of the voice command
   * @param confidence A confidence score for the recognition (0-1)
   */
  const sendVoiceCommand = useCallback((text: string, confidence: number = 0.9) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'voice_command',
        data: {
          command: text,
          confidence,
          timestamp: new Date().toISOString()
        }
      };
      
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected. Cannot send voice command.');
      return false;
    }
  }, []);
  
  /**
   * Generic function to send any message to the server
   * @param type Message type
   * @param data Message data
   */
  const sendMessage = useCallback((type: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn(`WebSocket not connected. Cannot send message of type: ${type}`);
      return false;
    }
  }, []);
  
  return {
    isConnected,
    error,
    sendVoiceCommand,
    sendMessage
  };
}