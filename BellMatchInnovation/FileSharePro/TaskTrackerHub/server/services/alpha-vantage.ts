import { log } from "../vite";

// Define interface for stock data response
export interface StockData {
  symbol: string;
  data: {
    date: string;
    open: number;
    high: number;
    close: number;
    volume: number;
  }[];
}

export interface MarketInsight {
  trend: "up" | "down" | "stable";
  value: number;
  description: string;
}

export class AlphaVantageService {
  private apiKey: string;
  
  constructor() {
    // Get the API key from environment variables
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";
    if (this.apiKey === "demo") {
      log("Warning: Using demo API key for Alpha Vantage. Limited to 5 requests per minute.", "alpha-vantage");
    }
  }
  
  /**
   * Fetches stock data for a specific symbol
   * @param symbol Stock symbol to fetch data for
   * @returns Promise with stock data
   */
  async getStockData(symbol: string): Promise<StockData> {
    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if the API returned an error message
      if (data["Error Message"]) {
        throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`);
      }
      
      // Check if we hit rate limiting
      if (data["Note"]) {
        log(`Alpha Vantage rate limit reached: ${data["Note"]}`, "alpha-vantage");
        throw new Error("API call frequency limit reached");
      }
      
      const timeSeriesData = data["Time Series (Daily)"];
      if (!timeSeriesData) {
        throw new Error("No time series data returned");
      }
      
      // Transform the data into a more usable format
      const formattedData = Object.entries(timeSeriesData).map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        close: parseFloat(values["4. close"]),
        volume: parseFloat(values["5. volume"]),
      })).slice(0, 30); // Get only the last 30 days
      
      return {
        symbol,
        data: formattedData
      };
    } catch (error) {
      log(`Error fetching stock data: ${error}`, "alpha-vantage");
      throw error;
    }
  }
  
  /**
   * Get sector performance data
   * @returns Promise with sector performance data
   */
  async getSectorPerformance(): Promise<Record<string, number>> {
    try {
      const url = `https://www.alphavantage.co/query?function=SECTOR&apikey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if the API returned an error message
      if (data["Error Message"]) {
        throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`);
      }
      
      // Check if we hit rate limiting
      if (data["Note"]) {
        log(`Alpha Vantage rate limit reached: ${data["Note"]}`, "alpha-vantage");
        throw new Error("API call frequency limit reached");
      }
      
      // Get performance data for sectors
      const sectorData = data["Rank A: Real-Time Performance"];
      if (!sectorData) {
        throw new Error("No sector data returned");
      }
      
      // Convert percentage strings to numbers
      const formattedData: Record<string, number> = {};
      for (const [sector, percentage] of Object.entries(sectorData)) {
        formattedData[sector] = parseFloat((percentage as string).replace("%", ""));
      }
      
      return formattedData;
    } catch (error) {
      log(`Error fetching sector performance: ${error}`, "alpha-vantage");
      throw error;
    }
  }
  
  /**
   * Generate market insights based on stock and sector data
   * @param sector Sector to analyze
   * @returns Promise with market insights
   */
  async generateMarketInsights(sector: string): Promise<MarketInsight[]> {
    try {
      // Map sectors to stock symbols - simplified mapping for demonstration
      const sectorToSymbols: Record<string, string[]> = {
        "Electronics": ["AAPL", "MSFT", "INTC"],
        "Semiconductors": ["NVDA", "AMD", "INTC"],
        "Manufacturing": ["GE", "CAT", "MMM"],
        "Renewables": ["NEE", "ENPH", "SEDG"],
        // Add more sectors and their representative stocks as needed
      };
      
      // Get sector performance data
      const sectorPerformance = await this.getSectorPerformance();
      
      // Get stock data for the specified sector
      const symbols = sectorToSymbols[sector] || ["AAPL"]; // Default to AAPL if sector not found
      const stockDataPromises = symbols.map(symbol => this.getStockData(symbol));
      const stockDataResults = await Promise.allSettled(stockDataPromises);
      
      const successfulResults = stockDataResults
        .filter((result): result is PromiseFulfilledResult<StockData> => result.status === 'fulfilled')
        .map(result => result.value);
      
      const insights: MarketInsight[] = [];
      
      // Generate insights from sector performance
      const relevantSectors = Object.keys(sectorPerformance)
        .filter(s => s.toLowerCase().includes(sector.toLowerCase()) || sector.toLowerCase().includes(s.toLowerCase()));
      
      for (const s of relevantSectors) {
        const performance = sectorPerformance[s];
        insights.push({
          trend: performance > 0 ? "up" : "down",
          value: performance,
          description: `${s} sector ${performance > 0 ? "up" : "down"} by ${Math.abs(performance).toFixed(2)}%`
        });
      }
      
      // Generate insights from stock data
      for (const stockData of successfulResults) {
        const recentData = stockData.data.slice(0, 5);
        const oldestClose = recentData[recentData.length - 1].close;
        const latestClose = recentData[0].close;
        const percentChange = ((latestClose - oldestClose) / oldestClose) * 100;
        
        insights.push({
          trend: percentChange > 0 ? "up" : "down",
          value: percentChange,
          description: `${stockData.symbol} ${percentChange > 0 ? "increased" : "decreased"} by ${Math.abs(percentChange).toFixed(2)}% in the last 5 days`
        });
      }
      
      return insights;
    } catch (error) {
      log(`Error generating market insights: ${error}`, "alpha-vantage");
      throw error;
    }
  }
}

// Create a singleton instance
export const alphaVantageService = new AlphaVantageService();
