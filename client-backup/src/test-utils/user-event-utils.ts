import { UserEvent } from '@testing-library/user-event/setup/setup';

/**
 * Utility function to simulate typing with a small delay between keystrokes
 * This helps test components that have debounced inputs
 */
export const typeWithDelay = async (user: UserEvent, element: Element, text: string) => {
  for (const char of text) {
    await user.type(element, char);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

/**
 * Utility function to wait for a condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 1000,
  interval = 50
) => {
  const start = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkCondition = async () => {
      try {
        const result = await Promise.resolve(condition());
        
        if (result) {
          resolve(true);
          return;
        }

        if (Date.now() - start > timeout) {
          reject(new Error(`Condition not met within ${timeout}ms`));
          return;
        }

        setTimeout(checkCondition, interval);
      } catch (error) {
        reject(error);
      }
    };

    checkCondition();
  });
};

/**
 * Utility to mock window.matchMedia which is not available in JSDOM
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
