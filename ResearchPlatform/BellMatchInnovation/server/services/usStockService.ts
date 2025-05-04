import axios from 'axios';

/**
 * US Stock Market Service
 * 
 * This service fetches stock market data from multiple public APIs for US markets.
 * It prioritizes free tier services like Alpha Vantage, Finnhub, and Yahoo Finance API.
 */
export class USStockService {
  private readonly ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
  private readonly FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
  
  /**
   * Get current stock quote for a symbol
   * 
   * @param symbol - Stock symbol (e.g., 'AAPL', 'MSFT')
   * @returns Current price and related information
   */
  async getStockQuote(symbol: string): Promise<any> {
    try {
      // Try Alpha Vantage first
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const response = await axios.get(url);
      
      if (response.data['Global Quote'] && Object.keys(response.data['Global Quote']).length > 0) {
        const quote = response.data['Global Quote'];
        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: quote['10. change percent'],
          volume: parseInt(quote['06. volume']),
          latestTradingDay: quote['07. latest trading day'],
          source: 'Alpha Vantage'
        };
      }
      
      // Fallback to Finnhub if Alpha Vantage fails or has no data
      const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.FINNHUB_API_KEY}`;
      const finnhubResponse = await axios.get(finnhubUrl);
      
      if (finnhubResponse.data && finnhubResponse.data.c) {
        return {
          symbol: symbol,
          price: finnhubResponse.data.c,
          change: finnhubResponse.data.d,
          changePercent: finnhubResponse.data.dp,
          high: finnhubResponse.data.h,
          low: finnhubResponse.data.l,
          open: finnhubResponse.data.o,
          previousClose: finnhubResponse.data.pc,
          timestamp: finnhubResponse.data.t,
          source: 'Finnhub'
        };
      }
      
      throw new Error('No data available from any provider');
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      throw new Error(`Failed to fetch stock quote for ${symbol}: ${error.message}`);
    }
  }
  
  /**
   * Get historical price data for a symbol
   * 
   * @param symbol - Stock symbol
   * @param interval - Time interval (daily, weekly, monthly)
   * @returns Historical price data
   */
  async getHistoricalData(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
    try {
      const function_name = interval === 'daily' ? 'TIME_SERIES_DAILY' : 
                           interval === 'weekly' ? 'TIME_SERIES_WEEKLY' : 'TIME_SERIES_MONTHLY';
      
      const url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const response = await axios.get(url);
      
      const timeSeriesKey = interval === 'daily' ? 'Time Series (Daily)' : 
                           interval === 'weekly' ? 'Weekly Time Series' : 'Monthly Time Series';
      
      if (response.data[timeSeriesKey]) {
        const timeSeries = response.data[timeSeriesKey];
        const formattedData = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }));
        
        return {
          symbol,
          interval,
          data: formattedData,
          source: 'Alpha Vantage'
        };
      }
      
      throw new Error('No historical data available');
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
    }
  }
  
  /**
   * Get company information
   * 
   * @param symbol - Stock symbol
   * @returns Company overview including sector, industry, etc.
   */
  async getCompanyOverview(symbol: string): Promise<any> {
    try {
      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.Symbol) {
        return {
          ...response.data,
          source: 'Alpha Vantage'
        };
      }
      
      throw new Error('No company overview available');
    } catch (error) {
      console.error(`Error fetching company overview for ${symbol}:`, error);
      throw new Error(`Failed to fetch company overview for ${symbol}: ${error.message}`);
    }
  }
  
  /**
   * Get major US market indices (S&P 500, NASDAQ, Dow Jones)
   * 
   * @returns Current values of major market indices
   */
  async getMarketIndices(): Promise<any> {
    try {
      // Define symbols for major indices
      const indices = [
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^DJI', name: 'Dow Jones Industrial Average' },
        { symbol: '^IXIC', name: 'NASDAQ Composite' },
        { symbol: '^RUT', name: 'Russell 2000' }
      ];
      
      // Get quotes for all indices
      const promises = indices.map(index => this.getStockQuote(index.symbol)
        .then(quote => ({ ...quote, name: index.name }))
        .catch(error => ({ 
          symbol: index.symbol, 
          name: index.name, 
          error: error.message,
          available: false 
        }))
      );
      
      const results = await Promise.all(promises);
      
      return {
        indices: results,
        timestamp: new Date().toISOString(),
        source: 'Alpha Vantage'
      };
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw new Error(`Failed to fetch market indices: ${error.message}`);
    }
  }
  
  /**
   * Search for stocks by keyword
   * 
   * @param keywords - Search keywords
   * @returns List of matching stocks
   */
  async searchStocks(keywords: string): Promise<any> {
    try {
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.bestMatches) {
        return {
          results: response.data.bestMatches.map((match: any) => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            currency: match['8. currency'],
            matchScore: match['9. matchScore']
          })),
          source: 'Alpha Vantage'
        };
      }
      
      return { results: [], source: 'Alpha Vantage' };
    } catch (error) {
      console.error(`Error searching stocks for "${keywords}":`, error);
      throw new Error(`Failed to search stocks for "${keywords}": ${error.message}`);
    }
  }
}

export default new USStockService();