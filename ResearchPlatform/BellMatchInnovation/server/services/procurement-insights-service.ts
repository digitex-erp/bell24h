/**
 * Procurement Insights Service
 * 
 * This service provides category-specific procurement insights
 * and supplier compatibility analysis
 */

import { geminiService } from './gemini-service';

export interface ProcurementInsightOptions {
  userId?: number | null;
  language?: string;
  includeSuppliers?: boolean;
  depth?: 'basic' | 'detailed' | 'comprehensive';
}

class ProcurementInsightsService {
  /**
   * Get insights for a specific procurement category
   */
  async getCategoryInsights(category: string, options: ProcurementInsightOptions = {}) {
    try {
      const { 
        userId = null, 
        language = 'en',
        includeSuppliers = true,
        depth = 'detailed'
      } = options;
      
      // In a real implementation, this would fetch category-specific data
      // from a database or external source before passing to the AI model
      
      let detailLevel = '';
      if (depth === 'basic') {
        detailLevel = 'Provide a basic overview with fundamental information.';
      } else if (depth === 'comprehensive') {
        detailLevel = 'Provide comprehensive, in-depth analysis with detailed information.';
      } else {
        detailLevel = 'Provide a balanced analysis with moderate detail.';
      }
      
      const supplierSection = includeSuppliers
        ? '2. Key suppliers and market leaders in this category\n'
        : '';
      
      const prompt = `
        Please provide procurement insights for the ${category} category in ${language} language.
        ${detailLevel}
        
        Include:
        1. Current market conditions and trends
        ${supplierSection}
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
      
      return {
        category,
        insights: response.response,
        actions: response.actions
      };
    } catch (error: any) {
      console.error('Error getting category insights:', error);
      throw new Error(`Failed to get insights for category '${category}': ${error.message}`);
    }
  }
  
  /**
   * Analyze supplier compatibility with an RFQ
   */
  async analyzeSupplierCompatibility(supplierId: number | string, rfqId: number | string, options: ProcurementInsightOptions = {}) {
    try {
      const { userId = null, depth = 'detailed' } = options;
      
      // In a real implementation, this would fetch supplier and RFQ data
      // from a database before passing to the AI model
      
      let detailLevel = '';
      if (depth === 'basic') {
        detailLevel = 'Provide a basic overview with fundamental compatibility factors.';
      } else if (depth === 'comprehensive') {
        detailLevel = 'Provide comprehensive, in-depth analysis with detailed compatibility assessment.';
      } else {
        detailLevel = 'Provide a balanced analysis with moderate detail.';
      }
      
      const response = await geminiService.getSupplierMatchExplanation(rfqId, supplierId, {
        userId
      });
      
      return {
        supplierId,
        rfqId,
        compatibility: response,
        recommendation: this.generateRecommendation(response)
      };
    } catch (error: any) {
      console.error('Error analyzing supplier compatibility:', error);
      throw new Error(`Failed to analyze supplier compatibility: ${error.message}`);
    }
  }
  
  /**
   * Generate a simplified recommendation based on the compatibility analysis
   */
  private generateRecommendation(analysisText: string): string {
    // In a real implementation, this would use more sophisticated analysis
    // to extract a recommendation from the AI response
    
    if (analysisText.toLowerCase().includes('highly compatible') || 
        analysisText.toLowerCase().includes('excellent match') ||
        analysisText.toLowerCase().includes('strong alignment')) {
      return 'Highly Recommended';
    } else if (analysisText.toLowerCase().includes('potential challenges') ||
              analysisText.toLowerCase().includes('some concerns')) {
      return 'Recommended with Caution';
    } else if (analysisText.toLowerCase().includes('significant mismatch') ||
              analysisText.toLowerCase().includes('major concerns')) {
      return 'Not Recommended';
    } else {
      return 'Moderately Recommended';
    }
  }
}

export const procurementInsightsService = new ProcurementInsightsService();