import { RFQ, Category } from '../../types/rfq';
import { CategoryConfig } from '../../config/categories';

interface PriceData {
  category: string;
  subcategory?: string;
  price: number;
  timestamp: Date;
  location?: string;
}

interface TrendData {
  category: string;
  subcategory?: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  factors: string[];
}

interface DemandForecast {
  category: string;
  subcategory?: string;
  forecast: number;
  confidence: number;
  timeFrame: 'short' | 'medium' | 'long';
}

interface MarketOpportunity {
  category: string;
  subcategory?: string;
  opportunityScore: number;
  factors: string[];
  recommendations: string[];
}

export class PredictiveAnalyticsService {
  private priceHistory: PriceData[] = [];
  private marketTrends: TrendData[] = [];
  private demandForecasts: DemandForecast[] = [];

  async predictPriceTrend(category: string, subcategory?: string): Promise<TrendData> {
    const relevantPrices = this.priceHistory.filter(
      p => p.category === category && (!subcategory || p.subcategory === subcategory)
    );

    if (relevantPrices.length < 2) {
      return {
        category,
        subcategory,
        trend: 'stable',
        confidence: 0.5,
        factors: ['Insufficient data']
      };
    }

    const prices = relevantPrices.map(p => p.price);
    const trend = this.calculateTrend(prices);
    const confidence = this.calculateConfidence(prices);

    return {
      category,
      subcategory,
      trend,
      confidence,
      factors: this.identifyTrendFactors(trend, prices)
    };
  }

  async forecastDemand(category: string, subcategory?: string): Promise<DemandForecast> {
    const historicalData = await this.getHistoricalDemand(category, subcategory);
    const forecast = this.calculateDemandForecast(historicalData);
    const confidence = this.calculateForecastConfidence(historicalData);

    return {
      category,
      subcategory,
      forecast,
      confidence,
      timeFrame: 'medium'
    };
  }

  async identifyMarketOpportunities(category: string): Promise<MarketOpportunity[]> {
    const trends = await this.predictPriceTrend(category);
    const demand = await this.forecastDemand(category);
    const opportunities: MarketOpportunity[] = [];

    // Analyze price trends
    if (trends.trend === 'up' && trends.confidence > 0.7) {
      opportunities.push({
        category,
        opportunityScore: 0.8,
        factors: ['Rising prices', 'High confidence'],
        recommendations: [
          'Consider increasing inventory',
          'Review pricing strategy',
          'Monitor market closely'
        ]
      });
    }

    // Analyze demand forecasts
    if (demand.forecast > 1.2 && demand.confidence > 0.7) {
      opportunities.push({
        category,
        opportunityScore: 0.9,
        factors: ['Growing demand', 'High confidence'],
        recommendations: [
          'Expand capacity',
          'Increase marketing efforts',
          'Consider new suppliers'
        ]
      });
    }

    return opportunities;
  }

  async predictSupplierPerformance(supplierId: string): Promise<{
    reliability: number;
    responseTime: number;
    quality: number;
  }> {
    // Implementation would include historical data analysis
    return {
      reliability: 0.85,
      responseTime: 0.9,
      quality: 0.88
    };
  }

  private calculateTrend(prices: number[]): 'up' | 'down' | 'stable' {
    if (prices.length < 2) return 'stable';
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    if (avgChange > 0.05) return 'up';
    if (avgChange < -0.05) return 'down';
    return 'stable';
  }

  private calculateConfidence(prices: number[]): number {
    if (prices.length < 2) return 0.5;
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const variance = this.calculateVariance(changes);
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to confidence score (0-1)
    return Math.max(0, 1 - (standardDeviation / Math.max(...prices)));
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private identifyTrendFactors(trend: 'up' | 'down' | 'stable', prices: number[]): string[] {
    const factors: string[] = [];
    
    if (trend === 'up') {
      factors.push('Increasing demand');
      factors.push('Supply constraints');
    } else if (trend === 'down') {
      factors.push('Decreasing demand');
      factors.push('Increased competition');
    } else {
      factors.push('Market stability');
      factors.push('Balanced supply and demand');
    }
    
    return factors;
  }

  private async getHistoricalDemand(category: string, subcategory?: string): Promise<number[]> {
    // Implementation would fetch historical demand data
    return [100, 120, 115, 130, 140];
  }

  private calculateDemandForecast(historicalData: number[]): number {
    if (historicalData.length < 2) return historicalData[0] || 0;
    
    const changes = historicalData.slice(1).map((value, i) => value - historicalData[i]);
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    return historicalData[historicalData.length - 1] * (1 + avgChange);
  }

  private calculateForecastConfidence(historicalData: number[]): number {
    if (historicalData.length < 2) return 0.5;
    
    const changes = historicalData.slice(1).map((value, i) => value - historicalData[i]);
    const variance = this.calculateVariance(changes);
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - (standardDeviation / Math.max(...historicalData)));
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService(); 