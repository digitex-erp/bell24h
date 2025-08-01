import { NextResponse } from 'next/server'
import { checkDatabaseHealth, ConnectionMonitor } from '@/lib/db-connection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check basic database connectivity
    const healthCheck = await checkDatabaseHealth()
    
    // Get connection monitoring data
    const monitor = ConnectionMonitor.getInstance()
    const connectionStats = await monitor.monitorConnections()
    
    const response = {
      status: healthCheck.status,
      timestamp: new Date().toISOString(),
      database: {
        connectivity: healthCheck.status,
        provider: 'Railway PostgreSQL',
        region: process.env.DATABASE_REGION || 'us-west1',
      },
      connections: connectionStats,
      performance: {
        region: process.env.VERCEL_REGION || 'unknown',
        edge: process.env.VERCEL_URL ? 'Vercel Edge' : 'localhost',
      }
    }

    return NextResponse.json(response, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Database health check API error:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database health check failed',
      database: {
        connectivity: 'failed',
        provider: 'Railway PostgreSQL'
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
} 