import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This is a stub for Whisper integration
  // In production, you would process the audio and return the transcript
  return NextResponse.json({
    success: true,
    message: 'Audio received. Whisper integration ready.',
    text: 'Sample transcript: "This is a test RFQ audio message."',
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Voice upload API is live',
    version: '1.0.0',
  });
} 