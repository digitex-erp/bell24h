"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Use port 5000 explicitly for WebSocket server
      const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setMessages(prev => [...prev, 'Connected to Bell24h WebSocket server']);
        
        // Send a test message
        ws.send(JSON.stringify({
          type: 'hello',
          data: 'Connecting from frontend client'
        }));
      };
      
      ws.onmessage = (event) => {
        console.log('Message received:', event.data);
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, `Received: ${JSON.stringify(data)}`]);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setMessages(prev => [...prev, 'Disconnected from server']);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setMessages(prev => [...prev, `Error: ${error.message}`]);
      };
      
      setSocket(ws);
      
      // Clean up function
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    };
    
    connectWebSocket();
  }, []);
  
  const sendTestMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };
      socket.send(JSON.stringify(message));
      setMessages(prev => [...prev, `Sent: ${JSON.stringify(message)}`]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Bell24h WebSocket Demo</h1>
        
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
          
          <button 
            onClick={sendTestMessage}
            disabled={!isConnected}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Send Test Message
          </button>
        </div>
        
        <div className="border rounded p-4 bg-gray-50 h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-2">Message Log</h2>
          <div className="space-y-1">
            {messages.map((msg, index) => (
              <div key={index} className="p-2 border-b text-sm font-mono">
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
