import axios from 'axios';
import { logger } from '../logger';

export class NapkinAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NAPKIN_AI_API_KEY || '';
    this.baseUrl = 'https://api.napkin.ai/v1';
  }

  async generateReport(data: any): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/reports/generate`, 
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Generated report with Napkin.ai');
      return response.data.reportUrl;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  async analyzeMarketTrends(industry: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/market-trends/${industry}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            timeframe: '3m',
            metrics: ['volume', 'growth', 'competition']
          }
        }
      );

      logger.info(`Analyzed market trends for industry: ${industry}`);
      return response.data;
    } catch (error) {
      logger.error('Error analyzing market trends:', error);
      throw error;
    }
  }
}

export const napkinAiService = new NapkinAIService();