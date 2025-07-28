import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      DATABASE_URL_MASKED: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      ok: true,
      message: 'Environment variables debug',
      environment: envVars,
      isRailway: process.env.DATABASE_URL?.includes('railway') || false,
      isOldDb: process.env.DATABASE_URL?.includes('production-db.bell24h.com') || false
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: 'Error reading environment variables',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 