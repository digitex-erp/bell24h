import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
import { configure } from '@testing-library/react';

// Mock WebSocket
global.WebSocket = class {
  constructor() {
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
  }
  send() {}
  close() {}
};

// Mock Request and Response
global.Request = class {};
global.Response = class {};

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: jest.fn(),
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
  }));
});

// Add missing TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

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

// Mock console methods
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
};

// Mock AWS Amplify
jest.mock('@aws-amplify/api', () => ({
  API: {
    graphql: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('@aws-amplify/auth', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
  },
}));

jest.mock('@aws-amplify/storage', () => ({
  Storage: {
    get: jest.fn(),
    put: jest.fn(),
    remove: jest.fn(),
    list: jest.fn(),
  },
}));

// Mock logger
jest.mock('./src/utils/logger', () => ({
    logInfo: jest.fn(),
    logError: jest.fn(),
    logWarning: jest.fn(),
    logDebug: jest.fn()
}));

// Mock retry utility
jest.mock('./src/utils/retry', () => ({
    retryAmplifyOperation: jest.fn(operation => operation())
}));

// Add any global test setup here
beforeEach(() => {
    jest.clearAllMocks();
});

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

// Mock ResizeObserver
class ResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
})

// Suppress console errors/warnings in tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning/.test(args[0]) ||
      /Not implemented/.test(args[0]) ||
      /Invalid prop/.test(args[0])
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (/Warning/.test(args[0])) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Add fetch polyfill for tests
import 'whatwg-fetch'

// Add custom jest matchers for testing DOM elements
import '@testing-library/jest-dom'

// Mock AWS Amplify
jest.mock('@aws-amplify/api', () => ({
  API: {
    graphql: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn()
  }
}))

jest.mock('@aws-amplify/auth', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn()
  }
}))

jest.mock('@aws-amplify/storage', () => ({
  Storage: {
    get: jest.fn(),
    put: jest.fn(),
    remove: jest.fn(),
    list: jest.fn()
  }
}))

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
})

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

// Mock ResizeObserver
class ResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
})

// Suppress console errors and warnings in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}

// Set up default test timeout
jest.setTimeout(10000) // 10 seconds 

// Suppress console errors during tests
const originalError = console.error;
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

// Mock Clipboard API
global.navigator.clipboard = {
  writeText: jest.fn(),
  readText: jest.fn(),
};

// Mock Geolocation API
global.navigator.geolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

// Mock Notification API
global.Notification = {
  requestPermission: jest.fn(() => Promise.resolve('granted')),
  permission: 'granted',
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  })),
}));

// Mock WebSocket with enhanced functionality
class MockWebSocket extends EventTarget {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.binaryType = 'blob';
    this.bufferedAmount = 0;
    this.extensions = '';
    this.protocol = '';
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
  }

  send(data) {
    this.bufferedAmount += data.length;
  }

  close(code, reason) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }

  // Helper methods for testing
  mockOpen() {
    this.readyState = WebSocket.OPEN;
    if (this.onopen) {
      this.onopen();
    }
  }

  mockMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }

  mockError(error) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

global.WebSocket = MockWebSocket;

// Mock Service Worker setup
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
  rest.get('/api/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.post('/api/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// Enhanced error reporting
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning/.test(args[0]) ||
      /Not implemented/.test(args[0]) ||
      /Invalid prop/.test(args[0])
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (/Warning/.test(args[0])) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Time manipulation utilities
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01')); 