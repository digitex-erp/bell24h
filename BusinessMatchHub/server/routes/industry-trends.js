/**
 * Industry Trends API Routes
 * Provides data for the Industry Trend Analyzer
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../db');

// Cache data to reduce API calls
const cache = {
  data: {},
  timestamp: {}
};

// Cache expiration time (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

/**
 * Get industry trend data based on industry, region, and timeframe
 */
router.get('/api/industry-trends', async (req, res) => {
  try {
    const { industry, region = 'global', timeframe = '1y', dataSource = 'all' } = req.query;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry parameter is required' });
    }
    
    // Check cache first
    const cacheKey = `${industry}-${region}-${timeframe}-${dataSource}`;
    if (cache.data[cacheKey] && (Date.now() - cache.timestamp[cacheKey] < CACHE_EXPIRATION)) {
      return res.json(cache.data[cacheKey]);
    }
    
    // Fetch data from database if available
    const dbData = await getStoredIndustryData(industry, region, timeframe);
    if (dbData) {
      // Update cache
      cache.data[cacheKey] = dbData;
      cache.timestamp[cacheKey] = Date.now();
      return res.json(dbData);
    }
    
    // Fetch from external API if data not in database
    const apiData = await fetchIndustryDataFromAPI(industry, region, timeframe, dataSource);
    
    // Update cache
    cache.data[cacheKey] = apiData;
    cache.timestamp[cacheKey] = Date.now();
    
    // Store in database for future use
    await storeIndustryData(industry, region, timeframe, apiData);
    
    res.json(apiData);
  } catch (error) {
    console.error('Error fetching industry trend data:', error);
    res.status(500).json({ error: 'Failed to fetch industry trend data' });
  }
});

/**
 * Get top traded commodities for an industry
 */
router.get('/api/industry-trends/commodities', async (req, res) => {
  try {
    const { industry } = req.query;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry parameter is required' });
    }
    
    // Get commodity list based on industry
    const commodities = await getCommoditiesForIndustry(industry);
    
    // Get commodity price data
    const commodityData = await Promise.all(
      commodities.map(async (commodity) => {
        const priceData = await fetchCommodityPriceData(commodity.symbol);
        return {
          ...commodity,
          priceData
        };
      })
    );
    
    res.json(commodityData);
  } catch (error) {
    console.error('Error fetching commodity data:', error);
    res.status(500).json({ error: 'Failed to fetch commodity data' });
  }
});

/**
 * Get export/import data for specific countries and regions
 */
router.get('/api/industry-trends/trade-flow', async (req, res) => {
  try {
    const { industry, region } = req.query;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry parameter is required' });
    }
    
    // Get trade flow data
    const tradeFlowData = await fetchTradeFlowData(industry, region);
    
    res.json(tradeFlowData);
  } catch (error) {
    console.error('Error fetching trade flow data:', error);
    res.status(500).json({ error: 'Failed to fetch trade flow data' });
  }
});

/**
 * Generate AI-powered industry insight report
 */
router.get('/api/industry-trends/insights', async (req, res) => {
  try {
    const { industry, region } = req.query;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry parameter is required' });
    }
    
    // Get AI insights
    const insights = await generateIndustryInsights(industry, region);
    
    res.json(insights);
  } catch (error) {
    console.error('Error generating industry insights:', error);
    res.status(500).json({ error: 'Failed to generate industry insights' });
  }
});

/**
 * Fetch industry data from database
 */
async function getStoredIndustryData(industry, region, timeframe) {
  try {
    // Query existing market data for this industry from our database
    const result = await pool.query(
      'SELECT data FROM market_data WHERE industry = $1 AND data->>\'region\' = $2 AND data->>\'timeframe\' = $3 ORDER BY timestamp DESC LIMIT 1',
      [industry, region, timeframe]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching industry data from database:', error);
    return null;
  }
}

/**
 * Store industry data in database
 */
async function storeIndustryData(industry, region, timeframe, data) {
  try {
    // Add metadata to the data object
    const dataWithMetadata = {
      ...data,
      region,
      timeframe,
      fetchedAt: new Date().toISOString()
    };
    
    // Store in market_data table
    await pool.query(
      'INSERT INTO market_data (industry, symbol, data, timestamp) VALUES ($1, $2, $3, NOW())',
      [industry, `${industry}-${region}-${timeframe}`, dataWithMetadata]
    );
  } catch (error) {
    console.error('Error storing industry data:', error);
  }
}

/**
 * Fetch industry data from external API
 */
async function fetchIndustryDataFromAPI(industry, region, timeframe, dataSource) {
  try {
    // In a real implementation, this would make API calls to various market data providers
    // For now, using a combination of public APIs
    
    // If India-specific data is requested, use Indian market data APIs
    if (region === 'india' || region === 'asia_pacific') {
      return await fetchIndianMarketData(industry, timeframe);
    }
    
    // For global data, use a general approach
    return await fetchGlobalMarketData(industry, region, timeframe);
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
}

/**
 * Fetch Indian market data for a given industry
 */
async function fetchIndianMarketData(industry, timeframe) {
  // Map industries to relevant Indian market indices or symbols
  const industryToSymbol = {
    'electronics': 'NIFTYIT',     // Nifty IT index
    'textiles': 'NIFTYCONSUMER',  // Nifty Consumer Durables
    'machinery': 'NIFTYMFG',      // Nifty Manufacturing
    'chemicals': 'NIFTYPHARMA',   // Nifty Pharma
    'automotive': 'NIFTYAUTO',    // Nifty Auto
    'food': 'NIFTYFMCG'           // Nifty FMCG
  };
  
  const symbol = industryToSymbol[industry] || 'NIFTY50';
  
  try {
    // Attempt to fetch from NSE API or alternative free source
    // For now, we'll simulate the data structure for demo purposes
    // In production, this would connect to an actual Indian market data API
    
    // Build data structure that matches our frontend expectations
    return generateMockDataStructure(industry, 'india', timeframe);
  } catch (error) {
    console.error('Error fetching Indian market data:', error);
    throw error;
  }
}

/**
 * Fetch global market data
 */
async function fetchGlobalMarketData(industry, region, timeframe) {
  try {
    // In a real implementation, fetch from global market data API
    // Build data structure that matches our frontend expectations
    return generateMockDataStructure(industry, region, timeframe);
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
}

/**
 * Get list of commodities relevant to an industry
 */
async function getCommoditiesForIndustry(industry) {
  // Map industries to relevant commodities
  const industryCommodities = {
    'electronics': [
      { name: 'Copper', symbol: 'COPPER', unit: 'USD/tonne' },
      { name: 'Lithium', symbol: 'LITHIUM', unit: 'USD/tonne' },
      { name: 'Gold', symbol: 'GOLD', unit: 'USD/oz' },
      { name: 'Silver', symbol: 'SILVER', unit: 'USD/oz' },
      { name: 'Semiconductor Index', symbol: 'SOX', unit: 'Index' }
    ],
    'textiles': [
      { name: 'Cotton', symbol: 'COTTON', unit: 'USD/lb' },
      { name: 'Wool', symbol: 'WOOL', unit: 'AUD/kg' },
      { name: 'Polyester', symbol: 'POLYESTER', unit: 'USD/kg' }
    ],
    'machinery': [
      { name: 'Steel', symbol: 'STEEL', unit: 'USD/tonne' },
      { name: 'Aluminum', symbol: 'ALUMINUM', unit: 'USD/tonne' },
      { name: 'Copper', symbol: 'COPPER', unit: 'USD/tonne' }
    ],
    'chemicals': [
      { name: 'Crude Oil', symbol: 'CRUDE_OIL', unit: 'USD/barrel' },
      { name: 'Natural Gas', symbol: 'NATURAL_GAS', unit: 'USD/MMBtu' },
      { name: 'Ethanol', symbol: 'ETHANOL', unit: 'USD/gallon' }
    ],
    'automotive': [
      { name: 'Steel', symbol: 'STEEL', unit: 'USD/tonne' },
      { name: 'Aluminum', symbol: 'ALUMINUM', unit: 'USD/tonne' },
      { name: 'Rubber', symbol: 'RUBBER', unit: 'USD/kg' },
      { name: 'Lithium', symbol: 'LITHIUM', unit: 'USD/tonne' }
    ],
    'food': [
      { name: 'Wheat', symbol: 'WHEAT', unit: 'USD/bushel' },
      { name: 'Corn', symbol: 'CORN', unit: 'USD/bushel' },
      { name: 'Sugar', symbol: 'SUGAR', unit: 'USD/lb' },
      { name: 'Coffee', symbol: 'COFFEE', unit: 'USD/lb' },
      { name: 'Rice', symbol: 'RICE', unit: 'USD/cwt' }
    ]
  };
  
  return industryCommodities[industry] || [];
}

/**
 * Fetch commodity price data
 */
async function fetchCommodityPriceData(symbol) {
  try {
    // In a real implementation, fetch from commodity price API
    // For now, generate simulated historical price data
    
    const now = new Date();
    const data = [];
    
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      
      data.unshift({
        date: date.toISOString().slice(0, 10),
        price: Math.random() * 100 + 50, // Random price between 50 and 150
        volume: Math.floor(Math.random() * 1000000) + 100000 // Random volume
      });
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching price data for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch trade flow data
 */
async function fetchTradeFlowData(industry, region = 'global') {
  try {
    // In a real implementation, fetch from trade statistics API
    // For now, return simulated data
    
    const countries = ['China', 'India', 'USA', 'Germany', 'Japan', 'South Korea', 'Vietnam', 'Mexico', 'Brazil', 'UK'];
    const tradeData = countries.map(country => ({
      country,
      exports: Math.floor(Math.random() * 300) + 20, // Random export value (billions USD)
      imports: Math.floor(Math.random() * 250) + 20, // Random import value (billions USD)
      growth: (Math.random() * 20 - 5).toFixed(1) // Growth rate (-5% to +15%)
    }));
    
    // Sort by export volume
    tradeData.sort((a, b) => b.exports - a.exports);
    
    return {
      topExporters: tradeData.slice(0, 8),
      topImporters: [...tradeData].sort((a, b) => b.imports - a.imports).slice(0, 8),
      tradeBalance: tradeData.map(item => ({
        country: item.country,
        balance: item.exports - item.imports
      }))
    };
  } catch (error) {
    console.error('Error fetching trade flow data:', error);
    return { topExporters: [], topImporters: [], tradeBalance: [] };
  }
}

/**
 * Generate insights about industry trends using AI
 */
async function generateIndustryInsights(industry, region = 'global') {
  try {
    // In a real implementation, this would use OpenAI API to generate insights
    // Since we're mocking for now, return predefined insights based on industry
    
    const insights = {
      'electronics': {
        keyTrends: [
          'Semiconductor shortages affecting supply chains',
          'Rising demand for IoT devices',
          'Increasing focus on sustainable electronics manufacturing'
        ],
        buyerRecommendations: [
          'Secure long-term contracts with suppliers to mitigate shortage risks',
          'Consider diversifying supply chain across multiple regions',
          'Monitor developments in Vietnam and Malaysia as emerging electronics manufacturing hubs'
        ],
        supplierRecommendations: [
          'Highlight sustainability practices in your product offerings',
          'Invest in IoT capabilities to meet growing demand',
          'Consider offering flexible payment terms to secure long-term contracts'
        ],
        riskFactors: [
          'Supply chain disruptions',
          'Increasing component costs',
          'Geopolitical tensions affecting semiconductor production'
        ],
        opportunities: [
          'Green electronics market expansion',
          'Rising demand in emerging markets',
          'New applications in medical and automotive sectors'
        ]
      },
      'textiles': {
        keyTrends: [
          'Shift towards sustainable and ethical manufacturing',
          'Growing demand for technical textiles',
          'Increasing automation in production'
        ],
        buyerRecommendations: [
          'Look for suppliers with sustainable practices certification',
          'Explore innovative materials with lower environmental impact',
          'Consider diversifying sourcing beyond traditional hubs like China'
        ],
        supplierRecommendations: [
          'Highlight sustainability credentials and ethical manufacturing',
          'Invest in technical textile capabilities',
          'Develop transparent supply chain documentation'
        ],
        riskFactors: [
          'Volatile cotton prices',
          'Increasing labor costs in traditional manufacturing countries',
          'Environmental regulations affecting production processes'
        ],
        opportunities: [
          'Growing market for recycled and sustainable textiles',
          'Expanding technical textile applications',
          'Direct-to-consumer models reducing intermediaries'
        ]
      }
    };
    
    // Return insights for the requested industry, or general insights if industry not specifically covered
    return insights[industry] || {
      keyTrends: [
        'Increasing digitalization across the supply chain',
        'Growing focus on sustainability and environmental impact',
        'Shift towards more regional/localized production'
      ],
      buyerRecommendations: [
        'Develop relationships with suppliers in multiple regions',
        'Invest in digital tools for better supply chain visibility',
        'Consider total cost of ownership beyond just unit price'
      ],
      supplierRecommendations: [
        'Highlight quality and reliability in uncertain markets',
        'Develop capabilities to serve regional markets directly',
        'Invest in sustainability credentials'
      ],
      riskFactors: [
        'Supply chain disruptions',
        'Volatile commodity prices',
        'Changing regulatory environment'
      ],
      opportunities: [
        'New markets opening due to trade agreements',
        'Digital transformation reducing operational costs',
        'Growing demand for sustainable products'
      ]
    };
  } catch (error) {
    console.error('Error generating industry insights:', error);
    throw error;
  }
}

/**
 * Helper function to generate data structure matching frontend expectations
 * This is used to provide realistic data until API integration is complete
 */
function generateMockDataStructure(industry, region, timeframe) {
  // Generate realistic market growth rates based on industry
  const growthRateBase = {
    'electronics': 8.4,
    'textiles': 4.7,
    'machinery': 6.2,
    'chemicals': 5.8,
    'automotive': 3.9,
    'food': 4.3
  }[industry] || 5.0;
  
  // Adjust based on region
  const regionMultiplier = {
    'global': 1.0,
    'asia_pacific': 1.3,
    'india': 1.4,
    'europe': 0.8,
    'north_america': 0.9,
    'middle_east': 1.1,
    'africa': 1.2
  }[region] || 1.0;
  
  const growthRate = (growthRateBase * regionMultiplier).toFixed(1);
  
  // Market composition data (varies by industry)
  const marketComposition = {
    'electronics': [
      { name: 'Semiconductors', value: 28.5 },
      { name: 'Displays & Optoelectronics', value: 21.2 },
      { name: 'Printed Circuit Boards', value: 18.7 },
      { name: 'Batteries & Power', value: 14.3 },
      { name: 'Connectors & Cables', value: 10.5 },
      { name: 'Others', value: 6.8 }
    ],
    'textiles': [
      { name: 'Apparel', value: 42.3 },
      { name: 'Home Textiles', value: 18.7 },
      { name: 'Technical Textiles', value: 15.5 },
      { name: 'Yarn & Fabric', value: 14.2 },
      { name: 'Others', value: 9.3 }
    ],
    'machinery': [
      { name: 'Industrial Equipment', value: 35.2 },
      { name: 'Electrical Machinery', value: 22.5 },
      { name: 'Agricultural Machinery', value: 18.3 },
      { name: 'Construction Machinery', value: 15.7 },
      { name: 'Others', value: 8.3 }
    ]
  }[industry] || [
    { name: 'Segment 1', value: 30 },
    { name: 'Segment 2', value: 25 },
    { name: 'Segment 3', value: 20 },
    { name: 'Segment 4', value: 15 },
    { name: 'Others', value: 10 }
  ];
  
  // Generate 12 month price trend data
  const now = new Date();
  const rawPriceData = [];
  const processedPriceData = [];
  
  let rawBaseline = 100;
  let processedBaseline = 100;
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (11 - i));
    
    // Add some randomness but maintain an upward trend
    const rawChange = (Math.random() * 5) - 1.5;
    const processedChange = (Math.random() * 6) - 1;
    
    rawBaseline += rawChange;
    processedBaseline += processedChange + 1; // Processed materials generally increase faster
    
    rawPriceData.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      value: Math.round(rawBaseline * 10) / 10
    });
    
    processedPriceData.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      value: Math.round(processedBaseline * 10) / 10
    });
  }
  
  // Sub-industry analysis (varies by industry)
  const subIndustryAnalysis = {
    'electronics': [
      { name: 'Semiconductors', growth: '+12.8%', marketShare: '28.5%', priceTrend: 'Rising', supplyDemand: '0.85', leadTime: '45' },
      { name: 'Displays & Optoelectronics', growth: '+7.3%', marketShare: '21.2%', priceTrend: 'Stable', supplyDemand: '1.05', leadTime: '32' },
      { name: 'Printed Circuit Boards', growth: '+9.1%', marketShare: '18.7%', priceTrend: 'Rising', supplyDemand: '0.95', leadTime: '28' },
      { name: 'Batteries & Power', growth: '+15.2%', marketShare: '14.3%', priceTrend: 'Rising', supplyDemand: '0.92', leadTime: '35' },
      { name: 'Connectors & Cables', growth: '+5.8%', marketShare: '10.5%', priceTrend: 'Stable', supplyDemand: '1.15', leadTime: '21' },
      { name: 'Others', growth: '-1.2%', marketShare: '6.8%', priceTrend: 'Falling', supplyDemand: '1.28', leadTime: '25' }
    ]
  }[industry] || [
    { name: 'Segment 1', growth: '+9.8%', marketShare: '30.0%', priceTrend: 'Rising', supplyDemand: '0.90', leadTime: '30' },
    { name: 'Segment 2', growth: '+6.3%', marketShare: '25.0%', priceTrend: 'Stable', supplyDemand: '1.00', leadTime: '25' },
    { name: 'Segment 3', growth: '+4.1%', marketShare: '20.0%', priceTrend: 'Stable', supplyDemand: '1.05', leadTime: '28' },
    { name: 'Segment 4', growth: '+7.2%', marketShare: '15.0%', priceTrend: 'Rising', supplyDemand: '0.95', leadTime: '32' },
    { name: 'Others', growth: '+2.8%', marketShare: '10.0%', priceTrend: 'Falling', supplyDemand: '1.20', leadTime: '24' }
  ];
  
  // Return structured data
  return {
    industry,
    region,
    timeframe,
    lastUpdated: new Date().toISOString(),
    marketSize: {
      value: Math.floor(Math.random() * 500) + 200, // Random market size between 200-700 billion
      currency: 'USD',
      unit: 'billion',
      growthRate: parseFloat(growthRate)
    },
    keyMetrics: {
      marketGrowthRate: parseFloat(growthRate),
      priceIndex: 112.5 + (Math.random() * 10 - 5),
      supplyDemandRatio: 1.03 + (Math.random() * 0.2 - 0.1),
      averageLeadTime: Math.floor(Math.random() * 10) + 25 // 25-35 days
    },
    priceTrends: {
      raw: rawPriceData,
      processed: processedPriceData
    },
    marketComposition,
    subIndustryAnalysis,
    tradeFlow: {
      topExporters: [
        { country: 'China', value: 320 },
        { country: 'Germany', value: 95 },
        { country: 'United States', value: 85 },
        { country: 'Japan', value: 75 },
        { country: 'South Korea', value: 65 },
        { country: 'India', value: 45 },
        { country: 'Italy', value: 40 },
        { country: 'France', value: 35 }
      ],
      topImporters: [
        { country: 'United States', value: 240 },
        { country: 'China', value: 180 },
        { country: 'Germany', value: 110 },
        { country: 'Japan', value: 85 },
        { country: 'United Kingdom', value: 70 },
        { country: 'France', value: 65 },
        { country: 'India', value: 55 },
        { country: 'Italy', value: 50 }
      ]
    }
  };
}

module.exports = router;