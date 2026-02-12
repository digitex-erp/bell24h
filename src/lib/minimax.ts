/**
 * MiniMax M2.1 API Service for Bell24h
 *
 * Features:
 * - Voice transcription and analysis
 * - Video analysis and product extraction
 * - Smart quote generation for suppliers
 * - Multi-step negotiation reasoning
 *
 * Cost: ~$0.30 per 1M tokens (8% of Claude cost)
 */

interface MiniMaxConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface VoiceRFQAnalysis {
  productName: string;
  quantity: number;
  unit: string;
  deliveryTimeline: string;
  location: string;
  additionalRequirements: string;
  extractedText: string;
  confidence: number;
}

interface VideoRFQAnalysis {
  productName: string;
  visualDescription: string;
  quantity: number;
  specifications: string[];
  qualityRequirements: string;
  extractedText: string;
  confidence: number;
}

interface SmartQuoteResponse {
  quotedPrice: number;
  deliveryDays: number;
  proposalText: string;
  terms: string[];
  confidence: number;
}

class MiniMaxService {
  private config: MiniMaxConfig;

  constructor() {
    this.config = {
      apiKey: process.env.MINIMAX_API_KEY || '',
      baseUrl: 'https://api.minimax.chat/v1',
      model: 'abab6.5-chat', // or 'MiniMax-Text-01' for longer context
    };
  }

  /**
   * Transcribe and analyze voice RFQ
   * Extracts: Product, Quantity, Timeline, Location
   */
  async analyzeVoiceRFQ(audioUrl: string): Promise<VoiceRFQAnalysis> {
    try {
      // Step 1: Transcribe audio using MiniMax ASR
      const transcription = await this.transcribeAudio(audioUrl);

      // Step 2: Analyze transcription to extract structured data
      const analysis = await this.extractRFQData(transcription);

      return {
        ...analysis,
        extractedText: transcription,
      };
    } catch (error) {
      console.error('MiniMax Voice RFQ Analysis Error:', error);
      throw new Error('Failed to analyze voice RFQ');
    }
  }

  /**
   * Analyze video RFQ (visual + audio)
   * Uses MiniMax Vision-Language model
   */
  async analyzeVideoRFQ(videoUrl: string): Promise<VideoRFQAnalysis> {
    try {
      const response = await fetch(`${this.config.baseUrl}/video_understanding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'MiniMax-VL-01',
          video_url: videoUrl,
          prompt: `Analyze this B2B product video and extract:
1. Product name and category
2. Visual quality indicators (color, finish, material)
3. Approximate quantity shown
4. Any specifications mentioned (size, weight, grade)
5. Quality requirements visible

Respond in JSON format with keys: productName, visualDescription, quantity, specifications, qualityRequirements`,
        }),
      });

      const data = await response.json();
      return this.parseVideoAnalysis(data);
    } catch (error) {
      console.error('MiniMax Video RFQ Analysis Error:', error);
      throw new Error('Failed to analyze video RFQ');
    }
  }

  /**
   * Generate smart quote for suppliers
   * Uses MiniMax's multi-step reasoning
   */
  async generateSmartQuote(
    rfqDetails: {
      productName: string;
      quantity: number;
      budget_min: number;
      budget_max: number;
      requirements: string;
    },
    supplierProfile: {
      category: string;
      averagePrice: number;
      deliveryCapability: number;
    }
  ): Promise<SmartQuoteResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5-chat',
          messages: [
            {
              role: 'system',
              content: `You are a B2B sales agent for a supplier. Generate competitive quotes that:
- Are within buyer's budget range (${rfqDetails.budget_min} - ${rfqDetails.budget_max})
- Consider supplier's average pricing (₹${supplierProfile.averagePrice})
- Offer realistic delivery timelines
- Include professional terms
- Maximize win probability while maintaining margin`,
            },
            {
              role: 'user',
              content: `RFQ Details:
Product: ${rfqDetails.productName}
Quantity: ${rfqDetails.quantity}
Budget: ₹${rfqDetails.budget_min} - ₹${rfqDetails.budget_max}
Requirements: ${rfqDetails.requirements}

Generate a competitive quote.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      return this.parseQuoteResponse(data);
    } catch (error) {
      console.error('MiniMax Smart Quote Error:', error);
      throw new Error('Failed to generate smart quote');
    }
  }

  /**
   * Multilingual negotiation agent
   * Handles buyer-supplier conversations in Hindi, Tamil, Telugu, English
   */
  async negotiationAgent(
    conversationHistory: Array<{ role: string; content: string }>,
    context: {
      rfqId: string;
      currentQuote: number;
      budgetRange: { min: number; max: number };
    }
  ): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5-chat',
          messages: [
            {
              role: 'system',
              content: `You are a multilingual B2B negotiation assistant for Bell24h marketplace.
- Help buyers and suppliers reach fair agreements
- Handle conversations in Hindi, Tamil, Telugu, and English
- Current quote: ₹${context.currentQuote}
- Buyer budget: ₹${context.budgetRange.min} - ₹${context.budgetRange.max}
- Suggest compromises and win-win solutions
- Be professional and culturally aware`,
            },
            ...conversationHistory,
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('MiniMax Negotiation Agent Error:', error);
      throw new Error('Failed to process negotiation');
    }
  }

  // Private helper methods

  private async transcribeAudio(audioUrl: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        file: audioUrl,
        language: 'auto', // Auto-detect Hindi, Tamil, Telugu, English
      }),
    });

    const data = await response.json();
    return data.text;
  }

  private async extractRFQData(transcription: string): Promise<Omit<VoiceRFQAnalysis, 'extractedText'>> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'abab6.5-chat',
        messages: [
          {
            role: 'system',
            content: `Extract structured RFQ data from Indian B2B conversations.
Respond ONLY with valid JSON matching this schema:
{
  "productName": string,
  "quantity": number,
  "unit": string (kg/pieces/tons/liters),
  "deliveryTimeline": string,
  "location": string (city name),
  "additionalRequirements": string,
  "confidence": number (0-1)
}`,
          },
          {
            role: 'user',
            content: `Transcription: ${transcription}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private parseVideoAnalysis(data: any): VideoRFQAnalysis {
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      productName: parsed.productName || '',
      visualDescription: parsed.visualDescription || '',
      quantity: parsed.quantity || 0,
      specifications: parsed.specifications || [],
      qualityRequirements: parsed.qualityRequirements || '',
      extractedText: content,
      confidence: 0.85,
    };
  }

  private parseQuoteResponse(data: any): SmartQuoteResponse {
    const content = data.choices[0].message.content;

    // Parse AI-generated quote
    const priceMatch = content.match(/₹?([\d,]+)/);
    const daysMatch = content.match(/(\d+)\s*days?/i);

    return {
      quotedPrice: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0,
      deliveryDays: daysMatch ? parseInt(daysMatch[1]) : 30,
      proposalText: content,
      terms: this.extractTerms(content),
      confidence: 0.9,
    };
  }

  private extractTerms(content: string): string[] {
    const terms: string[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      if (line.includes('payment') || line.includes('delivery') || line.includes('warranty')) {
        terms.push(line.trim());
      }
    });

    return terms;
  }
}

// Export singleton instance
export const minimaxService = new MiniMaxService();

// Export types
export type {
  VoiceRFQAnalysis,
  VideoRFQAnalysis,
  SmartQuoteResponse,
};
