import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Simple test to verify Jest is working
describe('Basic RFQ Controller Tests', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test request/response mocks', () => {
    // Mock request
    const req = {
      query: {},
      params: {},
      body: {}
    } as Request;

    // Mock response
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Simple test of the mock
    res.status(200).json({ success: true });

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
