// Setup file for Jest tests
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder and TextDecoder to global for tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock any global objects needed for your tests
global.console = {
  ...console,
  // uncomment to debug tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
