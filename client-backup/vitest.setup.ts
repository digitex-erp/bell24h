import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Mock scrollTo
window.scrollTo = () => {};

// Clean up after each test case
// (e.g., clearing jsdom, resetting mocks, etc.)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock console methods during tests
const consoleError = console.error;
const consoleWarn = console.warn;

beforeAll(() => {
  // Suppress specific console errors/warnings that are expected
  const suppressedErrors = [
    /Warning: ReactDOM.render is no longer supported in React 18/,
    /Warning: An update to .* inside a test was not wrapped in act/,
  ];

  console.error = (message, ...args) => {
    if (suppressedErrors.some(pattern => pattern.test(message))) {
      return;
    }
    consoleError(message, ...args);
  };

  console.warn = (message, ...args) => {
    if (suppressedErrors.some(pattern => pattern.test(message))) {
      return;
    }
    consoleWarn(message, ...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = consoleError;
  console.warn = consoleWarn;
});
