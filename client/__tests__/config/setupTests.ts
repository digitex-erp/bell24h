/**
 * Bell24H Comprehensive Test Setup Configuration
 * Provides enhanced testing utilities, mocks, and global configurations
 */

import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'file:./test.db';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || 'test-image'} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Framer Motion for animation testing
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    section: 'section',
    article: 'article',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside',
    ul: 'ul',
    li: 'li',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    a: 'a',
    img: 'img',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    label: 'label',
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => true,
}));

// Mock React Hot Toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock Chart.js for testing dashboard components
jest.mock('chart.js/auto', () => ({
  Chart: jest.fn(),
  registerables: [],
}));

jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(() => <div data-testid='line-chart'>Line Chart</div>),
  Bar: jest.fn(() => <div data-testid='bar-chart'>Bar Chart</div>),
  Pie: jest.fn(() => <div data-testid='pie-chart'>Pie Chart</div>),
  Doughnut: jest.fn(() => <div data-testid='doughnut-chart'>Doughnut Chart</div>),
  Radar: jest.fn(() => <div data-testid='radar-chart'>Radar Chart</div>),
  Scatter: jest.fn(() => <div data-testid='scatter-chart'>Scatter Chart</div>),
}));

// Mock Recharts for analytics components
jest.mock('recharts', () => ({
  LineChart: jest.fn(() => <div data-testid='recharts-line'>LineChart</div>),
  BarChart: jest.fn(() => <div data-testid='recharts-bar'>BarChart</div>),
  PieChart: jest.fn(() => <div data-testid='recharts-pie'>PieChart</div>),
  AreaChart: jest.fn(() => <div data-testid='recharts-area'>AreaChart</div>),
  ResponsiveContainer: ({ children }: any) => children,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Line: () => null,
  Bar: () => null,
  Area: () => null,
  Cell: () => null,
}));

// Mock Cloudinary React components
jest.mock('@cloudinary/react', () => ({
  Cloudinary: {
    image: jest.fn(() => ({
      toURL: () => 'https://test-cloudinary-url.com/test-image.jpg',
    })),
  },
  CloudinaryImage: jest.fn(({ publicId, ...props }) => (
    <img
      {...props}
      src={`https://test-cloudinary-url.com/${publicId}.jpg`}
      alt={props.alt || 'cloudinary-image'}
      data-testid='cloudinary-image'
    />
  )),
  Image: jest.fn(({ publicId, ...props }) => (
    <img
      {...props}
      src={`https://test-cloudinary-url.com/${publicId}.jpg`}
      alt={props.alt || 'cloudinary-image'}
      data-testid='cloudinary-image'
    />
  )),
}));

// Mock Audio/Video APIs for Voice RFQ testing
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    state: 'inactive',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [
        {
          stop: jest.fn(),
          kind: 'audio',
          label: 'Test Microphone',
        },
      ],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([
      {
        deviceId: 'test-device',
        kind: 'audioinput',
        label: 'Test Microphone',
      },
    ]),
  },
});

// Mock Speech Recognition API for voice features
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  result: null,
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

// Mock Bell Sound System
Object.defineProperty(window, 'templeBellSound', {
  value: {
    playBellSound: jest.fn().mockResolvedValue(undefined),
    isAudioSupported: jest.fn().mockReturnValue(true),
  },
  writable: true,
});

// Mock Web Audio API
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn(),
    createGain: jest.fn(),
    createOscillator: jest.fn(),
    createBufferSource: jest.fn(),
    decodeAudioData: jest.fn(),
    destination: {},
    state: 'running',
    resume: jest.fn().mockResolvedValue(undefined),
    suspend: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  })),
});

// Mock WebSocket for real-time features
Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: 1,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  })),
});

// Mock fetch for API testing
global.fetch = jest.fn();

// Mock intersection observer for lazy loading
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock resize observer for responsive components
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock file reader for file upload testing
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    readAsDataURL: jest.fn(),
    readAsText: jest.fn(),
    readAsArrayBuffer: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    result: 'data:image/jpeg;base64,test-image-data',
  })),
});

// Mock HTML5 drag and drop for file uploads
Object.defineProperty(window, 'DataTransfer', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    files: [],
    items: [],
    types: [],
    dropEffect: 'none',
    effectAllowed: 'uninitialized',
    setData: jest.fn(),
    getData: jest.fn(),
    clearData: jest.fn(),
    setDragImage: jest.fn(),
  })),
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveValue(value: string | number): R;
      toHaveTextContent(text: string): R;
    }
  }
}

// Enhanced test utilities
export const testUtils = {
  // Mock API responses
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
  }),

  // Mock file for upload testing
  createMockFile: (name: string, size: number, type: string) => {
    const file = new File(['mock file content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  // Mock user authentication
  mockAuthenticatedUser: {
    id: 'test-user-id',
    email: 'test@bell24h.com',
    name: 'Test User',
    role: 'USER',
    image: 'https://test-avatar.com/test.jpg',
  },

  // Mock RFQ data
  mockRFQData: {
    id: 'test-rfq-id',
    title: 'Test RFQ',
    description: 'Test RFQ Description',
    category: 'Electronics',
    budget: 50000,
    deadline: new Date('2024-12-31'),
    userId: 'test-user-id',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Mock supplier data
  mockSupplierData: {
    id: 'test-supplier-id',
    companyName: 'Test Supplier Co.',
    contactName: 'John Doe',
    email: 'supplier@test.com',
    phone: '+91-9876543210',
    location: 'Mumbai, India',
    rating: 4.5,
    verificationStatus: 'VERIFIED',
    categories: ['Electronics', 'Computers'],
  },

  // Wait for async operations
  waitForAsyncOperations: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Mock localStorage
  mockLocalStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },

  // Mock sessionStorage
  mockSessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
};

// Setup localStorage and sessionStorage mocks
Object.defineProperty(window, 'localStorage', {
  value: testUtils.mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: testUtils.mockSessionStorage,
});

// Console log configuration for tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // Clear localStorage and sessionStorage
  testUtils.mockLocalStorage.clear();
  testUtils.mockSessionStorage.clear();

  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
});

afterEach(() => {
  // Clean up any timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

beforeAll(() => {
  // Suppress console errors during tests unless needed
  console.error = (...args: any[]) => {
    if (args[0]?.includes && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    if (args[0]?.includes && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

export default testUtils;
