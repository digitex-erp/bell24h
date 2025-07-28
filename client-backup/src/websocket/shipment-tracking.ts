/**
 * Real-time Shipment Tracking WebSocket Service
 * 
 * This module provides real-time shipment tracking functionality via WebSockets,
 * supporting high-concurrency environments with optimized connection handling.
 */

import { connectionPool, ConnectionMetadata } from './connection-pool.js';
import { logInfo, logError, logWarning } from './logger.js';
import WebSocket from 'ws';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import { shipments, shipmentUpdates } from '../lib/db/schema/logistics.js';
import { eq, desc, and } from 'drizzle-orm';

// Maximum number of updates to keep in memory per shipment
const MAX_CACHED_UPDATES = 20;

// Cache for shipment updates
interface ShipmentUpdateCache {
  shipmentId: number;
  updates: Array<{
    id: number;
    status: string;
    description: string;
    timestamp: string;
    location?: string;
  }>;
  lastUpdated: Date;
}

// In-memory cache of recent shipment updates for quick access
const shipmentUpdatesCache = new Map<number, ShipmentUpdateCache>();

// Message types
export enum MessageType {
  SUBSCRIBE_SHIPMENT = 'subscribe_shipment',
  UNSUBSCRIBE_SHIPMENT = 'unsubscribe_shipment',
  SHIPMENT_UPDATE = 'shipment_update',
  SHIPMENT_STATUS_CHANGE = 'shipment_status_change',
  SHIPMENT_LOCATION_UPDATE = 'shipment_location_update',
  BATCH_UPDATE = 'batch_update',
  ERROR = 'error',
  ACK = 'ack'
}

// Message interfaces
export interface ShipmentTrackingMessage {
  type: MessageType;
  timestamp: string;
  messageId: string;
}

export interface SubscribeShipmentMessage extends ShipmentTrackingMessage {
  type: MessageType.SUBSCRIBE_SHIPMENT;
  shipmentId: number;
}

export interface UnsubscribeShipmentMessage extends ShipmentTrackingMessage {
  type: MessageType.UNSUBSCRIBE_SHIPMENT;
  shipmentId: number;
}

export interface ShipmentUpdateMessage extends ShipmentTrackingMessage {
  type: MessageType.SHIPMENT_UPDATE;
  shipmentId: number;
  update: {
    id: number;
    status: string;
    description: string;
    timestamp: string;
    location?: string;
  };
}

export interface ShipmentStatusChangeMessage extends ShipmentTrackingMessage {
  type: MessageType.SHIPMENT_STATUS_CHANGE;
  shipmentId: number;
  previousStatus: string;
  newStatus: string;
  description: string;
}

export interface ShipmentLocationUpdateMessage extends ShipmentTrackingMessage {
  type: MessageType.SHIPMENT_LOCATION_UPDATE;
  shipmentId: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
}

export interface BatchUpdateMessage extends ShipmentTrackingMessage {
  type: MessageType.BATCH_UPDATE;
  updates: Array<ShipmentUpdateMessage | ShipmentStatusChangeMessage | ShipmentLocationUpdateMessage>;
}

export interface ErrorMessage extends ShipmentTrackingMessage {
  type: MessageType.ERROR;
  error: string;
  code: number;
  originalMessageId?: string;
}

export interface AckMessage extends ShipmentTrackingMessage {
  type: MessageType.ACK;
  originalMessageId: string;
}

/**
 * Handle a new WebSocket connection for shipment tracking
 */
export async function handleShipmentTrackingConnection(
  ws: WebSocket,
  request: any,
  token?: string
): Promise<void> {
  try {
    // Validate token if provided
    let userId: number | undefined;
    let username: string | undefined;
    let role: string | undefined;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
        username = decoded.username;
        role = decoded.role;
      } catch (error) {
        logWarning(`Invalid token provided for shipment tracking connection: ${error}`);
        ws.send(JSON.stringify({
          type: MessageType.ERROR,
          timestamp: new Date().toISOString(),
          messageId: randomUUID(),
          error: 'Invalid authentication token',
          code: 401
        }));
        ws.close(1008, 'Invalid authentication token');
        return;
      }
    }

    // Create connection metadata
    const connectionId = randomUUID();
    const metadata: ConnectionMetadata = {
      id: connectionId,
      userId,
      username,
      role,
      subscribedShipments: [],
      subscribedCategories: ['shipment_tracking'],
      ipAddress: request.socket.remoteAddress,
      userAgent: request.headers['user-agent'],
      lastActivity: new Date(),
      connectionType: 'user'
    };

    // Add connection to pool
    connectionPool.add(ws, metadata);

    // Send welcome message
    ws.send(JSON.stringify({
      type: MessageType.ACK,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      message: 'Connected to shipment tracking service',
      connectionId
    }));

    // Set up message handler
    ws.on('message', async (message: WebSocket.Data) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        await handleShipmentTrackingMessage(parsedMessage, connectionId, ws);
      } catch (error) {
        logError('Error handling shipment tracking message', error);
        ws.send(JSON.stringify({
          type: MessageType.ERROR,
          timestamp: new Date().toISOString(),
          messageId: randomUUID(),
          error: 'Invalid message format',
          code: 400
        }));
      }
    });

    logInfo(`Shipment tracking connection established for ${connectionId}`, {
      userId,
      username,
      role
    });
  } catch (error) {
    logError('Error handling new shipment tracking connection', error);
    ws.close(1011, 'Internal server error');
  }
}

/**
 * Handle incoming shipment tracking messages
 */
async function handleShipmentTrackingMessage(
  message: any,
  connectionId: string,
  ws: WebSocket
): Promise<void> {
  // Get connection from pool
  const connection = connectionPool.get(connectionId);
  if (!connection) {
    logError(`Connection ${connectionId} not found in pool`);
    return;
  }

  // Update last activity timestamp
  connection.metadata.lastActivity = new Date();

  // Process message based on type
  switch (message.type) {
    case MessageType.SUBSCRIBE_SHIPMENT:
      await handleSubscribeShipment(message, connectionId, ws);
      break;

    case MessageType.UNSUBSCRIBE_SHIPMENT:
      await handleUnsubscribeShipment(message, connectionId, ws);
      break;

    default:
      // Send error for unknown message type
      ws.send(JSON.stringify({
        type: MessageType.ERROR,
        timestamp: new Date().toISOString(),
        messageId: randomUUID(),
        error: `Unknown message type: ${message.type}`,
        code: 400,
        originalMessageId: message.messageId
      }));
      break;
  }
}

/**
 * Handle subscribe to shipment message
 */
async function handleSubscribeShipment(
  message: SubscribeShipmentMessage,
  connectionId: string,
  ws: WebSocket
): Promise<void> {
  try {
    const { shipmentId } = message;

    // Validate shipment exists
    const shipmentExists = await validateShipment(shipmentId);
    if (!shipmentExists) {
      ws.send(JSON.stringify({
        type: MessageType.ERROR,
        timestamp: new Date().toISOString(),
        messageId: randomUUID(),
        error: `Shipment ${shipmentId} not found`,
        code: 404,
        originalMessageId: message.messageId
      }));
      return;
    }

    // Subscribe connection to shipment
    connectionPool.subscribeToShipment(connectionId, shipmentId);

    // Send acknowledgment
    ws.send(JSON.stringify({
      type: MessageType.ACK,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      originalMessageId: message.messageId
    }));

    // Send recent updates for this shipment
    const recentUpdates = await getRecentShipmentUpdates(shipmentId);
    if (recentUpdates.length > 0) {
      ws.send(JSON.stringify({
        type: MessageType.BATCH_UPDATE,
        timestamp: new Date().toISOString(),
        messageId: randomUUID(),
        updates: recentUpdates.map(update => ({
          type: MessageType.SHIPMENT_UPDATE,
          timestamp: new Date().toISOString(),
          messageId: randomUUID(),
          shipmentId,
          update: {
            id: update.id,
            status: update.status,
            description: update.description,
            timestamp: update.timestamp,
            location: update.location
          }
        }))
      }));
    }

    logInfo(`Connection ${connectionId} subscribed to shipment ${shipmentId}`);
  } catch (error) {
    logError(`Error handling subscribe to shipment ${message.shipmentId}`, error);
    ws.send(JSON.stringify({
      type: MessageType.ERROR,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      error: 'Internal server error',
      code: 500,
      originalMessageId: message.messageId
    }));
  }
}

/**
 * Handle unsubscribe from shipment message
 */
async function handleUnsubscribeShipment(
  message: UnsubscribeShipmentMessage,
  connectionId: string,
  ws: WebSocket
): Promise<void> {
  try {
    const { shipmentId } = message;

    // Unsubscribe connection from shipment
    connectionPool.unsubscribeFromShipment(connectionId, shipmentId);

    // Send acknowledgment
    ws.send(JSON.stringify({
      type: MessageType.ACK,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      originalMessageId: message.messageId
    }));

    logInfo(`Connection ${connectionId} unsubscribed from shipment ${shipmentId}`);
  } catch (error) {
    logError(`Error handling unsubscribe from shipment ${message.shipmentId}`, error);
    ws.send(JSON.stringify({
      type: MessageType.ERROR,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      error: 'Internal server error',
      code: 500,
      originalMessageId: message.messageId
    }));
  }
}

/**
 * Validate that a shipment exists
 */
async function validateShipment(shipmentId: number): Promise<boolean> {
  try {
    const results = await db.select({ id: shipments.id })
      .from(shipments)
      .where(eq(shipments.id, shipmentId))
      .limit(1);

    return results.length > 0;
  } catch (error) {
    logError(`Error validating shipment ${shipmentId}`, error);
    return false;
  }
}

/**
 * Get recent updates for a shipment
 */
async function getRecentShipmentUpdates(shipmentId: number): Promise<any[]> {
  try {
    // Check cache first
    if (shipmentUpdatesCache.has(shipmentId)) {
      const cache = shipmentUpdatesCache.get(shipmentId)!;
      
      // If cache is fresh (less than 1 minute old), use it
      if (new Date().getTime() - cache.lastUpdated.getTime() < 60000) {
        return cache.updates;
      }
    }

    // Otherwise, fetch from database
    const updates = await db.select({
      id: shipmentUpdates.id,
      status: shipmentUpdates.status,
      description: shipmentUpdates.details, // Using details field instead of description
      timestamp: shipmentUpdates.createdAt, // Using createdAt field instead of timestamp
      location: shipmentUpdates.locationData // Using locationData instead of location
    })
      .from(shipmentUpdates)
      .where(eq(shipmentUpdates.shipmentId, shipmentId))
      .orderBy(desc(shipmentUpdates.createdAt)) // Order by createdAt instead of timestamp
      .limit(MAX_CACHED_UPDATES);

    // Update cache
    shipmentUpdatesCache.set(shipmentId, {
      shipmentId,
      updates,
      lastUpdated: new Date()
    });

    return updates;
  } catch (error) {
    logError(`Error fetching recent updates for shipment ${shipmentId}`, error);
    return [];
  }
}

/**
 * Broadcast a shipment update to subscribers
 */
export async function broadcastShipmentUpdate(
  shipmentId: number,
  updateData: {
    id: number;
    status: string;
    description: string;
    timestamp: string;
    location?: string;
  }
): Promise<void> {
  try {
    const connections = connectionPool.getByShipmentId(shipmentId);
    
    if (connections.length === 0) {
      // No subscribers, no need to broadcast
      return;
    }

    // Create update message
    const updateMessage: ShipmentUpdateMessage = {
      type: MessageType.SHIPMENT_UPDATE,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      shipmentId,
      update: updateData
    };

    // Broadcast to all subscribers
    for (const connection of connections) {
      try {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify(updateMessage));
          connection.messagesSent++;
          connection.bytesSent += JSON.stringify(updateMessage).length;
        }
      } catch (error) {
        logError(`Error sending update to connection ${connection.id}`, error);
      }
    }

    // Update cache
    if (shipmentUpdatesCache.has(shipmentId)) {
      const cache = shipmentUpdatesCache.get(shipmentId)!;
      cache.updates.unshift(updateData);
      if (cache.updates.length > MAX_CACHED_UPDATES) {
        cache.updates.pop();
      }
      cache.lastUpdated = new Date();
    }

    logInfo(`Broadcast shipment update for shipment ${shipmentId} to ${connections.length} connections`);
  } catch (error) {
    logError(`Error broadcasting shipment update for shipment ${shipmentId}`, error);
  }
}

/**
 * Broadcast a shipment status change to subscribers
 */
export async function broadcastShipmentStatusChange(
  shipmentId: number,
  previousStatus: string,
  newStatus: string,
  description: string
): Promise<void> {
  try {
    const connections = connectionPool.getByShipmentId(shipmentId);
    
    if (connections.length === 0) {
      // No subscribers, no need to broadcast
      return;
    }

    // Create status change message
    const statusChangeMessage: ShipmentStatusChangeMessage = {
      type: MessageType.SHIPMENT_STATUS_CHANGE,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      shipmentId,
      previousStatus,
      newStatus,
      description
    };

    // Broadcast to all subscribers
    for (const connection of connections) {
      try {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify(statusChangeMessage));
          connection.messagesSent++;
          connection.bytesSent += JSON.stringify(statusChangeMessage).length;
        }
      } catch (error) {
        logError(`Error sending status change to connection ${connection.id}`, error);
      }
    }

    logInfo(`Broadcast shipment status change for shipment ${shipmentId} to ${connections.length} connections`);
  } catch (error) {
    logError(`Error broadcasting shipment status change for shipment ${shipmentId}`, error);
  }
}

/**
 * Broadcast a shipment location update to subscribers
 */
export async function broadcastShipmentLocationUpdate(
  shipmentId: number,
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  }
): Promise<void> {
  try {
    const connections = connectionPool.getByShipmentId(shipmentId);
    
    if (connections.length === 0) {
      // No subscribers, no need to broadcast
      return;
    }

    // Create location update message
    const locationUpdateMessage: ShipmentLocationUpdateMessage = {
      type: MessageType.SHIPMENT_LOCATION_UPDATE,
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
      shipmentId,
      location
    };

    // Broadcast to all subscribers
    for (const connection of connections) {
      try {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify(locationUpdateMessage));
          connection.messagesSent++;
          connection.bytesSent += JSON.stringify(locationUpdateMessage).length;
        }
      } catch (error) {
        logError(`Error sending location update to connection ${connection.id}`, error);
      }
    }

    logInfo(`Broadcast shipment location update for shipment ${shipmentId} to ${connections.length} connections`);
  } catch (error) {
    logError(`Error broadcasting shipment location update for shipment ${shipmentId}`, error);
  }
}

/**
 * Send batch update for multiple shipments
 * More efficient than sending individual updates
 */
export async function sendBatchUpdates(
  updates: Array<{
    type: MessageType.SHIPMENT_UPDATE | MessageType.SHIPMENT_STATUS_CHANGE | MessageType.SHIPMENT_LOCATION_UPDATE;
    shipmentId: number;
    data: any;
  }>
): Promise<void> {
  try {
    // Group updates by shipment ID
    const updatesByShipment = new Map<number, any[]>();
    
    for (const update of updates) {
      if (!updatesByShipment.has(update.shipmentId)) {
        updatesByShipment.set(update.shipmentId, []);
      }
      updatesByShipment.get(update.shipmentId)!.push(update);
    }

    // For each shipment, send batch update to subscribers
    for (const [shipmentId, shipmentUpdates] of updatesByShipment.entries()) {
      const connections = connectionPool.getByShipmentId(shipmentId);
      
      if (connections.length === 0) {
        continue;
      }

      // Create batch update message
      const batchUpdateMessage: BatchUpdateMessage = {
        type: MessageType.BATCH_UPDATE,
        timestamp: new Date().toISOString(),
        messageId: randomUUID(),
        updates: shipmentUpdates.map(update => {
          switch (update.type) {
            case MessageType.SHIPMENT_UPDATE:
              return {
                type: MessageType.SHIPMENT_UPDATE,
                timestamp: new Date().toISOString(),
                messageId: randomUUID(),
                shipmentId,
                update: update.data
              } as ShipmentUpdateMessage;
            
            case MessageType.SHIPMENT_STATUS_CHANGE:
              return {
                type: MessageType.SHIPMENT_STATUS_CHANGE,
                timestamp: new Date().toISOString(),
                messageId: randomUUID(),
                shipmentId,
                previousStatus: update.data.previousStatus,
                newStatus: update.data.newStatus,
                description: update.data.description
              } as ShipmentStatusChangeMessage;
            
            case MessageType.SHIPMENT_LOCATION_UPDATE:
              return {
                type: MessageType.SHIPMENT_LOCATION_UPDATE,
                timestamp: new Date().toISOString(),
                messageId: randomUUID(),
                shipmentId,
                location: update.data
              } as ShipmentLocationUpdateMessage;
            
            default:
              // This ensures we don't have undefined in our array
              return {
                type: MessageType.SHIPMENT_UPDATE,
                timestamp: new Date().toISOString(),
                messageId: randomUUID(),
                shipmentId,
                update: { id: 0, status: 'unknown', description: 'Unknown update type', timestamp: new Date().toISOString() }
              } as ShipmentUpdateMessage;
          }
        })
      };

      // Broadcast to all subscribers
      for (const connection of connections) {
        try {
          if (connection.ws.readyState === WebSocket.OPEN) {
            connection.ws.send(JSON.stringify(batchUpdateMessage));
            connection.messagesSent++;
            connection.bytesSent += JSON.stringify(batchUpdateMessage).length;
          }
        } catch (error) {
          logError(`Error sending batch update to connection ${connection.id}`, error);
        }
      }

      logInfo(`Sent batch update for shipment ${shipmentId} to ${connections.length} connections (${shipmentUpdates.length} updates)`);
    }
  } catch (error) {
    logError('Error sending batch updates', error);
  }
}

/**
 * Clear cache for inactive shipments periodically
 */
export function startCacheCleanupTimer(intervalMinutes: number = 15): NodeJS.Timeout {
  const cleanupInterval = intervalMinutes * 60 * 1000; // Convert to milliseconds

  const timer = setInterval(() => {
    try {
      const now = new Date().getTime();
      let cleanupCount = 0;

      // Check each shipment in cache
      for (const [shipmentId, cache] of shipmentUpdatesCache.entries()) {
        // If last updated more than 1 hour ago, remove from cache
        if (now - cache.lastUpdated.getTime() > 60 * 60 * 1000) {
          shipmentUpdatesCache.delete(shipmentId);
          cleanupCount++;
        }
      }

      if (cleanupCount > 0) {
        logInfo(`Cleaned up ${cleanupCount} inactive shipments from cache`);
      }
    } catch (error) {
      logError('Error during cache cleanup', error);
    }
  }, cleanupInterval);

  logInfo(`Started cache cleanup timer (interval: ${intervalMinutes} minutes)`);
  return timer;
}

// Start cache cleanup timer when module is loaded
const cacheCleanupTimer = startCacheCleanupTimer();

// Clean up when process exits
process.on('SIGINT', () => {
  clearInterval(cacheCleanupTimer);
});
