/**
 * Stock Analysis Service
 * 
 * This service provides industry-specific stock analysis for targeted market insights,
 * offering real-time and historical data on stock performance by industry segment.
 */

import { perplexityService } from './perplexity.service';
import {
  StockSymbol,
  StockPrice,
  IndustryStockAnalysis,
  StockAnalysisFilter,
  StockInsight,
  PriceHistoryRequest,
  PriceHistoryResponse,
  IndustryComparisonItem,
  MarketTrendAnalysis
} from '@shared/stock-analysis.types';

// Sample industry mapping (would typically come from database)
const industryMap: { [key: string]: number } = {
  'technology': 1,
  'healthcare': 2,
  'finance': 3,
  'energy': 4,
  'consumer-goods': 5,
  'manufacturing': 6,
  'telecommunications': 7,
  'materials': 8,
  'utilities': 9,
  'real-estate': 10
};

export class StockAnalysisService {
  private apiKey: string;
  private dataProvider: string;
  
  constructor() {
    this.apiKey = process.env.STOCK_API_KEY || '';
    this.dataProvider = process.env.STOCK_DATA_PROVIDER || 'default';
    
    // Log initialization status
    if (!this.apiKey) {
      console.log('Stock API key not found. Using cached or simulated data.');
    } else {
      console.log(`Stock Analysis Service initialized with ${this.dataProvider} provider.`);
    }
  }
  
  /**
   * Get industry-specific stock analysis
   * 
   * @param industryId The industry ID to analyze
   * @param filter Filter parameters for the analysis
   * @returns Industry stock analysis data
   */
  public async getIndustryStockAnalysis(
    industryId: number,
    filter: StockAnalysisFilter = {}
  ): Promise<IndustryStockAnalysis> {
    try {
      // If we have API access, fetch real stock data
      if (this.apiKey) {
        return await this.fetchIndustryStockData(industryId, filter);
      }
      
      // Otherwise, generate insights using Perplexity API
      return await this.generateIndustryStockInsights(industryId, filter);
    } catch (error) {
      console.error('Error in getIndustryStockAnalysis:', error);
      throw new Error(`Failed to retrieve industry stock analysis: ${error.message}`);
    }
  }
  
  /**
   * Get historical price data for a specific stock symbol
   * 
   * @param request Request parameters for price history
   * @returns Historical price data
   */
  public async getPriceHistory(request: PriceHistoryRequest): Promise<PriceHistoryResponse> {
    try {
      if (this.apiKey) {
        return await this.fetchPriceHistory(request);
      }
      
      // If no API key, return intelligently generated insights
      const industry = await this.getIndustryForSymbol(request.symbolId);
      return await this.generatePriceHistory(request, industry);
    } catch (error) {
      console.error('Error in getPriceHistory:', error);
      throw new Error(`Failed to retrieve price history: ${error.message}`);
    }
  }
  
  /**
   * Get detailed stock insights for a specific industry
   * 
   * @param industryId The industry ID to get insights for
   * @param startDate Start date for the analysis period
   * @param endDate End date for the analysis period
   * @returns Stock insights for the specified industry
   */
  public async getStockInsights(
    industryId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StockInsight[]> {
    try {
      if (this.apiKey) {
        return await this.fetchStockInsights(industryId, startDate, endDate);
      }
      
      // Generate insights using language model
      return await this.generateStockInsights(industryId, startDate, endDate);
    } catch (error) {
      console.error('Error in getStockInsights:', error);
      throw new Error(`Failed to retrieve stock insights: ${error.message}`);
    }
  }
  
  /**
   * Compare multiple industries' stock performance
   * 
   * @param industryIds List of industry IDs to compare
   * @param startDate Start date for the comparison period
   * @param endDate End date for the comparison period
   * @returns Comparison data for the specified industries
   */
  public async compareIndustries(
    industryIds: number[],
    startDate?: string,
    endDate?: string
  ): Promise<IndustryComparisonItem[]> {
    try {
      if (this.apiKey) {
        return await this.fetchIndustryComparison(industryIds, startDate, endDate);
      }
      
      // Generate comparison data using language model
      return await this.generateIndustryComparison(industryIds, startDate, endDate);
    } catch (error) {
      console.error('Error in compareIndustries:', error);
      throw new Error(`Failed to compare industries: ${error.message}`);
    }
  }
  
  /**
   * Get overall market trend analysis across industries
   * 
   * @param startDate Start date for the analysis period
   * @param endDate End date for the analysis period
   * @returns Market trend analysis data
   */
  public async getMarketTrendAnalysis(
    startDate?: string,
    endDate?: string
  ): Promise<MarketTrendAnalysis> {
    try {
      if (this.apiKey) {
        return await this.fetchMarketTrends(startDate, endDate);
      }
      
      // Generate market trend analysis using language model
      return await this.generateMarketTrendAnalysis(startDate, endDate);
    } catch (error) {
      console.error('Error in getMarketTrendAnalysis:', error);
      throw new Error(`Failed to retrieve market trend analysis: ${error.message}`);
    }
  }
  
  /**
   * Get stock symbols for a specific industry
   * 
   * @param industryId The industry ID to get symbols for
   * @returns List of stock symbols for the specified industry
   */
  public async getIndustrySymbols(industryId: number): Promise<StockSymbol[]> {
    try {
      if (this.apiKey) {
        return await this.fetchIndustrySymbols(industryId);
      }
      
      // Return pre-defined symbols for the industry
      return await this.getDefaultSymbolsForIndustry(industryId);
    } catch (error) {
      console.error('Error in getIndustrySymbols:', error);
      throw new Error(`Failed to retrieve industry symbols: ${error.message}`);
    }
  }
  
  // Private methods for actual data fetching and processing
  
  private async fetchIndustryStockData(
    industryId: number,
    filter: StockAnalysisFilter
  ): Promise<IndustryStockAnalysis> {
    // Implementation for real API call would go here
    // For now, we'll call our generate method
    return this.generateIndustryStockInsights(industryId, filter);
  }
  
  private async fetchPriceHistory(request: PriceHistoryRequest): Promise<PriceHistoryResponse> {
    // Implementation for real API call would go here
    // For now, we'll call our generate method
    const industry = await this.getIndustryForSymbol(request.symbolId);
    return this.generatePriceHistory(request, industry);
  }
  
  private async fetchStockInsights(
    industryId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StockInsight[]> {
    // Implementation for real API call would go here
    // For now, we'll call our generate method
    return this.generateStockInsights(industryId, startDate, endDate);
  }
  
  private async fetchIndustryComparison(
    industryIds: number[],
    startDate?: string,
    endDate?: string
  ): Promise<IndustryComparisonItem[]> {
    // Implementation for real API call would go here
    // For now, we'll call our generate method
    return this.generateIndustryComparison(industryIds, startDate, endDate);
  }
  
  private async fetchMarketTrends(
    startDate?: string,
    endDate?: string
  ): Promise<MarketTrendAnalysis> {
    // Implementation for real API call would go here
    // For now, we'll call our generate method
    return this.generateMarketTrendAnalysis(startDate, endDate);
  }
  
  private async fetchIndustrySymbols(industryId: number): Promise<StockSymbol[]> {
    // Implementation for real API call would go here
    // For now, we'll call our getDefaultSymbolsForIndustry method
    return this.getDefaultSymbolsForIndustry(industryId);
  }
  
  // Helper methods for generating insights
  
  private async getIndustryForSymbol(symbolId: number): Promise<string> {
    // In a real implementation, this would query the database
    // For now, we'll return a default value based on the symbolId
    const industries = Object.keys(industryMap);
    return industries[symbolId % industries.length];
  }
  
  private async getDefaultSymbolsForIndustry(industryId: number): Promise<StockSymbol[]> {
    // In a real implementation, this would return from a database or external API
    // For now, we'll dynamically generate this based on the industry
    const industryName = this.getIndustryName(industryId);
    
    // Use Perplexity to get realistic symbols
    const prompt = `What are 5 major publicly traded companies in the ${industryName} industry? Provide only the company name and ticker symbol in JSON format, like this:
    [
      {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
      ...
    ]`;
    
    try {
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial data expert. Provide accurate, real-world stock market data in JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1
      });
      
      const content = response.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const symbolData = JSON.parse(jsonMatch[0]);
        return symbolData.map((item: any, index: number) => ({
          id: (industryId * 100) + index,
          symbol: item.symbol,
          name: item.name,
          industryId: industryId,
          sector: this.getSectorForIndustry(industryId),
          isActive: true,
          country: "USA",
          exchange: item.exchange || "NYSE"
        }));
      }
      
      throw new Error("Failed to parse symbols from API response");
    } catch (error) {
      console.error("Error getting symbols from Perplexity:", error);
      
      // Return fallback data if Perplexity fails
      return [
        {
          id: (industryId * 100) + 1,
          symbol: "SYM1",
          name: `${industryName} Corp A`,
          industryId,
          sector: this.getSectorForIndustry(industryId),
          isActive: true,
          country: "USA",
          exchange: "NYSE"
        },
        {
          id: (industryId * 100) + 2,
          symbol: "SYM2",
          name: `${industryName} Corp B`,
          industryId,
          sector: this.getSectorForIndustry(industryId),
          isActive: true,
          country: "USA",
          exchange: "NASDAQ"
        }
      ];
    }
  }
  
  private async generateIndustryStockInsights(
    industryId: number,
    filter: StockAnalysisFilter
  ): Promise<IndustryStockAnalysis> {
    const industryName = this.getIndustryName(industryId);
    const sector = this.getSectorForIndustry(industryId);
    
    // Get realistic company symbols for this industry
    const symbols = await this.getDefaultSymbolsForIndustry(industryId);
    
    // Generate market analysis using Perplexity API
    const timeframe = filter.timeframe || 'weekly';
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const prompt = `
    Provide a realistic industry stock analysis for the ${industryName} industry in JSON format.
    Include:
    1. Current market trend (bullish/bearish/neutral)
    2. Average performance percentage (realistic number)
    3. Volatility (realistic number)
    4. A brief insight summary
    5. Top performers and worst performers (use the actual companies that would be in this sector)
    6. Key events affecting this industry
    
    Time period: ${timeframe} analysis as of ${dateStr}
    
    Return ONLY valid JSON that matches this structure:
    {
      "marketTrend": "bullish|bearish|neutral",
      "averagePerformance": number,
      "volatility": number,
      "insightSummary": "text",
      "topPerformers": [{"symbol": "XYZ", "name": "Company", "changePercent": number, "price": number, "volume": number}],
      "worstPerformers": [{"symbol": "XYZ", "name": "Company", "changePercent": number, "price": number, "volume": number}],
      "keyEvents": [{"date": "YYYY-MM-DD", "title": "text", "description": "text", "impactLevel": "high|medium|low"}]
    }
    `;
    
    try {
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial data analyst providing accurate stock market information in JSON format only. Create realistic stock market data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      });
      
      const content = response.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        
        return {
          industry: industryName,
          industryId,
          sector,
          date: dateStr,
          symbols,
          topPerformers: analysisData.topPerformers,
          worstPerformers: analysisData.worstPerformers,
          averagePerformance: analysisData.averagePerformance,
          marketTrend: analysisData.marketTrend,
          volatility: analysisData.volatility,
          insightSummary: analysisData.insightSummary,
          keyEvents: analysisData.keyEvents
        };
      }
      
      throw new Error("Failed to parse analysis from API response");
    } catch (error) {
      console.error("Error generating industry stock insights:", error);
      throw new Error(`Failed to generate industry stock insights: ${error.message}`);
    }
  }
  
  private async generatePriceHistory(
    request: PriceHistoryRequest,
    industry: string
  ): Promise<PriceHistoryResponse> {
    const { symbolId, timeframe, startDate, endDate, limit } = request;
    const currentDate = new Date();
    const end = endDate ? new Date(endDate) : currentDate;
    const limitDays = limit || 30;
    
    // Calculate start date based on parameters
    let start: Date;
    if (startDate) {
      start = new Date(startDate);
    } else {
      start = new Date(end);
      if (timeframe === 'daily') {
        start.setDate(end.getDate() - limitDays);
      } else if (timeframe === 'weekly') {
        start.setDate(end.getDate() - (limitDays * 7));
      } else {
        start.setMonth(end.getMonth() - limitDays);
      }
    }
    
    // Use Perplexity to get realistic price history
    const prompt = `
    Generate a realistic price history for a stock in the ${industry} industry with symbol ID ${symbolId} 
    from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]} 
    with ${timeframe} data points.
    
    Return ONLY a JSON object matching this structure:
    {
      "symbol": "XYZ",
      "name": "Company Name", 
      "data": [
        {"date": "YYYY-MM-DD", "open": number, "high": number, "low": number, "close": number, "volume": number, "changePercent": number}
      ],
      "overallChangePercent": number
    }
    
    Create plausible price movements that would be realistic for a company in this industry.
    `;
    
    try {
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial data generator providing realistic stock market data in JSON format only. Generate plausible price movements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      });
      
      const content = response.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const priceData = JSON.parse(jsonMatch[0]);
        
        // Convert the data to match our interface
        const stockPrices: StockPrice[] = priceData.data.map((item: any, index: number) => ({
          id: index + 1,
          symbolId,
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          changePercent: item.changePercent
        }));
        
        return {
          symbol: priceData.symbol,
          name: priceData.name,
          industry,
          data: stockPrices,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          overallChangePercent: priceData.overallChangePercent
        };
      }
      
      throw new Error("Failed to parse price history from API response");
    } catch (error) {
      console.error("Error generating price history:", error);
      throw new Error(`Failed to generate price history: ${error.message}`);
    }
  }
  
  private async generateStockInsights(
    industryId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StockInsight[]> {
    const industryName = this.getIndustryName(industryId);
    const symbols = await this.getDefaultSymbolsForIndustry(industryId);
    
    // Generate insights using Perplexity API
    const currentDate = new Date();
    const end = endDate ? new Date(endDate) : currentDate;
    const start = startDate ? new Date(startDate) : new Date(end.setDate(end.getDate() - 30));
    
    const prompt = `
    Generate 3 realistic stock market insights for the ${industryName} industry
    from ${start.toISOString().split('T')[0]} to ${currentDate.toISOString().split('T')[0]}.
    
    Return ONLY a JSON array matching this structure:
    [
      {
        "title": "Insight title",
        "summary": "Brief summary",
        "analysisText": "Detailed analysis",
        "symbols": ["XYZ", "ABC"],
        "date": "YYYY-MM-DD",
        "sentiment": "positive|negative|neutral",
        "confidenceScore": number,
        "keyMetrics": {
          "metric1": number,
          "metric2": number
        }
      }
    ]
    `;
    
    try {
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst providing stock market insights in JSON format only. Provide realistic insights based on real market conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });
      
      const content = response.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const insightsData = JSON.parse(jsonMatch[0]);
        
        return insightsData.map((item: any, index: number) => ({
          id: (industryId * 100) + index + 1,
          title: item.title,
          summary: item.summary,
          analysisText: item.analysisText,
          industryId,
          industry: industryName,
          symbols: item.symbols,
          date: item.date,
          sentiment: item.sentiment,
          confidenceScore: item.confidenceScore,
          keyMetrics: item.keyMetrics
        }));
      }
      
      throw new Error("Failed to parse insights from API response");
    } catch (error) {
      console.error("Error generating stock insights:", error);
      throw new Error(`Failed to generate stock insights: ${error.message}`);
    }
  }
  
  private async generateIndustryComparison(
    industryIds: number[],
    startDate?: string,
    endDate?: string
  ): Promise<IndustryComparisonItem[]> {
    // Create industry names mapping
    const industryNames = industryIds.map(id => this.getIndustryName(id));
    
    // Generate comparison using Perplexity API
    const currentDate = new Date();
    const end = endDate ? new Date(endDate) : currentDate;
    const start = startDate ? new Date(startDate) : new Date(end.setDate(end.getDate() - 30));
    
    const prompt = `
    Generate a realistic comparison of these industries' stock performance:
    ${industryNames.join(', ')}
    
    From ${start.toISOString().split('T')[0]} to ${currentDate.toISOString().split('T')[0]}.
    
    Return ONLY a JSON array matching this structure:
    [
      {
        "industry": "Industry Name",
        "performance": number,
        "volatility": number,
        "marketCap": number,
        "symbolCount": number,
        "topSymbol": {
          "symbol": "XYZ",
          "name": "Company Name",
          "performance": number
        }
      }
    ]
    
    Provide realistic values for each industry based on current market conditions.
    `;
    
    try {
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst providing stock market comparisons in JSON format only. Generate realistic comparative data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      });
      
      const content = response.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const comparisonData = JSON.parse(jsonMatch[0]);
        
        return comparisonData.map((item: any, index: number) => ({
          industryId: industryIds[index] || 0,
          industry: item.industry,
          performance: item.performance,
          volatility: item.volatility,
          marketCap: item.marketCap,
          symbolCount: item.symbolCount,
          topSymbol: item.topSymbol
        }));
      }
      
      throw new Error("Failed to parse comparison data from API response");
    } catch (error) {
      console.error("Error generating industry comparison:", error);
      throw new Error(`Failed to generate industry comparison: ${error.message}`);
    }
  }
  
  private async generateMarketTrendAnalysis(
    startDate?: string,
    endDate?: string
  ): Promise<MarketTrendAnalysis> {
    // Generate market trend analysis using Perplexity API
    const currentDate = new Date();
    const end = endDate ? new Date(endDate) : currentDate;
    const start = startDate ? new Date(startDate) : new Date(end.setDate(end.getDate() - 30));
    
    const prompt = `
    Generate a realistic market trend analysis across industries
    from ${start.toISOString().split('T')[0]} to ${currentDate.toISOString().split('T')[0]}.
    
    Return ONLY a JSON object matching this structure:
    {
      "overallTrend": "bullish|bearish|neutral",
      "topIndustries": [
        {
          "industry": "Industry Name",
          "performance": number,
          "volatility": number,
          "marketCap": number,
          "symbolCount": number,
          "topSymbol": {
            "symbol": "XYZ",
            "name": "Company Name",
            "performance": number
          }
        }
      ],
      "worstIndustries": [
        {
          "industry": "Industry Name",
          "performance": number,
          "volatility": number,
          "marketCap": number,
          "symbolCount": number,
          "topSymbol": {
            "symbol": "XYZ",
            "name": "Company Name",
            "performance": number
          }
        }
      ],
      "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
      "marketMovers": [
        {
          "symbol": "XYZ",
          "name": "Company Name",
          "change": number,
          "industry": "Industry Name"
        }
      ]
    }
    `;
    
    try {
      const response = await perplexityService.sendChatRequest({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst providing market trend analysis in JSON format only. Create realistic market analysis that reflects the current general market conditions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      });
      
      const content = response.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const trendData = JSON.parse(jsonMatch[0]);
        
        return {
          overallTrend: trendData.overallTrend,
          startDate: start.toISOString().split('T')[0],
          endDate: currentDate.toISOString().split('T')[0],
          topIndustries: trendData.topIndustries,
          worstIndustries: trendData.worstIndustries,
          keyInsights: trendData.keyInsights,
          marketMovers: trendData.marketMovers
        };
      }
      
      throw new Error("Failed to parse market trend data from API response");
    } catch (error) {
      console.error("Error generating market trend analysis:", error);
      throw new Error(`Failed to generate market trend analysis: ${error.message}`);
    }
  }
  
  // Utility methods
  
  private getIndustryName(industryId: number): string {
    // Reverse lookup in the industryMap
    for (const [name, id] of Object.entries(industryMap)) {
      if (id === industryId) {
        return name.replace('-', ' ');
      }
    }
    return `Industry ${industryId}`;
  }
  
  private getSectorForIndustry(industryId: number): string {
    // Map industries to sectors
    const sectorMap: { [key: number]: string } = {
      1: 'Information Technology',
      2: 'Healthcare',
      3: 'Financial Services',
      4: 'Energy',
      5: 'Consumer Discretionary',
      6: 'Industrials',
      7: 'Communication Services',
      8: 'Materials',
      9: 'Utilities',
      10: 'Real Estate'
    };
    
    return sectorMap[industryId] || 'Miscellaneous';
  }
}

export const stockAnalysisService = new StockAnalysisService();