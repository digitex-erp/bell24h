/**
 * Perplexity API Integration Test Suite
 * 
 * This test suite validates the Perplexity API integration using best practices
 * from the provided testing strategy document.
 */

require('dotenv').config();
const { PerplexityService } = require('../server/services/perplexity.service');
const axios = require('axios');
const Joi = require('joi');

// Mock axios to avoid actual API calls during testing
jest.mock('axios');

// Schema validation helper
const validateTrendSchema = (response) => {
  const schema = Joi.object({
    summary: Joi.string().required(),
    marketSize: Joi.object({
      current: Joi.string().required(),
      projected: Joi.string().required(),
      cagr: Joi.string().required()
    }).required(),
    keyPlayers: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        marketShare: Joi.string().required(),
        keyStrength: Joi.string().required()
      })
    ).min(1).required(),
    trendAnalysis: Joi.array().items(
      Joi.object({
        trend: Joi.string().required(),
        description: Joi.string().required(),
        impact: Joi.string().valid('High', 'Medium', 'Low').required()
      })
    ).min(1).required()
  });
  
  return schema.validate(response);
};

// Analytics tracking mock
class AnalyticsMiddleware {
  constructor() {
    this.startTime = Date.now();
    this.isError = false;
    this.response = null;
  }
  
  trackResponse(provider, response, error = null) {
    this.response = response;
    this.isError = !!error;
    
    const metrics = {
      provider,
      response_time: Date.now() - this.startTime,
      success: !this.isError,
      tokens_used: this.response?.usage?.total_tokens || 0
    };
    
    // In a real implementation, this would send metrics to a monitoring service
    console.log('API Metrics:', metrics);
    return metrics;
  }
}

// Test suite for Environment Configuration
describe('Environment Configuration', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  test('Should detect Perplexity API key from env', () => {
    process.env.PERPLEXITY_API_KEY = 'test-key';
    const service = new PerplexityService();
    expect(service.apiKey).toBe('test-key');
  });
  
  test('Should warn when Perplexity API key is missing', () => {
    delete process.env.PERPLEXITY_API_KEY;
    console.warn = jest.fn();
    
    const service = new PerplexityService();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Perplexity API key not found'));
    expect(service.apiKey).toBe('');
  });
});

// Test suite for Perplexity API integration
describe('Perplexity API Integration', () => {
  let service;
  let analytics;
  
  beforeEach(() => {
    process.env.PERPLEXITY_API_KEY = 'test-pplx-key';
    service = new PerplexityService();
    analytics = new AnalyticsMiddleware();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('Should successfully generate industry trend analysis', async () => {
    // Mock successful response
    const mockResponse = {
      status: 200,
      data: {
        id: 'test-id',
        model: 'llama-3.1-sonar-small-128k-online',
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Renewable energy industry is growing rapidly',
                marketSize: {
                  current: '$1.1 Trillion',
                  projected: '$2.2 Trillion by 2030',
                  cagr: '8.5%'
                },
                keyPlayers: [
                  {
                    name: 'NextEra Energy',
                    marketShare: '15%',
                    keyStrength: 'Leader in wind and solar investments'
                  },
                  {
                    name: 'Iberdrola',
                    marketShare: '12%',
                    keyStrength: 'Diverse renewable portfolio'
                  }
                ],
                trendAnalysis: [
                  {
                    trend: 'Green Hydrogen',
                    description: 'Emerging as a key storage solution',
                    impact: 'High'
                  }
                ]
              })
            }
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300
        }
      }
    };
    
    axios.post.mockResolvedValue(mockResponse);
    
    // Call the service
    const result = await service.generateIndustryTrendAnalysis('Renewable Energy');
    analytics.trackResponse('perplexity', mockResponse.data);
    
    // Validate the API call
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.perplexity.ai/chat/completions',
      expect.objectContaining({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system'
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Renewable Energy')
          })
        ])
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-pplx-key'
        })
      })
    );
    
    // Validate schema
    const { error } = validateTrendSchema(result);
    expect(error).toBeUndefined();
    
    // Validate content
    expect(result.summary).toBe('Renewable energy industry is growing rapidly');
    expect(result.marketSize.current).toBe('$1.1 Trillion');
    expect(result.keyPlayers).toHaveLength(2);
    expect(result.trendAnalysis[0].trend).toBe('Green Hydrogen');
  });
  
  test('Should handle API errors gracefully', async () => {
    // Mock error response
    const errorResponse = {
      response: {
        status: 400,
        data: {
          error: {
            message: 'Invalid request parameters'
          }
        }
      }
    };
    
    axios.post.mockRejectedValue(errorResponse);
    
    // Expect the service to throw an error
    await expect(service.generateIndustryTrendAnalysis('Invalid Industry'))
      .rejects
      .toThrow('Failed to generate industry trend analysis');
      
    // Track the error metrics
    analytics.trackResponse('perplexity', null, errorResponse);
    expect(analytics.isError).toBe(true);
  });
  
  test('Should handle rate limiting', async () => {
    // Mock rate limit response
    const rateLimitResponse = {
      response: {
        status: 429,
        data: {
          error: {
            message: 'Rate limit exceeded'
          }
        }
      }
    };
    
    axios.post.mockRejectedValue(rateLimitResponse);
    
    // Expect the service to throw a rate limit error
    await expect(service.generateIndustryTrendAnalysis('Test Industry'))
      .rejects
      .toThrow('Failed to generate industry trend analysis');
      
    // Verify we're tracking rate limits
    analytics.trackResponse('perplexity', null, rateLimitResponse);
    expect(analytics.isError).toBe(true);
  });
  
  test('Should include region-specific prompt when provided', async () => {
    // Mock successful response
    const mockResponse = {
      status: 200,
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Asia Pacific renewable energy market analysis',
                marketSize: {
                  current: '$500 Billion',
                  projected: '$1.2 Trillion by 2030',
                  cagr: '10.5%'
                },
                keyPlayers: [
                  {
                    name: 'JinkoSolar',
                    marketShare: '18%',
                    keyStrength: 'Leading solar panel manufacturer'
                  }
                ],
                trendAnalysis: [
                  {
                    trend: 'Offshore Wind',
                    description: 'Rapid growth in APAC coastal regions',
                    impact: 'High'
                  }
                ]
              })
            }
          }
        ],
        usage: {
          total_tokens: 350
        }
      }
    };
    
    axios.post.mockResolvedValue(mockResponse);
    
    // Call the service with a region
    const result = await service.generateIndustryTrendAnalysis('Renewable Energy', 'Asia Pacific');
    
    // Validate the API call included the region
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Asia Pacific')
          })
        ])
      }),
      expect.any(Object)
    );
    
    // Validate result contains region-specific data
    expect(result.summary).toContain('Asia Pacific');
  });
});

// If we were running this in an actual test framework, we'd add
// describe('Fallback Mechanism', () => { ... });