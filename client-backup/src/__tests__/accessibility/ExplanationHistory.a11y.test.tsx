import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ExplanationHistory from '../../components/ExplanationHistory';

// Add jest-axe custom matchers
expect.extend(toHaveNoViolations);

describe('ExplanationHistory Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    // Mock the necessary props for ExplanationHistory
    const mockProps = {
      explanations: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          query: 'Sample query 1',
          response: 'Sample response 1',
          source: 'User',
          metadata: { confidence: 0.95 }
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          query: 'Sample query 2',
          response: 'Sample response 2',
          source: 'System',
          metadata: { confidence: 0.87 }
        }
      ],
      isLoading: false,
      onPageChange: jest.fn(),
      onSortChange: jest.fn(),
      currentPage: 1,
      totalPages: 2,
      sortField: 'timestamp',
      sortDirection: 'desc'
    };

    // Render the component
    const { container } = render(<ExplanationHistory {...mockProps} />);
    
    // Run axe on the rendered component
    const results = await axe(container);
    
    // Assert no accessibility violations
    expect(results).toHaveNoViolations();
  });

  it('should be accessible in loading state', async () => {
    const mockProps = {
      explanations: [],
      isLoading: true,
      onPageChange: jest.fn(),
      onSortChange: jest.fn(),
      currentPage: 1,
      totalPages: 0,
      sortField: 'timestamp',
      sortDirection: 'desc'
    };

    const { container } = render(<ExplanationHistory {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be accessible with error state', async () => {
    const mockProps = {
      explanations: [],
      isLoading: false,
      error: 'Failed to load explanations',
      onPageChange: jest.fn(),
      onSortChange: jest.fn(),
      currentPage: 1,
      totalPages: 0,
      sortField: 'timestamp',
      sortDirection: 'desc'
    };

    const { container } = render(<ExplanationHistory {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be accessible with empty state', async () => {
    const mockProps = {
      explanations: [],
      isLoading: false,
      onPageChange: jest.fn(),
      onSortChange: jest.fn(),
      currentPage: 1,
      totalPages: 0,
      sortField: 'timestamp',
      sortDirection: 'desc'
    };

    const { container } = render(<ExplanationHistory {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
