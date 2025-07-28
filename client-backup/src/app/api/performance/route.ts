import { NextResponse } from 'next/server';

// Mock data generator
const generatePerformanceData = () => {
  const kpis = [
    {
      metric: 'On-Time Delivery',
      value: 92,
      target: 95,
      trend: -3,
      unit: '%',
    },
    {
      metric: 'Quality Score',
      value: 88,
      target: 90,
      trend: -2,
      unit: '%',
    },
    {
      metric: 'Cost Efficiency',
      value: 85,
      target: 80,
      trend: 5,
      unit: '%',
    },
    {
      metric: 'Customer Satisfaction',
      value: 4.5,
      target: 4.0,
      trend: 0.5,
      unit: '',
    },
  ];

  const trends = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    efficiency: Math.floor(Math.random() * 20) + 80,
    quality: Math.floor(Math.random() * 15) + 85,
    cost: Math.floor(Math.random() * 10) + 90,
  }));

  const distribution = [
    { category: 'Excellent', value: 30 },
    { category: 'Good', value: 45 },
    { category: 'Average', value: 20 },
    { category: 'Below Average', value: 5 },
  ];

  const comparisons = [
    {
      metric: 'Delivery Time',
      current: 85,
      previous: 80,
      change: 5,
    },
    {
      metric: 'Quality Rating',
      current: 90,
      previous: 88,
      change: 2,
    },
    {
      metric: 'Cost Savings',
      current: 12,
      previous: 10,
      change: 2,
    },
    {
      metric: 'Response Time',
      current: 95,
      previous: 92,
      change: 3,
    },
  ];

  return {
    kpis,
    trends,
    distribution,
    comparisons,
  };
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = generatePerformanceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in performance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
} 