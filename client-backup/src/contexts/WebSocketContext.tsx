import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@chakra-ui/react';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastMessage: any;
  sendPing: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: null,
  sendPing: () => {},
  connectionStatus: 'disconnected',
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const toast = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    setConnectionStatus('connecting');

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    console.log('Connecting to WebSocket server at:', socketUrl);

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    // Connection established
    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket server with ID:', socketInstance.id);
      setConnectionStatus('connected');
      
      toast({
        title: 'Connected',
        description: 'Live updates are now active',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnectionStatus('error');
      
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to live updates server',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    // Disconnected
    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        // Reconnect if the server disconnects us
        socketInstance.connect();
      }
    });

    // Reconnection attempts
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`♻️ Reconnection attempt ${attemptNumber}`);
      setConnectionStatus('connecting');
    });

    // Reconnection failed
    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to WebSocket server');
      setConnectionStatus('error');
    });

    // Handle incoming messages
    socketInstance.on('code-update', (data) => {
      console.log('📩 Received code update:', data);
      setLastMessage(data);
      
      // Show toast for file changes
      if (data.type && data.type.includes('file-')) {
        toast({
          title: 'File Change Detected',
          description: `${data.path} was ${data.type.replace('file-', '')}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    // Handle connection info
    socketInstance.on('connection-info', (info) => {
      console.log('ℹ️ Connection info:', info);
    });

    // Handle pong responses
    socketInstance.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
    };
  }, [toast]);

  // Function to send a ping
  const sendPing = useCallback(() => {
    if (socket?.connected) {
      const pingData = { 
        timestamp: new Date().toISOString(),
        clientId: socket.id 
      };
      console.log('🏓 Sending ping:', pingData);
      socket.emit('ping', pingData);
    } else {
      console.warn('Cannot send ping: Socket not connected');
    }
  }, [socket]);

  // Debug: Log connection status changes
  useEffect(() => {
    console.log(`🔄 Connection status: ${connectionStatus}`);
  }, [connectionStatus]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected: connectionStatus === 'connected',
        lastMessage,
        sendPing,
        connectionStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
