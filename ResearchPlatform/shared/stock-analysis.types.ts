/**
 * Stock Analysis Types
 * 
 * This file contains the types and interfaces for the industry-specific
 * stock analysis feature, providing targeted market insights.
 */

export interface StockSymbol {
  id: number;
  symbol: string;
  name: string;
  industryId: number;
  sector: string;
  isActive: boolean;
  country: string;
  exchange: string;
}

export interface StockPrice {
  id: number;
  symbolId: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
}

export interface IndustryStockAnalysis {
  industry: string;
  industryId: number;
  sector: string;
  date: string;
  symbols: StockSymbol[];
  topPerformers: StockPerformance[];
  worstPerformers: StockPerformance[];
  averagePerformance: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  insightSummary: string;
  keyEvents: IndustryKeyEvent[];
}

export interface StockPerformance {
  symbolId: number;
  symbol: string;
  name: string;
  changePercent: number;
  price: number;
  volume: number;
  marketCap?: number;
}

export interface IndustryKeyEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  impactLevel: 'high' | 'medium' | 'low';
  affectedSymbols?: string[];
  source?: string;
}

export interface StockAnalysisFilter {
  industryId?: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
  minPerformance?: number;
  maxPerformance?: number;
  orderBy?: 'performance' | 'volume' | 'volatility';
  orderDirection?: 'asc' | 'desc';
}

export interface StockInsight {
  id: number;
  title: string;
  summary: string;
  analysisText: string;
  industryId: number;
  industry: string;
  symbols: string[];
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidenceScore: number;
  keyMetrics: {
    [key: string]: number;
  };
  relatedInsightIds?: number[];
}

export interface PriceHistoryRequest {
  symbolId: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface PriceHistoryResponse {
  symbol: string;
  name: string;
  industry: string;
  data: StockPrice[];
  startDate: string;
  endDate: string;
  overallChangePercent: number;
}

export interface IndustryComparisonItem {
  industryId: number;
  industry: string;
  performance: number;
  volatility: number;
  marketCap: number;
  symbolCount: number;
  topSymbol: {
    symbol: string;
    name: string;
    performance: number;
  };
}

export interface MarketTrendAnalysis {
  overallTrend: 'bullish' | 'bearish' | 'neutral';
  startDate: string;
  endDate: string;
  topIndustries: IndustryComparisonItem[];
  worstIndustries: IndustryComparisonItem[];
  keyInsights: string[];
  marketMovers: {
    symbol: string;
    name: string;
    change: number;
    industry: string;
  }[];
}