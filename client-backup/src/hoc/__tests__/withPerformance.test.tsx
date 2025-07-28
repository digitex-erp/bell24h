import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import withPerformance from '../withPerformance';
import { mark, measure } from '../../utils/performance';

// Mock the performance utilities
jest.mock('../../utils/performance', () => ({
  mark: jest.fn(),
  measure: jest.fn(),
}));

// Mock requestIdleCallback and cancelIdleCallback
const mockRequestIdleCallback = jest.fn((callback) => {
  callback();
  return 1; // Return a mock ID
});

const mockCancelIdleCallback = jest.fn();

// Mock the global objects
Object.defineProperty(window, 'requestIdleCallback', {
  value: mockRequestIdleCallback,
  writable: true,
});

Object.defineProperty(window, 'cancelIdleCallback', {
  value: mockCancelIdleCallback,
  writable: true,
});

describe('withPerformance HOC', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the wrapped component with performance marks', () => {
    // Create a test component
    const TestComponent = ({ isLoaded }: { isLoaded?: boolean }) => (
      <div data-testid="test-component">
        {isLoaded ? 'Loaded' : 'Loading...'}
      </div>
    );

    // Wrap the component with the HOC
    const EnhancedComponent = withPerformance(TestComponent, 'TestComponent');

    // Render the component
    render(<EnhancedComponent />);

    // Check that the component is rendered
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Check that the performance marks were called
    expect(mark).toHaveBeenCalledWith('component_TestComponent_start');
    
    // The idle callback should have been called
    expect(mockRequestIdleCallback).toHaveBeenCalled();
    
    // The measure should be called after the idle callback
    expect(measure).toHaveBeenCalledWith(
      'component_TestComponent',
      'component_TestComponent_start',
      'component_TestComponent_mount'
    );
  });

  it('should clean up idle callback on unmount', () => {
    // Create a test component
    const TestComponent = ({ isLoaded }: { isLoaded?: boolean }) => (
      <div>{isLoaded ? 'Loaded' : 'Loading...'}</div>
    );

    // Wrap the component with the HOC
    const EnhancedComponent = withPerformance(TestComponent);

    // Render and unmount the component
    const { unmount } = render(<EnhancedComponent />);
    unmount();

    // Check that cancelIdleCallback was called
    expect(mockCancelIdleCallback).toHaveBeenCalled();
  });

  it('should use setTimeout when requestIdleCallback is not available', () => {
    // Save original implementation
    const originalRequestIdleCallback = window.requestIdleCallback;
    const originalSetTimeout = global.setTimeout;
    
    // Mock setTimeout
    const mockSetTimeout = jest.fn((callback) => {
      callback();
      return 123; // Return a mock timer ID
    });
    
    // Mock clearTimeout
    const mockClearTimeout = jest.fn();
    
    // Override globals
    delete (window as any).requestIdleCallback;
    global.setTimeout = mockSetTimeout as any;
    const originalClearTimeout = global.clearTimeout;
    global.clearTimeout = mockClearTimeout as any;
    
    try {
      // Create a test component
      const TestComponent = () => <div>Test</div>;
      
      // Wrap the component with the HOC
      const EnhancedComponent = withPerformance(TestComponent);
      
      // Render and unmount the component
      const { unmount } = render(<EnhancedComponent />);
      unmount();
      
      // Check that setTimeout was used as a fallback
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
      expect(mockClearTimeout).toHaveBeenCalledWith(123);
    } finally {
      // Restore globals
      window.requestIdleCallback = originalRequestIdleCallback;
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
    }
  });

  it('should pass through props to the wrapped component', () => {
    // Create a test component that uses the isLoaded prop
    const TestComponent = ({ isLoaded, name }: { isLoaded?: boolean; name: string }) => (
      <div data-testid="test-component">
        {isLoaded ? `Hello, ${name}!` : 'Loading...'}
      </div>
    );

    // Wrap the component with the HOC
    const EnhancedComponent = withPerformance(TestComponent);

    // Render the component with props
    render(<EnhancedComponent name="Test User" />);

    // The component should receive the name prop and isLoaded prop
    expect(screen.getByTestId('test-component')).toHaveTextContent('Loading...');
    
    // Simulate the idle callback
    act(() => {
      const callback = mockRequestIdleCallback.mock.calls[0][0];
      callback();
    });
    
    // After loading, the component should show the name
    expect(screen.getByTestId('test-component')).toHaveTextContent('Hello, Test User!');
  });

  it('should use the component name for the display name', () => {
    // Create a test component with a display name
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'CustomDisplayName';
    
    // Wrap the component with the HOC
    const EnhancedComponent = withPerformance(TestComponent);
    
    // Check the display name
    expect(EnhancedComponent.displayName).toBe('WithPerformance(CustomDisplayName)');
  });
});
