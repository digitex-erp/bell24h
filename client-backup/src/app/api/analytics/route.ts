import { NextResponse } from 'next/server';

// Mock data generator
const generateAnalyticsData = () => {
  const transactions = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 1000000) + 100000,
    count: Math.floor(Math.random() * 100) + 10,
  }));

  const suppliers = [
    { category: 'Manufacturing', value: 35 },
    { category: 'Services', value: 25 },
    { category: 'Technology', value: 20 },
    { category: 'Healthcare', value: 15 },
    { category: 'Other', value: 5 },
  ];

  const performance = [
    { metric: 'Total Revenue', value: 12500000, target: 10000000, unit: '₹' },
    { metric: 'Transaction Volume', value: 1250, target: 1000, unit: '' },
    { metric: 'Success Rate', value: 95, target: 90, unit: '%' },
    { metric: 'Average Value', value: 10000, target: 8000, unit: '₹' },
  ];

  const risk = [
    { level: 'Low', count: 45 },
    { level: 'Medium', count: 30 },
    { level: 'High', count: 15 },
  ];

  return {
    transactions,
    suppliers,
    performance,
    risk,
  };
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = generateAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 