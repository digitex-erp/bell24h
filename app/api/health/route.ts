import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check that doesn't depend on database
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'bell24h-app',
      version: '1.0.0'
    }, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed'
    }, { status: 500 });
  }
}