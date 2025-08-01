import { NextResponse } from 'next/server'
import { db } from '@/lib/db-connection'

export async function POST() {
  try {
    // Kill idle connections older than 10 minutes
    const cleanupResult = await db.$executeRaw`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE state IN ('idle', 'idle in transaction')
      AND state_change < NOW() - INTERVAL '10 minutes'
      AND datname = current_database()
      AND pid != pg_backend_pid()
    `

    // Kill long-running queries (over 5 minutes)
    const longQueryCleanup = await db.$executeRaw`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE state = 'active'
      AND now() - pg_stat_activity.query_start > INTERVAL '5 minutes'
      AND datname = current_database()
      AND pid != pg_backend_pid()
      AND query NOT LIKE '%pg_stat_activity%'
    `

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      cleanup: {
        idleConnectionsTerminated: cleanupResult,
        longQueriesTerminated: longQueryCleanup,
        message: 'Database cleanup completed successfully'
      }
    })

  } catch (error) {
    console.error('Database cleanup API error:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database cleanup failed'
    }, { status: 500 })
  }
} 