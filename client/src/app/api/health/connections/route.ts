import { db } from '@/lib/db-connection';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get detailed connection information
    const connectionDetails = await db.$queryRaw<
      Array<{
        total_connections: number;
        active_connections: number;
        idle_connections: number;
        max_connections: number;
        database_name: string;
      }>
    >`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as total_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND datname = current_database()) as active_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle' AND datname = current_database()) as idle_connections,
        (SELECT setting::integer FROM pg_settings WHERE name = 'max_connections') as max_connections,
        current_database() as database_name
    `;

    const stats = connectionDetails[0];
    const utilizationPercent = stats
      ? (Number(stats.total_connections) / Number(stats.max_connections)) * 100
      : 0;

    // Get long-running queries
    const longRunningQueries = await db.$queryRaw<
      Array<{
        pid: number;
        duration: string;
        query: string;
        state: string;
      }>
    >`
      SELECT 
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query,
        state
      FROM pg_stat_activity
      WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
      AND datname = current_database()
      AND state != 'idle'
      ORDER BY duration DESC
      LIMIT 10
    `;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: {
        total: stats ? Number(stats.total_connections) : 0,
        active: stats ? Number(stats.active_connections) : 0,
        idle: stats ? Number(stats.idle_connections) : 0,
        max: stats ? Number(stats.max_connections) : 0,
        utilization: Math.round(utilizationPercent * 100) / 100,
        database: stats ? stats.database_name : 'unknown',
      },
      performance: {
        longRunningQueries: longRunningQueries.length,
        queries: longRunningQueries.map(q => ({
          pid: Number(q.pid),
          duration: q.duration,
          state: q.state,
          queryPreview: q.query.substring(0, 100) + (q.query.length > 100 ? '...' : ''),
        })),
      },
      alerts: {
        highUtilization: utilizationPercent > 75,
        longRunningQueries: longRunningQueries.length > 0,
        connectionLeaks: stats ? Number(stats.idle_connections) > 20 : false,
      },
    });
  } catch (error) {
    console.error('Connection monitoring API error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection monitoring failed',
      },
      { status: 503 }
    );
  }
}
