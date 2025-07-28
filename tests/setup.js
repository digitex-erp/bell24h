// Global test setup
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder and TextDecoder to global scope for Node.js < 18
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Setup environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bell24h_test';

// Mock any global dependencies
global.console = {
  ...console,
  // Uncomment to debug
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Add global test timeout
jest.setTimeout(30000);

// Setup any global test utilities
const testUtils = {
  // Add any test utilities here
};

global.testUtils = testUtils;
