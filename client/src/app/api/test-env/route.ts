import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not Set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
      NODE_ENV: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 