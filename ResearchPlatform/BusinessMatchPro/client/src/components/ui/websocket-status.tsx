import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface WebSocketStatusProps {
  className?: string;
}

export function WebSocketStatus({ className }: WebSocketStatusProps) {
  const { connected } = useWebSocket();
  
  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", className)}>
      {connected ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-500">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-400">Offline</span>
        </>
      )}
    </div>
  );
}