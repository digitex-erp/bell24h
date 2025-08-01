import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Fetch polyfill for MSW and API testing

// Add TextEncoder/TextDecoder polyfill for Jest environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Prisma mocking
jest.mock('@prisma/client', () => require('./__mocks__/prisma'));
jest.mock('@/lib/prisma', () => require('./__mocks__/prisma'));

// MSW server setup for API testing
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Create MSW handlers for common API endpoints
export const handlers = [
  rest.get('/api/test', (req, res, ctx) => {
    return res(ctx.json({ message: 'test response' }));
  }),
  rest.post('/api/rfq', (req, res, ctx) => {
    return res(ctx.json({ id: 'test-rfq-id', status: 'created' }));
  }),
  rest.get('/api/auth/session', (req, res, ctx) => {
    return res(ctx.json({ user: { email: 'test@example.com' } }));
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Enhanced MediaRecorder mock for Voice/Video RFQ tests
Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: class MockMediaRecorder {
    static isTypeSupported = jest.fn(() => true);

    constructor(stream: MediaStream, options?: MediaRecorderOptions) {
      this.stream = stream;
      this.options = options;
      this.state = 'inactive';
      this.mimeType = 'audio/webm;codecs=opus';
    }

    state: 'inactive' | 'recording' | 'paused' = 'inactive';
    mimeType: string = 'audio/webm;codecs=opus';
    stream: MediaStream;
    options?: MediaRecorderOptions;
    ondataavailable: ((event: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    onstart: (() => void) | null = null;
    onpause: (() => void) | null = null;
    onresume: (() => void) | null = null;

    start = jest.fn((timeslice?: number) => {
      this.state = 'recording';
      if (this.onstart) this.onstart();

      // Simulate data availability after short delay
      setTimeout(() => {
        if (this.ondataavailable && this.state === 'recording') {
          const blob = new Blob(['fake-audio-data'], { type: this.mimeType });
          this.ondataavailable({
            data: blob,
            timecode: Date.now(),
          } as BlobEvent);
        }
      }, 100);
    });

    stop = jest.fn(() => {
      this.state = 'inactive';
      setTimeout(() => {
        if (this.onstop) this.onstop();
      }, 50);
    });

    pause = jest.fn(() => {
      this.state = 'paused';
      if (this.onpause) this.onpause();
    });

    resume = jest.fn(() => {
      this.state = 'recording';
      if (this.onresume) this.onresume();
    });

    requestData = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
  },
});

// Enhanced Web Audio API mocks
Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: class MockAudioContext {
    destination = { numberOfInputs: 1, numberOfOutputs: 0 };
    sampleRate = 44100;
    currentTime = 0;
    state = 'running';

    createMediaStreamSource = jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      numberOfInputs: 1,
      numberOfOutputs: 1,
    }));

    createAnalyser = jest.fn(() => ({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      numberOfInputs: 1,
      numberOfOutputs: 1,
    }));

    createGain = jest.fn(() => ({
      gain: { value: 1 },
      connect: jest.fn(),
      disconnect: jest.fn(),
    }));

    close = jest.fn(() => Promise.resolve());
    resume = jest.fn(() => Promise.resolve());
    suspend = jest.fn(() => Promise.resolve());
  },
});

// Enhanced FileReader mock for upload tests
Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: class MockFileReader {
    readyState: number = 0; // EMPTY
    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;

    // Event handlers
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsDataURL = jest.fn(function (this: any, file: Blob) {
      this.readyState = 1; // LOADING
      setTimeout(() => {
        this.readyState = 2; // DONE
        this.result = `data:${file.type || 'application/octet-stream'};base64,ZmFrZS1kYXRh`;
        if (this.onload) {
          this.onload({ target: this, loaded: file.size, total: file.size } as any);
        }
        if (this.onloadend) {
          this.onloadend({ target: this } as any);
        }
      }, 100);
    });

    readAsText = jest.fn(function (this: any, file: Blob) {
      this.readyState = 1; // LOADING
      setTimeout(() => {
        this.readyState = 2; // DONE
        this.result = 'fake file content';
        if (this.onload) {
          this.onload({ target: this } as any);
        }
      }, 100);
    });

    readAsArrayBuffer = jest.fn();
    readAsBinaryString = jest.fn();
    abort = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = jest.fn();

    // Constants
    static readonly EMPTY = 0;
    static readonly LOADING = 1;
    static readonly DONE = 2;
  },
});

// Mock URL.createObjectURL and revokeObjectURL for file handling
Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-object-url'),
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock navigator.mediaDevices for getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
        addTrack: jest.fn(),
        removeTrack: jest.fn(),
        clone: jest.fn(),
      } as MediaStream)
    ),
    enumerateDevices: jest.fn(() => Promise.resolve([])),
    getDisplayMedia: jest.fn(() => Promise.resolve({} as MediaStream)),
  },
});

// Mock HTMLVideoElement and HTMLAudioElement
Object.defineProperty(global.HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn(() => Promise.resolve()),
});

Object.defineProperty(global.HTMLAudioElement.prototype, 'play', {
  writable: true,
  value: jest.fn(() => Promise.resolve()),
});

// Mock ResizeObserver for responsive components
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock IntersectionObserver for lazy loading components
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallback;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment these to reduce noise in test output
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn()
};
