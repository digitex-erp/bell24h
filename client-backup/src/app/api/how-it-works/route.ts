import { NextResponse } from 'next/server';

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up for free and complete your business profile to get started.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    number: '02',
    title: 'Find Products or Suppliers',
    description: 'Browse through thousands of products or find reliable suppliers for your business needs.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  },
  {
    number: '03',
    title: 'Connect & Negotiate',
    description: 'Use our secure messaging system to connect with suppliers and negotiate terms.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    number: '04',
    title: 'Secure Payment & Delivery',
    description: 'Complete transactions with our secure payment system and track your order in real-time.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  }
];

export async function GET() {
  try {
    // Simulate a small delay to test loading states
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching how-it-works data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch how-it-works data' },
      { status: 500 }
    );
  }
} 