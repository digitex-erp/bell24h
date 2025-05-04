/**
 * Perplexity Fallback Test Suite
 * 
 * This test suite validates the fallback mechanism from Perplexity to OpenAI
 * ensuring consistent data structure across providers.
 */

require('dotenv').config();
const { IndustryTrendsService } = require('../server/services/industry-trends.service');
const { PerplexityService } = require('../server/services/perplexity.service');
const OpenAI = require('openai');
const axios = require('axios');

// Mock both APIs to control the test scenarios
jest.mock('axios');
jest.mock('openai');

// Test suite for fallback mechanism
describe('AI Provider Fallback Mechanism', () => {
  let industryTrendsService;
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock OpenAI
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }));
    
    industryTrendsService = new IndustryTrendsService();
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  test('Should use Perplexity when API key is available', async () => {
    // Setup environment
    process.env.PERPLEXITY_API_KEY = 'test-pplx-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    
    // Mock Perplexity successful response
    const mockPerplexityResponse = {
      status: 200,
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Analysis from Perplexity API',
                marketSize: {
                  current: '$1.0 Trillion',
                  projected: '$2.0 Trillion by 2030',
                  cagr: '8.0%'
                },
                keyPlayers: [
                  {
                    name: 'Company A',
                    marketShare: '15%',
                    keyStrength: 'Innovation'
                  }
                ],
                trendAnalysis: [
                  {
                    trend: 'Trend 1',
                    description: 'Description 1',
                    impact: 'High'
                  }
                ]
              })
            }
          }
        ]
      }
    };
    
    axios.post.mockResolvedValue(mockPerplexityResponse);
    
    // Test generateOneClickSnapshot which should use Perplexity
    await industryTrendsService.generateOneClickSnapshot('Test Industry');
    
    // Verify Perplexity was called but not OpenAI
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.perplexity.ai/chat/completions',
      expect.any(Object),
      expect.any(Object)
    );
    expect(OpenAI.prototype.chat.completions.create).not.toHaveBeenCalled();
  });
  
  test('Should fall back to OpenAI when Perplexity fails', async () => {
    // Setup environment
    process.env.PERPLEXITY_API_KEY = 'test-pplx-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    
    // Mock Perplexity failure
    const perplexityError = {
      response: {
        status: 500,
        data: {
          error: {
            message: 'Service unavailable'
          }
        }
      }
    };
    axios.post.mockRejectedValue(perplexityError);
    
    // Mock OpenAI successful response
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: 'Analysis from OpenAI fallback',
              marketSize: {
                current: '$1.1 Trillion',
                projected: '$2.2 Trillion by 2030',
                cagr: '8.5%'
              },
              keyPlayers: [
                {
                  name: 'Company B',
                  marketShare: '16%',
                  keyStrength: 'Market reach'
                }
              ],
              trendAnalysis: [
                {
                  trend: 'Trend 2',
                  description: 'Description 2',
                  impact: 'Medium'
                }
              ]
            })
          }
        }
      ]
    };
    OpenAI.prototype.chat.completions.create.mockResolvedValue(mockOpenAIResponse);
    
    // Test generateOneClickSnapshot which should fall back to OpenAI
    await industryTrendsService.generateOneClickSnapshot('Test Industry');
    
    // Verify both were called - Perplexity first, then OpenAI as fallback
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.perplexity.ai/chat/completions',
      expect.any(Object),
      expect.any(Object)
    );
    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalled();
  });
  
  test('Should use OpenAI directly when no Perplexity API key is available', async () => {
    // Setup environment with only OpenAI key
    delete process.env.PERPLEXITY_API_KEY;
    process.env.OPENAI_API_KEY = 'test-openai-key';
    
    // Mock OpenAI successful response
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: 'Analysis from OpenAI primary',
              marketSize: {
                current: '$1.1 Trillion',
                projected: '$2.2 Trillion by 2030',
                cagr: '8.5%'
              },
              keyPlayers: [
                {
                  name: 'Company B',
                  marketShare: '16%',
                  keyStrength: 'Market reach'
                }
              ],
              trendAnalysis: [
                {
                  trend: 'Trend 2',
                  description: 'Description 2',
                  impact: 'Medium'
                }
              ]
            })
          }
        }
      ]
    };
    OpenAI.prototype.chat.completions.create.mockResolvedValue(mockOpenAIResponse);
    
    // Test generateOneClickSnapshot which should use OpenAI directly
    await industryTrendsService.generateOneClickSnapshot('Test Industry');
    
    // Verify only OpenAI was called (no attempt to use Perplexity)
    expect(axios.post).not.toHaveBeenCalled();
    expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalled();
  });
  
  test('Should maintain consistent data structure across providers', async () => {
    // This test validates that both providers return the same data structure
    
    // Setup test with both APIs available
    process.env.PERPLEXITY_API_KEY = 'test-pplx-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    
    // Two scenarios to test:
    // 1. Perplexity success
    // 2. Perplexity fail, OpenAI success
    
    // Scenario 1: Perplexity success
    const perplexityData = {
      summary: 'From Perplexity',
      marketSize: { current: '$1T', projected: '$2T', cagr: '8%' },
      keyPlayers: [{ name: 'P1', marketShare: '10%', keyStrength: 'S1' }],
      trendAnalysis: [{ trend: 'T1', description: 'D1', impact: 'High' }]
    };
    
    const mockPerplexityResponse = {
      status: 200,
      data: {
        choices: [{ message: { content: JSON.stringify(perplexityData) } }]
      }
    };
    
    // Scenario 2: OpenAI success
    const openaiData = {
      summary: 'From OpenAI',
      marketSize: { current: '$1.1T', projected: '$2.1T', cagr: '8.1%' },
      keyPlayers: [{ name: 'O1', marketShare: '11%', keyStrength: 'S2' }],
      trendAnalysis: [{ trend: 'T2', description: 'D2', impact: 'Medium' }]
    };
    
    const mockOpenAIResponse = {
      choices: [{ message: { content: JSON.stringify(openaiData) } }]
    };
    
    // Run test for Perplexity first
    axios.post.mockResolvedValue(mockPerplexityResponse);
    const perplexitySnapshot = await industryTrendsService.generateOneClickSnapshot('Test Industry');
    
    // Then simulate Perplexity failure and OpenAI fallback
    axios.post.mockRejectedValue(new Error('Perplexity unavailable'));
    OpenAI.prototype.chat.completions.create.mockResolvedValue(mockOpenAIResponse);
    const openaiSnapshot = await industryTrendsService.generateOneClickSnapshot('Test Industry');
    
    // Verify structure consistency across providers
    expect(Object.keys(perplexitySnapshot.snapshotData)).toEqual(
      expect.arrayContaining(['summary', 'marketSize', 'keyPlayers', 'trendAnalysis'])
    );
    
    expect(Object.keys(openaiSnapshot.snapshotData)).toEqual(
      expect.arrayContaining(['summary', 'marketSize', 'keyPlayers', 'trendAnalysis'])
    );
    
    // Verify marketSize has same structure
    expect(Object.keys(perplexitySnapshot.snapshotData.marketSize)).toEqual(
      Object.keys(openaiSnapshot.snapshotData.marketSize)
    );
    
    // Verify keyPlayers array items have same structure
    expect(Object.keys(perplexitySnapshot.snapshotData.keyPlayers[0])).toEqual(
      Object.keys(openaiSnapshot.snapshotData.keyPlayers[0])
    );
    
    // Verify trendAnalysis array items have same structure
    expect(Object.keys(perplexitySnapshot.snapshotData.trendAnalysis[0])).toEqual(
      Object.keys(openaiSnapshot.snapshotData.trendAnalysis[0])
    );
  });
});