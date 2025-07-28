import { renderHook, act } from '@testing-library/react-hooks';
import { useWorker } from '../useWorker';

// Mock the Worker class
const mockWorker = {
  postMessage: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
};

// Mock the Worker constructor
const mockWorkerConstructor = jest.fn().mockImplementation(() => mockWorker);

describe('useWorker', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the Worker mock
    global.Worker = mockWorkerConstructor as any;
  });

  it('should initialize a worker with the correct URL', () => {
    const workerUrl = '/mock-worker.js';
    
    renderHook(() => useWorker(workerUrl));
    
    expect(mockWorkerConstructor).toHaveBeenCalledTimes(1);
    expect(mockWorkerConstructor).toHaveBeenCalledWith(workerUrl);
  });

  it('should post messages to the worker', () => {
    const workerUrl = '/mock-worker.js';
    const message = { type: 'TEST', data: 'test data' };
    
    const { result } = renderHook(() => useWorker(workerUrl));
    
    act(() => {
      result.current.postMessage(message);
    });
    
    expect(mockWorker.postMessage).toHaveBeenCalledTimes(1);
    expect(mockWorker.postMessage).toHaveBeenCalledWith(message);
  });

  it('should handle incoming messages', () => {
    const workerUrl = '/mock-worker.js';
    const message = { data: { type: 'RESPONSE', data: 'response data' } };
    let messageHandler: (event: MessageEvent) => void = () => {};
    
    // Capture the onmessage handler
    Object.defineProperty(mockWorker, 'onmessage', {
      set: (fn: (event: MessageEvent) => void) => {
        messageHandler = fn;
      },
    });
    
    const onMessage = jest.fn();
    
    renderHook(() => 
      useWorker(workerUrl, { onMessage })
    );
    
    // Simulate a message from the worker
    act(() => {
      messageHandler(message as MessageEvent);
    });
    
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it('should handle errors from the worker', () => {
    const workerUrl = '/mock-worker.js';
    const error = new Error('Worker error');
    let errorHandler: (event: ErrorEvent) => void = () => {};
    
    // Capture the onerror handler
    Object.defineProperty(mockWorker, 'onerror', {
      set: (fn: (event: ErrorEvent) => void) => {
        errorHandler = fn;
      },
    });
    
    const onError = jest.fn();
    
    renderHook(() => 
      useWorker(workerUrl, { onError })
    );
    
    // Simulate an error from the worker
    act(() => {
      errorHandler({ error, message: 'Worker error' } as unknown as ErrorEvent);
    });
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      error,
      message: 'Worker error',
    }));
  });

  it('should terminate the worker on unmount', () => {
    const workerUrl = '/mock-worker.js';
    
    const { unmount } = renderHook(() => useWorker(workerUrl));
    
    unmount();
    
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
  });

  it('should queue messages when worker is not ready', () => {
    const workerUrl = '/mock-worker.js';
    const message1 = { type: 'MESSAGE_1' };
    const message2 = { type: 'MESSAGE_2' };
    
    // Create a mock worker that doesn't set onmessage immediately
    let resolveWorker: (worker: any) => void;
    const workerPromise = new Promise<Worker>((resolve) => {
      resolveWorker = resolve;
    });
    
    const mockDelayedWorker = {
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
    };
    
    const mockDelayedWorkerConstructor = jest.fn().mockImplementation(() => {
      // Don't resolve immediately
      return workerPromise.then(() => mockDelayedWorker);
    });
    
    // Override the Worker mock for this test
    global.Worker = mockDelayedWorkerConstructor as any;
    
    const { result } = renderHook(() => useWorker(workerUrl));
    
    // Post messages before worker is ready
    act(() => {
      result.current.postMessage(message1);
      result.current.postMessage(message2);
    });
    
    // Messages should be queued, not sent yet
    expect(mockDelayedWorker.postMessage).not.toHaveBeenCalled();
    
    // Now resolve the worker
    act(() => {
      resolveWorker!(mockDelayedWorker);
    });
    
    // After resolving, both messages should be sent
    expect(mockDelayedWorker.postMessage).toHaveBeenCalledTimes(2);
    expect(mockDelayedWorker.postMessage).toHaveBeenNthCalledWith(1, message1);
    expect(mockDelayedWorker.postMessage).toHaveBeenNthCalledWith(2, message2);
  });
});
