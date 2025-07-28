// Import the jest-dom library for custom matchers
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { vi, expect } from 'vitest';
import { server } from './mocks/server';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Add type for ResizeObserverCallback
type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

interface ResizeObserver {
  observe: (target: Element) => void;
  unobserve: (target: Element) => void;
  disconnect: () => void;
}

declare global {
  interface Window {
    ResizeObserver: new (callback: ResizeObserverCallback) => ResizeObserver;
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console.error to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress specific error messages in tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Suppress specific warning messages if needed
    if (args[0]?.includes('ReactDOM.render is no longer supported in React 18')) {
      return;
    }
    originalWarn(...args);
  };

  // Establish API mocking before all tests
  server.listen();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests
  server.resetHandlers();
  jest.clearAllMocks();

  // Clean up after the tests are finished
  server.close();
});

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.ResizeObserver = mockResizeObserver;

// Mock console.error to fail tests on React warnings
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
