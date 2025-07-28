import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

type Options = Omit<RenderOptions, 'queries'> & {
  /**
   * Whether to include the theme provider in the test render
   * @default true
   */
  withTheme?: boolean;
  /**
   * Whether to include CSS baseline styles
   * @default true
   */
  withCssBaseline?: boolean;
};

/**
 * Custom render function that includes providers and accessibility testing utilities
 */
const customRender = (
  ui: ReactElement,
  { withTheme = true, withCssBaseline = true, ...renderOptions }: Options = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = children;

    if (withCssBaseline) {
      content = <CssBaseline>{content}</CssBaseline>;
    }

    if (withTheme) {
      content = <ThemeProvider theme={theme}>{content}</ThemeProvider>;
    }

    return <>{content}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Test a component for accessibility violations
 * @param ui The React component or element to test
 * @param options Options for rendering and accessibility testing
 * @returns Promise that resolves with the accessibility test results
 */
async function testA11y(
  ui: ReactElement | HTMLElement,
  options: Options = {}
): Promise<any> {
  const { withTheme = true, withCssBaseline = true, ...renderOptions } = options;
  
  let container: HTMLElement | null = null;
  
  // If we received a React element, render it
  if (React.isValidElement(ui)) {
    const { container: renderedContainer } = customRender(ui, {
      withTheme,
      withCssBaseline,
      ...renderOptions,
    });
    container = renderedContainer;
  } 
  // If we received an HTMLElement, use it directly
  else if (ui instanceof HTMLElement) {
    container = ui;
  } 
  // Otherwise, throw an error
  else {
    throw new Error('testA11y expects a React element or HTMLElement');
  }

  // Run axe on the container
  const results = await axe(container, {
    // Configure axe options as needed
    rules: {
      // Disable rules that are not relevant for our tests
      'color-contrast': { enabled: false }, // Handled by theme
      'landmark-one-main': { enabled: false }, // Not always applicable in component tests
      'page-has-heading-one': { enabled: false }, // Not always applicable in component tests
      'region': { enabled: false }, // Not always applicable in component tests
    },
  });

  // Expect no violations
  expect(results).toHaveNoViolations();
  
  return results;
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override the render method
export { customRender as render };

// Export the accessibility test utility
export { testA11y };
