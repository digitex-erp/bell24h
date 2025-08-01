import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { measurementId, propertyName } = body;

    if (!measurementId) {
      return NextResponse.json(
        { error: 'Measurement ID is required' },
        { status: 400 }
      );
    }

    // Validate GA4 Measurement ID format
    const ga4Pattern = /^G-[A-Z0-9]{10}$/;
    if (!ga4Pattern.test(measurementId)) {
      return NextResponse.json(
        { error: 'Invalid GA4 Measurement ID format. Should be G-XXXXXXXXXX' },
        { status: 400 }
      );
    }

    // Here you would typically save to environment variables or database
    // For now, we'll return success and instructions
    
    const setupInstructions = {
      success: true,
      measurementId,
      propertyName: propertyName || 'Bell24h',
      nextSteps: [
        '1. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your environment variables',
        '2. Deploy the updated code to Vercel',
        '3. Verify tracking in Google Analytics Real-Time reports',
        '4. Submit sitemap to Google Search Console'
      ],
      environmentVariable: `NEXT_PUBLIC_GA_MEASUREMENT_ID=${measurementId}`,
      verificationUrl: `https://bell24h-v1.vercel.app`,
      searchConsoleUrl: 'https://search.google.com/search-console'
    };

    return NextResponse.json(setupInstructions);

  } catch (error: any) {
    console.error('GA4 setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup Google Analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    instructions: {
      title: 'Google Analytics 4 Setup for Bell24h',
      steps: [
        '1. Go to https://analytics.google.com',
        '2. Create new GA4 property for Bell24h',
        '3. Get Measurement ID (G-XXXXXXXXXX format)',
        '4. Use this API to configure tracking',
        '5. Deploy to production'
      ],
      currentStatus: 'Ready for GA4 configuration',
      siteUrl: 'https://bell24h-v1.vercel.app'
    }
  });
} 