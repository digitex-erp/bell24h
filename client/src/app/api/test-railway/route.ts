import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if we can reach Railway
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      return NextResponse.json({
        ok: false,
        message: 'DATABASE_URL not found in environment variables',
        hasDbUrl: false,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Check if it's a Railway URL
    const isRailway = dbUrl.includes('railway');
    const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    
    return NextResponse.json({
      ok: true,
      message: 'Railway connection test',
      isRailway,
      dbUrlMasked: maskedUrl,
      hasDbUrl: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: 'Railway test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 