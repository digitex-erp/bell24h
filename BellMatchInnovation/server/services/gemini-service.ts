/**
 * Gemini Service
 * 
 * This service handles interactions with the Gemini API
 * for procurement AI features with contextual awareness
 */

// Options for the chatbot API
export interface ChatbotOptions {
  history?: any[];
  userId?: number | null;
  mode?: string;
  context?: ChatbotContext;
}

// Contextual information for the chatbot
export interface ChatbotContext {
  currentRfq?: {
    id: number;
    title: string;
    description?: string;
    category?: string;
    requirements?: string[];
  } | null;
  currentSupplier?: {
    id: number;
    name: string;
    category?: string;
    capabilities?: string[];
    rating?: number;
  } | null;
  recentCategories?: string[];
  lastQueriedCategory?: string | null;
  userPreferences?: {
    language?: string;
    industry?: string;
    preferredSupplierTypes?: string[];
    responseStyle?: 'concise' | 'detailed';
    dataPrivacyLevel?: 'standard' | 'enhanced';
  };
}

class GeminiService {
  private apiKey: string;
  
  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set');
    }
  }
  
  /**
   * Process a chatbot message and get a response with contextual awareness
   */
  async processChatbotMessage(message: string, options: ChatbotOptions = {}) {
    try {
      const { history = [], userId = null, mode = 'general', context } = options;
      
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      
      // Convert history format to Gemini format
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      // System prompt based on mode with contextual information
      let systemPrompt = 'You are a helpful procurement assistant for Bell24h.com, an AI-powered RFQ marketplace that simplifies global procurement through intelligent supplier matching. Provide concise, accurate information about procurement, suppliers, and RFQs.';
      
      if (mode === 'analysis') {
        systemPrompt = 'You are a procurement analyst specialized in market trends and category insights for Bell24h.com, an AI-powered RFQ marketplace. Provide detailed analysis with actionable insights.';
      } else if (mode === 'rfp') {
        systemPrompt = 'You are an RFP optimization expert for Bell24h.com, an AI-powered RFQ marketplace. Analyze RFQs and provide specific improvements to clarity, structure, and content.';
      } else if (mode === 'negotiation') {
        systemPrompt = 'You are a negotiation strategy expert for Bell24h.com, an AI-powered RFQ marketplace. Provide strategic talking points and approaches for procurement negotiations.';
      } else if (mode === 'supplier-match') {
        systemPrompt = 'You are a supplier matching expert for Bell24h.com, an AI-powered RFQ marketplace. Evaluate compatibility between RFQs and potential suppliers based on capabilities, ratings, and business requirements.';
      }
      
      // Add contextual information to the system prompt if available
      if (context) {
        systemPrompt += '\n\nCONTEXT:';
        
        if (context.currentRfq) {
          systemPrompt += `\nCurrent RFQ: #${context.currentRfq.id} - ${context.currentRfq.title}`;
          if (context.currentRfq.description) {
            systemPrompt += `\nDescription: ${context.currentRfq.description}`;
          }
          if (context.currentRfq.category) {
            systemPrompt += `\nCategory: ${context.currentRfq.category}`;
          }
          if (context.currentRfq.requirements && context.currentRfq.requirements.length > 0) {
            systemPrompt += `\nRequirements: ${context.currentRfq.requirements.join(', ')}`;
          }
        }
        
        if (context.currentSupplier) {
          systemPrompt += `\n\nCurrent Supplier: #${context.currentSupplier.id} - ${context.currentSupplier.name}`;
          if (context.currentSupplier.category) {
            systemPrompt += `\nCategory: ${context.currentSupplier.category}`;
          }
          if (context.currentSupplier.capabilities && context.currentSupplier.capabilities.length > 0) {
            systemPrompt += `\nCapabilities: ${context.currentSupplier.capabilities.join(', ')}`;
          }
          if (context.currentSupplier.rating) {
            systemPrompt += `\nRating: ${context.currentSupplier.rating}/5`;
          }
        }
        
        if (context.recentCategories && context.recentCategories.length > 0) {
          systemPrompt += `\n\nRecent Categories: ${context.recentCategories.join(', ')}`;
        }
        
        if (context.lastQueriedCategory) {
          systemPrompt += `\nLast Queried Category: ${context.lastQueriedCategory}`;
        }
        
        if (context.userPreferences) {
          systemPrompt += '\n\nUser Preferences:';
          
          if (context.userPreferences.language) {
            systemPrompt += `\nPreferred Language: ${context.userPreferences.language}`;
          }
          
          if (context.userPreferences.industry) {
            systemPrompt += `\nIndustry: ${context.userPreferences.industry}`;
          }
          
          if (context.userPreferences.preferredSupplierTypes && context.userPreferences.preferredSupplierTypes.length > 0) {
            systemPrompt += `\nPreferred Supplier Types: ${context.userPreferences.preferredSupplierTypes.join(', ')}`;
          }
          
          if (context.userPreferences.responseStyle) {
            systemPrompt += `\nPreferred Response Style: ${context.userPreferences.responseStyle}`;
          }
          
          if (context.userPreferences.dataPrivacyLevel) {
            systemPrompt += `\nData Privacy Level: ${context.userPreferences.dataPrivacyLevel}`;
          }
        }
      }
      
      // Add system prompt
      const contents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand my role and the context. How can I assist you with your procurement needs?' }]
        },
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];
      
      // Make API request
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + this.apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      // Handle errors from the API
      if (result.error) {
        throw new Error(`Gemini API error: ${result.error.message}`);
      }
      
      let responseText = '';
      let actions = [];
      
      // Process response
      if (result.candidates && result.candidates.length > 0) {
        const candidate = result.candidates[0];
        
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          responseText = candidate.content.parts[0].text;
          
          // Check for special actions in the response
          actions = this.extractActionsFromResponse(responseText);
        }
      }
      
      return {
        response: responseText,
        actions
      };
    } catch (error: any) {
      console.error('Error processing chatbot message with Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Get explanation for why a supplier was matched with an RFQ with contextual awareness
   */
  async getSupplierMatchExplanation(rfqId: number | string, supplierId: number | string, options: ChatbotOptions = {}) {
    try {
      // In a real implementation, this would fetch RFQ and supplier data
      // and pass it to the AI model for analysis
      
      const prompt = `
        Please explain why Supplier #${supplierId} is a good match for RFQ #${rfqId}.
        
        Include:
        1. Key compatibility factors
        2. Potential challenges and how to address them
        3. Specific capabilities of the supplier that align with RFQ requirements
        4. Competitive advantages of this supplier over others
        5. Historical performance data relevance
        
        Format your response to be clear, concise, and actionable for procurement professionals.
      `;
      
      const result = await this.processChatbotMessage(prompt, {
        ...options,
        mode: 'supplier-match'
      });
      
      return result.response;
    } catch (error: any) {
      console.error('Error getting supplier match explanation:', error);
      throw error;
    }
  }
  
  /**
   * Get procurement category insights based on user's recent activity and preferences
   */
  async getCategoryInsights(category: string, options: ChatbotOptions = {}) {
    try {
      const prompt = `
        Please provide detailed insights about the "${category}" procurement category. 
        
        Include:
        1. Market trends and forecast
        2. Key suppliers in this space
        3. Common challenges and best practices
        4. Pricing models and negotiation strategies
        5. Quality assurance considerations
        6. Sustainability and ESG factors
        
        Format your response to be informative and actionable for procurement professionals.
      `;
      
      const result = await this.processChatbotMessage(prompt, {
        ...options,
        mode: 'analysis'
      });
      
      return result.response;
    } catch (error: any) {
      console.error('Error getting category insights:', error);
      throw error;
    }
  }
  
  /**
   * Get RFQ optimization suggestions based on current RFQ context
   */
  async getRfqOptimizationSuggestions(rfqId: number | string, options: ChatbotOptions = {}) {
    try {      
      const prompt = `
        Please analyze RFQ #${rfqId} and provide optimization suggestions.
        
        Focus on:
        1. Clarity and completeness of requirements
        2. Opportunities to enhance supplier response quality
        3. Technical specification improvements
        4. Pricing structure and payment terms
        5. Timeline and delivery requirements
        6. Supplier qualification criteria
        
        Format your response with specific, actionable improvements.
      `;
      
      const result = await this.processChatbotMessage(prompt, {
        ...options,
        mode: 'rfp'
      });
      
      return result.response;
    } catch (error: any) {
      console.error('Error getting RFQ optimization suggestions:', error);
      throw error;
    }
  }
  
  /**
   * Get negotiation talking points based on RFQ and supplier context
   */
  async getNegotiationTalkingPoints(rfqId: number | string, supplierId: number | string, options: ChatbotOptions = {}) {
    try {
      const prompt = `
        Please provide strategic talking points for negotiations with Supplier #${supplierId} regarding RFQ #${rfqId}.
        
        Include:
        1. Key negotiation leverage points
        2. Potential supplier concerns to address
        3. Pricing and terms strategy
        4. Quality and service level considerations
        5. Risk mitigation approaches
        6. Competitive alternatives to reference
        
        Format your response as concise, actionable talking points that can be used during negotiations.
      `;
      
      const result = await this.processChatbotMessage(prompt, {
        ...options,
        mode: 'negotiation'
      });
      
      return result.response;
    } catch (error: any) {
      console.error('Error getting negotiation talking points:', error);
      throw error;
    }
  }
  
  /**
   * Extract special actions from the AI response with enhanced context awareness
   */
  private extractActionsFromResponse(text: string): any[] {
    const actions = [];
    
    // Advanced pattern detection for contextual actions
    // In a production system, this would use a more sophisticated approach with NLP
    
    // Look for table creation requests
    if (text.includes('[CREATE_TABLE]') || text.includes('[TABLE_START]')) {
      actions.push({
        type: 'createTable',
        metadata: { suggested: true }
      });
    }
    
    // Look for chart creation requests
    if (text.includes('[CREATE_CHART]') || text.includes('[CHART]')) {
      actions.push({
        type: 'createChart',
        metadata: { suggested: true }
      });
    }
    
    // Look for supplier comparison requests
    if (text.includes('[COMPARE_SUPPLIERS]')) {
      actions.push({
        type: 'compareSuppliers',
        metadata: { suggested: true }
      });
    }
    
    // Look for RFQ optimization suggestions
    if (text.includes('[OPTIMIZE_RFQ]') || text.includes('[RFQ_OPTIMIZATION]')) {
      actions.push({
        type: 'optimizeRfq',
        metadata: { suggested: true }
      });
    }
    
    // Look for category analysis requests
    if (text.includes('[CATEGORY_ANALYSIS]') || text.includes('[ANALYZE_CATEGORY]')) {
      actions.push({
        type: 'analyzeCategory',
        metadata: { suggested: true }
      });
    }
    
    // Look for supplier compatibility assessment
    if (text.includes('[ASSESS_COMPATIBILITY]') || text.includes('[COMPATIBILITY_CHECK]')) {
      actions.push({
        type: 'assessCompatibility',
        metadata: { suggested: true }
      });
    }
    
    // Look for negotiation strategy recommendations
    if (text.includes('[NEGOTIATION_STRATEGY]') || text.includes('[RECOMMEND_NEGOTIATION_POINTS]')) {
      actions.push({
        type: 'negotiationStrategy',
        metadata: { suggested: true }
      });
    }
    
    // Look for collaboration requests that might need to be forwarded to other users
    if (text.includes('[COLLABORATION_REQUEST]') || text.includes('[FORWARD_TO_TEAM]')) {
      actions.push({
        type: 'collaborationRequest',
        metadata: { suggested: true }
      });
    }
    
    // Look for data export requests
    if (text.includes('[EXPORT_DATA]') || text.includes('[DOWNLOAD_REPORT]')) {
      actions.push({
        type: 'exportData',
        metadata: { suggested: true }
      });
    }
    
    // Look for meeting scheduling suggestions
    if (text.includes('[SCHEDULE_MEETING]') || text.includes('[SUGGEST_MEETING]')) {
      actions.push({
        type: 'scheduleMeeting',
        metadata: { suggested: true }
      });
    }
    
    return actions;
  }
}

export const geminiService = new GeminiService();