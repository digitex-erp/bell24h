/// <reference types="@testing-library/jest-dom" />
import { RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

declare module '@testing-library/react' {
  export function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'queries'>
  ): RenderResult;
}

declare global {
  namespace NodeJS {
    interface Global {
      IS_REACT_ACT_ENVIRONMENT: boolean;
    }
  }
  
  // Add any global test utilities or matchers here
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      // Add other custom matchers as needed
    }
  }
}
