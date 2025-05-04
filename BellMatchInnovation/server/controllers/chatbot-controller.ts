import { Request, Response } from 'express';
import { geminiService } from '../services/gemini-service';

/**
 * Process a general chatbot message
 */
export async function handleChatbotMessage(req: Request, res: Response) {
  try {
    const { message, history, userId, mode } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await geminiService.processChatbotMessage(message, {
      history,
      userId,
      mode
    });
    
    return res.json(response);
  } catch (error: any) {
    console.error('Error processing chatbot message:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chatbot message' });
  }
}

/**
 * Get category-specific procurement insights
 */
export async function getProcurementInsights(req: Request, res: Response) {
  try {
    const { category, userId } = req.body;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    const prompt = `
      Please provide comprehensive procurement insights for the ${category} category.
      
      Include:
      1. Current market conditions and trends
      2. Key suppliers and market leaders
      3. Typical pricing structures and negotiation strategies
      4. Common quality and compliance issues to watch for
      5. Sustainability and ethical considerations
      6. Supply chain risks specific to this category
      7. Recommended procurement strategies and best practices
      
      Format your response in clear sections with concise, actionable insights.
    `;
    
    const response = await geminiService.processChatbotMessage(prompt, {
      userId,
      mode: 'analysis'
    });
    
    return res.json(response);
  } catch (error: any) {
    console.error('Error getting category insights:', error);
    return res.status(500).json({ error: error.message || 'Failed to get category insights' });
  }
}

/**
 * Get RFQ optimization suggestions
 */
export async function optimizeRfq(req: Request, res: Response) {
  try {
    const { rfqText, userId } = req.body;
    
    if (!rfqText) {
      return res.status(400).json({ error: 'RFQ text is required' });
    }
    
    const prompt = `
      Please analyze and optimize the following RFQ (Request for Quotation):
      
      ${rfqText}
      
      Provide specific recommendations to improve:
      1. Clarity and precision of requirements
      2. Completeness (identify missing important details)
      3. Structure and organization
      4. Technical specifications
      5. Evaluation criteria
      6. Timeline and milestones
      7. Payment terms if applicable
      
      For each improvement, explain why it would help attract better supplier responses.
      If you spot potential compliance or legal issues, highlight those as well.
      
      Format your response with clear headings and concise, specific suggestions.
    `;
    
    const response = await geminiService.processChatbotMessage(prompt, {
      userId,
      mode: 'rfp'
    });
    
    return res.json(response);
  } catch (error: any) {
    console.error('Error optimizing RFQ:', error);
    return res.status(500).json({ error: error.message || 'Failed to optimize RFQ' });
  }
}

/**
 * Get negotiation talking points for a specific supplier and RFQ
 */
export async function getNegotiationTalkingPoints(req: Request, res: Response) {
  try {
    const { supplierId, rfqId, userId } = req.body;
    
    if (!supplierId || !rfqId) {
      return res.status(400).json({ error: 'Supplier ID and RFQ ID are required' });
    }
    
    const prompt = `
      Please provide strategic negotiation talking points for negotiating with Supplier #${supplierId} 
      regarding RFQ #${rfqId}.
      
      Include:
      1. Key leverage points to use in the negotiation
      2. Potential areas for price concessions
      3. Non-price factors that could be negotiated (delivery, payment terms, etc.)
      4. Recommended negotiation approach based on supplier profile
      5. Potential objections from the supplier and how to counter them
      6. Alternative options to discuss if negotiations stall
      7. BATNA (Best Alternative To a Negotiated Agreement)
      
      Format your response with clear sections and prioritize the most impactful points first.
    `;
    
    const response = await geminiService.processChatbotMessage(prompt, {
      userId,
      mode: 'negotiation'
    });
    
    return res.json(response);
  } catch (error: any) {
    console.error('Error getting negotiation talking points:', error);
    return res.status(500).json({ error: error.message || 'Failed to get negotiation talking points' });
  }
}

/**
 * Analyze supplier compatibility with an RFQ
 */
export async function getSupplierCompatibility(req: Request, res: Response) {
  try {
    const { supplierId, rfqId, userId } = req.body;
    
    if (!supplierId || !rfqId) {
      return res.status(400).json({ error: 'Supplier ID and RFQ ID are required' });
    }
    
    const explanation = await geminiService.getSupplierMatchExplanation(rfqId, supplierId, {
      userId
    });
    
    return res.json({
      response: explanation,
      actions: []
    });
  } catch (error: any) {
    console.error('Error analyzing supplier compatibility:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze supplier compatibility' });
  }
}

/**
 * Get detailed supplier match explanation
 */
export async function getSupplierMatchExplanation(req: Request, res: Response) {
  try {
    const { supplierId, rfqId, userId } = req.body;
    
    if (!supplierId || !rfqId) {
      return res.status(400).json({ error: 'Supplier ID and RFQ ID are required' });
    }
    
    const explanation = await geminiService.getSupplierMatchExplanation(rfqId, supplierId, {
      userId
    });
    
    return res.json({
      explanation
    });
  } catch (error: any) {
    console.error('Error getting supplier match explanation:', error);
    return res.status(500).json({ error: error.message || 'Failed to get supplier match explanation' });
  }
}