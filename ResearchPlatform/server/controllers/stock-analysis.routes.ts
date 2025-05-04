/**
 * Stock Analysis Routes
 * 
 * This file defines the API routes for industry-specific stock analysis
 * features in the Bell24h platform.
 */

import { Express } from 'express';
import {
  getIndustryStockAnalysis,
  getIndustrySymbols,
  getPriceHistory,
  getStockInsights,
  compareIndustries,
  getMarketTrendAnalysis
} from './stock-analysis.controller';

/**
 * Register stock analysis routes
 * 
 * @param app Express application instance
 */
export function registerStockAnalysisRoutes(app: Express) {
  // Industry-specific analysis
  app.get('/api/stock-analysis/industry/:industryId', getIndustryStockAnalysis);
  
  // Get symbols for an industry
  app.get('/api/stock-analysis/industry/:industryId/symbols', getIndustrySymbols);
  
  // Get price history for a specific symbol
  app.get('/api/stock-analysis/symbol/:symbolId/price-history', getPriceHistory);
  
  // Get stock insights for an industry
  app.get('/api/stock-analysis/industry/:industryId/insights', getStockInsights);
  
  // Compare multiple industries
  app.get('/api/stock-analysis/compare', compareIndustries);
  
  // Get overall market trend analysis
  app.get('/api/stock-analysis/market-trends', getMarketTrendAnalysis);
}