import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

// WebSocket client type
interface ExtendedWebSocket extends WebSocket {
  id: string;
}

/**
 * Set up WebSocket server for real-time communication
 * @param httpServer The HTTP server to attach the WebSocket server to
 */
export function setupWebSocketServer(httpServer: Server) {
  // Create WebSocket server attached to HTTP server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track connected clients
  const clients = new Map<string, ExtendedWebSocket>();
  
  // Handle new WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    const extendedWs = ws as ExtendedWebSocket;
    extendedWs.id = uuidv4();
    clients.set(extendedWs.id, extendedWs);
    
    console.log(`[WebSocket] Client connected: ${extendedWs.id}`);
    
    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        handleMessage(extendedWs, data);
      } catch (error) {
        console.error('[WebSocket] Invalid message format:', error);
        sendError(extendedWs, 'Invalid message format');
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected: ${extendedWs.id}`);
      clients.delete(extendedWs.id);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocket] Error for client ${extendedWs.id}:`, error);
      clients.delete(extendedWs.id);
    });
    
    // Send welcome message
    sendToClient(extendedWs, 'connection_established', {
      message: 'Connected to Bell24h Procurement Assistant',
      clientId: extendedWs.id
    });
  });
  
  /**
   * Handle incoming WebSocket messages
   * @param ws WebSocket connection
   * @param data Message data
   */
  function handleMessage(ws: ExtendedWebSocket, data: any) {
    const { type, data: messageData } = data;
    
    switch (type) {
      case 'voice_command':
        handleVoiceCommand(ws, messageData);
        break;
      case 'ping':
        sendToClient(ws, 'pong', { timestamp: new Date().toISOString() });
        break;
      default:
        console.warn(`[WebSocket] Unknown message type: ${type}`);
        sendError(ws, `Unknown message type: ${type}`);
    }
  }
  
  /**
   * Handle voice commands
   * @param ws WebSocket connection
   * @param data Voice command data
   */
  function handleVoiceCommand(ws: ExtendedWebSocket, data: any) {
    const { command, confidence } = data;
    
    console.log(`[WebSocket] Voice command received: "${command}" (confidence: ${confidence})`);
    
    // Process the command - this would typically involve NLP/AI processing
    // For now, we'll use simple keyword matching
    
    let response = '';
    
    if (command.includes('rfq') || command.includes('request')) {
      if (command.includes('create') || command.includes('new')) {
        response = "I'll help you create a new RFQ. What category would you like to create it for?";
      } else if (command.includes('list') || command.includes('show')) {
        response = "Here are your recent RFQs. You have 5 active requests and 2 drafts.";
      } else {
        response = "I can help you with RFQs. Would you like to create a new one or view existing ones?";
      }
    } else if (command.includes('supplier') || command.includes('vendor') || command.includes('manufacturer')) {
      if (command.includes('find') || command.includes('search')) {
        response = "I'll help you find suppliers. What product or service are you looking for?";
      } else if (command.includes('recommend') || command.includes('suggestion')) {
        response = "Based on your requirements, I recommend these top 3 suppliers with high reliability scores.";
      } else {
        response = "I can help you with supplier management. Would you like to find new suppliers or view recommendations?";
      }
    } else if (command.includes('analytics') || command.includes('report') || command.includes('dashboard')) {
      response = "Opening the analytics dashboard. You've achieved 12% cost savings this quarter compared to last.";
    } else if (command.includes('help') || command.includes('command') || command.includes('what can you do')) {
      response = "I can help you create RFQs, find suppliers, compare quotes, check analytics, and much more. Just tell me what you'd like to do.";
    } else {
      response = "I'm not sure what you're asking for. Try asking about RFQs, suppliers, analytics, or say 'help' for assistance.";
    }
    
    // Send response back to client
    sendToClient(ws, 'voice_command_response', {
      originalCommand: command,
      response,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Send a message to a specific client
   * @param ws WebSocket connection
   * @param type Message type
   * @param data Message data
   */
  function sendToClient(ws: ExtendedWebSocket, type: string, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  /**
   * Send an error message to a client
   * @param ws WebSocket connection
   * @param message Error message
   */
  function sendError(ws: ExtendedWebSocket, message: string) {
    sendToClient(ws, 'error', { message });
  }
  
  /**
   * Broadcast a message to all connected clients
   * @param type Message type
   * @param data Message data
   * @param excludeId Optional client ID to exclude
   */
  function broadcast(type: string, data: any, excludeId?: string) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && (!excludeId || client.id !== excludeId)) {
        sendToClient(client, type, data);
      }
    });
  }
  
  // Return WebSocket utilities for use outside this module
  return {
    broadcast,
    getConnectedClients: () => clients.size
  };
}