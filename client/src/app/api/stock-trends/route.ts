import { NextRequest, NextResponse } from 'next/server';

interface StockTrendsResponse {
  success: boolean;
  industry: string;
  trends: {
    overall: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    keyIndicators: {
      priceMovement: number;
      volumeChange: number;
      marketSentiment: number;
      volatility: number;
    };
    topStocks: Array<{
      symbol: string;
      name: string;
      price: number;
      change: number;
      changePercent: number;
      volume: number;
    }>;
    sectorAnalysis: {
      performance: number;
      outlook: string;
      risks: string[];
      opportunities: string[];
    };
  };
  commodities: Array<{
    name: string;
    price: number;
    change: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  marketInsights: {
    summary: string;
    recommendations: string[];
    riskFactors: string[];
  };
  lastUpdated: string;
}

// Mock stock data - in production, integrate with Alpha Vantage API
const getStockData = (industry: string) => {
  const industryData = {
    steel: {
      name: 'Steel & Metals',
      stocks: [
        {
          symbol: 'TATASTEEL',
          name: 'Tata Steel',
          price: 125.5,
          change: 2.3,
          changePercent: 1.87,
          volume: 15420000,
        },
        {
          symbol: 'JSWSTEEL',
          name: 'JSW Steel',
          price: 89.75,
          change: -1.25,
          changePercent: -1.37,
          volume: 9875000,
        },
        {
          symbol: 'SAIL',
          name: 'Steel Authority',
          price: 67.2,
          change: 0.8,
          changePercent: 1.2,
          volume: 12340000,
        },
      ],
      commodities: [
        { name: 'Steel Rebar', price: 45000, change: 500, unit: 'INR/ton', trend: 'up' },
        { name: 'Iron Ore', price: 8500, change: -200, unit: 'INR/ton', trend: 'down' },
        { name: 'Coal', price: 12000, change: 300, unit: 'INR/ton', trend: 'up' },
      ],
      outlook: 'Moderate growth expected with infrastructure push',
      risks: ['Raw material price volatility', 'Global demand fluctuations'],
      opportunities: ['Government infrastructure projects', 'Export opportunities'],
    },
    construction: {
      name: 'Construction & Infrastructure',
      stocks: [
        {
          symbol: 'LARSEN',
          name: 'L&T',
          price: 3450.0,
          change: 45.5,
          changePercent: 1.34,
          volume: 2345000,
        },
        {
          symbol: 'ACC',
          name: 'ACC Limited',
          price: 2340.0,
          change: -12.0,
          changePercent: -0.51,
          volume: 567800,
        },
        {
          symbol: 'ULTRACEMCO',
          name: 'UltraTech Cement',
          price: 7890.0,
          change: 89.0,
          changePercent: 1.14,
          volume: 123400,
        },
      ],
      commodities: [
        { name: 'Cement', price: 320, change: 5, unit: 'INR/bag', trend: 'up' },
        { name: 'Sand', price: 1800, change: 50, unit: 'INR/cubic meter', trend: 'up' },
        { name: 'Aggregate', price: 1200, change: 30, unit: 'INR/ton', trend: 'up' },
      ],
      outlook: 'Strong growth driven by government infrastructure spending',
      risks: ['Monsoon impact on construction', 'Material cost inflation'],
      opportunities: ['Smart city projects', 'Highway development'],
    },
    electronics: {
      name: 'Electronics & Technology',
      stocks: [
        {
          symbol: 'HCLTECH',
          name: 'HCL Technologies',
          price: 1234.5,
          change: 23.4,
          changePercent: 1.94,
          volume: 3456000,
        },
        {
          symbol: 'TCS',
          name: 'Tata Consultancy',
          price: 3456.0,
          change: -12.5,
          changePercent: -0.36,
          volume: 2345000,
        },
        {
          symbol: 'INFY',
          name: 'Infosys',
          price: 1567.8,
          change: 15.2,
          changePercent: 0.98,
          volume: 4567000,
        },
      ],
      commodities: [
        { name: 'Silicon', price: 4500, change: 200, unit: 'USD/ton', trend: 'up' },
        { name: 'Rare Earth Elements', price: 85000, change: 5000, unit: 'USD/ton', trend: 'up' },
        { name: 'Copper', price: 8500, change: -150, unit: 'USD/ton', trend: 'down' },
      ],
      outlook: 'Technology sector showing resilience with digital transformation',
      risks: ['Global semiconductor shortage', 'Currency fluctuations'],
      opportunities: ['Digital transformation demand', 'Cloud computing growth'],
    },
    textiles: {
      name: 'Textiles & Apparel',
      stocks: [
        {
          symbol: 'ARVIND',
          name: 'Arvind Limited',
          price: 234.5,
          change: 4.2,
          changePercent: 1.83,
          volume: 2345000,
        },
        {
          symbol: 'RAYMOND',
          name: 'Raymond',
          price: 456.0,
          change: -3.5,
          changePercent: -0.76,
          volume: 1234000,
        },
        {
          symbol: 'KPRMILL',
          name: 'KPR Mills',
          price: 789.0,
          change: 12.3,
          changePercent: 1.58,
          volume: 567800,
        },
      ],
      commodities: [
        { name: 'Cotton', price: 6500, change: 200, unit: 'INR/quintal', trend: 'up' },
        { name: 'Polyester', price: 85, change: -2, unit: 'INR/kg', trend: 'down' },
        { name: 'Wool', price: 450, change: 15, unit: 'INR/kg', trend: 'up' },
      ],
      outlook: 'Export demand driving growth in textile sector',
      risks: ['Raw material price fluctuations', 'Competition from Bangladesh'],
      opportunities: ['Export market expansion', 'Premium segment growth'],
    },
  };

  return industryData[industry.toLowerCase()] || industryData['steel'];
};

const calculateMarketTrends = (industry: string): StockTrendsResponse => {
  const data = getStockData(industry);

  // Calculate overall trend
  const avgChange =
    data.stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / data.stocks.length;
  let overallTrend: 'bullish' | 'bearish' | 'neutral';
  if (avgChange > 1) overallTrend = 'bullish';
  else if (avgChange < -1) overallTrend = 'bearish';
  else overallTrend = 'neutral';

  // Calculate confidence based on volume and consistency
  const confidence = Math.min(0.95, 0.7 + Math.abs(avgChange) * 0.1);

  // Calculate key indicators
  const priceMovement = avgChange;
  const volumeChange =
    data.stocks.reduce((sum, stock) => sum + stock.volume, 0) / data.stocks.length / 1000000; // Normalize
  const marketSentiment = overallTrend === 'bullish' ? 0.7 : overallTrend === 'bearish' ? 0.3 : 0.5;
  const volatility = Math.abs(avgChange) * 0.5;

  return {
    success: true,
    industry: data.name,
    trends: {
      overall: overallTrend,
      confidence: Math.round(confidence * 100) / 100,
      keyIndicators: {
        priceMovement: Math.round(priceMovement * 100) / 100,
        volumeChange: Math.round(volumeChange * 100) / 100,
        marketSentiment: Math.round(marketSentiment * 100) / 100,
        volatility: Math.round(volatility * 100) / 100,
      },
      topStocks: data.stocks,
      sectorAnalysis: {
        performance: Math.round(avgChange * 100) / 100,
        outlook: data.outlook,
        risks: data.risks,
        opportunities: data.opportunities,
      },
    },
    commodities: data.commodities,
    marketInsights: {
      summary: `The ${data.name} sector is showing ${overallTrend} trends with ${Math.round(confidence * 100)}% confidence. Key drivers include ${data.opportunities[0]?.toLowerCase() || 'market dynamics'}.`,
      recommendations: [
        'Monitor commodity price movements closely',
        'Consider hedging strategies for price volatility',
        'Focus on companies with strong fundamentals',
        'Diversify across sub-sectors to manage risk',
      ],
      riskFactors: [
        'Global economic uncertainty',
        'Currency fluctuations',
        'Regulatory changes',
        'Supply chain disruptions',
      ],
    },
    lastUpdated: new Date().toISOString(),
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry') || 'steel';

    console.log(`📈 Stock trends requested for industry: ${industry}`);

    const trends = calculateMarketTrends(industry);

    console.log(`✅ Stock trends analysis completed for ${industry}: ${trends.trends.overall}`);

    return NextResponse.json(trends);
  } catch (error) {
    console.error('❌ Stock trends analysis failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Stock trends analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { industries, analysisType } = await request.json();

    if (!industries || !Array.isArray(industries)) {
      return NextResponse.json({ error: 'Industries array is required' }, { status: 400 });
    }

    console.log(`📊 Bulk stock analysis requested for industries: ${industries.join(', ')}`);

    const bulkAnalysis = industries.map(industry => ({
      industry,
      trends: calculateMarketTrends(industry),
    }));

    // Calculate cross-industry insights
    const avgConfidence =
      bulkAnalysis.reduce((sum, item) => sum + item.trends.trends.confidence, 0) /
      bulkAnalysis.length;
    const bullishCount = bulkAnalysis.filter(
      item => item.trends.trends.overall === 'bullish'
    ).length;
    const bearishCount = bulkAnalysis.filter(
      item => item.trends.trends.overall === 'bearish'
    ).length;

    const crossIndustryInsights = {
      totalIndustries: industries.length,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      marketSentiment:
        bullishCount > bearishCount
          ? 'bullish'
          : bearishCount > bullishCount
            ? 'bearish'
            : 'neutral',
      topPerformingIndustry: bulkAnalysis.reduce((top, current) =>
        current.trends.trends.keyIndicators.priceMovement >
        top.trends.trends.keyIndicators.priceMovement
          ? current
          : top
      ).industry,
      recommendations: [
        'Diversify investments across multiple sectors',
        'Focus on sectors with positive momentum',
        'Monitor commodity price correlations',
        'Consider sector rotation strategies',
      ],
    };

    return NextResponse.json({
      success: true,
      analysis: bulkAnalysis,
      crossIndustryInsights,
      analysisType: analysisType || 'comprehensive',
    });
  } catch (error) {
    console.error('❌ Bulk stock analysis failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Bulk stock analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
