import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { queryClient } from '@/lib/queryClient';

// Define the WebSocket message format (matching server's format)
export type WebSocketMessage = {
  type: 'rfq_created' | 'rfq_updated' | 'quote_created' | 'quote_updated' | 
        'message_created' | 'transaction_created' | 'ping' | 'error' | 
        'authentication_success' | 'authenticate' | 'pong';
  payload: any;
  timestamp: number;
};

interface WebSocketContextType {
  connected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    // Only connect if there's a logged-in user
    if (!user) {
      return;
    }

    if (socket.current) {
      // Close existing connection before creating a new one
      socket.current.close();
    }

    try {
      // Use the correct protocol based on current connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Create a new WebSocket connection
      const ws = new WebSocket(wsUrl);
      socket.current = ws;

      // Set up event handlers
      ws.addEventListener('open', () => {
        setConnected(true);
        console.log('WebSocket connection established');
        
        // Authenticate the connection with user ID and role
        sendMessage({
          type: 'authenticate',
          payload: { 
            userId: user.id, 
            role: user.role 
          },
          timestamp: Date.now()
        });
      });

      ws.addEventListener('message', (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.addEventListener('close', () => {
        setConnected(false);
        console.log('WebSocket connection closed');
        
        // Attempt to reconnect after a delay
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        
        reconnectTimeout.current = setTimeout(() => {
          if (user) {
            connect();
          }
        }, 3000); // Reconnect after 3 seconds
      });

      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      });
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }, [user]);

  // Reconnect when user changes (login/logout)
  useEffect(() => {
    if (user) {
      connect();
    } else if (socket.current) {
      socket.current.close();
      setConnected(false);
    }

    // Clean up on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [user, connect]);

  // Handle incoming messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);

    // Handle different message types
    switch (message.type) {
      case 'ping':
        // Respond to keep-alive ping
        sendMessage({
          type: 'pong',
          payload: null,
          timestamp: Date.now()
        });
        break;
        
      case 'authentication_success':
        toast({
          title: 'Real-time updates active',
          description: 'You will now receive live updates',
          variant: 'default',
        });
        break;
        
      case 'rfq_created':
        // Invalidate RFQ queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
        toast({
          title: 'New RFQ',
          description: 'A new RFQ has been posted',
          variant: 'default',
        });
        break;
        
      case 'rfq_updated':
        // Invalidate RFQ queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
        queryClient.invalidateQueries({ queryKey: ['/api/rfqs/user'] });
        queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${message.payload.id}`] });
        toast({
          title: 'RFQ Updated',
          description: `RFQ status changed to ${message.payload.status}`,
          variant: 'default',
        });
        break;
        
      case 'quote_created':
        // Invalidate quote queries for the affected RFQ
        queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${message.payload.rfqId}/quotes`] });
        toast({
          title: 'New Quote',
          description: 'A new quote has been submitted',
          variant: 'default',
        });
        break;
        
      case 'quote_updated':
        // Invalidate quote queries for the affected RFQ
        queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${message.payload.rfqId}/quotes`] });
        toast({
          title: 'Quote Updated',
          description: `Quote status changed to ${message.payload.status}`,
          variant: 'default',
        });
        break;
        
      case 'message_created':
        // Invalidate message queries for the affected conversation
        queryClient.invalidateQueries({ 
          queryKey: [
            `/api/messages/${message.payload.senderId}`,
            `/api/messages/${message.payload.receiverId}`
          ] 
        });
        if (message.payload.receiverId === user?.id) {
          toast({
            title: 'New Message',
            description: 'You have received a new message',
            variant: 'default',
          });
        }
        break;
        
      case 'transaction_created':
        // Invalidate transaction queries
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
        toast({
          title: 'Transaction Completed',
          description: `${message.payload.type} transaction of ₹${message.payload.amount} processed`,
          variant: 'default',
        });
        break;
        
      case 'error':
        toast({
          title: 'Error',
          description: message.payload.message || 'Something went wrong',
          variant: 'destructive',
        });
        break;
    }
  }, [toast, user?.id]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }, []);

  // Provide the WebSocket context to children
  return (
    <WebSocketContext.Provider value={{ connected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use the WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}