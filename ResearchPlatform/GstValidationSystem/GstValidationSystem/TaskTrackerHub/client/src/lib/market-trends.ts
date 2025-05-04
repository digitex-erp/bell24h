// Mock data generator for India stock market trends
// This would be replaced with real data from Alpha Vantage API in production

export interface MarketTrendPoint {
  date: string;
  current: number;
  predicted?: number;
}

export interface MarketInsight {
  trend: "up" | "down" | "stable";
  value: number;
  description: string;
}

export interface MarketTrendData {
  sector: string;
  data: MarketTrendPoint[];
  insights: MarketInsight[];
}

/**
 * Generate market trend data for visualization
 * @param sector Sector to generate data for
 * @returns Array of data points for charting
 */
export function getMarketTrendData(sector: string): MarketTrendPoint[] {
  // Use the sector to seed our random data generation
  // This ensures consistent data for the same sector
  const sectorSeed = getSectorSeed(sector);
  
  // Current date
  const today = new Date();
  
  // Generate data for the last 30 days and next 7 days (predicted)
  const data: MarketTrendPoint[] = [];
  
  // Base value depends on sector
  let baseValue = 100;
  if (sector === "Electronics") baseValue = 110;
  if (sector === "Semiconductors") baseValue = 140;
  if (sector === "Manufacturing") baseValue = 90;
  if (sector === "Renewables") baseValue = 120;
  
  // Volatility factor by sector
  let volatility = 0.02; // 2% daily volatility
  if (sector === "Semiconductors") volatility = 0.03;
  if (sector === "Renewables") volatility = 0.025;
  
  // Define a trend by sector (slight upward or downward bias)
  let trend = 0.001; // 0.1% upward trend per day
  if (sector === "Electronics") trend = 0.002;
  if (sector === "Manufacturing") trend = -0.0005;
  if (sector === "Renewables") trend = 0.003;
  
  // Generate historical data (last 30 days)
  let currentValue = baseValue;
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add noise to the trend
    const noise = ((Math.sin(i * sectorSeed) + 1) / 2) * volatility * 2 - volatility;
    currentValue = currentValue * (1 + trend + noise);
    
    data.push({
      date: date.toISOString().split('T')[0],
      current: Math.round(currentValue * 100) / 100,
    });
  }
  
  // Today's value
  currentValue = currentValue * (1 + trend + ((Math.sin(0 * sectorSeed) + 1) / 2) * volatility * 2 - volatility);
  data.push({
    date: today.toISOString().split('T')[0],
    current: Math.round(currentValue * 100) / 100,
  });
  
  // Generate future predictions (next 7 days)
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Add noise to the trend with more uncertainty for further dates
    const uncertainty = 1 + (i / 7) * 0.5; // 50% more uncertainty by day 7
    const noise = ((Math.sin(i * sectorSeed + 31) + 1) / 2) * volatility * 2 * uncertainty - volatility * uncertainty;
    currentValue = currentValue * (1 + trend + noise);
    
    // For historical data points, we add "current" value
    // For predicted data points, we add "predicted" value
    data.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(currentValue * 100) / 100,
    });
  }
  
  return data;
}

/**
 * Get market insights for a specific sector
 * @param sector Sector to generate insights for
 * @returns Array of market insights
 */
export function getMarketInsights(sector: string): MarketInsight[] {
  const sectorSeed = getSectorSeed(sector);
  const insights: MarketInsight[] = [];
  
  // Sector-specific insights
  switch (sector) {
    case "Electronics":
      if (sectorSeed > 0.5) {
        insights.push({
          trend: "up",
          value: 12,
          description: "Semiconductor Shortage Easing: Expected 12% increase in supply over next quarter"
        });
      } else {
        insights.push({
          trend: "down",
          value: 8,
          description: "Component Costs Rising: 8% increase in material costs expected"
        });
      }
      break;
      
    case "Semiconductors":
      if (sectorSeed > 0.6) {
        insights.push({
          trend: "up",
          value: 15,
          description: "Chip Demand Surging: 15% growth in automotive semiconductor demand"
        });
      } else {
        insights.push({
          trend: "up",
          value: 7,
          description: "Production Capacity Expanding: 7% increase in global fabrication capacity"
        });
      }
      break;
      
    case "Manufacturing":
      if (sectorSeed > 0.4) {
        insights.push({
          trend: "down",
          value: 5,
          description: "Labor Shortages Impacting: 5% decline in production efficiency reported"
        });
      } else {
        insights.push({
          trend: "up",
          value: 10,
          description: "Automation Adoption Rising: 10% increase in factory automation investments"
        });
      }
      break;
      
    case "Renewables":
      insights.push({
        trend: "up",
        value: 18,
        description: "Solar Panel Prices Dropping: 18% reduction in cost over past 12 months"
      });
      break;
      
    default:
      insights.push({
        trend: "up",
        value: 9,
        description: "Industry Growth Trend: 9% year-over-year expansion expected"
      });
  }
  
  // Common materials insight
  const materialTrend = sectorSeed > 0.5 ? "up" : "down";
  const materialValue = Math.round(sectorSeed * 15);
  insights.push({
    trend: materialTrend,
    value: materialValue,
    description: `${materialTrend === "up" ? "Copper Prices Increasing" : "Aluminum Prices Stabilizing"}: ${materialValue}% ${materialTrend === "up" ? "price increase" : "price reduction"} over last month`
  });
  
  return insights;
}

/**
 * Generate a consistent seed value for a sector
 * @param sector Sector name
 * @returns Seed value between 0 and 1
 */
function getSectorSeed(sector: string): number {
  // Simple hash function to get a consistent seed for the same sector
  let hash = 0;
  for (let i = 0; i < sector.length; i++) {
    hash = ((hash << 5) - hash) + sector.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to value between 0 and 1
  return (hash & 0x7FFFFFFF) / 0x7FFFFFFF;
}
