import { NextRequest, NextResponse } from 'next/server';
import { track24HourEngagement, trackRealTimeEngagement, generateEngagementReport } from '@/lib/engagement-metrics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '24hour';

    let data;

    switch (type) {
      case 'realtime':
        data = await trackRealTimeEngagement();
        break;
      case 'report':
        data = await generateEngagementReport();
        break;
      case '24hour':
      default:
        data = await track24HourEngagement();
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      type
    });

  } catch (error) {
    console.error('Engagement analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch engagement metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, metadata } = body;

    // Track user action
    const trackingData = {
      userId,
      action,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    };

    console.log('📊 User Action Tracked:', trackingData);

    return NextResponse.json({
      success: true,
      message: 'Action tracked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Action tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track action',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 