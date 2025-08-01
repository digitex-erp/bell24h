import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    googleClientId: !!process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing',
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Missing',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'Missing',
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET ? 'Found' : 'Missing',
  };

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    variables: envCheck,
  });
}
