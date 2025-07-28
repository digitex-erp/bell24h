// src/websocket/message-handler.ts
import type { WebSocket } from 'ws';

let clients: WebSocket[] = [];

export function registerClient(ws: WebSocket) {
  clients.push(ws);
}

export function unregisterClient(ws: WebSocket) {
  clients = clients.filter(client => client !== ws);
}

export function broadcastMessage(message: any) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}
