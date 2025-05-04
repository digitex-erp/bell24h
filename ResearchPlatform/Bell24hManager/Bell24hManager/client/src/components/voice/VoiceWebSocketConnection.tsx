import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/use-websocket';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface VoiceWebSocketConnectionProps {
  onCommandResponse?: (response: string) => void;
}

/**
 * Component to display WebSocket connection status and handle voice responses
 */
export const VoiceWebSocketConnection: React.FC<VoiceWebSocketConnectionProps> = ({
  onCommandResponse
}) => {
  const [connecting, setConnecting] = useState(true);
  
  // Define message handlers
  const messageHandlers = {
    voice_command_response: (message: any) => {
      if (onCommandResponse && message.data && message.data.response) {
        onCommandResponse(message.data.response);
      }
    }
  };
  
  const { isConnected, error } = useWebSocket(messageHandlers);
  
  // Show connecting state briefly
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnecting(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (connecting) {
    return (
      <Badge variant="outline" className="bg-blue-50">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Connecting
      </Badge>
    );
  }
  
  if (error) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-600">
        <WifiOff className="h-3 w-3 mr-1" />
        Error
      </Badge>
    );
  }
  
  if (isConnected) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-600">
        <Wifi className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
      <WifiOff className="h-3 w-3 mr-1" />
      Disconnected
    </Badge>
  );
};