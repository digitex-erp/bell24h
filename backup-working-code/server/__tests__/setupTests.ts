// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Mock console methods to keep test output clean
const consoleMethods = ['log', 'error', 'warn', 'info', 'debug'];

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Mock console methods
  consoleMethods.forEach(method => {
    jest.spyOn(console, method as any).mockImplementation(() => {});
  });
});

afterEach(() => {
  // Restore console methods after each test
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(30000);
