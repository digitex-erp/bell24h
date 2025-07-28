import PerplexityService from '../src/services/perplexityService';
import { PerplexityClient } from '../src/lib/perplexity';

// Mock the PerplexityClient
jest.mock('../src/lib/perplexity');

const MockedPerplexityClient = PerplexityClient as jest.MockedClass<typeof PerplexityClient>;



describe('PerplexityService', () => {
  let service: ReturnType<typeof PerplexityService.getInstance>;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = PerplexityService.getInstance();
    mockClient = new MockedPerplexityClient('test-api-key');
    
    // Setup default mock implementations
    mockClient.chat = jest.fn();
    mockClient.createChatCompletion = jest.fn();
    mockClient.testConnection = jest.fn();
  });

  afterEach(() => {
    // Reset the singleton instance between tests
    // @ts-ignore - Accessing private static property for testing
    PerplexityService.instance = null;
  });

  describe('getChatResponse', () => {
    it('should return a chat response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Test response',
            role: 'assistant',
          },
        }],
      };
      
      mockClient.chat.mockResolvedValue(mockResponse);

      const result = await service.getChatResponse(
        'Test message',
        'You are a test assistant'
      );

      expect(mockClient.chat).toHaveBeenCalledWith(
        'Test message',
        'You are a test assistant',
        undefined,
        undefined,
        undefined
      );
      expect(result).toBe('Test response');
    });

    it('should handle errors from the API', async () => {
      mockClient.chat.mockRejectedValue(new Error('API Error'));

      await expect(
        service.getChatResponse('Test message')
      ).rejects.toThrow('Failed to get chat response');
    });
  });

  describe('getConversationResponse', () => {
    it('should return a conversation response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Test conversation response',
            role: 'assistant',
          },
        }],
      };
      
      mockClient.createChatCompletion.mockResolvedValue(mockResponse);

      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
      ];

      const result = await service.getConversationResponse(messages);

      expect(mockClient.createChatCompletion).toHaveBeenCalledWith({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          ...messages,
        ],
        model: 'sonar',
        temperature: 0.7,
        max_tokens: 1000,
      });
      expect(result).toBe('Test conversation response');
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      mockClient.testConnection.mockResolvedValue(true);
      const result = await service.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      mockClient.testConnection.mockResolvedValue(false);
      const result = await service.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const instance1 = PerplexityService.getInstance();
      const instance2 = PerplexityService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
