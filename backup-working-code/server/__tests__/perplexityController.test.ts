import { Request, Response } from 'express';
import PerplexityController from '../src/controllers/perplexityController';
import PerplexityService from '../src/services/perplexityService';

// Mock the PerplexityService
jest.mock('../src/services/perplexityService');

const MockedPerplexityService = PerplexityService as jest.Mocked<typeof PerplexityService>;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('PerplexityController', () => {
  let controller: PerplexityController;
  let mockService: jest.Mocked<typeof PerplexityService>;
  let req: Partial<Request>;
  let res: ReturnType<typeof mockResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PerplexityController();
    mockService = MockedPerplexityService;
    req = {};
    res = mockResponse();
    
    // Setup default mock implementation for getInstance
    mockService.getInstance = jest.fn().mockReturnValue({
      testConnection: jest.fn(),
      getChatResponse: jest.fn(),
      getConversationResponse: jest.fn(),
    });
  });

  describe('healthCheck', () => {
    it('should return 200 and service status when healthy', async () => {
      const mockInstance = {
        testConnection: vi.fn().mockResolvedValue(true),
      };
      mockService.getInstance.mockReturnValue(mockInstance as any);

      await controller.healthCheck(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          service: 'Perplexity AI',
          status: 'operational',
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 503 when service is degraded', async () => {
      const mockInstance = {
        testConnection: vi.fn().resolvedValue(false),
      };
      mockService.getInstance.mockReturnValue(mockInstance as any);

      await controller.healthCheck(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          service: 'Perplexity AI',
          status: 'degraded',
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('chat', () => {
    it('should return 200 and chat response for valid request', async () => {
      const mockInstance = {
        getChatResponse: vi.fn().resolvedValue('Test response'),
      };
      mockService.getInstance.mockReturnValue(mockInstance as any);

      req.body = {
        message: 'Hello, world!',
        systemMessage: 'You are helpful',
      };

      await controller.chat(req as Request, res as Response);

      expect(mockInstance.getChatResponse).toHaveBeenCalledWith(
        'Hello, world!',
        'You are helpful',
        undefined,
        undefined,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          response: 'Test response',
          model: 'sonar',
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 400 for missing message', async () => {
      req.body = {};

      await controller.chat(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Message is required',
      });
    });
  });

  describe('conversation', () => {
    it('should return 200 and conversation response for valid request', async () => {
      const mockInstance = {
        getConversationResponse: vi.fn().resolvedValue('Test response'),
      };
      mockService.getInstance.mockReturnValue(mockInstance as any);

      req.body = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      };

      await controller.conversation(req as Request, res as Response);

      expect(mockInstance.getConversationResponse).toHaveBeenCalledWith(
        [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
        undefined,
        undefined,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          response: 'Test response',
          model: 'sonar',
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 400 for invalid messages array', async () => {
      req.body = { messages: [] };

      await controller.conversation(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Messages array is required and cannot be empty',
      });
    });
  });
});
