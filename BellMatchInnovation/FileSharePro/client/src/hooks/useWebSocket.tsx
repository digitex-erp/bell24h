import { useState, useEffect, useCallback, useRef } from "react";
import { WebSocketMessage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { parseWebSocketMessage } from "@/lib/utils";

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Start connection
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    
    if (!userId) {
      console.error("No user ID available for WebSocket connection");
      return;
    }

    const connect = () => {
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        
        // Send authentication message
        socket.send(JSON.stringify({
          type: "auth",
          userId: parseInt(userId)
        }));
      };

      socket.onmessage = (event) => {
        const message = parseWebSocketMessage(event.data);
        
        if (message) {
          console.log("WebSocket message received:", message);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case "new-message":
              toast({
                title: "New Message",
                description: "You have received a new message",
              });
              break;
            case "new-quote":
              toast({
                title: "New Quote",
                description: `A new quote has been submitted for your RFQ: ${message.data?.rfqTitle || "Unknown RFQ"}`,
              });
              break;
            case "quote-updated":
              toast({
                title: "Quote Updated",
                description: `A quote has been updated for your RFQ: ${message.data?.rfqTitle || "Unknown RFQ"}`,
              });
              break;
          }
        }
      };

      socket.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setConnected(false);
        
        // Reconnect with delay to avoid rapid reconnection attempts
        setTimeout(() => {
          if (socketRef.current?.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 3000);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [toast]);

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return { connected, lastMessage, sendMessage };
}
