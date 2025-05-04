import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parser';

/**
 * Indian Stock Market Service
 * 
 * This service fetches stock market data from the National Stock Exchange (NSE) of India.
 * It uses publicly available data from the NSE website by downloading CSV files and parsing them.
 */
export class IndianStockService {
  private readonly NSE_BASE_URL = 'https://www.nseindia.com';
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nseindia.com/market-data/equity-derivatives-watch'
  };
  
  /**
   * Get daily NSE market data for a specific symbol
   * 
   * @param symbol - NSE stock symbol (e.g., 'RELIANCE', 'TATAMOTORS')
   * @returns Stock data including price, volume, and other metrics
   */
  async getStockData(symbol: string): Promise<any> {
    try {
      // We need to first get cookies by visiting the NSE homepage
      const homepageResponse = await axios.get(this.NSE_BASE_URL, {
        headers: this.headers
      });
      
      // Extract cookies from the response
      const cookies = homepageResponse.headers['set-cookie'] || [];
      const cookieString = cookies.join('; ');
      
      // Add cookies to headers for subsequent requests
      const headersWithCookies = {
        ...this.headers,
        'Cookie': cookieString
      };
      
      // Fetch the stock data
      const url = `${this.NSE_BASE_URL}/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
      const response = await axios.get(url, {
        headers: headersWithCookies
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
    }
  }
  
  /**
   * Get market indices (e.g., NIFTY 50, SENSEX)
   * 
   * @returns Current values of major market indices
   */
  async getMarketIndices(): Promise<any> {
    try {
      // Get cookies first
      const homepageResponse = await axios.get(this.NSE_BASE_URL, {
        headers: this.headers
      });
      
      const cookies = homepageResponse.headers['set-cookie'] || [];
      const cookieString = cookies.join('; ');
      
      const headersWithCookies = {
        ...this.headers,
        'Cookie': cookieString
      };
      
      // Fetch market indices data
      const url = `${this.NSE_BASE_URL}/api/allIndices`;
      const response = await axios.get(url, {
        headers: headersWithCookies
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching market indices:", error);
      throw new Error(`Failed to fetch market indices: ${error.message}`);
    }
  }
  
  /**
   * Download and parse NSE bhavcopy (daily price data) 
   * 
   * @param date - Date in format DDMMYYYY (e.g., '25042025')
   * @returns Parsed CSV data with daily trading information
   */
  async getBhavcopy(date: string): Promise<any[]> {
    try {
      // Format of NSE bhavcopy URL
      const url = `https://archives.nseindia.com/content/historical/EQUITIES/2025/${date.substring(2,4)}/${date}/cm${date}bhav.csv.zip`;
      
      // Download the zip file
      const response = await axios.get(url, {
        headers: this.headers,
        responseType: 'arraybuffer'
      });
      
      // Save the zip file temporarily
      const zipPath = path.join(__dirname, `../tmp/cm${date}bhav.csv.zip`);
      fs.mkdirSync(path.dirname(zipPath), { recursive: true });
      fs.writeFileSync(zipPath, response.data);
      
      // Extract the CSV from the zip file (simplified)
      // In a real scenario, we would use a library like 'adm-zip' to extract the CSV
      // For now, let's assume the CSV is already extracted and parse it
      
      // This is a placeholder for CSV parsing code
      // In a real implementation, you would need to extract and read the actual CSV file
      const results: any[] = [];
      
      return results;
    } catch (error) {
      console.error(`Error fetching bhavcopy for ${date}:`, error);
      throw new Error(`Failed to fetch bhavcopy for ${date}: ${error.message}`);
    }
  }
  
  /**
   * Get top gainers and losers of the day
   * 
   * @returns Lists of top gainers and losers
   */
  async getTopGainersLosers(): Promise<any> {
    try {
      // Get cookies first
      const homepageResponse = await axios.get(this.NSE_BASE_URL, {
        headers: this.headers
      });
      
      const cookies = homepageResponse.headers['set-cookie'] || [];
      const cookieString = cookies.join('; ');
      
      const headersWithCookies = {
        ...this.headers,
        'Cookie': cookieString
      };
      
      // Fetch market data for top gainers and losers
      const url = `${this.NSE_BASE_URL}/api/live-analysis-variations?index=gainers_loosers`;
      const response = await axios.get(url, {
        headers: headersWithCookies
      });
      
      return {
        gainers: response.data.NIFTY?.adv || [],
        losers: response.data.NIFTY?.dec || []
      };
    } catch (error) {
      console.error("Error fetching top gainers/losers:", error);
      throw new Error(`Failed to fetch top gainers/losers: ${error.message}`);
    }
  }
  
  /**
   * Get company information and fundamentals
   * 
   * @param symbol - NSE stock symbol
   * @returns Company information including fundamentals
   */
  async getCompanyInfo(symbol: string): Promise<any> {
    try {
      // Get cookies first
      const homepageResponse = await axios.get(this.NSE_BASE_URL, {
        headers: this.headers
      });
      
      const cookies = homepageResponse.headers['set-cookie'] || [];
      const cookieString = cookies.join('; ');
      
      const headersWithCookies = {
        ...this.headers,
        'Cookie': cookieString
      };
      
      // Fetch company information
      const url = `${this.NSE_BASE_URL}/api/quote-equity?symbol=${encodeURIComponent(symbol)}&section=trade_info`;
      const response = await axios.get(url, {
        headers: headersWithCookies
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching company info for ${symbol}:`, error);
      throw new Error(`Failed to fetch company info for ${symbol}: ${error.message}`);
    }
  }
}

export default new IndianStockService();