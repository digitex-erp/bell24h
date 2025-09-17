/**
 * Production-Grade Caching System
 * Handles 1000+ concurrent users with Redis and in-memory fallback
 */

import { NextRequest, NextResponse } from 'next/server'

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 300, // 5 minutes
  maxMemorySize: 100 * 1024 * 1024, // 100MB
  cleanupInterval: 60 * 1000, // 1 minute
}

// In-memory cache (fallback when Redis is not available)
interface CacheEntry {
  value: any
  expires: number
  size: number
}

const memoryCache = new Map<string, CacheEntry>()
let totalMemoryUsage = 0

// Redis client (if available)
let redis: any = null

/**
 * Initialize Redis connection
 */
async function initRedis() {
  if (redis) return redis
  
  try {
    const Redis = require('ioredis')
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    })
    
    await redis.ping()
    console.log('✅ Redis connected for caching')
    return redis
  } catch (error) {
    console.warn('⚠️ Redis not available, using in-memory cache')
    return null
  }
}

/**
 * Generate cache key
 */
function generateCacheKey(prefix: string, key: string): string {
  return `${prefix}:${key}`.replace(/[^a-zA-Z0-9:_-]/g, '_')
}

/**
 * Get value from cache
 */
export async function get(key: string, prefix: string = 'default'): Promise<any> {
  const cacheKey = generateCacheKey(prefix, key)
  
  try {
    // Try Redis first
    await initRedis()
    if (redis) {
      const value = await redis.get(cacheKey)
      if (value) {
        return JSON.parse(value)
      }
    }
  } catch (error) {
    console.warn('Redis get error, falling back to memory:', error)
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(cacheKey)
  if (entry && entry.expires > Date.now()) {
    return entry.value
  }
  
  // Remove expired entry
  if (entry) {
    memoryCache.delete(cacheKey)
    totalMemoryUsage -= entry.size
  }
  
  return null
}

/**
 * Set value in cache
 */
export async function set(
  key: string, 
  value: any, 
  ttl: number = CACHE_CONFIG.defaultTTL,
  prefix: string = 'default'
): Promise<void> {
  const cacheKey = generateCacheKey(prefix, key)
  const serializedValue = JSON.stringify(value)
  const size = Buffer.byteLength(serializedValue, 'utf8')
  
  try {
    // Try Redis first
    await initRedis()
    if (redis) {
      await redis.setex(cacheKey, ttl, serializedValue)
      return
    }
  } catch (error) {
    console.warn('Redis set error, falling back to memory:', error)
  }
  
  // Fallback to memory cache
  const entry: CacheEntry = {
    value,
    expires: Date.now() + (ttl * 1000),
    size,
  }
  
  // Check memory limit
  if (totalMemoryUsage + size > CACHE_CONFIG.maxMemorySize) {
    cleanupMemoryCache()
  }
  
  memoryCache.set(cacheKey, entry)
  totalMemoryUsage += size
}

/**
 * Delete value from cache
 */
export async function del(key: string, prefix: string = 'default'): Promise<void> {
  const cacheKey = generateCacheKey(prefix, key)
  
  try {
    // Try Redis first
    await initRedis()
    if (redis) {
      await redis.del(cacheKey)
      return
    }
  } catch (error) {
    console.warn('Redis del error, falling back to memory:', error)
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(cacheKey)
  if (entry) {
    memoryCache.delete(cacheKey)
    totalMemoryUsage -= entry.size
  }
}

/**
 * Get or set pattern (cache-aside)
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_CONFIG.defaultTTL,
  prefix: string = 'default'
): Promise<T> {
  const cached = await get(key, prefix)
  if (cached !== null) {
    return cached
  }
  
  const value = await fetcher()
  await set(key, value, ttl, prefix)
  return value
}

/**
 * Cache middleware for API routes
 */
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    ttl?: number
    prefix?: string
    keyGenerator?: (request: NextRequest) => string
  } = {}
) {
  const { ttl = CACHE_CONFIG.defaultTTL, prefix = 'api', keyGenerator } = options
  
  return async (request: NextRequest) => {
    // Generate cache key
    const key = keyGenerator ? keyGenerator(request) : `${request.method}:${request.nextUrl.pathname}`
    
    // Try to get from cache
    const cached = await get(key, prefix)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttl}`,
        },
      })
    }
    
    // Execute handler
    const response = await handler(request)
    
    // Cache successful responses
    if (response.status === 200) {
      const data = await response.json()
      await set(key, data, ttl, prefix)
    }
    
    return response
  }
}

/**
 * Cleanup expired entries from memory cache
 */
function cleanupMemoryCache() {
  const now = Date.now()
  const toDelete: string[] = []
  
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expires <= now) {
      toDelete.push(key)
      totalMemoryUsage -= entry.size
    }
  }
  
  toDelete.forEach(key => memoryCache.delete(key))
  
  // If still over limit, remove oldest entries
  if (totalMemoryUsage > CACHE_CONFIG.maxMemorySize) {
    const entries = Array.from(memoryCache.entries())
      .sort((a, b) => a[1].expires - b[1].expires)
    
    for (const [key, entry] of entries) {
      memoryCache.delete(key)
      totalMemoryUsage -= entry.size
      
      if (totalMemoryUsage <= CACHE_CONFIG.maxMemorySize * 0.8) {
        break
      }
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memory: {
      entries: memoryCache.size,
      totalSize: totalMemoryUsage,
      maxSize: CACHE_CONFIG.maxMemorySize,
      usagePercent: (totalMemoryUsage / CACHE_CONFIG.maxMemorySize) * 100,
    },
    redis: {
      connected: !!redis,
    },
  }
}

// Cleanup memory cache every minute
setInterval(cleanupMemoryCache, CACHE_CONFIG.cleanupInterval)