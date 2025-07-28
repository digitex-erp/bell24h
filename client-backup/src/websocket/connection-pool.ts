/**
 * WebSocket Connection Pool Implementation
 * 
 * This module provides optimized connection pooling for the Bell24H WebSocket server
 * to handle high concurrency, especially for real-time shipment tracking.
 */

import WebSocket from 'ws';
import { logInfo, logWarning, logError } from './logger';

// Connection pool interface
export interface ConnectionPool {
  add(connection: WebSocket, metadata: ConnectionMetadata): void;
  remove(connectionId: string): void;
  get(connectionId: string): PooledConnection | undefined;
  getByUserId(userId: number): PooledConnection[];
  getByShipmentId(shipmentId: number): PooledConnection[];
  getByCategory(category: string): PooledConnection[];
  getByRole(role: string): PooledConnection[];
  broadcast(message: any, filter?: (conn: PooledConnection) => boolean): void;
  size(): number;
  stats(): PoolStats;
}

// Connection metadata
export interface ConnectionMetadata {
  id: string;
  userId?: number;
  username?: string;
  role?: string;
  subscribedShipments?: number[];
  subscribedCategories?: string[];
  ipAddress?: string;
  userAgent?: string;
  lastActivity: Date;
  connectionType: 'user' | 'system' | 'monitoring';
}

// Pooled connection
export interface PooledConnection {
  id: string;
  ws: WebSocket;
  metadata: ConnectionMetadata;
  isActive: boolean;
  lastPing: Date;
  messagesSent: number;
  messagesReceived: number;
  bytesReceived: number;
  bytesSent: number;
  errors: number;
}

// Pool statistics
export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  inactiveConnections: number;
  connectionsByRole: Record<string, number>;
  connectionsByType: Record<string, number>;
  trafficStats: {
    totalMessagesSent: number;
    totalMessagesReceived: number;
    totalBytesSent: number;
    totalBytesReceived: number;
  };
  shipmentSubscriptions: {
    totalSubscribedShipments: number;
    topShipments: Array<{shipmentId: number, subscribers: number}>;
  };
}

/**
 * Optimized WebSocket Connection Pool
 * 
 * Features:
 * - Efficient connection management
 * - Connection metadata tracking
 * - Subscription-based messaging
 * - Connection health monitoring
 * - Performance statistics
 * - Automatic cleanup of dead connections
 */
export class WebSocketConnectionPool implements ConnectionPool {
  private connections: Map<string, PooledConnection> = new Map();
  private userIdIndex: Map<number, Set<string>> = new Map();
  private shipmentIdIndex: Map<number, Set<string>> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private roleIndex: Map<string, Set<string>> = new Map();
  
  // Tracking metrics
  private totalMessagesSent: number = 0;
  private totalMessagesReceived: number = 0;
  private totalBytesSent: number = 0;
  private totalBytesReceived: number = 0;
  
  // Health check interval in ms (default: 30 seconds)
  private healthCheckInterval: number = 30000;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  
  constructor(options?: { healthCheckInterval?: number }) {
    if (options?.healthCheckInterval) {
      this.healthCheckInterval = options.healthCheckInterval;
    }
    
    // Start health check timer
    this.startHealthCheck();
    
    logInfo('WebSocket Connection Pool initialized', {
      healthCheckInterval: this.healthCheckInterval
    });
  }
  
  /**
   * Add a new connection to the pool
   */
  public add(ws: WebSocket, metadata: ConnectionMetadata): void {
    const connection: PooledConnection = {
      id: metadata.id,
      ws,
      metadata,
      isActive: true,
      lastPing: new Date(),
      messagesSent: 0,
      messagesReceived: 0,
      bytesReceived: 0,
      bytesSent: 0,
      errors: 0
    };
    
    // Add to main connections map
    this.connections.set(metadata.id, connection);
    
    // Add to indices for fast lookup
    if (metadata.userId) {
      if (!this.userIdIndex.has(metadata.userId)) {
        this.userIdIndex.set(metadata.userId, new Set());
      }
      this.userIdIndex.get(metadata.userId)!.add(metadata.id);
    }
    
    if (metadata.role) {
      if (!this.roleIndex.has(metadata.role)) {
        this.roleIndex.set(metadata.role, new Set());
      }
      this.roleIndex.get(metadata.role)!.add(metadata.id);
    }
    
    if (metadata.subscribedCategories) {
      for (const category of metadata.subscribedCategories) {
        if (!this.categoryIndex.has(category)) {
          this.categoryIndex.set(category, new Set());
        }
        this.categoryIndex.get(category)!.add(metadata.id);
      }
    }
    
    if (metadata.subscribedShipments) {
      for (const shipmentId of metadata.subscribedShipments) {
        if (!this.shipmentIdIndex.has(shipmentId)) {
          this.shipmentIdIndex.set(shipmentId, new Set());
        }
        this.shipmentIdIndex.get(shipmentId)!.add(metadata.id);
      }
    }
    
    // Set up ping handler for connection health monitoring
    ws.on('pong', () => {
      const conn = this.connections.get(metadata.id);
      if (conn) {
        conn.lastPing = new Date();
        conn.isActive = true;
      }
    });
    
    // Set up message handler
    ws.on('message', (message: WebSocket.Data) => {
      const conn = this.connections.get(metadata.id);
      if (conn) {
        conn.messagesReceived++;
        conn.bytesReceived += message.toString().length;
        conn.lastPing = new Date(); // Update activity timestamp
        this.totalMessagesReceived++;
        this.totalBytesReceived += message.toString().length;
      }
    });
    
    // Set up error handler
    ws.on('error', (err) => {
      const conn = this.connections.get(metadata.id);
      if (conn) {
        conn.errors++;
        logError(`WebSocket error for connection ${metadata.id}`, err);
      }
    });
    
    // Set up close handler
    ws.on('close', () => {
      this.remove(metadata.id);
    });
    
    logInfo(`Connection ${metadata.id} added to pool`, {
      userId: metadata.userId,
      role: metadata.role,
      shipments: metadata.subscribedShipments?.length || 0
    });
  }
  
  /**
   * Remove a connection from the pool
   */
  public remove(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }
    
    // Remove from indices
    if (connection.metadata.userId) {
      const userConnections = this.userIdIndex.get(connection.metadata.userId);
      if (userConnections) {
        userConnections.delete(connectionId);
        if (userConnections.size === 0) {
          this.userIdIndex.delete(connection.metadata.userId);
        }
      }
    }
    
    if (connection.metadata.role) {
      const roleConnections = this.roleIndex.get(connection.metadata.role);
      if (roleConnections) {
        roleConnections.delete(connectionId);
        if (roleConnections.size === 0) {
          this.roleIndex.delete(connection.metadata.role);
        }
      }
    }
    
    if (connection.metadata.subscribedCategories) {
      for (const category of connection.metadata.subscribedCategories) {
        const categoryConnections = this.categoryIndex.get(category);
        if (categoryConnections) {
          categoryConnections.delete(connectionId);
          if (categoryConnections.size === 0) {
            this.categoryIndex.delete(category);
          }
        }
      }
    }
    
    if (connection.metadata.subscribedShipments) {
      for (const shipmentId of connection.metadata.subscribedShipments) {
        const shipmentConnections = this.shipmentIdIndex.get(shipmentId);
        if (shipmentConnections) {
          shipmentConnections.delete(connectionId);
          if (shipmentConnections.size === 0) {
            this.shipmentIdIndex.delete(shipmentId);
          }
        }
      }
    }
    
    // Remove from main connections map
    this.connections.delete(connectionId);
    
    logInfo(`Connection ${connectionId} removed from pool`);
  }
  
  /**
   * Get a connection by ID
   */
  public get(connectionId: string): PooledConnection | undefined {
    return this.connections.get(connectionId);
  }
  
  /**
   * Get connections by user ID
   */
  public getByUserId(userId: number): PooledConnection[] {
    const connectionIds = this.userIdIndex.get(userId);
    if (!connectionIds) {
      return [];
    }
    
    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is PooledConnection => conn !== undefined);
  }
  
  /**
   * Get connections by shipment ID
   */
  public getByShipmentId(shipmentId: number): PooledConnection[] {
    const connectionIds = this.shipmentIdIndex.get(shipmentId);
    if (!connectionIds) {
      return [];
    }
    
    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is PooledConnection => conn !== undefined);
  }
  
  /**
   * Get connections by category
   */
  public getByCategory(category: string): PooledConnection[] {
    const connectionIds = this.categoryIndex.get(category);
    if (!connectionIds) {
      return [];
    }
    
    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is PooledConnection => conn !== undefined);
  }
  
  /**
   * Get connections by role
   */
  public getByRole(role: string): PooledConnection[] {
    const connectionIds = this.roleIndex.get(role);
    if (!connectionIds) {
      return [];
    }
    
    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is PooledConnection => conn !== undefined);
  }
  
  /**
   * Broadcast a message to connections (with optional filter)
   */
  public broadcast(message: any, filter?: (conn: PooledConnection) => boolean): void {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    const messageSize = payload.length;
    let sentCount = 0;
    
    for (const connection of this.connections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN && 
          (!filter || filter(connection))) {
        try {
          connection.ws.send(payload);
          connection.messagesSent++;
          connection.bytesSent += messageSize;
          sentCount++;
        } catch (error) {
          connection.errors++;
          logError(`Error sending message to connection ${connection.id}`, error);
        }
      }
    }
    
    this.totalMessagesSent += sentCount;
    this.totalBytesSent += sentCount * messageSize;
    
    if (sentCount > 0) {
      logInfo(`Broadcast message sent to ${sentCount} connections`);
    }
  }
  
  /**
   * Subscribe a connection to a shipment
   */
  public subscribeToShipment(connectionId: string, shipmentId: number): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }
    
    // Add to shipment index
    if (!this.shipmentIdIndex.has(shipmentId)) {
      this.shipmentIdIndex.set(shipmentId, new Set());
    }
    this.shipmentIdIndex.get(shipmentId)!.add(connectionId);
    
    // Update connection metadata
    if (!connection.metadata.subscribedShipments) {
      connection.metadata.subscribedShipments = [];
    }
    if (!connection.metadata.subscribedShipments.includes(shipmentId)) {
      connection.metadata.subscribedShipments.push(shipmentId);
    }
    
    logInfo(`Connection ${connectionId} subscribed to shipment ${shipmentId}`);
    return true;
  }
  
  /**
   * Unsubscribe a connection from a shipment
   */
  public unsubscribeFromShipment(connectionId: string, shipmentId: number): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }
    
    // Remove from shipment index
    const shipmentConnections = this.shipmentIdIndex.get(shipmentId);
    if (shipmentConnections) {
      shipmentConnections.delete(connectionId);
      if (shipmentConnections.size === 0) {
        this.shipmentIdIndex.delete(shipmentId);
      }
    }
    
    // Update connection metadata
    if (connection.metadata.subscribedShipments) {
      connection.metadata.subscribedShipments = connection.metadata.subscribedShipments.filter(
        id => id !== shipmentId
      );
    }
    
    logInfo(`Connection ${connectionId} unsubscribed from shipment ${shipmentId}`);
    return true;
  }
  
  /**
   * Get total number of connections
   */
  public size(): number {
    return this.connections.size;
  }
  
  /**
   * Get pool statistics
   */
  public stats(): PoolStats {
    // Count active and inactive connections
    let activeConnections = 0;
    let inactiveConnections = 0;
    
    for (const conn of this.connections.values()) {
      if (conn.isActive) {
        activeConnections++;
      } else {
        inactiveConnections++;
      }
    }
    
    // Count connections by role
    const connectionsByRole: Record<string, number> = {};
    for (const [role, connectionIds] of this.roleIndex.entries()) {
      connectionsByRole[role] = connectionIds.size;
    }
    
    // Count connections by type
    const connectionsByType: Record<string, number> = {
      user: 0,
      system: 0,
      monitoring: 0
    };
    
    for (const conn of this.connections.values()) {
      connectionsByType[conn.metadata.connectionType]++;
    }
    
    // Get shipment subscription stats
    const shipmentSubscriptions = Array.from(this.shipmentIdIndex.entries())
      .map(([shipmentId, subscribers]) => ({
        shipmentId,
        subscribers: subscribers.size
      }))
      .sort((a, b) => b.subscribers - a.subscribers);
    
    return {
      totalConnections: this.connections.size,
      activeConnections,
      inactiveConnections,
      connectionsByRole,
      connectionsByType,
      trafficStats: {
        totalMessagesSent: this.totalMessagesSent,
        totalMessagesReceived: this.totalMessagesReceived,
        totalBytesSent: this.totalBytesSent,
        totalBytesReceived: this.totalBytesReceived
      },
      shipmentSubscriptions: {
        totalSubscribedShipments: this.shipmentIdIndex.size,
        topShipments: shipmentSubscriptions.slice(0, 10)
      }
    };
  }
  
  /**
   * Perform health check on all connections
   */
  private performHealthCheck(): void {
    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - (2 * this.healthCheckInterval));
    
    let checkedCount = 0;
    let pingCount = 0;
    let terminatedCount = 0;
    
    for (const [connectionId, connection] of this.connections.entries()) {
      checkedCount++;
      
      // Check if connection is inactive
      if (connection.lastPing < inactiveThreshold) {
        // Connection hasn't responded to pings, terminate it
        try {
          connection.ws.terminate();
          terminatedCount++;
          this.remove(connectionId);
        } catch (error) {
          // Ignore errors when terminating already closed connections
        }
      } else if (!connection.isActive) {
        // Send ping to check if connection is still alive
        try {
          connection.ws.ping();
          pingCount++;
        } catch (error) {
          // If ping fails, remove the connection
          this.remove(connectionId);
          terminatedCount++;
        }
      }
    }
    
    if (checkedCount > 0) {
      logInfo(`Health check completed: ${checkedCount} checked, ${pingCount} pinged, ${terminatedCount} terminated`);
    }
  }
  
  /**
   * Start health check timer
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);
    
    logInfo(`Health check timer started (interval: ${this.healthCheckInterval}ms)`);
  }
  
  /**
   * Stop health check timer
   */
  public stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      logInfo('Health check timer stopped');
    }
  }
  
  /**
   * Gracefully shutdown the connection pool
   */
  public shutdown(): void {
    this.stopHealthCheck();
    
    // Close all connections
    for (const connection of this.connections.values()) {
      try {
        connection.ws.close(1000, 'Server shutting down');
      } catch (error) {
        // Ignore errors when closing connections
      }
    }
    
    // Clear all connections and indices
    this.connections.clear();
    this.userIdIndex.clear();
    this.shipmentIdIndex.clear();
    this.categoryIndex.clear();
    this.roleIndex.clear();
    
    logInfo('Connection pool shutdown completed');
  }
}

// Export a singleton instance
export const connectionPool = new WebSocketConnectionPool();

// Export helper function to get the singleton instance
export function getConnectionPool(): ConnectionPool {
  return connectionPool;
}
