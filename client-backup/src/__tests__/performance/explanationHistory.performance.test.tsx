import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ExplanationHistory from '@/components/ai/ExplanationHistory';
import { performance } from 'perf_hooks';
import React from 'react';

describe('ExplanationHistory Component – Performance Test', () => {
  // Generate a large dataset of mock explanation items
  const generateLargeDataset = (size: number) => {
    return Array.from({ length: size }, (_, i) => ({
      id: `item-${i}`,
      modelType: i % 2 === 0 ? 'SHAP' : 'LIME',
      timestamp: new Date(Date.now() - i * 60000).toISOString(), // Subtract minutes
      summary: `Summary for explanation item ${i}`,
    }));
  };

  const smallDataset = generateLargeDataset(20);
  const mediumDataset = generateLargeDataset(100);
  const largeDataset = generateLargeDataset(500);
  

  it('should render small dataset (20 items) efficiently', async () => {
    const startTime = performance.now();
    
    render(
      <ExplanationHistory 
        explanations={smallDataset} 
        isLoading={false}
        error={null}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Summary for explanation item 0/i)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`Small dataset (20 items) render time: ${renderTime.toFixed(2)}ms`);
    expect(renderTime).toBeLessThan(1000); // Expect render time to be less than 1 second
  });

  it('should render medium dataset (100 items) without significant performance degradation', async () => {
    const startTime = performance.now();
    
    render(
      <ExplanationHistory 
        explanations={mediumDataset}
        isLoading={false}
        error={null}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Summary for explanation item 0/i)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`Medium dataset (100 items) render time: ${renderTime.toFixed(2)}ms`);
    expect(renderTime).toBeLessThan(2000); // Expect render time to be less than 2 seconds
  });

  it('should render large dataset (500 items) without crashing', async () => {
    const startTime = performance.now();
    
    render(
      <ExplanationHistory 
        explanations={largeDataset}
        isLoading={false}
        error={null}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Summary for explanation item 0/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`Large dataset (500 items) render time: ${renderTime.toFixed(2)}ms`);
    expect(renderTime).toBeLessThan(5000); // Expect render time to be less than 5 seconds
  });

  it('should maintain pagination performance with large datasets', async () => {
    const { container } = render(
      <ExplanationHistory 
        explanations={largeDataset}
        isLoading={false}
        error={null}
      />
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Summary for explanation item 0/i)).toBeInTheDocument();
    });
    
    // Find and click next page button
    const paginationButtons = container.querySelectorAll('.MuiPagination-ul button');
    const nextPageButton = Array.from(paginationButtons).find(button => 
      button.textContent === '2' || button.getAttribute('aria-label') === 'Go to page 2'
    );
    
    if (nextPageButton) {
      const startTime = performance.now();
      
      nextPageButton.click();
      
      // Wait for page 2 to be rendered
      await waitFor(() => {
        // This depends on your pagination implementation
        // You might need to adjust based on your actual page size and item order
        const expectedItemOnPage2 = largeDataset[10]; // Assuming 10 items per page
        expect(screen.getByText(new RegExp(expectedItemOnPage2.summary))).toBeInTheDocument();
      }, { timeout: 2000 });
      
      const endTime = performance.now();
      const paginationTime = endTime - startTime;
      
      console.log(`Pagination operation time: ${paginationTime.toFixed(2)}ms`);
      expect(paginationTime).toBeLessThan(1000); // Pagination should be fast
    }
  });

  it('should maintain sorting performance with large datasets', async () => {
    const { container } = render(
      <ExplanationHistory 
        explanations={largeDataset}
        isLoading={false}
        error={null}
      />
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Summary for explanation item 0/i)).toBeInTheDocument();
    });
    
    // Find and click on a sortable column header
    const sortableHeaders = container.querySelectorAll('th[aria-sort]');
    if (sortableHeaders.length > 0) {
      const startTime = performance.now();
      
      sortableHeaders[0].click(); // Click first sortable column
      
      // Wait for sorted content
      await waitFor(() => {
        // This depends on your sorting implementation
        // Check if the aria-sort attribute changes or if content reorders
        expect(sortableHeaders[0].getAttribute('aria-sort')).not.toBe('none');
      }, { timeout: 2000 });
      
      const endTime = performance.now();
      const sortingTime = endTime - startTime;
      
      console.log(`Sorting operation time: ${sortingTime.toFixed(2)}ms`);
      expect(sortingTime).toBeLessThan(1000); // Sorting should be fast
    }
  });
});
