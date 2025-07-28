/**
 * Bell24H Metrics Utilities
 * 
 * Provides metrics collection and reporting for monitoring WebSocket performance
 * and other application metrics. Supports Prometheus integration.
 */

import { register, Counter, Gauge, Histogram } from 'prom-client';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize Prometheus metrics
register.setDefaultLabels({
  app: 'bell24h-dashboard'
});

// Create metrics
const websocketConnections = new Gauge({
  name: 'bell24h_websocket_connections',
  help: 'Current number of active WebSocket connections',
  labelNames: ['status']
});

const websocketMessagesTotal = new Counter({
  name: 'bell24h_websocket_messages_total',
  help: 'Total number of WebSocket messages sent/received',
  labelNames: ['direction', 'type']
});

const websocketMessageBatches = new Counter({
  name: 'bell24h_websocket_message_batches',
  help: 'Total number of WebSocket message batches processed',
  labelNames: ['size_range']
});

const websocketLatency = new Histogram({
  name: 'bell24h_websocket_latency_ms',
  help: 'WebSocket message latency in milliseconds',
  labelNames: ['type'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
});

const websocketErrors = new Counter({
  name: 'bell24h_websocket_errors',
  help: 'WebSocket errors',
  labelNames: ['type']
});

const apiRequestsTotal = new Counter({
  name: 'bell24h_api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status']
});

const apiRequestDuration = new Histogram({
  name: 'bell24h_api_request_duration_ms',
  help: 'API request duration in milliseconds',
  labelNames: ['method', 'endpoint'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
});

const systemMetrics = new Gauge({
  name: 'bell24h_system_metrics',
  help: 'System metrics',
  labelNames: ['type']
});

// Update system metrics every minute
setInterval(() => {
  systemMetrics.set({ type: 'memory_usage_bytes' }, process.memoryUsage().heapUsed);
  systemMetrics.set({ type: 'memory_total_bytes' }, process.memoryUsage().heapTotal);
  systemMetrics.set({ type: 'cpu_usage_percent' }, os.loadavg()[0] * 100 / os.cpus().length);
  systemMetrics.set({ type: 'free_memory_bytes' }, os.freemem());
  systemMetrics.set({ type: 'total_memory_bytes' }, os.totalmem());
}, 60000);

/**
 * Metrics Service for Bell24H Dashboard
 */
export class MetricsService {
  private metricsPath: string;
  private saveInterval: NodeJS.Timeout | null = null;
  
  constructor(metricsPath: string = path.join(process.cwd(), 'metrics')) {
    this.metricsPath = metricsPath;
    this.ensureMetricsDirectory();
  }
  
  /**
   * Ensure metrics directory exists
   */
  private ensureMetricsDirectory(): void {
    if (!fs.existsSync(this.metricsPath)) {
      fs.mkdirSync(this.metricsPath, { recursive: true });
    }
  }
  
  /**
   * Start automatic metrics saving
   */
  public startAutomaticSaving(intervalMs: number = 300000): void {
    this.stopAutomaticSaving();
    
    this.saveInterval = setInterval(() => {
      this.saveMetricsSnapshot();
    }, intervalMs);
  }
  
  /**
   * Stop automatic metrics saving
   */
  public stopAutomaticSaving(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
  
  /**
   * Save current metrics to file
   */
  public async saveMetricsSnapshot(): Promise<string> {
    try {
      const metrics = await register.getMetricsAsJSON();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.metricsPath, `metrics-${timestamp}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));
      return filePath;
    } catch (error) {
      console.error('Error saving metrics snapshot:', error);
      throw error;
    }
  }
  
  /**
   * Get metrics in Prometheus format
   */
  public async getPrometheusMetrics(): Promise<string> {
    return register.metrics();
  }
  
  /**
   * Reset all metrics (for testing)
   */
  public resetMetrics(): void {
    register.resetMetrics();
  }
  
  // WebSocket metric methods
  
  /**
   * Track WebSocket connection
   */
  public trackWebSocketConnection(status: 'connected' | 'disconnected'): void {
    if (status === 'connected') {
      websocketConnections.inc({ status: 'active' });
    } else {
      websocketConnections.dec({ status: 'active' });
    }
  }
  
  /**
   * Track WebSocket message
   */
  public trackWebSocketMessage(direction: 'sent' | 'received', type: string): void {
    websocketMessagesTotal.inc({ direction, type });
  }
  
  /**
   * Track WebSocket message batch
   */
  public trackWebSocketBatch(batchSize: number): void {
    let sizeRange = '1-10';
    
    if (batchSize > 10 && batchSize <= 50) {
      sizeRange = '11-50';
    } else if (batchSize > 50 && batchSize <= 100) {
      sizeRange = '51-100';
    } else if (batchSize > 100) {
      sizeRange = '100+';
    }
    
    websocketMessageBatches.inc({ size_range: sizeRange });
  }
  
  /**
   * Track WebSocket latency
   */
  public trackWebSocketLatency(type: 'ping' | 'message' | 'batch', latencyMs: number): void {
    websocketLatency.observe({ type }, latencyMs);
  }
  
  /**
   * Track WebSocket error
   */
  public trackWebSocketError(type: 'connection' | 'message' | 'close'): void {
    websocketErrors.inc({ type });
  }
  
  // API metric methods
  
  /**
   * Track API request
   */
  public trackApiRequest(method: string, endpoint: string, statusCode: number): void {
    let status = 'success';
    
    if (statusCode >= 400 && statusCode < 500) {
      status = 'client_error';
    } else if (statusCode >= 500) {
      status = 'server_error';
    }
    
    apiRequestsTotal.inc({ method, endpoint, status });
  }
  
  /**
   * Track API request duration
   */
  public trackApiRequestDuration(method: string, endpoint: string, durationMs: number): void {
    apiRequestDuration.observe({ method, endpoint }, durationMs);
  }
  
  /**
   * Create a middleware to track API requests
   */
  public apiMetricsMiddleware() {
    return (req: any, res: any, next: () => void) => {
      const start = Date.now();
      
      // Add response finished listener
      res.on('finish', () => {
        const durationMs = Date.now() - start;
        const method = req.method;
        const endpoint = req.route ? req.route.path : req.path;
        
        this.trackApiRequest(method, endpoint, res.statusCode);
        this.trackApiRequestDuration(method, endpoint, durationMs);
      });
      
      next();
    };
  }
  
  /**
   * Get current WebSocket metrics
   */
  public async getWebSocketMetrics() {
    const metrics = await register.getMetricsAsJSON();
    
    return metrics.filter(metric => 
      metric.name.startsWith('bell24h_websocket_')
    );
  }
  
  /**
   * Get current API metrics
   */
  public async getApiMetrics() {
    const metrics = await register.getMetricsAsJSON();
    
    return metrics.filter(metric => 
      metric.name.startsWith('bell24h_api_')
    );
  }
  
  /**
   * Get current system metrics
   */
  public async getSystemMetrics() {
    const metrics = await register.getMetricsAsJSON();
    
    return metrics.filter(metric => 
      metric.name.startsWith('bell24h_system_')
    );
  }
}

// Export singleton instance
export default new MetricsService();
