import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export interface WebSocketNotification {
  type: string;
  data: any;
}

interface WebSocketContextType {
  connected: boolean;
  notifications: WebSocketNotification[];
  sendMessage: (message: any) => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  notifications: [],
  sendMessage: () => {},
});

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const { isAuthenticated } = useAuth();

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle different message types
        if (message.type !== 'welcome' && message.type !== 'pong') {
          setNotifications(prev => [message, ...prev]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected");
      
      // Try to reconnect after a delay
      setTimeout(() => {
        if (isAuthenticated) {
          console.log("Attempting to reconnect WebSocket...");
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    setSocket(ws);

    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthenticated]);

  // Send a message through the WebSocket
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket not connected");
    }
  };

  // Ping to keep the connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [connected]);

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        notifications,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
