import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Escrow API is live',
    features: ['Fund', 'Release', 'Dispute', 'Pause'],
    timestamp: new Date().toISOString(),
  });
} 