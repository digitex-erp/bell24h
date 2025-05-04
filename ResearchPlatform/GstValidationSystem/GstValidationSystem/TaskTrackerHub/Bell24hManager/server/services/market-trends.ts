
import axios from 'axios';

interface MarketTrend {
  symbol: string;
  date: string;
  price: number;
  change: number;
  volume: number;
}

export class MarketTrendsAnalyzer {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getIndustryTrends(industry: string): Promise<MarketTrend[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: this.getIndustrySymbol(industry),
          apikey: this.apiKey
        }
      });

      return this.parseMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market trends:', error);
      return [];
    }
  }

  async getSupplierMarketImpact(supplierData: any): Promise<{
    marketShare: number;
    industryGrowth: number;
    competitivePosition: number;
  }> {
    const industryTrends = await this.getIndustryTrends(supplierData.industry);
    
    return {
      marketShare: this.calculateMarketShare(supplierData, industryTrends),
      industryGrowth: this.calculateIndustryGrowth(industryTrends),
      competitivePosition: this.assessCompetitivePosition(supplierData, industryTrends)
    };
  }

  private getIndustrySymbol(industry: string): string {
    const industrySymbols: Record<string, string> = {
      'Manufacturing': 'XLI',
      'Electronics': 'SMH',
      'Automotive': 'CARZ',
      'Chemical': 'XLB'
    };
    return industrySymbols[industry] || 'SPY';
  }

  private parseMarketData(data: any): MarketTrend[] {
    const timeSeriesData = data['Time Series (Daily)'];
    return Object.entries(timeSeriesData).map(([date, values]: [string, any]) => ({
      date,
      symbol: data['Meta Data']['2. Symbol'],
      price: parseFloat(values['4. close']),
      change: parseFloat(values['4. close']) - parseFloat(values['1. open']),
      volume: parseFloat(values['5. volume'])
    }));
  }

  private calculateMarketShare(supplier: any, trends: MarketTrend[]): number {
    const industryVolume = trends[0]?.volume || 1;
    return (supplier.tradingVolume / industryVolume) * 100;
  }

  private calculateIndustryGrowth(trends: MarketTrend[]): number {
    if (trends.length < 2) return 0;
    const latestPrice = trends[0].price;
    const oldestPrice = trends[trends.length - 1].price;
    return ((latestPrice - oldestPrice) / oldestPrice) * 100;
  }

  private assessCompetitivePosition(supplier: any, trends: MarketTrend[]): number {
    const industryAvgPrice = trends.reduce((sum, t) => sum + t.price, 0) / trends.length;
    const priceCompetitiveness = supplier.averagePrice < industryAvgPrice ? 1 : 0.5;
    const marketPresence = supplier.yearsInBusiness / 10;
    return (priceCompetitiveness + marketPresence) * 50;
  }
}
