import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this data might come from a CMS or database
    const features = [
      {
        icon: '🌐',
        title: 'Global Marketplace',
        description: 'Connect with buyers and sellers from around the world in over 50+ categories.',
        color: 'from-blue-600 to-blue-400'
      },
      {
        icon: '🔒',
        title: 'Secure Transactions',
        description: 'Our escrow service ensures safe and secure transactions for all parties involved.',
        color: 'from-purple-600 to-purple-400'
      },
      {
        icon: '🛡️',
        title: 'Trust & Verification',
        description: 'Verified suppliers and buyers with secure payment protection.',
        color: 'from-green-600 to-green-400'
      },
      {
        icon: '⚡',
        title: 'Fast & Efficient',
        description: 'Quick search, instant quotes, and efficient order processing.',
        color: 'from-amber-600 to-amber-400'
      },
      {
        icon: '💬',
        title: '24/7 Support',
        description: 'Dedicated customer support available round the clock.',
        color: 'from-pink-600 to-pink-400'
      },
      {
        icon: '📈',
        title: 'Business Growth',
        description: 'Tools and insights to help your business grow and succeed.',
        color: 'from-cyan-600 to-cyan-400'
      }
    ];

    // Simulate a small delay to test loading states
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
} 