import React, { createContext, useContext, useEffect, useState } from "react";
import { createWebSocketConnection } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

interface WebSocketContextType {
  status: WebSocketStatus;
  sendMessage: (message: object) => void;
  lastMessage: any | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      // Don't establish WebSocket connection if not authenticated
      return;
    }

    const ws = createWebSocketConnection();
    setSocket(ws);
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("open");
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        // Handle notifications
        if (data.type === "notification") {
          toast({
            title: data.title || "New Notification",
            description: data.message,
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("closed");
      console.log("WebSocket connection closed");
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthenticated, toast]);

  const sendMessage = (message: object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket not connected");
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        status,
        sendMessage,
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
