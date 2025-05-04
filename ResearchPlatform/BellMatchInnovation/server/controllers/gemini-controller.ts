import { Request, Response } from 'express';
import { geminiService } from '../services/gemini-service';
import { procurementInsightsService } from '../services/procurement-insights-service';

/**
 * Process a message using the Gemini chatbot
 * 
 * @param req Express request
 * @param res Express response
 */
export async function processGeminiChatbotMessage(req: Request, res: Response) {
  try {
    const { message, history, userId, mode = 'general' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Process message using the Gemini service
    const response = await geminiService.processChatbotMessage(message, {
      history: history || [],
      userId: userId || null,
      mode
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error processing Gemini chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message with Gemini' });
  }
}

/**
 * Get explanation for why a supplier matches with an RFQ
 * 
 * @param req Express request
 * @param res Express response
 */
export async function getGeminiSupplierMatchExplanation(req: Request, res: Response) {
  try {
    const rfqId = parseInt(req.params.rfqId);
    const supplierId = parseInt(req.params.supplierId);
    
    if (isNaN(rfqId) || isNaN(supplierId)) {
      return res.status(400).json({ error: 'Valid RFQ ID and supplier ID are required' });
    }
    
    // Get explanation from Gemini service
    const explanation = await geminiService.getSupplierMatchExplanation(rfqId, supplierId);
    
    res.json({ explanation });
  } catch (error) {
    console.error('Error getting supplier match explanation:', error);
    res.status(500).json({ error: 'Failed to get supplier match explanation' });
  }
}

/**
 * Get procurement insights for specific categories
 * 
 * @param req Express request
 * @param res Express response
 */
export async function getGeminiProcurementInsights(req: Request, res: Response) {
  try {
    const { categories, userId, timeframe, language } = req.body;
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Valid categories array is required' });
    }
    
    // Get insights from procurement insights service
    const insights = await procurementInsightsService.getCategoryInsights(categories, {
      userId: userId || null,
      timeframe: timeframe || 'current',
      language: language || 'en'
    });
    
    res.json({ insights });
  } catch (error) {
    console.error('Error getting procurement insights:', error);
    res.status(500).json({ error: 'Failed to get procurement insights' });
  }
}

/**
 * Get optimization suggestions for an RFQ
 * 
 * @param req Express request
 * @param res Express response
 */
export async function getGeminiRfqOptimizationSuggestions(req: Request, res: Response) {
  try {
    const { rfqDetails, userId, language } = req.body;
    
    if (!rfqDetails) {
      return res.status(400).json({ error: 'RFQ details are required' });
    }
    
    // Get optimization suggestions from procurement insights service
    const result = await procurementInsightsService.getRfqOptimizationSuggestions(rfqDetails, {
      userId: userId || null,
      language: language || 'en'
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting RFQ optimization suggestions:', error);
    res.status(500).json({ error: 'Failed to get RFQ optimization suggestions' });
  }
}

/**
 * Get supplier compatibility analysis for an RFQ
 * 
 * @param req Express request
 * @param res Express response
 */
export async function getGeminiSupplierCompatibilityAnalysis(req: Request, res: Response) {
  try {
    const { rfqId, supplierIds, userId, language } = req.body;
    
    if (!rfqId || !supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return res.status(400).json({ error: 'Valid RFQ ID and supplier IDs are required' });
    }
    
    // Get compatibility analysis from procurement insights service
    const analysis = await procurementInsightsService.getSupplierCompatibilityAnalysis(
      rfqId,
      supplierIds,
      {
        userId: userId || null,
        language: language || 'en'
      }
    );
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error getting supplier compatibility analysis:', error);
    res.status(500).json({ error: 'Failed to get supplier compatibility analysis' });
  }
}

/**
 * Get negotiation talking points for a specific RFQ and supplier
 * 
 * @param req Express request
 * @param res Express response
 */
export async function getGeminiNegotiationTalkingPoints(req: Request, res: Response) {
  try {
    const { rfqId, supplierId, userId, language } = req.body;
    
    if (!rfqId || !supplierId) {
      return res.status(400).json({ error: 'Valid RFQ ID and supplier ID are required' });
    }
    
    // Get negotiation talking points from procurement insights service
    const result = await procurementInsightsService.getNegotiationTalkingPoints(
      rfqId,
      supplierId,
      {
        userId: userId || null,
        language: language || 'en'
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error getting negotiation talking points:', error);
    res.status(500).json({ error: 'Failed to get negotiation talking points' });
  }
}