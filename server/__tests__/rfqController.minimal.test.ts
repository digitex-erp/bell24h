import { jest } from '@jest/globals';

// Simple test to verify the test environment
describe('Minimal RFQ Controller Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should mock a function', () => {
    const mockFn = jest.fn().mockReturnValue('mocked value');
    expect(mockFn()).toBe('mocked value');
  });

  it('should test async/await', async () => {
    const asyncMock = jest.fn().mockResolvedValue('resolved value');
    const result = await asyncMock();
    expect(result).toBe('resolved value');
  });
});
