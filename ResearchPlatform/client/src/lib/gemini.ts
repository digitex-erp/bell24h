import { apiRequest } from './queryClient';

export interface GeminiGenerationParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: 'gemini-1.5-pro' | 'gemini-1.5-flash';
}

export interface GeminiCompletionResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IndustryTrendResponse {
  industry: string;
  date: string;
  trends: {
    title: string;
    description: string;
    impactScore: number;
    relevantRegions: string[];
    sources?: string[];
  }[];
  marketSize: {
    currentValue: number;
    currency: string;
    growthRate: number;
    forecastYear: number;
  };
  keyPlayers: {
    name: string;
    marketShare?: number;
    recentDevelopments?: string;
  }[];
  disruptiveForces: string[];
  opportunities: string[];
  challenges: string[];
  summary: string;
}

export interface RfqCategorization {
  category: string;
  subCategory: string;
  confidence: number;
  tags: string[];
  potentialSuppliers: string[];
  estimatedValue: {
    min: number;
    max: number;
    currency: string;
  };
  complexity: 'low' | 'medium' | 'high';
  timeline: {
    estimatedDays: number;
    urgency: 'low' | 'medium' | 'high';
  };
}

// Gemini Text Generation
export const generateWithGemini = async (
  params: GeminiGenerationParams
): Promise<GeminiCompletionResponse> => {
  try {
    const response = await apiRequest('POST', '/api/ai/gemini/generate', params);
    return await response.json();
  } catch (error) {
    console.error('Error with Gemini generation:', error);
    throw new Error('Failed to generate content with Gemini');
  }
};

// Industry Trend Analysis
export const getIndustryTrends = async (
  industry: string,
  region?: string,
  timeframe?: string
): Promise<IndustryTrendResponse> => {
  try {
    const response = await apiRequest('POST', '/api/ai/gemini/industry-trends', {
      industry,
      region,
      timeframe
    });
    return await response.json();
  } catch (error) {
    console.error('Error getting industry trends:', error);
    throw new Error('Failed to retrieve industry trends');
  }
};

// RFQ Categorization
export const categorizeRfq = async (
  rfqText: string
): Promise<RfqCategorization> => {
  try {
    const response = await apiRequest('POST', '/api/ai/gemini/categorize-rfq', {
      rfqText
    });
    return await response.json();
  } catch (error) {
    console.error('Error categorizing RFQ:', error);
    throw new Error('Failed to categorize RFQ');
  }
};

// Supplier Matching
export const matchSuppliers = async (
  rfqData: any,
  count: number = 5
): Promise<any[]> => {
  try {
    const response = await apiRequest('POST', '/api/ai/gemini/match-suppliers', {
      rfqData,
      count
    });
    return await response.json();
  } catch (error) {
    console.error('Error matching suppliers:', error);
    throw new Error('Failed to match suppliers');
  }
};

// Business Analysis
export const analyzeBusinessTrends = async (
  businessName: string,
  industry?: string
): Promise<any> => {
  try {
    const response = await apiRequest('POST', '/api/ai/gemini/business-analysis', {
      businessName,
      industry
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing business trends:', error);
    throw new Error('Failed to analyze business trends');
  }
};