import { NextResponse } from 'next/server';

// Mock data generator
const generateRiskData = () => {
  const overallRisk = {
    score: 65,
    level: 'Medium',
    trend: 'down',
  };

  const riskFactors = [
    { category: 'Financial', score: 75, weight: 0.3 },
    { category: 'Operational', score: 60, weight: 0.25 },
    { category: 'Compliance', score: 85, weight: 0.2 },
    { category: 'Market', score: 45, weight: 0.15 },
    { category: 'Environmental', score: 70, weight: 0.1 },
  ];

  const supplierDistribution = [
    { riskLevel: 'Low', count: 45, percentage: 45 },
    { riskLevel: 'Medium', count: 35, percentage: 35 },
    { riskLevel: 'High', count: 20, percentage: 20 },
  ];

  const recentAlerts = [
    {
      id: '1',
      supplier: 'Tech Solutions Ltd',
      type: 'Financial Risk',
      severity: 'high',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'open',
    },
    {
      id: '2',
      supplier: 'Global Services Inc',
      type: 'Compliance Issue',
      severity: 'medium',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'acknowledged',
    },
    {
      id: '3',
      supplier: 'Manufacturing Corp',
      type: 'Operational Delay',
      severity: 'low',
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
    },
  ];

  return {
    overallRisk,
    riskFactors,
    supplierDistribution,
    recentAlerts,
  };
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = generateRiskData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in supplier risk API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier risk data' },
      { status: 500 }
    );
  }
} 