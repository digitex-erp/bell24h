import { jest } from '@jest/globals';

// Simple test to verify the testing environment
describe('Simple RFQ Controller Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should mock a function', () => {
    const mockFn = jest.fn().mockReturnValue('mocked value');
    expect(mockFn()).toBe('mocked value');
  });
});
