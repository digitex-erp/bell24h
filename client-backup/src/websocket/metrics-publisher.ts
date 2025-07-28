/**
 * WebSocket CloudWatch Metrics Publisher
 * 
 * This module publishes WebSocket metrics to AWS CloudWatch for monitoring and auto-scaling
 * of the WebSocket server based on connection load and performance metrics.
 */

import AWS from 'aws-sdk';
import { logInfo, logError } from './logger.js';
import { getConnectionStats } from './server.js';

// Constants
const NAMESPACE = 'Bell24H/WebSocket';
const DEFAULT_REGION = 'ap-south-1'; // Mumbai region
const DEFAULT_ENVIRONMENT = process.env.NODE_ENV || 'production';
const METRIC_RESOLUTION = 60; // seconds (1 minute)

// Initialize CloudWatch client
let cloudWatch: AWS.CloudWatch | null = null;

/**
 * Initialize the CloudWatch client
 */
export function initializeCloudWatch(options?: {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}): void {
  try {
    // Use provided options or environment variables
    const region = options?.region || process.env.AWS_REGION || DEFAULT_REGION;
    const accessKeyId = options?.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = options?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
    
    // Check for required credentials
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not provided. Cannot initialize CloudWatch metrics publisher.');
    }
    
    // Initialize AWS SDK
    AWS.config.update({
      region,
      accessKeyId,
      secretAccessKey
    });
    
    cloudWatch = new AWS.CloudWatch();
    
    logInfo('CloudWatch metrics publisher initialized', { region });
  } catch (error) {
    logError('Failed to initialize CloudWatch metrics publisher', error);
    cloudWatch = null;
  }
}

/**
 * Publish WebSocket metrics to CloudWatch
 */
export async function publishWebSocketMetrics(): Promise<boolean> {
  if (!cloudWatch) {
    logError('CloudWatch client not initialized');
    return false;
  }
  
  try {
    // Get connection statistics
    const stats = getConnectionStats();
    const environment = process.env.NODE_ENV || DEFAULT_ENVIRONMENT;
    
    // Create metric data
    const metricData = [
      // Connection count metrics
      {
        MetricName: 'ConnectionCount',
        Dimensions: [
          {
            Name: 'Environment',
            Value: environment
          }
        ],
        Value: stats.total,
        Unit: 'Count',
        Timestamp: new Date()
      },
      {
        MetricName: 'ActiveConnections',
        Dimensions: [
          {
            Name: 'Environment',
            Value: environment
          }
        ],
        Value: stats.active,
        Unit: 'Count',
        Timestamp: new Date()
      },
      
      // Max connections
      {
        MetricName: 'MaxConnections',
        Dimensions: [
          {
            Name: 'Environment',
            Value: environment
          }
        ],
        Value: 2000, // Configurable max connection limit
        Unit: 'Count',
        Timestamp: new Date()
      }
    ];
    
    // Add role-based metrics
    Object.entries(stats.byRole).forEach(([role, count]) => {
      metricData.push({
        MetricName: 'ConnectionsByRole',
        Dimensions: [
          {
            Name: 'Environment',
            Value: environment
          },
          {
            Name: 'Role',
            Value: role
          }
        ],
        Value: count,
        Unit: 'Count',
        Timestamp: new Date()
      });
    });
    
    // Add category-based metrics
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      metricData.push({
        MetricName: 'ConnectionsByCategory',
        Dimensions: [
          {
            Name: 'Environment',
            Value: environment
          },
          {
            Name: 'Category',
            Value: category
          }
        ],
        Value: count,
        Unit: 'Count',
        Timestamp: new Date()
      });
    });
    
    // Add shipment subscription metric
    if (stats.byCategory['shipment_tracking']) {
      metricData.push({
        MetricName: 'ShipmentSubscriptions',
        Dimensions: [
          {
            Name: 'Environment',
            Value: environment
          }
        ],
        Value: stats.byCategory['shipment_tracking'],
        Unit: 'Count',
        Timestamp: new Date()
      });
    }
    
    // Put metric data
    await cloudWatch.putMetricData({
      Namespace: NAMESPACE,
      MetricData: metricData
    }).promise();
    
    logInfo('Published WebSocket metrics to CloudWatch', {
      metricCount: metricData.length,
      connectionCount: stats.total,
      activeConnections: stats.active
    });
    
    return true;
  } catch (error) {
    logError('Failed to publish WebSocket metrics to CloudWatch', error);
    return false;
  }
}

/**
 * Start the metrics publishing timer
 */
export function startMetricsPublisher(intervalSeconds: number = METRIC_RESOLUTION): NodeJS.Timeout {
  logInfo(`Starting WebSocket metrics publisher (interval: ${intervalSeconds}s)`);
  
  return setInterval(() => {
    publishWebSocketMetrics().catch(error => {
      logError('Error in metrics publisher interval', error);
    });
  }, intervalSeconds * 1000);
}

/**
 * Stop the metrics publishing timer
 */
export function stopMetricsPublisher(timer: NodeJS.Timeout): void {
  clearInterval(timer);
  logInfo('WebSocket metrics publisher stopped');
}

/**
 * Record custom metric
 */
export async function recordCustomMetric(
  metricName: string,
  value: number,
  unit: 'Count' | 'Milliseconds' | 'Bytes' | 'Percent' = 'Count',
  dimensions: Record<string, string> = {}
): Promise<boolean> {
  if (!cloudWatch) {
    logError('CloudWatch client not initialized');
    return false;
  }
  
  try {
    const environment = process.env.NODE_ENV || DEFAULT_ENVIRONMENT;
    
    // Create dimensions array
    const metricDimensions = [
      {
        Name: 'Environment',
        Value: environment
      }
    ];
    
    // Add custom dimensions
    Object.entries(dimensions).forEach(([name, value]) => {
      metricDimensions.push({
        Name: name,
        Value: value
      });
    });
    
    // Put metric data
    await cloudWatch.putMetricData({
      Namespace: NAMESPACE,
      MetricData: [
        {
          MetricName: metricName,
          Dimensions: metricDimensions,
          Value: value,
          Unit: unit,
          Timestamp: new Date()
        }
      ]
    }).promise();
    
    logInfo(`Published custom metric ${metricName} to CloudWatch`, {
      value,
      unit,
      dimensions
    });
    
    return true;
  } catch (error) {
    logError(`Failed to publish custom metric ${metricName} to CloudWatch`, error);
    return false;
  }
}

/**
 * Record connection latency
 */
export async function recordConnectionLatency(latencyMs: number): Promise<boolean> {
  return recordCustomMetric('ConnectionLatency', latencyMs, 'Milliseconds');
}

/**
 * Record connection error
 */
export async function recordConnectionError(): Promise<boolean> {
  return recordCustomMetric('ConnectionErrors', 1);
}

/**
 * Record connection timeout
 */
export async function recordConnectionTimeout(): Promise<boolean> {
  return recordCustomMetric('ConnectionTimeouts', 1);
}

/**
 * Record message throughput
 */
export async function recordMessageThroughput(
  direction: 'in' | 'out',
  count: number
): Promise<boolean> {
  return recordCustomMetric(
    direction === 'in' ? 'MessagesReceived' : 'MessagesSent',
    count
  );
}

/**
 * Record data transfer
 */
export async function recordDataTransfer(
  direction: 'in' | 'out',
  byteCount: number
): Promise<boolean> {
  return recordCustomMetric(
    'DataTransferred',
    byteCount / 1024, // Convert to KB
    'Count',
    { Direction: direction }
  );
}
