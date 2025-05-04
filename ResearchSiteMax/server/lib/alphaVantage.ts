import axios from "axios";

/**
 * Maps industry to appropriate Indian stock symbols
 */
const industrySymbolMap: Record<string, string> = {
  "Electronics": "INFY.BSE", // Infosys (Technology)
  "Manufacturing": "TATASTEEL.BSE", // Tata Steel
  "Chemicals": "RELIANCE.BSE", // Reliance Industries
  "Textiles": "ARVIND.BSE", // Arvind Ltd
  "Auto": "TATAMOTORS.BSE", // Tata Motors
  "Pharmaceuticals": "SUNPHARMA.BSE", // Sun Pharmaceutical
  "Energy": "POWERGRID.BSE", // Power Grid Corporation
  "Finance": "HDFCBANK.BSE", // HDFC Bank
  "Technology": "TCS.BSE", // Tata Consultancy Services
  "Retail": "DMART.BSE", // Avenue Supermarts (D-Mart)
  // Add more mappings as needed
};

// Industry group symbols - used for industry risk calculation
const industryGroupSymbols: Record<string, string[]> = {
  "Electronics": ["INFY.BSE", "TCS.BSE", "WIPRO.BSE", "HCLTECH.BSE", "TECHM.BSE"],
  "Manufacturing": ["TATASTEEL.BSE", "SAIL.BSE", "HINDALCO.BSE", "JSWSTEEL.BSE", "JINDALSTEL.BSE"],
  "Chemicals": ["RELIANCE.BSE", "ONGC.BSE", "IOC.BSE", "GAIL.BSE", "PIDILITIND.BSE"],
  "Textiles": ["ARVIND.BSE", "RAYMOND.BSE", "WELSPUNIND.BSE", "PAGEIND.BSE", "VARDHACRLC.BSE"],
  "Auto": ["TATAMOTORS.BSE", "MARUTI.BSE", "M&M.BSE", "HEROMOTOCO.BSE", "BAJAJ-AUTO.BSE"],
  "Pharmaceuticals": ["SUNPHARMA.BSE", "DRREDDY.BSE", "CIPLA.BSE", "DIVISLAB.BSE", "LUPIN.BSE"],
  "Energy": ["POWERGRID.BSE", "NTPC.BSE", "TATAPOWER.BSE", "ADANIPOWER.BSE", "TORNTPOWER.BSE"],
  "Finance": ["HDFCBANK.BSE", "ICICIBANK.BSE", "SBIN.BSE", "KOTAKBANK.BSE", "AXISBANK.BSE"],
  "Technology": ["TCS.BSE", "INFY.BSE", "WIPRO.BSE", "HCLTECH.BSE", "TECHM.BSE"],
  "Retail": ["DMART.BSE", "VMART.BSE", "TRENT.BSE", "SHOPERSTOP.BSE", "ABFRL.BSE"]
};

// Industry economic indicators for supply chain risk and demand forecasting
const industryEconomicIndicators: Record<string, string[]> = {
  "Electronics": ["PPI", "CPI", "TECH_INDEX", "SEMI_INDEX", "RAW_MATERIALS"],
  "Manufacturing": ["PPI", "PMI", "INDUSTRIAL_PRODUCTION", "CAPACITY_UTILIZATION", "RAW_MATERIALS"],
  "Chemicals": ["OIL_PRICE", "NATURAL_GAS", "PPI", "CHEMICAL_INDEX", "FERTILIZER_INDEX"],
  "Textiles": ["COTTON_PRICE", "LABOR_COST", "CPI_CLOTHING", "RETAIL_SALES", "IMPORT_TARIFFS"],
  "Auto": ["STEEL_PRICE", "ALUMINUM_PRICE", "RUBBER_PRICE", "AUTO_SALES", "FUEL_PRICE"],
  "Pharmaceuticals": ["HEALTHCARE_SPENDING", "DRUG_APPROVALS", "R&D_SPENDING", "HEALTHCARE_CPI", "PATENT_EXPIRATIONS"],
  "Energy": ["OIL_PRICE", "NATURAL_GAS", "COAL_PRICE", "ENERGY_DEMAND", "RENEWABLE_INVESTMENT"],
  "Finance": ["INTEREST_RATES", "LENDING_VOLUME", "DEFAULT_RATES", "BANK_INDEX", "HOUSING_STARTS"],
  "Technology": ["TECH_SPENDING", "VENTURE_CAPITAL", "PATENT_FILINGS", "CLOUD_GROWTH", "TECH_HIRING"],
  "Retail": ["RETAIL_SALES", "CONSUMER_CONFIDENCE", "INVENTORY_LEVELS", "E-COMMERCE_GROWTH", "CPI"]
};

// Global stock market data APIs - using free public APIs
const FREE_MARKET_APIS = {
  NSE_API: "https://www.nseindia.com/api/equity-stockIndices",
  BSE_API: "https://api.bseindia.com/BseIndiaAPI/api/ProduceCSVForDate/w",
  YAHOO_FINANCE_API: "https://query1.finance.yahoo.com/v8/finance/chart/",
  TWELVE_DATA_API: "https://api.twelvedata.com/time_series", // Offers free tier
  MARKET_STACK_API: "https://api.marketstack.com/v1/eod", // Offers free tier
  FINNHUB_API: "https://finnhub.io/api/v1/quote", // Offers free tier
  EOD_HISTORICAL_API: "https://eodhistoricaldata.com/api/", // Offers free tier
  ALPHAVANTAGE_API: "https://www.alphavantage.co/query" // Offers free tier
};

/**
 * Gets stock trends for a specific industry using free publicly available APIs
 */
export async function getStockTrends(industry: string): Promise<any> {
  try {
    // Get the appropriate symbol for the industry
    const symbol = industrySymbolMap[industry] || "NIFTY50";
    
    // Try Yahoo Finance API first (no API key needed)
    const response = await axios.get(`${FREE_MARKET_APIS.YAHOO_FINANCE_API}${symbol}`, {
      params: {
        interval: "1d",
        range: "1mo" // 1 month of data
      }
    });
    
    // Process the Yahoo Finance response
    const result = response.data.chart.result[0];
    if (!result) {
      throw new Error("No data available from Yahoo Finance");
    }
    
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0] || {};
    const closePrices = quotes.close || [];
    const volumes = quotes.volume || [];
    const highs = quotes.high || [];
    const lows = quotes.low || [];
    
    // Format the data
    const dates = timestamps.map((timestamp: number) => {
      return new Date(timestamp * 1000).toISOString().split("T")[0];
    });

    // Calculate additional metrics like volatility
    const volatility = calculateVolatility(closePrices);
    const trend = calculateTrend(closePrices);
    const momentum = calculateMomentum(closePrices);
    const support = calculateSupportLevel(lows);
    const resistance = calculateResistanceLevel(highs);
    
    return {
      industry,
      symbol,
      source: "Yahoo Finance API",
      data: {
        dates,
        values: closePrices,
        volumes,
        highs,
        lows
      },
      metrics: {
        volatility,
        trend,
        momentum,
        support,
        resistance,
        lastPrice: closePrices[closePrices.length - 1],
        changePercent: calculateChangePercent(closePrices)
      }
    };
  } catch (error) {
    console.error("Error fetching stock trends from Yahoo Finance:", error);
    
    try {
      // Fallback to Twelve Data API (offers free tier)
      const response = await axios.get(FREE_MARKET_APIS.TWELVE_DATA_API, {
        params: {
          symbol: industrySymbolMap[industry] || "NIFTY50",
          interval: "1day",
          outputsize: 30,
          format: "json"
        }
      });
      
      if (response.data && response.data.values) {
        const values = response.data.values;
        const closePrices = values.map((item: any) => parseFloat(item.close));
        
        return {
          industry,
          symbol: industrySymbolMap[industry] || "NIFTY50",
          source: "Twelve Data API",
          data: {
            dates: values.map((item: any) => item.datetime),
            values: closePrices,
            volumes: values.map((item: any) => parseFloat(item.volume || "0")),
            highs: values.map((item: any) => parseFloat(item.high)),
            lows: values.map((item: any) => parseFloat(item.low))
          },
          metrics: {
            volatility: calculateVolatility(closePrices),
            trend: calculateTrend(closePrices),
            momentum: calculateMomentum(closePrices),
            support: calculateSupportLevel(values.map((item: any) => parseFloat(item.low))),
            resistance: calculateResistanceLevel(values.map((item: any) => parseFloat(item.high))),
            lastPrice: closePrices[0],
            changePercent: calculateChangePercent(closePrices)
          }
        };
      } else {
        throw new Error("No data available from Twelve Data API");
      }
    } catch (fallbackError) {
      console.error("Error fetching stock trends from fallback API:", fallbackError);
      
      // Instead of mock data, provide a descriptive error
      return {
        industry,
        symbol: industrySymbolMap[industry] || "NIFTY50",
        error: "Could not fetch stock market data. APIs may be unavailable or rate limited. Please try again later.",
        data: {
          dates: [],
          values: []
        }
      };
    }
  }
}

/**
 * Gets global stock market data for multiple industries
 * Uses multiple free public APIs for redundancy
 */
export async function getGlobalMarketData(): Promise<any> {
  try {
    // Get data for global market indices using Yahoo Finance
    const indices = [
      "^NSEI", // NIFTY 50
      "^BSESN", // BSE SENSEX
      "^GSPC", // S&P 500
      "^DJI", // Dow Jones
      "^IXIC", // NASDAQ
      "^FTSE", // FTSE 100
      "^GDAXI", // DAX
      "^HSI", // Hang Seng
      "^N225" // Nikkei 225
    ];
    
    const promises = indices.map(async (index) => {
      try {
        const response = await axios.get(`${FREE_MARKET_APIS.YAHOO_FINANCE_API}${index}`, {
          params: {
            interval: "1d",
            range: "1mo"
          }
        });
        
        const result = response.data.chart.result[0];
        const meta = result.meta || {};
        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0] || {};
        const closePrices = quotes.close || [];
        
        // Calculate additional metrics
        const volatility = calculateVolatility(closePrices);
        const trend = calculateTrend(closePrices);
        
        return {
          index: meta.symbol,
          name: meta.exchangeName,
          price: meta.regularMarketPrice,
          change: meta.regularMarketChange,
          changePercent: meta.regularMarketChangePercent,
          volatility,
          trend
        };
      } catch (error) {
        console.error(`Error fetching data for index ${index}:`, error);
        return {
          index,
          error: "Data temporarily unavailable"
        };
      }
    });
    
    const results = await Promise.all(promises);
    return {
      source: "Yahoo Finance API",
      timestamp: new Date().toISOString(),
      data: results
    };
  } catch (error) {
    console.error("Error fetching global market data:", error);
    return {
      error: "Could not fetch global market data. Please try again later.",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gets industry trends using Indian market sector indices
 */
export async function getIndianSectorIndices(): Promise<any> {
  // Map of Indian sector indices
  const sectorIndices = {
    "Technology": "NIFTYIT.NS",
    "Banking": "NIFTYBANK.NS",
    "Energy": "CNXENERGY.NS",
    "Pharmaceuticals": "CNXPHARMA.NS",
    "Auto": "CNXAUTO.NS",
    "Metal": "CNXMETAL.NS",
    "Finance": "CNXFIN.NS",
    "FMCG": "CNXFMCG.NS",
    "Manufacturing": "CNXMIDCAP.NS"
  };
  
  try {
    const promises = Object.entries(sectorIndices).map(async ([sector, index]) => {
      try {
        const response = await axios.get(`${FREE_MARKET_APIS.YAHOO_FINANCE_API}${index}`, {
          params: {
            interval: "1d",
            range: "1mo"
          }
        });
        
        const result = response.data.chart.result[0];
        if (!result) return { sector, error: "No data available" };
        
        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0] || {};
        const closePrices = quotes.close || [];
        const volumes = quotes.volume || [];
        
        // Format the data
        const dates = timestamps.map((timestamp: number) => {
          return new Date(timestamp * 1000).toISOString().split("T")[0];
        });
        
        // Calculate additional metrics
        const volatility = calculateVolatility(closePrices);
        const momentum = calculateMomentum(closePrices);
        const trend = calculateTrend(closePrices);
        
        return {
          sector,
          index,
          data: {
            dates,
            values: closePrices,
            volumes
          },
          metrics: {
            volatility,
            momentum,
            trend,
            lastPrice: closePrices[closePrices.length - 1],
            changePercent: calculateChangePercent(closePrices)
          }
        };
      } catch (error) {
        console.error(`Error fetching data for sector ${sector}:`, error);
        return {
          sector,
          index,
          error: "Data temporarily unavailable"
        };
      }
    });
    
    const results = await Promise.all(promises);
    return {
      source: "Yahoo Finance API (Indian Sectors)",
      timestamp: new Date().toISOString(),
      data: results
    };
  } catch (error) {
    console.error("Error fetching Indian sector indices:", error);
    return {
      error: "Could not fetch sector data. Please try again later.",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gets supply chain forecasting data for a specific industry
 */
export async function getSupplyChainForecast(industry: string): Promise<any> {
  try {
    // Get the economic indicators for this industry
    const indicators = industryEconomicIndicators[industry] || [];
    
    // Get the associated stocks for this industry
    const stocks = industryGroupSymbols[industry] || [];
    
    // Get stock data for each symbol in the industry group
    const stockPromises = stocks.map(async (symbol) => {
      try {
        const response = await axios.get(`${FREE_MARKET_APIS.YAHOO_FINANCE_API}${symbol}`, {
          params: {
            interval: "1d",
            range: "3mo" // 3 months of data for better forecasting
          }
        });
        
        const result = response.data.chart.result[0];
        if (!result) return { symbol, error: "No data available" };
        
        const meta = result.meta || {};
        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0] || {};
        const closePrices = quotes.close || [];
        
        // Format the data
        const dates = timestamps.map((timestamp: number) => {
          return new Date(timestamp * 1000).toISOString().split("T")[0];
        });
        
        return {
          symbol,
          name: meta.shortName || symbol,
          data: {
            dates,
            prices: closePrices
          }
        };
      } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        return {
          symbol,
          error: "Data temporarily unavailable"
        };
      }
    });
    
    const stockData = await Promise.all(stockPromises);
    
    // Calculate industry-wide metrics
    const supplyChainRisk = calculateSupplyChainRisk(stockData, industry);
    const demandForecast = calculateDemandForecast(stockData, industry);
    const priceVolatility = calculateIndustryVolatility(stockData);
    
    // Forecast next 4 weeks of price trends
    const forecast = forecastPriceTrends(stockData, 4);
    
    return {
      industry,
      timestamp: new Date().toISOString(),
      supplyChainMetrics: {
        riskLevel: supplyChainRisk.riskLevel,
        riskScore: supplyChainRisk.riskScore,
        riskFactors: supplyChainRisk.riskFactors,
        confidenceScore: supplyChainRisk.confidenceScore
      },
      demandForecast: {
        trend: demandForecast.trend,
        forecast: demandForecast.forecast,
        confidenceScore: demandForecast.confidenceScore,
        factors: demandForecast.factors
      },
      priceForecasts: forecast,
      volatility: {
        overall: priceVolatility.overall,
        shortTerm: priceVolatility.shortTerm,
        longTerm: priceVolatility.longTerm
      },
      stockData: stockData.filter(stock => !stock.error)
    };
  } catch (error) {
    console.error("Error generating supply chain forecast:", error);
    return {
      industry,
      error: "Could not generate supply chain forecast. Please try again later.",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gets market volatility index for different industries
 */
export async function getMarketVolatilityIndex(): Promise<any> {
  try {
    const industries = Object.keys(industrySymbolMap);
    
    const promises = industries.map(async (industry) => {
      try {
        const stockData = await getStockTrends(industry);
        
        if (stockData.error) {
          return {
            industry,
            error: stockData.error
          };
        }
        
        const volatility = stockData.metrics?.volatility || 0;
        const changePercent = stockData.metrics?.changePercent || 0;
        const trend = stockData.metrics?.trend || 'neutral';
        
        // Classify volatility level
        let volatilityLevel = 'low';
        if (volatility > 3) volatilityLevel = 'extreme';
        else if (volatility > 2) volatilityLevel = 'high';
        else if (volatility > 1) volatilityLevel = 'moderate';
        
        return {
          industry,
          volatility,
          volatilityLevel,
          changePercent,
          trend,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error calculating volatility for industry ${industry}:`, error);
        return {
          industry,
          error: "Could not calculate volatility data."
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    // Calculate overall market volatility
    const overallVolatility = results
      .filter((result) => !result.error)
      .reduce((sum, result) => sum + result.volatility, 0) / 
      results.filter((result) => !result.error).length;
    
    // Determine overall market volatility level
    let overallVolatilityLevel = 'low';
    if (overallVolatility > 3) overallVolatilityLevel = 'extreme';
    else if (overallVolatility > 2) overallVolatilityLevel = 'high';
    else if (overallVolatility > 1) overallVolatilityLevel = 'moderate';
    
    return {
      timestamp: new Date().toISOString(),
      overallVolatility,
      overallVolatilityLevel,
      industries: results
    };
  } catch (error) {
    console.error("Error generating market volatility index:", error);
    return {
      error: "Could not generate market volatility index. Please try again later.",
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gets predictive analytics for RFQ success rates based on market conditions
 */
export async function getRfqSuccessPrediction(industry?: string): Promise<any> {
  try {
    // If no industry is specified, get predictions for all industries
    const industries = industry ? [industry] : Object.keys(industrySymbolMap);
    
    const predictions = await Promise.all(
      industries.map(async (ind) => {
        try {
          // Get current market conditions for the industry
          const marketData = await getStockTrends(ind);
          
          if (marketData.error) {
            return {
              industry: ind,
              error: marketData.error
            };
          }
          
          // Extract relevant metrics
          const volatility = marketData.metrics?.volatility || 0;
          const trend = marketData.metrics?.trend || 'neutral';
          const momentum = marketData.metrics?.momentum || 0;
          
          // Calculate RFQ success probabilities based on market conditions
          const successProbability = calculateRfqSuccessProbability(volatility, trend, momentum, ind);
          
          // Factors affecting the success probability
          const factors = determineSuccessFactors(volatility, trend, momentum, ind);
          
          return {
            industry: ind,
            successProbability,
            confidence: successProbability.confidence,
            trend: successProbability.trend,
            factors
          };
        } catch (error) {
          console.error(`Error generating RFQ success prediction for industry ${ind}:`, error);
          return {
            industry: ind,
            error: "Could not generate prediction."
          };
        }
      })
    );
    
    return {
      timestamp: new Date().toISOString(),
      predictions: predictions.filter(p => !p.error)
    };
  } catch (error) {
    console.error("Error generating RFQ success predictions:", error);
    return {
      error: "Could not generate RFQ success predictions. Please try again later.",
      timestamp: new Date().toISOString()
    };
  }
}

// Helper functions for calculations

function calculateVolatility(prices: number[]): number {
  if (!prices || prices.length < 2) return 0;
  
  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i-1] !== 0) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
  }
  
  // Calculate standard deviation of returns (volatility)
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Express as percentage
}

function calculateTrend(prices: number[]): string {
  if (!prices || prices.length < 5) return 'neutral';
  
  // Simple trend calculation using most recent prices
  const recentPrices = prices.slice(-5);
  
  // Linear regression to determine trend
  const xValues = [0, 1, 2, 3, 4];
  const yValues = recentPrices;
  
  const n = xValues.length;
  const xSum = xValues.reduce((sum, x) => sum + x, 0);
  const ySum = yValues.reduce((sum, y) => sum + y, 0);
  const xySum = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const x2Sum = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  
  if (slope > 0.005) return 'bullish';
  if (slope < -0.005) return 'bearish';
  return 'neutral';
}

function calculateMomentum(prices: number[]): number {
  if (!prices || prices.length < 10) return 0;
  
  // Calculate 10-day Rate of Change
  const currentPrice = prices[prices.length - 1];
  const oldPrice = prices[prices.length - 10];
  
  if (oldPrice === 0) return 0;
  
  return ((currentPrice - oldPrice) / oldPrice) * 100;
}

function calculateSupportLevel(lows: number[]): number {
  if (!lows || lows.length === 0) return 0;
  
  // Simple support level calculation (lowest in the period)
  return Math.min(...lows.filter(Boolean));
}

function calculateResistanceLevel(highs: number[]): number {
  if (!highs || highs.length === 0) return 0;
  
  // Simple resistance level calculation (highest in the period)
  return Math.max(...highs.filter(Boolean));
}

function calculateChangePercent(prices: number[]): number {
  if (!prices || prices.length < 2) return 0;
  
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  
  if (firstPrice === 0) return 0;
  
  return ((lastPrice - firstPrice) / firstPrice) * 100;
}

function calculateSupplyChainRisk(stockData: any[], industry: string): any {
  // In a real implementation, this would incorporate machine learning models
  // For now, calculate based on the volatility of the industry stocks
  
  // Extract volatilities
  const volatilities = stockData
    .filter(stock => !stock.error && stock.data && stock.data.prices)
    .map(stock => calculateVolatility(stock.data.prices));
  
  if (volatilities.length === 0) {
    return {
      riskLevel: "unknown",
      riskScore: 50,
      riskFactors: ["Insufficient data"],
      confidenceScore: 0
    };
  }
  
  // Average volatility
  const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
  
  // Risk score (0-100, higher means more risk)
  let riskScore = Math.min(100, avgVolatility * 10);
  
  // Risk level
  let riskLevel = "low";
  if (riskScore > 75) riskLevel = "high";
  else if (riskScore > 50) riskLevel = "moderate";
  else if (riskScore > 25) riskLevel = "low-moderate";
  
  // Risk factors specific to the industry
  const riskFactors = [];
  
  // Add industry-specific risk factors
  if (industry === "Electronics" && avgVolatility > 2) {
    riskFactors.push("Semiconductor supply constraints");
    riskFactors.push("Component price volatility");
  } else if (industry === "Manufacturing" && avgVolatility > 2) {
    riskFactors.push("Raw material price fluctuations");
    riskFactors.push("Logistics bottlenecks");
  } else if (industry === "Auto" && avgVolatility > 2) {
    riskFactors.push("Chip shortage impact");
    riskFactors.push("Material cost increases");
  } 
  
  // Default risk factors
  if (riskFactors.length === 0) {
    if (avgVolatility > 3) {
      riskFactors.push("High market volatility");
      riskFactors.push("Unstable pricing environment");
    } else if (avgVolatility > 1.5) {
      riskFactors.push("Moderate market fluctuations");
    } else {
      riskFactors.push("Stable market conditions");
    }
  }
  
  // Calculate confidence score (higher with more data)
  const confidenceScore = Math.min(100, stockData.filter(stock => !stock.error).length * 20);
  
  return {
    riskLevel,
    riskScore,
    riskFactors,
    confidenceScore
  };
}

function calculateDemandForecast(stockData: any[], industry: string): any {
  // Extract price trends
  const trends = stockData
    .filter(stock => !stock.error && stock.data && stock.data.prices)
    .map(stock => calculateTrend(stock.data.prices));
  
  if (trends.length === 0) {
    return {
      trend: "stable",
      forecast: [0, 0, 0, 0],
      confidenceScore: 0,
      factors: ["Insufficient data"]
    };
  }
  
  // Count trends
  const bullishCount = trends.filter(trend => trend === 'bullish').length;
  const bearishCount = trends.filter(trend => trend === 'bearish').length;
  const neutralCount = trends.filter(trend => trend === 'neutral').length;
  
  // Determine overall trend
  let trend = "stable";
  if (bullishCount > bearishCount && bullishCount > neutralCount) {
    trend = "increasing";
  } else if (bearishCount > bullishCount && bearishCount > neutralCount) {
    trend = "decreasing";
  }
  
  // Simple forecast for next 4 periods
  const forecast = [0, 0, 0, 0];
  if (trend === "increasing") {
    forecast[0] = 2;
    forecast[1] = 3;
    forecast[2] = 3.5;
    forecast[3] = 4;
  } else if (trend === "decreasing") {
    forecast[0] = -1;
    forecast[1] = -2;
    forecast[2] = -2.5;
    forecast[3] = -3;
  } else {
    forecast[0] = 0.5;
    forecast[1] = 0.5;
    forecast[2] = 0.5;
    forecast[3] = 0.5;
  }
  
  // Factors affecting demand
  const factors = [];
  
  // Add industry-specific factors
  if (industry === "Electronics") {
    if (trend === "increasing") {
      factors.push("Rising consumer electronics demand");
      factors.push("Technology upgrade cycle");
    } else if (trend === "decreasing") {
      factors.push("Market saturation");
      factors.push("Extended device replacement cycles");
    }
  } else if (industry === "Manufacturing") {
    if (trend === "increasing") {
      factors.push("Infrastructure development");
      factors.push("Industrial capacity expansion");
    } else if (trend === "decreasing") {
      factors.push("Economic slowdown");
      factors.push("Reduced capital expenditure");
    }
  }
  
  // Default factors
  if (factors.length === 0) {
    if (trend === "increasing") {
      factors.push("Positive market sentiment");
      factors.push("Growing industry demand");
    } else if (trend === "decreasing") {
      factors.push("Negative market outlook");
      factors.push("Reduced industry demand");
    } else {
      factors.push("Stable market conditions");
      factors.push("Consistent demand patterns");
    }
  }
  
  // Calculate confidence score
  const confidenceScore = Math.min(100, stockData.filter(stock => !stock.error).length * 20);
  
  return {
    trend,
    forecast,
    confidenceScore,
    factors
  };
}

function calculateIndustryVolatility(stockData: any[]): any {
  // Extract volatilities from all stocks
  const allVolatilities = stockData
    .filter(stock => !stock.error && stock.data && stock.data.prices)
    .map(stock => calculateVolatility(stock.data.prices));
  
  if (allVolatilities.length === 0) {
    return {
      overall: 0,
      shortTerm: 0,
      longTerm: 0
    };
  }
  
  // Overall volatility (average of all stocks)
  const overall = allVolatilities.reduce((sum, vol) => sum + vol, 0) / allVolatilities.length;
  
  // Short-term volatility (more recent dates)
  const shortTermVolatilities = stockData
    .filter(stock => !stock.error && stock.data && stock.data.prices)
    .map(stock => {
      const prices = stock.data.prices;
      if (prices.length < 5) return 0;
      return calculateVolatility(prices.slice(-5));
    });
  
  const shortTerm = shortTermVolatilities.reduce((sum, vol) => sum + vol, 0) / shortTermVolatilities.length;
  
  // Long-term volatility (whole period)
  const longTerm = overall;
  
  return {
    overall,
    shortTerm,
    longTerm
  };
}

function forecastPriceTrends(stockData: any[], weeks: number): any[] {
  // Simple forecasting method using recent trend
  return stockData
    .filter(stock => !stock.error && stock.data && stock.data.prices && stock.data.prices.length >= 10)
    .map(stock => {
      const prices = stock.data.prices;
      const recentPrices = prices.slice(-10);
      
      // Calculate average weekly change
      let totalChange = 0;
      for (let i = 1; i < recentPrices.length; i++) {
        totalChange += (recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1];
      }
      
      const avgWeeklyChange = totalChange / (recentPrices.length - 1);
      const currentPrice = recentPrices[recentPrices.length - 1];
      
      // Generate forecast
      const forecast = [];
      let forecastPrice = currentPrice;
      
      for (let i = 0; i < weeks; i++) {
        forecastPrice = forecastPrice * (1 + avgWeeklyChange);
        forecast.push(forecastPrice);
      }
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice,
        forecast,
        trend: avgWeeklyChange > 0 ? 'up' : avgWeeklyChange < 0 ? 'down' : 'stable',
        percentChange: avgWeeklyChange * 100
      };
    });
}

function calculateRfqSuccessProbability(volatility: number, trend: string, momentum: number, industry: string): any {
  // Base success rate
  let successRate = 75; // Default base success rate
  let confidence = 70;  // Default confidence level
  
  // Adjust for volatility - high volatility reduces success rate
  if (volatility > 3) {
    successRate -= 15;
    confidence -= 10;
  } else if (volatility > 2) {
    successRate -= 10;
    confidence -= 5;
  } else if (volatility > 1) {
    successRate -= 5;
  } else {
    successRate += 5; // Low volatility improves success rate
    confidence += 5;
  }
  
  // Adjust for market trend
  if (trend === 'bullish') {
    successRate += 10;
    confidence += 5;
  } else if (trend === 'bearish') {
    successRate -= 8;
    confidence -= 5;
  }
  
  // Adjust for momentum
  if (momentum > 5) {
    successRate += 5;
    confidence += 3;
  } else if (momentum < -5) {
    successRate -= 5;
    confidence -= 3;
  }
  
  // Industry-specific adjustments
  if (industry === 'Electronics') {
    successRate += 5; // Electronics historically has higher success
  } else if (industry === 'Textiles') {
    successRate -= 3; // Textiles historically has lower success
  }
  
  // Ensure values are within bounds
  successRate = Math.max(0, Math.min(100, successRate));
  confidence = Math.max(0, Math.min(100, confidence));
  
  // Determine trend for next period
  let predictedTrend = 'stable';
  if (trend === 'bullish' && momentum > 0) {
    predictedTrend = 'improving';
  } else if (trend === 'bearish' && momentum < 0) {
    predictedTrend = 'declining';
  } else if (trend === 'bullish' && momentum < -3) {
    predictedTrend = 'reversing';
  } else if (trend === 'bearish' && momentum > 3) {
    predictedTrend = 'recovering';
  }
  
  return {
    rate: successRate,
    confidence,
    trend: predictedTrend
  };
}

function determineSuccessFactors(volatility: number, trend: string, momentum: number, industry: string): string[] {
  const factors = [];
  
  // Volatility factors
  if (volatility > 3) {
    factors.push("High market volatility reducing predictability");
  } else if (volatility < 1) {
    factors.push("Stable market conditions improving success chances");
  }
  
  // Trend factors
  if (trend === 'bullish') {
    factors.push("Positive market trend supporting RFQ responses");
  } else if (trend === 'bearish') {
    factors.push("Negative market trend reducing supplier participation");
  }
  
  // Momentum factors
  if (momentum > 5) {
    factors.push("Strong positive momentum increasing supplier engagement");
  } else if (momentum < -5) {
    factors.push("Strong negative momentum causing supplier caution");
  }
  
  // Industry-specific factors
  if (industry === 'Electronics') {
    factors.push("High competition among electronics suppliers");
  } else if (industry === 'Manufacturing') {
    factors.push("Manufacturing capacity utilization affecting response rates");
  } else if (industry === 'Auto') {
    factors.push("Supply chain constraints in automotive sector");
  } else if (industry === 'Pharmaceuticals') {
    factors.push("Regulatory considerations in pharmaceutical industry");
  }
  
  // Add a general factor if no specific ones were determined
  if (factors.length === 0) {
    factors.push("Normal market conditions with standard success probability");
  }
  
  return factors;
}
