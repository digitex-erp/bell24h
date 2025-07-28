import { render } from '@testing-library/react';
import { describe, beforeAll, afterEach, afterAll, test, expect } from 'vitest';
import { configureAxe } from 'vitest-axe';
import { ExplanationHistory } from '../ExplanationHistory';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Configure axe with custom rules
const axe = configureAxe({
  rules: {
    // Disable rules that are not applicable to our test environment
    region: { enabled: false },
  },
});

// Setup MSW for API mocking
const mockExplanations = [
  {
    id: '1',
    title: 'Test Explanation 1',
    description: 'This is a test explanation',
    timestamp: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Explanation 2',
    description: 'This is another test explanation',
    timestamp: '2023-01-02T00:00:00Z',
  },
];

describe('ExplanationHistory - Accessibility Tests', () => {
  beforeAll(() => {
    // Start the MSW server
    server.listen();
    
    // Setup default mock handlers
    server.use(
      http.get('/api/explanations', () => {
        return HttpResponse.json({
          items: mockExplanations,
          totalItems: mockExplanations.length,
        });
      })
    );
  });

  test('should have no accessibility violations', async () => {
    const { container } = render(<ExplanationHistory />);
    const results = await axe(container);
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations found:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations).toHaveLength(0);
  });
  
  afterEach(() => {
    server.resetHandlers();
  });

  test('should have no accessibility violations when loading', async () => {
    // Mock a slow API response to test loading state
    server.use(
      http.get('/api/explanations', () => {
        return new Promise(resolve => 
          setTimeout(() => resolve(HttpResponse.json({
            items: mockExplanations,
            totalItems: mockExplanations.length,
          })), 1000)
        );
      })
    );

    const { container } = render(<ExplanationHistory />);
    const results = await axe(container);
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations in loading state:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations).toHaveLength(0);
  });

  test('should have no accessibility violations when empty', async () => {
    // Mock empty response
    server.use(
      http.get('/api/explanations', () => {
        return HttpResponse.json({
          items: [],
          totalItems: 0,
        });
      })
    );

    const { container } = render(<ExplanationHistory />);
    const results = await axe(container);
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations in empty state:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations).toHaveLength(0);
  });

  test('should have no accessibility violations when error occurs', async () => {
    // Mock error response
    server.use(
      http.get('/api/explanations', () => {
        return new HttpResponse('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
      })
    );

    const { container } = render(<ExplanationHistory />);
    const results = await axe(container);
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations in error state:', JSON.stringify(results.violations, null, 2));
    }
    
    expect(results.violations).toHaveLength(0);
  });

  afterAll(() => {
    // Clean up the MSW server
    server.close();
  });
});
