import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateAIRecommendations, createPriceTrendChart, createSupplierRadarChart } from '@/lib/napkin-pdf';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfqId } = body;

    if (!rfqId) {
      return NextResponse.json(
        { error: 'Missing required field: rfqId' },
        { status: 400 }
      );
    }

    // Get RFQ data
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyname: true,
          },
        },
        responses: {
          include: {
            rfq: {
              include: {
                buyer: true,
              },
            },
          },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    // Generate mock price trend data (in production, this would come from market data APIs)
    const priceTrend = await generatePriceTrendData(rfq.category);
    
    // Generate competitor analysis
    const competitorAnalysis = await generateCompetitorAnalysis(rfq.category);
    
    // Calculate risk scores for responses
    const responsesWithScores = rfq.responses.map(response => ({
      ...response,
      aiScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
      riskScore: Math.floor(Math.random() * 50) + 20, // 20-70 risk
    }));

    // Generate AI recommendations
    const recommendations = generateAIRecommendations(
      responsesWithScores,
      priceTrend,
      rfq.budget
    );

    // Create chart data
    const priceChart = createPriceTrendChart(priceTrend);
    const supplierChart = createSupplierRadarChart(responsesWithScores);

    // Generate PDF report (simplified - in production, use a PDF library)
    const reportData = {
      rfqId: rfq.id,
      title: rfq.title,
      category: rfq.category,
      quantity: rfq.quantity,
      unit: rfq.unit,
      budget: rfq.budget,
      deadline: rfq.deadline,
      buyer: rfq.buyer,
      priceTrend,
      competitorAnalysis,
      responses: responsesWithScores,
      recommendations,
      charts: {
        priceChart,
        supplierChart,
      },
      generatedAt: new Date().toISOString(),
    };

    // For now, return the report data as JSON
    // In production, you would generate an actual PDF using libraries like Puppeteer or jsPDF
    return NextResponse.json({
      success: true,
      report: reportData,
      downloadUrl: `/api/rfq/${rfqId}/report/download`,
    });

  } catch (error) {
    console.error('Error generating RFQ report:', error);
    return NextResponse.json(
      { error: 'Failed to generate RFQ report' },
      { status: 500 }
    );
  }
}

async function generatePriceTrendData(category: string) {
  // Mock price trend data - in production, this would come from market data APIs
  const basePrice = getBasePriceForCategory(category);
  const dates = [];
  const prices = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    
    // Generate realistic price fluctuations
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
    const price = basePrice * (1 + fluctuation);
    prices.push(Math.round(price));
  }

  const trend = prices[prices.length - 1] > prices[0] ? 'up' : 'down';
  const percentageChange = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  const marketAverage = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return {
    dates,
    prices,
    trend,
    percentageChange,
    marketAverage,
  };
}

function getBasePriceForCategory(category: string): number {
  const basePrices: Record<string, number> = {
    steel: 45000,
    aluminum: 180000,
    copper: 750000,
    machinery: 250000,
    electronics: 15000,
    textiles: 500,
    chemicals: 80000,
    automotive: 12000,
    construction: 8000,
    agriculture: 15000,
  };

  return basePrices[category.toLowerCase()] || 10000;
}

async function generateCompetitorAnalysis(category: string) {
  // Mock competitor data - in production, this would come from market research
  const competitors = [
    {
      name: 'Tata Steel',
      price: 47000,
      rating: 4.5,
      deliveryTime: 7,
      riskScore: 25,
    },
    {
      name: 'JSW Steel',
      price: 45500,
      rating: 4.3,
      deliveryTime: 10,
      riskScore: 30,
    },
    {
      name: 'SAIL',
      price: 46000,
      rating: 4.2,
      deliveryTime: 12,
      riskScore: 35,
    },
    {
      name: 'Essar Steel',
      price: 44800,
      rating: 4.0,
      deliveryTime: 15,
      riskScore: 40,
    },
  ];

  return competitors;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId');

    if (!rfqId) {
      return NextResponse.json(
        { error: 'Missing required field: rfqId' },
        { status: 400 }
      );
    }

    // Get RFQ summary
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        buyer: {
          select: {
            name: true,
            companyname: true,
          },
        },
        responses: {
          select: {
            id: true,
            price: true,
            deliveryTime: true,
            status: true,
          },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    const summary = {
      id: rfq.id,
      title: rfq.title,
      category: rfq.category,
      quantity: rfq.quantity,
      unit: rfq.unit,
      budget: rfq.budget,
      status: rfq.status,
      buyer: rfq.buyer,
      responseCount: rfq.responses.length,
      averagePrice: rfq.responses.length > 0 
        ? rfq.responses.reduce((sum, r) => sum + r.price, 0) / rfq.responses.length 
        : 0,
      createdAt: rfq.createdAt,
    };

    return NextResponse.json({
      success: true,
      summary,
    });

  } catch (error) {
    console.error('Error fetching RFQ summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFQ summary' },
      { status: 500 }
    );
  }
}