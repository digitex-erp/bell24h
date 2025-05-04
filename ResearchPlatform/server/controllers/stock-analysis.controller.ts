/**
 * Stock Analysis Controller
 * 
 * This controller handles requests for industry-specific stock analysis,
 * providing targeted market insights for the Bell24h platform.
 */

import { Request, Response } from 'express';
import { stockAnalysisService } from '../services/stock-analysis.service';
import { StockAnalysisFilter, PriceHistoryRequest } from '@shared/stock-analysis.types';

/**
 * Get industry-specific stock analysis
 */
export async function getIndustryStockAnalysis(req: Request, res: Response) {
  try {
    const industryId = parseInt(req.params.industryId);
    if (isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    // Extract filter parameters from query
    const filter: StockAnalysisFilter = {};
    if (req.query.timeframe) filter.timeframe = req.query.timeframe as any;
    if (req.query.startDate) filter.startDate = req.query.startDate as string;
    if (req.query.endDate) filter.endDate = req.query.endDate as string;
    if (req.query.minPerformance) filter.minPerformance = parseFloat(req.query.minPerformance as string);
    if (req.query.maxPerformance) filter.maxPerformance = parseFloat(req.query.maxPerformance as string);
    if (req.query.orderBy) filter.orderBy = req.query.orderBy as any;
    if (req.query.orderDirection) filter.orderDirection = req.query.orderDirection as any;
    
    const analysisData = await stockAnalysisService.getIndustryStockAnalysis(industryId, filter);
    res.json(analysisData);
  } catch (error) {
    console.error('Error in getIndustryStockAnalysis controller:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve industry stock analysis' });
  }
}

/**
 * Get stock symbols for a specific industry
 */
export async function getIndustrySymbols(req: Request, res: Response) {
  try {
    const industryId = parseInt(req.params.industryId);
    if (isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    const symbols = await stockAnalysisService.getIndustrySymbols(industryId);
    res.json(symbols);
  } catch (error) {
    console.error('Error in getIndustrySymbols controller:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve industry symbols' });
  }
}

/**
 * Get historical price data for a specific stock symbol
 */
export async function getPriceHistory(req: Request, res: Response) {
  try {
    const symbolId = parseInt(req.params.symbolId);
    if (isNaN(symbolId)) {
      return res.status(400).json({ error: 'Invalid symbol ID' });
    }
    
    // Extract request parameters
    const request: PriceHistoryRequest = {
      symbolId,
      timeframe: (req.query.timeframe as any) || 'daily',
    };
    
    if (req.query.startDate) request.startDate = req.query.startDate as string;
    if (req.query.endDate) request.endDate = req.query.endDate as string;
    if (req.query.limit) request.limit = parseInt(req.query.limit as string);
    
    const priceData = await stockAnalysisService.getPriceHistory(request);
    res.json(priceData);
  } catch (error) {
    console.error('Error in getPriceHistory controller:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve price history' });
  }
}

/**
 * Get detailed stock insights for a specific industry
 */
export async function getStockInsights(req: Request, res: Response) {
  try {
    const industryId = parseInt(req.params.industryId);
    if (isNaN(industryId)) {
      return res.status(400).json({ error: 'Invalid industry ID' });
    }
    
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    
    const insights = await stockAnalysisService.getStockInsights(industryId, startDate, endDate);
    res.json(insights);
  } catch (error) {
    console.error('Error in getStockInsights controller:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve stock insights' });
  }
}

/**
 * Compare multiple industries' stock performance
 */
export async function compareIndustries(req: Request, res: Response) {
  try {
    // Extract industry IDs from query parameter
    let industryIds: number[] = [];
    
    if (typeof req.query.industryIds === 'string') {
      industryIds = req.query.industryIds.split(',').map(id => parseInt(id.trim()));
      
      // Validate all IDs are valid numbers
      if (industryIds.some(id => isNaN(id))) {
        return res.status(400).json({ error: 'Invalid industry ID format' });
      }
    } else {
      return res.status(400).json({ error: 'industryIds parameter is required' });
    }
    
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    
    const comparisonData = await stockAnalysisService.compareIndustries(industryIds, startDate, endDate);
    res.json(comparisonData);
  } catch (error) {
    console.error('Error in compareIndustries controller:', error);
    res.status(500).json({ error: error.message || 'Failed to compare industries' });
  }
}

/**
 * Get overall market trend analysis across industries
 */
export async function getMarketTrendAnalysis(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    
    const trendAnalysis = await stockAnalysisService.getMarketTrendAnalysis(startDate, endDate);
    res.json(trendAnalysis);
  } catch (error) {
    console.error('Error in getMarketTrendAnalysis controller:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve market trend analysis' });
  }
}