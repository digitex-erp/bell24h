import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate risk scoring logic
  return NextResponse.json({
    success: true,
    score: Math.floor(Math.random() * 30) + 70, // 70-100 risk score
    factors: [
      'GST verified',
      'No recent disputes',
      'On-time delivery',
      'Positive buyer feedback',
      'Low credit risk',
    ],
    timestamp: new Date().toISOString(),
  });
} 