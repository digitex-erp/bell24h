import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { healthCheck } from '@/lib/monitoring'

/**
 * GET /api/health - Production health check endpoint
 * Monitors system health for 1000+ concurrent users
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth()
    
    // Check Redis connectivity (if configured)
    const redisHealth = await checkRedisHealth()
    
    // Check external services
    const servicesHealth = await checkExternalServices()
    
    // Get system metrics
    const systemMetrics = healthCheck()
    
    // Overall health status
    const isHealthy = dbHealth.healthy && redisHealth.healthy && servicesHealth.healthy
    
    const healthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: dbHealth,
        redis: redisHealth,
        services: servicesHealth,
        system: systemMetrics,
      },
    }
    
    const statusCode = isHealthy ? 200 : 503
    
    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  try {
    const startTime = Date.now()
    
    // Test basic query
    await prisma.$queryRaw`SELECT 1 as health`
    
    // Test connection pool status
    const poolStatus = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    `
    
    const responseTime = Date.now() - startTime
    
    return {
      healthy: true,
      responseTime,
      poolStatus: poolStatus[0],
      message: 'Database connection healthy',
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
      message: 'Database connection unhealthy',
    }
  }
}

/**
 * Check Redis health
 */
async function checkRedisHealth() {
  try {
    if (!process.env.REDIS_URL) {
      return {
        healthy: true,
        message: 'Redis not configured, using in-memory cache',
      }
    }
    
    const Redis = require('ioredis')
    const redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
    
    const startTime = Date.now()
    await redis.ping()
    const responseTime = Date.now() - startTime
    
    await redis.disconnect()
    
    return {
      healthy: true,
      responseTime,
      message: 'Redis connection healthy',
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Redis connection failed',
      message: 'Redis connection unhealthy',
    }
  }
}

/**
 * Check external services health
 */
async function checkExternalServices() {
  const services = []
  
  // Check OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      
      services.push({
        name: 'OpenAI API',
        healthy: response.ok,
        responseTime: Date.now(),
      })
    } catch (error) {
      services.push({
        name: 'OpenAI API',
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  // Check Razorpay API
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        signal: AbortSignal.timeout(5000),
      })
      
      services.push({
        name: 'Razorpay API',
        healthy: response.ok,
        responseTime: Date.now(),
      })
    } catch (error) {
      services.push({
        name: 'Razorpay API',
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  const allHealthy = services.every(service => service.healthy)
  
  return {
    healthy: allHealthy,
    services,
    message: allHealthy ? 'All external services healthy' : 'Some external services unhealthy',
  }
}
