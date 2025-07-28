/**
 * Bell24H Error Handler
 * 
 * Centralized error handling system with:
 * - Structured logging
 * - Error categorization
 * - Alerting capabilities
 * - Performance impact tracking
 */

import { Request, Response, NextFunction } from 'express';
import { WebSocket } from 'ws';
import winston from 'winston';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import path from 'path';
import metricsService from './metrics';

dotenv.config();

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0
  });
}

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'bell24h-dashboard' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error'
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    })
  ]
});

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_SERVER = 'INTERNAL_SERVER_ERROR',
  DATABASE = 'DATABASE_ERROR',
  NETWORK = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  WEBSOCKET = 'WEBSOCKET_ERROR',
  API_CLIENT = 'API_CLIENT_ERROR',
  THIRD_PARTY = 'THIRD_PARTY_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
  clientIp?: string;
  duration?: number;
  additionalData?: Record<string, any>;
}

// Error information interface
export interface ErrorInfo {
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  context?: ErrorContext;
  stack?: string;
  originalError?: any;
}

/**
 * Bell24H Error Handler Service
 */
export class ErrorHandlerService {
  // Alert thresholds for different severities
  private alertThresholds = {
    [ErrorSeverity.LOW]: 50,
    [ErrorSeverity.MEDIUM]: 10,
    [ErrorSeverity.HIGH]: 3,
    [ErrorSeverity.CRITICAL]: 1
  };

  // Error counters by type and severity
  private errorCounts: Record<string, number> = {};

  // Last alert times by type and severity
  private lastAlertTimes: Record<string, number> = {};

  /**
   * Handle error with structured logging and alerting
   */
  public handleError(errorInfo: ErrorInfo): void {
    // Log error based on severity
    this.logError(errorInfo);

    // Track error in metrics
    this.trackError(errorInfo);

    // Report to Sentry if enabled
    this.reportToSentry(errorInfo);

    // Check if alert threshold reached
    this.checkAlertThreshold(errorInfo);
  }

  /**
   * Express middleware for handling errors
   */
  public errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
    // Default error info
    const errorInfo: ErrorInfo = {
      message: err.message || 'An unexpected error occurred',
      type: err.type || ErrorType.INTERNAL_SERVER,
      severity: err.severity || ErrorSeverity.MEDIUM,
      context: {
        requestId: req.headers['x-request-id'] as string,
        path: req.path,
        method: req.method,
        query: req.query,
        body: this.sanitizeRequestBody(req.body),
        clientIp: this.getClientIp(req)
      },
      stack: err.stack,
      originalError: err
    };

    // Handle error
    this.handleError(errorInfo);

    // Send appropriate response to client
    const statusCode = this.getStatusCodeForErrorType(errorInfo.type);
    res.status(statusCode).json({
      success: false,
      error: {
        code: errorInfo.type,
        message: this.getSafeErrorMessage(errorInfo)
      }
    });
  }

  /**
   * WebSocket error handler
   */
  public handleWebSocketError(err: any, ws: WebSocket, context?: Partial<ErrorContext>): void {
    const errorInfo: ErrorInfo = {
      message: err.message || 'WebSocket error occurred',
      type: ErrorType.WEBSOCKET,
      severity: ErrorSeverity.MEDIUM,
      context: {
        ...context
      },
      stack: err.stack,
      originalError: err
    };

    // Handle error
    this.handleError(errorInfo);

    // Send error to client if connection is open
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        code: errorInfo.type,
        message: this.getSafeErrorMessage(errorInfo)
      }));
    }
  }

  /**
   * Log error with appropriate level
   */
  private logError(errorInfo: ErrorInfo): void {
    const logMethod = this.getLogMethodForSeverity(errorInfo.severity);
    
    // Create log object
    const logObject = {
      message: errorInfo.message,
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      context: errorInfo.context,
      stack: process.env.NODE_ENV !== 'production' ? errorInfo.stack : undefined
    };
    
    // Log using appropriate method
    logger[logMethod](logObject);
  }

  /**
   * Track error in metrics
   */
  private trackError(errorInfo: ErrorInfo): void {
    // Update error counts
    const key = `${errorInfo.type}:${errorInfo.severity}`;
    this.errorCounts[key] = (this.errorCounts[key] || 0) + 1;
    
    // Track API errors if context has a path
    if (errorInfo.context?.path) {
      metricsService.trackApiRequest(
        errorInfo.context.method || 'UNKNOWN',
        errorInfo.context.path,
        this.getStatusCodeForErrorType(errorInfo.type)
      );
    }
    
    // Track WebSocket errors
    if (errorInfo.type === ErrorType.WEBSOCKET) {
      metricsService.trackWebSocketError('message');
    }
  }

  /**
   * Report error to Sentry if enabled
   */
  private reportToSentry(errorInfo: ErrorInfo): void {
    if (!process.env.SENTRY_DSN) return;
    
    // Only report medium severity and above
    if (
      errorInfo.severity === ErrorSeverity.LOW && 
      process.env.NODE_ENV === 'production'
    ) {
      return;
    }
    
    // Create Sentry event
    Sentry.withScope((scope) => {
      // Add tags
      scope.setTag('error_type', errorInfo.type);
      scope.setTag('severity', errorInfo.severity);
      
      // Add context
      if (errorInfo.context) {
        scope.setContext('request', errorInfo.context);
      }
      
      // Add user if available
      if (errorInfo.context?.userId) {
        scope.setUser({ id: errorInfo.context.userId });
      }
      
      // Set level based on severity
      scope.setLevel(this.getSentryLevelForSeverity(errorInfo.severity));
      
      // Capture exception or message
      if (errorInfo.originalError) {
        Sentry.captureException(errorInfo.originalError);
      } else {
        Sentry.captureMessage(errorInfo.message);
      }
    });
  }

  /**
   * Check if error alert threshold reached
   */
  private checkAlertThreshold(errorInfo: ErrorInfo): void {
    const key = `${errorInfo.type}:${errorInfo.severity}`;
    const count = this.errorCounts[key] || 0;
    const threshold = this.alertThresholds[errorInfo.severity] || 10;
    const now = Date.now();
    const lastAlertTime = this.lastAlertTimes[key] || 0;
    const alertCooldown = this.getAlertCooldownForSeverity(errorInfo.severity);
    
    // Check if threshold reached and cooldown expired
    if (count >= threshold && now - lastAlertTime > alertCooldown) {
      this.triggerAlert(errorInfo, count);
      this.lastAlertTimes[key] = now;
      this.errorCounts[key] = 0; // Reset count
    }
  }

  /**
   * Trigger alert for error threshold
   */
  private triggerAlert(errorInfo: ErrorInfo, count: number): void {
    // Log alert
    logger.warn({
      message: `Alert: ${errorInfo.type} error threshold reached`,
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      count,
      alertTimestamp: new Date().toISOString()
    });
    
    // Implement additional alert mechanisms here (email, SMS, etc.)
    // This is a placeholder for future implementation
    if (process.env.ENABLE_ERROR_ALERTS === 'true') {
      // Example: Send email alert
      // emailService.sendAlert({
      //   subject: `Bell24H Alert: ${errorInfo.type} errors`,
      //   body: `${count} errors of type ${errorInfo.type} with severity ${errorInfo.severity} occurred.`
      // });
    }
  }

  /**
   * Map error type to HTTP status code
   */
  private getStatusCodeForErrorType(errorType: ErrorType): number {
    switch (errorType) {
      case ErrorType.VALIDATION:
        return 400; // Bad Request
      case ErrorType.AUTHENTICATION:
        return 401; // Unauthorized
      case ErrorType.AUTHORIZATION:
        return 403; // Forbidden
      case ErrorType.RESOURCE_NOT_FOUND:
        return 404; // Not Found
      case ErrorType.RATE_LIMIT:
        return 429; // Too Many Requests
      case ErrorType.DATABASE:
      case ErrorType.INTERNAL_SERVER:
      case ErrorType.THIRD_PARTY:
      default:
        return 500; // Internal Server Error
    }
  }

  /**
   * Get winston log method for error severity
   */
  private getLogMethodForSeverity(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'warn';
    }
  }

  /**
   * Get Sentry level for error severity
   */
  private getSentryLevelForSeverity(severity: ErrorSeverity): Sentry.Severity {
    switch (severity) {
      case ErrorSeverity.LOW:
        return Sentry.Severity.Info;
      case ErrorSeverity.MEDIUM:
        return Sentry.Severity.Warning;
      case ErrorSeverity.HIGH:
        return Sentry.Severity.Error;
      case ErrorSeverity.CRITICAL:
        return Sentry.Severity.Fatal;
      default:
        return Sentry.Severity.Warning;
    }
  }

  /**
   * Get alert cooldown period based on severity
   */
  private getAlertCooldownForSeverity(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 24 * 60 * 60 * 1000; // 24 hours
      case ErrorSeverity.MEDIUM:
        return 6 * 60 * 60 * 1000; // 6 hours
      case ErrorSeverity.HIGH:
        return 1 * 60 * 60 * 1000; // 1 hour
      case ErrorSeverity.CRITICAL:
        return 10 * 60 * 1000; // 10 minutes
      default:
        return 6 * 60 * 60 * 1000; // 6 hours
    }
  }

  /**
   * Get safe error message (avoid leaking sensitive info)
   */
  private getSafeErrorMessage(errorInfo: ErrorInfo): string {
    // In production, return generic messages for certain error types
    if (process.env.NODE_ENV === 'production') {
      if (
        errorInfo.type === ErrorType.INTERNAL_SERVER ||
        errorInfo.type === ErrorType.DATABASE
      ) {
        return 'An internal server error occurred';
      }
    }
    
    return errorInfo.message;
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}

// Export singleton instance
export default new ErrorHandlerService();
