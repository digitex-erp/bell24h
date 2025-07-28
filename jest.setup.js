// Add custom matchers for testing-library
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>;
    },
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
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
window.scrollTo = jest.fn();

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn((target) => {
      if (this.autoObserve) {
        this.callback([{ isIntersecting: true, target }], this);
      }
    });
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    this.takeRecords = jest.fn();
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
    this.autoObserve = true;
  }
}

window.IntersectionObserver = IntersectionObserverMock;

// Mock fetch
const mockFetch = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock Date
const mockDate = new Date('2023-01-01T00:00:00.000Z');
const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) {
      return new RealDate(mockDate);
    }
    return new RealDate(...args);
  }
  static now() {
    return new RealDate(mockDate).getTime();
  }
};

// Mock console methods in test environment
const originalConsole = { ...console };

global.console = {
  ...originalConsole,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, width, height, ...props }) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        {...props}
      />
    );
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock next/head
global.Head = ({ children }) => <>{children}</>;

// Mock next/dynamic
jest.mock('next/dynamic', () => (dynamicImport) => {
  return function DynamicComponent() {
    const Component = dynamicImport();
    return <Component />;
  };
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: null, expires: '1' },
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  getCsrfToken: jest.fn(),
  getProviders: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Mock next/script
jest.mock('next/script', () => ({
  __esModule: true,
  default: function Script(props) {
    return <script {...props} />;
  },
}));

// Mock next/error
jest.mock('next/error', () => ({
  __esModule: true,
  default: function Error({ statusCode }) {
    return <div>Error {statusCode}</div>;
  },
}));

// Mock next/head
jest.mock('next/head', () => ({
  __esModule: true,
  default: function Head({ children }) {
    return <>{children}</>;
  },
}));

// Mock next/config
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
    NODE_ENV: 'test',
  },
}));

// Add cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// // Mock IntersectionObserver (Redundant - already mocked above with more detail)
// if (!global.IntersectionObserver) {
//   global.IntersectionObserver = class IntersectionObserver {
//     constructor() {}
//     observe() {}
//     unobserve() {}
//     disconnect() {}
//   };
// }

// // Mock ResizeObserver (Redundant - already mocked above with more detail)
// if (!global.ResizeObserver) {
//   global.ResizeObserver = class ResizeObserver {
//     constructor() {}
//     observe() {}
//     unobserve() {}
//     disconnect() {}
//   };
// }
