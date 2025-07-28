/**
 * Bell24H Rate Limiting System
 * 
 * Advanced rate limiting implementation with:
 * - IP-based and user-based rate limiting
 * - Sliding window algorithm
 * - Separate limits for different API endpoints
 * - Redis-backed storage for distributed deployments
 * - Graceful fallback to in-memory storage
 * - Customizable response behavior
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

// Rate limit types
export type RateLimitType = 'strict' | 'sliding' | 'token-bucket';

// Rate limit window sizes
export type WindowSize = 'second' | 'minute' | 'hour' | 'day';

// Rate limit options interface
export interface RateLimitOptions {
  // Maximum number of requests allowed in the window
  max: number;
  
  // Window size in which the maximum applies
  windowSize: WindowSize;
  
  // Limit type algorithm to use
  type?: RateLimitType;
  
  // Unique identifier for this rate limit (used for Redis keys)
  id?: string;
  
  // Function to extract the key from a request (default: IP address)
  keyGenerator?: (req: Request) => string;
  
  // Skip rate limiting for certain requests
  skip?: (req: Request) => boolean;
  
  // Custom handler for when limit is reached
  handler?: (req: Request, res: Response, next: NextFunction, info: RateLimitInfo) => void;
  
  // Headers configuration
  headers?: {
    // Whether to include rate limit headers in the response
    enabled: boolean;
    // Custom header names
    remaining?: string;
    limit?: string;
    reset?: string;
  };
  
  // Whether to use Redis for storage (if false, uses in-memory)
  useRedis?: boolean;
  
  // Redis client options (if using Redis)
  redisOptions?: {
    host?: string;
    port?: number;
    password?: string;
    url?: string;
  };
}

// Rate limit information for a request
export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
  exceeded: boolean;
}

// Default options
const DEFAULT_OPTIONS: Partial<RateLimitOptions> = {
  type: 'sliding',
  windowSize: 'minute',
  max: 60,
  id: 'default',
  headers: {
    enabled: true,
    remaining: 'X-RateLimit-Remaining',
    limit: 'X-RateLimit-Limit',
    reset: 'X-RateLimit-Reset'
  },
  useRedis: false,
  skip: () => false,
  keyGenerator: (req: Request) => req.ip || req.socket.remoteAddress || '127.0.0.1'
};

// Window size in seconds
const WINDOW_SIZES = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60
};

/**
 * In-memory store for rate limiting data
 */
class MemoryStore {
  private store: Map<string, { hits: number[]; resetTime: number }> = new Map();
  
  /**
   * Increment the counter for a key
   */
  async increment(key: string, windowSizeSeconds: number): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowMs = windowSizeSeconds * 1000;
    
    // Get or initialize record
    let record = this.store.get(key);
    if (!record) {
      record = {
        hits: [],
        resetTime: now + windowMs
      };
      this.store.set(key, record);
    }
    
    // Clean up expired hits
    const expiryTime = now - windowMs;
    record.hits = record.hits.filter(timestamp => timestamp > expiryTime);
    
    // Add current hit
    record.hits.push(now);
    
    // Update reset time if needed
    if (now > record.resetTime - 1000) {
      record.resetTime = now + windowMs;
    }
    
    return {
      limit: 0, // Will be set by the caller
      current: record.hits.length,
      remaining: 0, // Will be set by the caller
      resetTime: new Date(record.resetTime),
      exceeded: false // Will be set by the caller
    };
  }
  
  /**
   * Reset the counter for a key
   */
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  /**
   * Clear all rate limit data
   */
  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Redis store for rate limiting data (for distributed deployments)
 */
class RedisStore {
  private client: Redis;
  private ready: boolean = false;
  private prefix: string = 'bell24h:ratelimit:';
  
  constructor(options?: Redis.RedisOptions) {
    if (options?.url) {
      this.client = new Redis(options.url);
    } else {
      this.client = new Redis(options);
    }
    
    this.client.on('connect', () => {
      this.ready = true;
    });
    
    this.client.on('error', (err) => {
      console.error('Redis rate limit store error:', err);
      this.ready = false;
    });
  }
  
  /**
   * Increment the counter for a key
   */
  async increment(key: string, windowSizeSeconds: number): Promise<RateLimitInfo> {
    if (!this.ready) {
      throw new Error('Redis store not ready');
    }
    
    const now = Date.now();
    const redisKey = this.prefix + key;
    const windowMs = windowSizeSeconds * 1000;
    
    const pipeline = this.client.pipeline();
    
    // Add current hit with timestamp
    pipeline.zadd(redisKey, now, now.toString() + ':' + uuidv4());
    
    // Remove expired hits
    pipeline.zremrangebyscore(redisKey, 0, now - windowMs);
    
    // Get current count
    pipeline.zcard(redisKey);
    
    // Set expiry on the whole set
    pipeline.expire(redisKey, windowSizeSeconds * 2);
    
    const results = await pipeline.exec();
    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }
    
    // Executed commands return [error, result]
    const count = results[2][1] as number;
    const resetTime = now + windowMs;
    
    return {
      limit: 0, // Will be set by the caller
      current: count,
      remaining: 0, // Will be set by the caller
      resetTime: new Date(resetTime),
      exceeded: false // Will be set by the caller
    };
  }
  
  /**
   * Reset the counter for a key
   */
  async reset(key: string): Promise<void> {
    if (!this.ready) {
      throw new Error('Redis store not ready');
    }
    
    await this.client.del(this.prefix + key);
  }
  
  /**
   * Clear all rate limit data
   */
  async clear(): Promise<void> {
    if (!this.ready) {
      throw new Error('Redis store not ready');
    }
    
    const keys = await this.client.keys(this.prefix + '*');
    
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
  
  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private options: RateLimitOptions;
  private store: MemoryStore | RedisStore;
  private windowSizeSeconds: number;
  
  constructor(options: Partial<RateLimitOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as RateLimitOptions;
    
    // Calculate window size in seconds
    this.windowSizeSeconds = WINDOW_SIZES[this.options.windowSize];
    
    // Initialize store
    if (this.options.useRedis) {
      try {
        this.store = new RedisStore(this.options.redisOptions);
      } catch (error) {
        console.warn('Failed to initialize Redis store, falling back to memory store:', error);
        this.store = new MemoryStore();
      }
    } else {
      this.store = new MemoryStore();
    }
  }
  
  /**
   * Create middleware for Express
   */
  middleware(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Skip middleware if needed
      if (this.options.skip?.(req)) {
        return next();
      }
      
      try {
        // Generate key for this request
        const key = this.generateKey(req);
        
        // Increment counter
        const result = await this.store.increment(key, this.windowSizeSeconds);
        
        // Set limit and remaining
        result.limit = this.options.max;
        result.remaining = Math.max(0, this.options.max - result.current);
        result.exceeded = result.current > this.options.max;
        
        // Set headers if enabled
        if (this.options.headers?.enabled) {
          res.setHeader(this.options.headers.limit || 'X-RateLimit-Limit', result.limit.toString());
          res.setHeader(this.options.headers.remaining || 'X-RateLimit-Remaining', result.remaining.toString());
          res.setHeader(this.options.headers.reset || 'X-RateLimit-Reset', Math.floor(result.resetTime.getTime() / 1000).toString());
        }
        
        // Check if limit is exceeded
        if (result.exceeded) {
          if (this.options.handler) {
            return this.options.handler(req, res, next, result);
          } else {
            return this.defaultLimitHandler(req, res, next, result);
          }
        }
        
        next();
      } catch (error) {
        // Log error and continue
        console.error('Rate limit error:', error);
        next();
      }
    };
  }
  
  /**
   * Generate a unique key for the request
   */
  private generateKey(req: Request): string {
    const keyBase = this.options.keyGenerator?.(req) || req.ip || '127.0.0.1';
    return `${this.options.id}:${createHash('md5').update(keyBase).digest('hex')}`;
  }
  
  /**
   * Default handler for when rate limit is exceeded
   */
  private defaultLimitHandler(req: Request, res: Response, next: NextFunction, info: RateLimitInfo): void {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil((info.resetTime.getTime() - Date.now()) / 1000)} seconds.`,
      retryAfter: Math.ceil((info.resetTime.getTime() - Date.now()) / 1000)
    });
  }
  
  /**
   * Reset rate limit for a specific key
   */
  async reset(req: Request): Promise<void> {
    const key = this.generateKey(req);
    await this.store.reset(key);
  }
  
  /**
   * Clear all rate limits
   */
  async clear(): Promise<void> {
    await this.store.clear();
  }
}

/**
 * Factory functions for common rate limit scenarios
 */
export const rateLimit = {
  /**
   * Create a strict rate limiter
   */
  strict(max: number, windowSize: WindowSize = 'minute', keyGenerator?: (req: Request) => string): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return new RateLimiter({
      max,
      windowSize,
      type: 'strict',
      id: `strict:${max}:${windowSize}`,
      keyGenerator
    }).middleware();
  },
  
  /**
   * Create a rate limiter for API endpoints
   */
  api(max: number, windowSize: WindowSize = 'minute'): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return new RateLimiter({
      max,
      windowSize,
      type: 'sliding',
      id: `api:${max}:${windowSize}`,
      // Include path in the key to have separate limits per endpoint
      keyGenerator: (req: Request) => `${req.ip}:${req.method}:${req.path}`
    }).middleware();
  },
  
  /**
   * Create a rate limiter for authentication endpoints
   */
  auth(max: number = 5, windowSize: WindowSize = 'minute'): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return new RateLimiter({
      max,
      windowSize,
      type: 'sliding',
      id: 'auth',
      // Stricter rate limiting for authentication attempts
      keyGenerator: (req: Request) => {
        // Use IP and username if available
        const username = (req.body?.username || req.query?.username || '').toString().toLowerCase();
        return `${req.ip}:${username}`;
      }
    }).middleware();
  },
  
  /**
   * Create a user-based rate limiter
   */
  user(max: number, windowSize: WindowSize = 'minute'): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return new RateLimiter({
      max,
      windowSize,
      type: 'sliding',
      id: `user:${max}:${windowSize}`,
      // Skip if no user
      skip: (req: Request) => !req.user,
      // Use user ID for the key
      keyGenerator: (req: Request) => {
        // @ts-ignore - user might be added by auth middleware
        return `${req.user?.id || req.user?.userId || 'anonymous'}`;
      }
    }).middleware();
  },
  
  /**
   * Create a distributed rate limiter using Redis
   */
  distributed(max: number, windowSize: WindowSize = 'minute', redisOptions?: Redis.RedisOptions): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return new RateLimiter({
      max,
      windowSize,
      type: 'sliding',
      id: `dist:${max}:${windowSize}`,
      useRedis: true,
      redisOptions
    }).middleware();
  }
};

export default rateLimit;
