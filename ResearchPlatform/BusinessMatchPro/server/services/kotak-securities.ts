import axios from 'axios';

const KOTAK_API_BASE_URL = process.env.KOTAK_API_BASE_URL || 'https://tradeapi.kotaksecurities.com/apim';
const KOTAK_API_KEY = process.env.KOTAK_API_KEY;
const KOTAK_UCC = process.env.KOTAK_UCC;

export class KotakSecuritiesService {
  private client;

  constructor() {
    if (!KOTAK_API_KEY || !KOTAK_UCC) {
      console.warn('Warning: Kotak Securities API configuration not found. Market data features will be disabled.');
      return;
    }

    this.client = axios.create({
      baseURL: KOTAK_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${KOTAK_API_KEY}`,
        'Content-Type': 'application/json',
        'ucc': KOTAK_UCC
      }
    });
  }

  async getMarketData(symbol: string) {
    try {
      const response = await this.client.get(`/quotes/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async getStockPrice(symbol: string) {
    try {
      const response = await this.client.get(`/quotes/${symbol}/ltp`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock price:', error);
      throw error;
    }
  }
}