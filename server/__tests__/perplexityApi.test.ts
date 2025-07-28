import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { createServer, Server } from 'http';
import PerplexityController from '../src/controllers/perplexityController';
import PerplexityService from '../src/services/perplexityService';

// Mock the PerplexityService
jest.mock('../src/services/perplexityService');

const MockedPerplexityService = PerplexityService as jest.Mocked<typeof PerplexityService>;

describe('Perplexity API Integration Tests', () => {
  let app: express.Express;
  let server: Server;
  let service: jest.Mocked<typeof PerplexityService>;
  const baseUrl = '/api/perplexity';

  beforeAll(async () => {
    // Create express app
    app = express();
    app.use(bodyParser.json());
    
    // Initialize controller with routes
    const controller = new PerplexityController();
    app.get(`${baseUrl}/health`, (req, res) => controller.healthCheck(req, res));
    app.post(`${baseUrl}/chat`, (req, res) => controller.chat(req, res));
    app.post(`${baseUrl}/conversation`, (req, res) => controller.conversation(req, res));
    
    // Create HTTP server
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '0.0.0.0', resolve);
    });
    
    // Get the server's address
    const address = server.address();
    const port = typeof address === 'string' ? 0 : address?.port || 0;
    
    // Set base URL for requests
    app.set('baseUrl', `http://localhost:${port}`);
    
    // Get the mocked service instance
    service = vi.mocked(PerplexityService);
  });

  afterAll(() => {
    server.close();
    jest.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and service status', async () => {
      const mockInstance = {
        testConnection: vi.fn().mockResolvedValue(true),
      };
      service.getInstance.mockReturnValue(mockInstance as any);

      const response = await request(app)
        .get(`${baseUrl}/health`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          service: 'Perplexity AI',
          status: 'operational',
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('POST /chat', () => {
    it('should return 200 and chat response for valid request', async () => {
      const mockInstance = {
        getChatResponse: vi.fn().mockResolvedValue('Test response'),
      };
      service.getInstance.mockReturnValue(mockInstance as any);

      const response = await request(app)
        .post(`${baseUrl}/chat`)
        .send({
          message: 'Hello, world!',
          systemMessage: 'You are helpful',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          response: 'Test response',
          model: 'sonar',
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 400 for missing message', async () => {
      const response = await request(app)
        .post(`${baseUrl}/chat`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Message is required',
      });
    });
  });

  describe('POST /conversation', () => {
    it('should return 200 and conversation response for valid request', async () => {
      const mockInstance = {
        getConversationResponse: vi.fn().mockResolvedValue('Test response'),
      };
      service.getInstance.mockReturnValue(mockInstance as any);

      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
      ];

      const response = await request(app)
        .post(`${baseUrl}/conversation`)
        .send({ messages })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          response: 'Test response',
          model: 'sonar',
          timestamp: expect.any(String),
        },
      });
    });

    it('should return 400 for empty messages array', async () => {
      const response = await request(app)
        .post(`${baseUrl}/conversation`)
        .send({ messages: [] })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Messages array is required and cannot be empty',
      });
    });
  });
});
