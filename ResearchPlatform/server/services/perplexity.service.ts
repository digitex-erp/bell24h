/**
 * Perplexity API Service
 * 
 * This service provides integration with the Perplexity API for advanced
 * AI-powered industry trend analysis and market insights.
 * 
 * Implements best practices for error handling, metric tracking, and graceful degradation.
 */

import axios from "axios";

// Custom error class for Perplexity API errors
export class PerplexityError extends Error {
  statusCode: number;
  errorCode?: string;
  retryable: boolean;
  
  constructor(message: string, statusCode: number = 500, errorCode?: string, retryable: boolean = false) {
    super(message);
    this.name = "PerplexityError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryable = retryable;
  }
}

// Message structure for Perplexity API
export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Request options for Perplexity API
export interface PerplexityRequestOptions {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

// Response structure from Perplexity API
export interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// API metrics tracking
interface ApiMetrics {
  provider: string;
  requestTime: number;
  responseTime: number;
  latency: number;
  status: number;
  success: boolean;
  tokensUsed?: number;
  errorType?: string;
  industry?: string;
  region?: string;
}

export class PerplexityService {
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.perplexity.ai/chat/completions";
  private readonly defaultModel = "llama-3.1-sonar-small-128k-online";
  private readonly maxRetries = 2;
  private requestCount = 0;
  private errorCount = 0;
  
  constructor() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.warn("Perplexity API key not found. Some features may not work.");
    }
    this.apiKey = apiKey || "";
  }
  
  /**
   * Generate industry trend analysis using Perplexity AI API
   * 
   * @param industry The industry to analyze
   * @param region Optional region to focus on
   * @returns Structured industry trend analysis data
   */
  async generateIndustryTrendAnalysis(industry: string, region?: string): Promise<any> {
    if (!this.apiKey) {
      throw new PerplexityError("Perplexity API key not configured", 500, "MISSING_API_KEY", false);
    }
    
    // Initialize metrics tracking
    const metrics: ApiMetrics = {
      provider: "perplexity",
      requestTime: Date.now(),
      responseTime: 0,
      latency: 0,
      status: 0,
      success: false,
      industry,
      region: region || undefined
    };
    
    try {
      this.requestCount++;
      const startTime = Date.now();
      
      const regionSpecificPrompt = region 
        ? `Focus specifically on the ${region} region.` 
        : "Include global perspective with regional highlights where relevant.";
      
      const messages: PerplexityMessage[] = [
        {
          role: "system",
          content: `You are an expert industry analyst with deep knowledge of market trends, competitive landscapes, and business intelligence. 
            Provide comprehensive, well-structured, and data-driven analysis. 
            Format your response as JSON with the following structure:
            {
              "summary": "Brief executive summary of key findings",
              "marketSize": {
                "current": "Current market size with value in USD",
                "projected": "Projected market size with value in USD",
                "cagr": "Compound Annual Growth Rate"
              },
              "keyPlayers": [
                {"name": "Company Name", "marketShare": "percentage", "keyStrength": "Brief description"},
                ...
              ],
              "trendAnalysis": [
                {"trend": "Trend name", "description": "Description", "impact": "High/Medium/Low"},
                ...
              ],
              "regionalInsights": [
                {"region": "Region name", "insight": "Key regional insight"},
                ...
              ],
              "emergingTechnologies": [
                {"technology": "Technology name", "maturity": "Early/Growing/Mature", "potentialImpact": "High/Medium/Low"},
                ...
              ],
              "regulatoryFactors": [
                {"factor": "Regulatory factor", "description": "Brief description", "regions": ["Region1", "Region2"]}
              ],
              "opportunitiesAndChallenges": {
                "opportunities": ["Opportunity 1", "Opportunity 2", ...],
                "challenges": ["Challenge 1", "Challenge 2", ...]
              },
              "forecastAndOutlook": "Detailed 2-3 year outlook"
            }`
        },
        {
          role: "user",
          content: `Generate a comprehensive industry trend snapshot for the ${industry} industry. ${regionSpecificPrompt} Include current market size, key players, emerging trends, technological disruptions, regulatory factors, and a 2-3 year forecast. The analysis should be actionable for business decision-makers.`
        }
      ];
      
      const requestOptions: PerplexityRequestOptions = {
        model: this.defaultModel,
        messages,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: ["perplexity.ai"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false,
        frequency_penalty: 1,
        presence_penalty: 0
      };
      
      // Make request with timeout
      const response = await axios.post<PerplexityResponse>(
        this.apiUrl,
        requestOptions,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      // Update metrics
      metrics.responseTime = Date.now();
      metrics.latency = metrics.responseTime - startTime;
      metrics.status = response.status;
      metrics.success = true;
      metrics.tokensUsed = response.data.usage?.total_tokens;
      
      // Track metrics (in production, would send to monitoring service)
      this.trackApiMetrics(metrics);
      
      const content = response.data.choices[0].message.content;
      
      try {
        // Parse and validate the JSON response
        const parsedData = JSON.parse(content);
        this.validateResponseSchema(parsedData);
        return parsedData;
      } catch (parseError: any) {
        console.error("JSON parsing error:", parseError.message);
        throw new PerplexityError(
          "Failed to parse Perplexity response: " + parseError.message,
          500,
          "INVALID_RESPONSE_FORMAT",
          false
        );
      }
    } catch (error: any) {
      this.errorCount++;
      metrics.success = false;
      metrics.responseTime = Date.now();
      metrics.latency = metrics.responseTime - metrics.requestTime;
      
      if (axios.isAxiosError(error)) {
        metrics.status = error.response?.status || 0;
        metrics.errorType = this.categorizeError(error);
      } else {
        metrics.errorType = "UNKNOWN_ERROR";
      }
      
      // Track error metrics
      this.trackApiMetrics(metrics);
      
      console.error("Perplexity API error:", error.response?.data || error.message);
      
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 429) {
          // Rate limiting error
          throw new PerplexityError(
            "Rate limit exceeded for Perplexity API. Please try again later.",
            429,
            "RATE_LIMIT_EXCEEDED",
            true
          );
        } else if (status === 401 || status === 403) {
          // Authentication error
          throw new PerplexityError(
            "Authentication failed for Perplexity API. Please check your API key.",
            status,
            "AUTHENTICATION_ERROR",
            false
          );
        } else if (status >= 500) {
          // Server error
          throw new PerplexityError(
            "Perplexity API server error. Please try again later.",
            status,
            "SERVER_ERROR",
            true
          );
        }
      }
      
      // Generic error
      throw new PerplexityError(
        "Failed to generate industry trend analysis: " + (error.response?.data?.error?.message || error.message),
        error.response?.status || 500,
        "API_ERROR",
        false
      );
    }
  }
  
  /**
   * Validate the response schema to ensure it matches expected format
   */
  private validateResponseSchema(data: any): void {
    // Check required top-level fields
    const requiredFields = ['summary', 'marketSize', 'keyPlayers', 'trendAnalysis'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check marketSize structure
    if (!data.marketSize.current || !data.marketSize.projected || !data.marketSize.cagr) {
      throw new Error('Invalid marketSize structure');
    }
    
    // Check keyPlayers is an array with at least one item
    if (!Array.isArray(data.keyPlayers) || data.keyPlayers.length === 0) {
      throw new Error('keyPlayers must be a non-empty array');
    }
    
    // Check trendAnalysis is an array with at least one item
    if (!Array.isArray(data.trendAnalysis) || data.trendAnalysis.length === 0) {
      throw new Error('trendAnalysis must be a non-empty array');
    }
  }
  
  /**
   * Categorize the error type for better monitoring and reporting
   */
  private categorizeError(error: any): string {
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    const status = error.response.status;
    
    if (status === 429) return 'RATE_LIMIT_EXCEEDED';
    if (status === 401 || status === 403) return 'AUTHENTICATION_ERROR';
    if (status >= 500) return 'SERVER_ERROR';
    if (status === 400) return 'BAD_REQUEST';
    if (status === 404) return 'NOT_FOUND';
    
    return 'UNKNOWN_ERROR';
  }
  
  /**
   * Track API metrics for monitoring
   * In a production environment, this would send data to a monitoring service
   */
  private trackApiMetrics(metrics: ApiMetrics): void {
    // In production, would send to monitoring system
    // For now, just log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[METRICS] Perplexity API: ${metrics.success ? 'SUCCESS' : 'FAILURE'} in ${metrics.latency}ms`);
      
      if (!metrics.success) {
        console.log(`[METRICS] Error type: ${metrics.errorType}, Status: ${metrics.status}`);
      } else if (metrics.tokensUsed) {
        console.log(`[METRICS] Tokens used: ${metrics.tokensUsed}`);
      }
    }
    
    // In production, would implement:
    // - Prometheus metrics collection
    // - CloudWatch or similar logging
    // - Error rate alerting
    // - Circuit breaker pattern for service degradation
  }
  
  /**
   * Get service health and statistics
   * Used for monitoring and diagnostics
   */
  getServiceStats() {
    return {
      totalRequests: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      serviceAvailable: this.apiKey !== '',
      serviceHealthy: this.requestCount > 0 && (this.errorCount / this.requestCount) < 0.25 // Less than 25% errors
    };
  }
  
  /**
   * Send a request to the Perplexity chat API
   * 
   * This is a more general-purpose method than generateIndustryTrendAnalysis,
   * allowing for any type of prompt to be sent to the API.
   * 
   * @param options Request options for the Perplexity API
   * @returns The response from the API
   */
  async sendChatRequest(options: PerplexityRequestOptions): Promise<any> {
    if (!this.apiKey) {
      throw new PerplexityError("Perplexity API key not configured", 500, "MISSING_API_KEY", false);
    }
    
    // Initialize metrics tracking
    const metrics: ApiMetrics = {
      provider: "perplexity",
      requestTime: Date.now(),
      responseTime: 0,
      latency: 0,
      status: 0,
      success: false
    };
    
    try {
      this.requestCount++;
      const startTime = Date.now();
      
      // Ensure default values are set
      const requestOptions: PerplexityRequestOptions = {
        ...{
          model: this.defaultModel,
          temperature: 0.2,
          top_p: 0.9,
          search_domain_filter: ["perplexity.ai"],
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month",
          stream: false,
          frequency_penalty: 1,
          presence_penalty: 0
        },
        ...options
      };
      
      // Make request with timeout
      const response = await axios.post<PerplexityResponse>(
        this.apiUrl,
        requestOptions,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      // Update metrics
      metrics.responseTime = Date.now();
      metrics.latency = metrics.responseTime - startTime;
      metrics.status = response.status;
      metrics.success = true;
      metrics.tokensUsed = response.data.usage?.total_tokens;
      
      // Track metrics
      this.trackApiMetrics(metrics);
      
      // Return the structured response data
      return {
        id: response.data.id,
        model: response.data.model,
        content: response.data.choices[0].message.content,
        citations: response.data.citations || [],
        tokenUsage: response.data.usage
      };
    } catch (error: any) {
      this.errorCount++;
      metrics.success = false;
      metrics.responseTime = Date.now();
      metrics.latency = metrics.responseTime - metrics.requestTime;
      
      if (axios.isAxiosError(error)) {
        metrics.status = error.response?.status || 0;
        metrics.errorType = this.categorizeError(error);
      } else {
        metrics.errorType = "UNKNOWN_ERROR";
      }
      
      // Track error metrics
      this.trackApiMetrics(metrics);
      
      console.error("Perplexity API error:", error.response?.data || error.message);
      
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        if (status === 429) {
          // Rate limiting error
          throw new PerplexityError(
            "Rate limit exceeded for Perplexity API. Please try again later.",
            429,
            "RATE_LIMIT_EXCEEDED",
            true
          );
        } else if (status === 401 || status === 403) {
          // Authentication error
          throw new PerplexityError(
            "Authentication failed for Perplexity API. Please check your API key.",
            status,
            "AUTHENTICATION_ERROR",
            false
          );
        } else if (status >= 500) {
          // Server error
          throw new PerplexityError(
            "Perplexity API server error. Please try again later.",
            status,
            "SERVER_ERROR",
            true
          );
        }
      }
      
      // Generic error
      throw new PerplexityError(
        "Failed to process request: " + (error.response?.data?.error?.message || error.message),
        error.response?.status || 500,
        "API_ERROR",
        false
      );
    }
  }
}

export const perplexityService = new PerplexityService();