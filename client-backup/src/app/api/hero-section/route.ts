import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this data might come from a CMS or database
    const heroData = {
      title: 'Bell24H – AI-Powered B2B Marketplace',
      description: 'Streamline procurement with intelligent RFQ matching, real-time analytics, and secure transactions.',
      imageUrl: '/images/hero-image.jpg',
      fallbackImageUrl: '/images/hero-illustration.svg',
    };

    // Simulate a small delay to test loading states
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(heroData);
  } catch (error) {
    console.error('Error fetching hero section data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero section data' },
      { status: 500 }
    );
  }
} 