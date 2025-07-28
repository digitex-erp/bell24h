import { NextResponse } from 'next/server';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CEO, TechGadgets Inc.',
    company: 'TechGadgets Inc.',
    content: 'Bell24H has revolutionized how we connect with suppliers. The AI-powered RFQ matching system saves us hours every week.',
    rating: 5,
    avatar: '/images/avatars/avatar1.jpg'
  },
  {
    id: 2,
    name: 'Raj Patel',
    role: 'Procurement Manager',
    company: 'Global Manufacturing Co.',
    content: 'The supplier risk scoring dashboard gives us confidence in our decisions. It\'s a game-changer for B2B procurement.',
    rating: 4,
    avatar: '/images/avatars/avatar2.jpg'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Operations Director',
    company: 'Logistics Solutions Ltd.',
    content: 'I was blown away by the AI explainability features. Being able to see why a supplier was matched helps build trust across our team.',
    rating: 5,
    avatar: '/images/avatars/avatar3.jpg'
  },
  {
    id: 4,
    name: 'Ahmed Hassan',
    role: 'Supply Chain Lead',
    company: 'Middle East Distributors',
    content: 'As someone working in Arabic, I appreciate the RTL support and multilingual capabilities of Bell24H. The interface feels natural and intuitive.',
    rating: 5,
    avatar: '/images/avatars/avatar4.jpg'
  }
];

export async function GET() {
  try {
    // Simulate a small delay to test loading states
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials data' },
      { status: 500 }
    );
  }
} 