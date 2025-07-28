import { RenderResult, render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';

type RenderOptions = {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  [key: string]: any;
};

/**
 * Custom render function that includes all necessary providers
 */
export const render = (
  ui: ReactElement,
  { wrapper: Wrapper, ...renderOptions }: RenderOptions = {}
): RenderResult => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const content = Wrapper ? <Wrapper>{children}</Wrapper> : children;
    
    return (
      <ThemeProvider theme={theme}>
        {content}
      </ThemeProvider>
    );
  };

  return rtlRender(ui, { wrapper: AllTheProviders, ...renderOptions });
};

/**
 * Mocks the window.matchMedia function
 */
export const mockMatchMedia = () => {
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
};

/**
 * Waits for an element to be removed from the DOM
 */
export const waitForElementToBeRemoved = (selector: () => any) => {
  return new Promise<void>((resolve) => {
    const check = () => {
      try {
        selector();
        setTimeout(check, 100);
      } catch (error) {
        resolve();
      }
    };
    check();
  });
};

/**
 * Mocks the IntersectionObserver
 */
export const mockIntersectionObserver = () => {
  // Mock IntersectionObserver
  class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    
    constructor(private callback: IntersectionObserverCallback) {}
    
    observe() {
      // Trigger callback with mocked entry
      this.callback([{
        isIntersecting: true,
        intersectionRatio: 1,
        target: document.createElement('div'),
        time: 0,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
      }], this);
    }
    
    unobserve() {}
    disconnect() {}
  }
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
  
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
// Override render method
export { render };
