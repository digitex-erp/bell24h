/**
 * Bell24H Security Utilities
 * 
 * Provides security features including:
 * - Rate limiting
 * - JWT validation
 * - Input sanitization
 * - CSRF protection
 */

import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import DOMPurify from 'dompurify';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Redis client for rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Security configuration
export interface SecurityConfig {
  jwtSecret: string;
  rateLimits: {
    api: RateLimitConfig;
    login: RateLimitConfig;
    websocket: RateLimitConfig;
  };
  csrfEnabled: boolean;
  xssProtectionEnabled: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

// Default security configuration
const DEFAULT_CONFIG: SecurityConfig = {
  jwtSecret: process.env.JWT_SECRET || 'bell24h-default-secret-change-in-production',
  rateLimits: {
    api: {
      windowMs: 60000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      blockDurationMs: 300000 // 5 minutes block if exceeded
    },
    login: {
      windowMs: 300000, // 5 minutes
      maxRequests: 5, // 5 attempts per 5 minutes
      blockDurationMs: 1800000 // 30 minutes block if exceeded
    },
    websocket: {
      windowMs: 10000, // 10 seconds
      maxRequests: 50, // 50 messages per 10 seconds
      blockDurationMs: 60000 // 1 minute block if exceeded
    }
  },
  csrfEnabled: process.env.NODE_ENV === 'production',
  xssProtectionEnabled: true
};

// Security service class
export class SecurityService {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate JWT token
   */
  public generateToken(payload: any, expiresIn: string = '24h'): string {
    return jwt.sign(payload, this.config.jwtSecret, { expiresIn });
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Extract JWT token from request
   */
  public extractToken(req: Request): string | null {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.substring(7);
    }
    return null;
  }

  /**
   * JWT authentication middleware
   */
  public authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = this.extractToken(req);
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = this.verifyToken(token);
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error instanceof Error ? error.message : 'Unauthorized'
        }
      });
    }
  }

  /**
   * Rate limiting middleware for API requests
   */
  public apiRateLimiter(req: Request, res: Response, next: NextFunction): void {
    this.rateLimiter(
      req,
      this.config.rateLimits.api,
      'api',
      next,
      () => {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later'
          }
        });
      }
    );
  }

  /**
   * Rate limiting middleware for login attempts
   */
  public loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
    this.rateLimiter(
      req,
      this.config.rateLimits.login,
      'login',
      next,
      () => {
        res.status(429).json({
          success: false,
          error: {
            code: 'LOGIN_ATTEMPTS_EXCEEDED',
            message: 'Too many login attempts, please try again later'
          }
        });
      }
    );
  }

  /**
   * Rate limiter for WebSocket connections
   */
  public async websocketRateLimiter(
    clientId: string,
    req: IncomingMessage
  ): Promise<{ limited: boolean; reason?: string }> {
    const ipAddress = this.getIpAddress(req);
    const key = `ratelimit:websocket:${ipAddress}:${clientId}`;
    const config = this.config.rateLimits.websocket;

    try {
      // Check if client is blocked
      const isBlocked = await redis.get(`${key}:blocked`);
      if (isBlocked) {
        return {
          limited: true,
          reason: 'Rate limit exceeded, connection blocked temporarily'
        };
      }

      // Get current count
      const count = await redis.incr(key);
      
      // Set expiry on first request
      if (count === 1) {
        await redis.pexpire(key, config.windowMs);
      }
      
      // Check if limit exceeded
      if (count > config.maxRequests) {
        // Block for specified duration
        await redis.set(`${key}:blocked`, '1', 'PX', config.blockDurationMs);
        
        return {
          limited: true,
          reason: 'Rate limit exceeded, connection blocked temporarily'
        };
      }
      
      return { limited: false };
    } catch (error) {
      console.error('Error in websocket rate limiter:', error);
      return { limited: false }; // Fail open to prevent blocking legitimate traffic
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  public sanitizeInput(input: string): string {
    if (!this.config.xssProtectionEnabled) {
      return input;
    }
    return DOMPurify.sanitize(input);
  }

  /**
   * Generate CSRF token
   */
  public generateCsrfToken(sessionId: string): string {
    return this.generateToken({ sessionId, type: 'csrf' }, '1h');
  }

  /**
   * Validate CSRF token
   */
  public validateCsrfToken(token: string, sessionId: string): boolean {
    try {
      const decoded = this.verifyToken(token);
      return decoded.sessionId === sessionId && decoded.type === 'csrf';
    } catch (error) {
      return false;
    }
  }

  /**
   * CSRF protection middleware
   */
  public csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!this.config.csrfEnabled) {
      return next();
    }

    const token = req.headers['x-csrf-token'] as string;

    if (!token || !this.validateCsrfToken(token, (req as any).sessionID)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_CSRF_TOKEN',
          message: 'Invalid CSRF token'
        }
      });
      return; // Explicitly return to end the response
    }

    next();
  }

  /**
   * Get client IP address
   */
  private getIpAddress(req: Request | IncomingMessage): string {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown';
  }

  /**
   * Generic rate limiting logic
   */
  private async rateLimiter(
    req: Request,
    config: RateLimitConfig,
    type: string,
    next: NextFunction,
    onLimitExceeded: () => void
  ): Promise<void> {
    const ipAddress = this.getIpAddress(req);
    const key = `ratelimit:${type}:${ipAddress}`;

    try {
      const isBlocked = await redis.get(`${key}:blocked`);
      if (isBlocked) {
        return onLimitExceeded();
      }

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.pexpire(key, config.windowMs);
      }

      if (count > config.maxRequests) {
        await redis.set(`${key}:blocked`, '1', 'PX', config.blockDurationMs);
        return onLimitExceeded();
      }

      next();
    } catch (error) {
      console.error(`Error in ${type} rate limiter:`, error);
      next(); // Fail open
    }
  }

  /**
   * Middleware to handle missing CSRF token for specific methods
   */
  public csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!this.config.csrfEnabled) {
      return next();
    }

    const METHODS_TO_PROTECT = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (METHODS_TO_PROTECT.includes(req.method.toUpperCase())) {
      const token = req.headers['x-csrf-token'] as string;
      if (!token) {
        res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_TOKEN_MISSING',
            message: 'CSRF token missing'
          }
        });
        return; // Explicitly return to end the response
      }
    }
    next();
  }
}

export default new SecurityService();
