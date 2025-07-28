import { NextRequest, NextResponse } from 'next/server';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  timestamp: string;
}

interface MarketTrends {
  nifty50: StockData;
  sensex: StockData;
  sectorPerformance: {
    [sector: string]: {
      change: number;
      topGainers: string[];
      topLosers: string[];
    };
  };
  commodityPrices: {
    gold: number;
    silver: number;
    crudeOil: number;
    copper: number;
  };
  currencyRates: {
    usd: number;
    eur: number;
    gbp: number;
    jpy: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'NIFTY50';
    const interval = searchParams.get('interval') || 'daily';

    // Mock stock data (in production, use Alpha Vantage API)
    const mockStockData: { [key: string]: StockData } = {
      'NIFTY50': {
        symbol: 'NIFTY50',
        price: 22450.75,
        change: 125.50,
        changePercent: 0.56,
        volume: 125000000,
        marketCap: 1250000000000,
        peRatio: 22.5,
        dividendYield: 1.2,
        timestamp: new Date().toISOString()
      },
      'SENSEX': {
        symbol: 'SENSEX',
        price: 73850.25,
        change: 425.75,
        changePercent: 0.58,
        volume: 98000000,
        marketCap: 1850000000000,
        peRatio: 23.1,
        dividendYield: 1.1,
        timestamp: new Date().toISOString()
      },
      'TATAMOTORS': {
        symbol: 'TATAMOTORS',
        price: 985.50,
        change: 15.25,
        changePercent: 1.57,
        volume: 8500000,
        marketCap: 325000000000,
        peRatio: 18.5,
        dividendYield: 0.8,
        timestamp: new Date().toISOString()
      },
      'RELIANCE': {
        symbol: 'RELIANCE',
        price: 2850.75,
        change: -25.50,
        changePercent: -0.88,
        volume: 6500000,
        marketCap: 1850000000000,
        peRatio: 25.2,
        dividendYield: 0.6,
        timestamp: new Date().toISOString()
      },
      'TCS': {
        symbol: 'TCS',
        price: 3850.25,
        change: 45.75,
        changePercent: 1.20,
        volume: 3200000,
        marketCap: 1420000000000,
        peRatio: 28.5,
        dividendYield: 1.5,
        timestamp: new Date().toISOString()
      }
    };

    const marketTrends: MarketTrends = {
      nifty50: mockStockData['NIFTY50'],
      sensex: mockStockData['SENSEX'],
      sectorPerformance: {
        'Automotive': {
          change: 1.2,
          topGainers: ['TATAMOTORS', 'MARUTI', 'HEROMOTOCO'],
          topLosers: ['ASHOKLEY', 'TVSMOTOR']
        },
        'Technology': {
          change: 0.8,
          topGainers: ['TCS', 'INFY', 'WIPRO'],
          topLosers: ['HCLTECH', 'TECHM']
        },
        'Banking': {
          change: 0.5,
          topGainers: ['HDFCBANK', 'ICICIBANK', 'SBIN'],
          topLosers: ['AXISBANK', 'KOTAKBANK']
        },
        'Energy': {
          change: -0.3,
          topGainers: ['ONGC', 'IOC'],
          topLosers: ['RELIANCE', 'BPCL']
        },
        'Pharmaceuticals': {
          change: 0.9,
          topGainers: ['SUNPHARMA', 'DRREDDY', 'CIPLA'],
          topLosers: ['DIVISLAB', 'APOLLOHOSP']
        }
      },
      commodityPrices: {
        gold: 62500, // per 10 grams
        silver: 75000, // per kg
        crudeOil: 6500, // per barrel
        copper: 850 // per kg
      },
      currencyRates: {
        usd: 83.25,
        eur: 90.50,
        gbp: 105.75,
        jpy: 0.55
      }
    };

    // Get specific stock data if requested
    const stockData = mockStockData[symbol] || mockStockData['NIFTY50'];

    // Generate market insights
    const marketInsights = generateMarketInsights(marketTrends);

    return NextResponse.json({
      success: true,
      data: {
        stockData,
        marketTrends,
        insights: marketInsights,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Stock data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data', details: error },
      { status: 500 }
    );
  }
}

function generateMarketInsights(trends: MarketTrends) {
  const insights = {
    marketSentiment: trends.nifty50.changePercent > 0 ? 'BULLISH' : 'BEARISH',
    topPerformingSector: Object.entries(trends.sectorPerformance)
      .sort(([,a], [,b]) => b.change - a.change)[0][0],
    worstPerformingSector: Object.entries(trends.sectorPerformance)
      .sort(([,a], [,b]) => a.change - b.change)[0][0],
    commodityTrend: trends.commodityPrices.gold > 62000 ? 'GOLD_BULLISH' : 'GOLD_BEARISH',
    currencyTrend: trends.currencyRates.usd > 83 ? 'USD_STRONG' : 'USD_WEAK',
    recommendations: [
      "Automotive sector showing strong momentum - good for auto component suppliers",
      "Technology stocks gaining - positive for IT service providers",
      "Gold prices stable - good for jewelry manufacturers",
      "USD strengthening - favorable for export-oriented businesses"
    ],
    riskFactors: [
      "Global market volatility may impact Indian markets",
      "Monsoon uncertainty could affect agricultural commodity prices",
      "Geopolitical tensions may impact crude oil prices"
    ]
  };

  return insights;
}

// Alpha Vantage API integration (for production)
async function fetchAlphaVantageData(symbol: string, interval: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const baseUrl = 'https://www.alphavantage.co/query';
  
  try {
    const response = await fetch(
      `${baseUrl}?function=TIME_SERIES_${interval.toUpperCase()}&symbol=${symbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    throw error;
  }
} 