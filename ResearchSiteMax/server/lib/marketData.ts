/**
 * Market Data Service
 * 
 * This module provides functions for retrieving and analyzing market data.
 * For a production environment, this would integrate with real-time market data APIs.
 * For this demo, it uses simulated data to avoid external API dependencies.
 */

/**
 * Generate market data for the specified industry
 * @param industry Industry for which to generate data
 * @returns Market data
 */
export async function getMarketData(industry: string): Promise<any> {
  try {
    // Get the appropriate trend data for the industry
    const trendData = await getTrendData(industry);
    
    // Calculate some analytics
    const values = trendData.data.values;
    const volatility = calculateVolatility(values);
    const change = values[values.length - 1] - values[0];
    const percentChange = (change / values[0]) * 100;
    
    return {
      industry,
      symbol: trendData.symbol,
      data: trendData.data,
      analytics: {
        volatility,
        percentChange,
        trend: percentChange > 0 ? 'up' : 'down',
        riskLevel: volatility > 2 ? 'high' : volatility > 1 ? 'medium' : 'low'
      }
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw new Error("Failed to retrieve market data");
  }
}

/**
 * Get trend data for a specific industry
 */
async function getTrendData(industry: string): Promise<any> {
  // Map industry to appropriate market sector
  const symbol = industrySymbolMap[industry] || "SPY"; // Default to S&P 500 ETF
  
  // Generate realistic-looking data for the industry
  return {
    industry,
    symbol,
    data: {
      dates: generateDates(30),
      values: generateRealisticValues(30, industry),
    }
  };
}

/**
 * Calculate volatility from an array of values
 * @param values Array of numeric values
 * @returns Volatility as a percentage
 */
function calculateVolatility(values: number[]): number {
  if (values.length <= 1) return 0;
  
  // Calculate average
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Calculate variance
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  
  // Standard deviation as a percentage of the average
  return Math.sqrt(variance) / avg * 100;
}

/**
 * Get top industry recommendations based on market data
 * @returns Array of industry recommendations
 */
export async function getIndustryRecommendations(): Promise<any[]> {
  const industries = Object.keys(industrySymbolMap);
  const recommendations = [];
  
  for (const industry of industries.slice(0, 5)) { // Limit to 5 industries
    const marketData = await getMarketData(industry);
    recommendations.push({
      industry,
      percentChange: marketData.analytics.percentChange,
      riskLevel: marketData.analytics.riskLevel,
      trend: marketData.analytics.trend,
      recommendation: marketData.analytics.percentChange > 2 ? 'strong_buy' : 
                      marketData.analytics.percentChange > 0 ? 'buy' : 
                      marketData.analytics.percentChange > -2 ? 'hold' : 'sell'
    });
  }
  
  // Sort by recommendation strength
  return recommendations.sort((a, b) => {
    const rankMap: Record<string, number> = { 'strong_buy': 4, 'buy': 3, 'hold': 2, 'sell': 1 };
    return rankMap[b.recommendation] - rankMap[a.recommendation];
  });
}

/**
 * Get market trends for dashboard
 * @returns Market trend data
 */
export async function getMarketTrends(): Promise<any> {
  const industries = Object.keys(industrySymbolMap);
  const trends: Record<string, any> = {};
  
  for (const industry of industries) {
    const data = await getTrendData(industry);
    trends[industry] = {
      current: data.data.values[data.data.values.length - 1],
      previous: data.data.values[data.data.values.length - 2],
      change: data.data.values[data.data.values.length - 1] - data.data.values[data.data.values.length - 2],
      data: data.data
    };
  }
  
  return trends;
}

// Maps industry to appropriate stock symbols
const industrySymbolMap: Record<string, string> = {
  "Electronics": "XLK", // Technology sector ETF
  "Manufacturing": "XLI", // Industrial sector ETF
  "Chemicals": "XLB", // Materials sector ETF
  "Textiles": "XLP", // Consumer Staples sector ETF
  "Auto Parts": "CARZ", // Global Auto Index ETF
  "Pharmaceuticals": "XPH", // Pharmaceutical ETF
  "Food & Beverages": "XLP", // Consumer Staples sector ETF
  "Construction": "XHB", // Homebuilders ETF
  "IT Services": "IGV", // Software ETF
  "Energy": "XLE", // Energy sector ETF
  "Finance": "XLF", // Financial sector ETF
  "Retail": "XRT", // Retail sector ETF
};

/**
 * Helper function to generate dates for the last n days
 */
function generateDates(days: number): string[] {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  
  return dates;
}

/**
 * Helper function to generate realistic-looking values for an industry
 */
function generateRealisticValues(count: number, industry: string): number[] {
  const values = [];
  let baseValue = 100;
  
  // Different industries have different volatility and trends
  const trendMap: Record<string, { trend: number, volatility: number }> = {
    "Electronics": { trend: 0.4, volatility: 2.2 },
    "Manufacturing": { trend: 0.2, volatility: 1.5 },
    "Chemicals": { trend: 0.1, volatility: 1.2 },
    "Textiles": { trend: -0.1, volatility: 1.0 },
    "Auto Parts": { trend: 0.3, volatility: 1.8 },
    "Pharmaceuticals": { trend: 0.2, volatility: 1.7 },
    "Food & Beverages": { trend: 0.05, volatility: 0.8 },
    "Construction": { trend: 0.15, volatility: 1.4 },
    "IT Services": { trend: 0.5, volatility: 2.5 },
    "Energy": { trend: -0.2, volatility: 2.0 },
    "Finance": { trend: 0.1, volatility: 1.6 },
    "Retail": { trend: -0.1, volatility: 1.3 },
    "Default": { trend: 0.1, volatility: 1.5 }
  };
  
  const { trend, volatility } = trendMap[industry] || trendMap["Default"];
  
  for (let i = 0; i < count; i++) {
    // Add random movement with trend
    baseValue += (Math.random() - 0.5) * volatility + trend;
    values.push(Math.max(baseValue, 0));
  }
  
  return values;
}