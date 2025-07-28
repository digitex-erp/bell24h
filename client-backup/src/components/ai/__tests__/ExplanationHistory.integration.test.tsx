import { render, screen, fireEvent } from '../../../test-utils';
import { ExplanationHistory } from '../ExplanationHistory';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Setup MSW for API mocking
const mockExplanations = [
  {
    id: '1',
    modelType: 'Risk Assessment',
    timestamp: '2023-06-15T10:30:00Z',
    summary: 'Low risk profile detected',
  },
  {
    id: '2',
    modelType: 'Fraud Detection',
    timestamp: '2023-06-15T11:45:00Z',
    summary: 'Potential fraud pattern identified',
  },
];

describe('ExplanationHistory - Integration Tests', () => {
  beforeAll(() => {
    // Enable API mocking before all tests
    server.use(
      http.get('/api/explanations', () => {
        return HttpResponse.json({
          items: mockExplanations,
          totalItems: mockExplanations.length,
        });
      })
    );
  });

  afterEach(() => {
    // Reset any runtime request handlers we may add during the tests
    server.resetHandlers();
  });

  it('should fetch and display explanations', async () => {
    render(<ExplanationHistory />);
    
    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for data to load
    const firstItem = await screen.findByText(mockExplanations[0].modelType);
    expect(firstItem).toBeInTheDocument();
    
    // Verify all items are rendered
    mockExplanations.forEach(item => {
      expect(screen.getByText(item.modelType)).toBeInTheDocument();
      expect(screen.getByText(item.summary)).toBeInTheDocument();
    });
    
    // Verify pagination shows correct count
    expect(screen.getByText(/1–2 of 2/)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock error response
    server.use(
      http.get('/api/explanations', () => {
        return HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    render(<ExplanationHistory />);
    
    // Verify error message is shown - the component shows the actual error message from the API
    const errorMessage = await screen.findByText(/API request failed with status 500/);
    expect(errorMessage).toBeInTheDocument();
  });

  it('should support sorting', async () => {
    // Mock the API response with sorting support
    server.use(
      http.get('/api/explanations', ({ request }) => {
        const url = new URL(request.url);
        const sortBy = url.searchParams.get('sortBy') || 'timestamp';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';
        
        // Create a sorted copy of the mock data based on the sort parameters
        const sortedItems = [...mockExplanations].sort((a, b) => {
          if (sortBy === 'modelType') {
            return sortOrder === 'asc' 
              ? a.modelType.localeCompare(b.modelType)
              : b.modelType.localeCompare(a.modelType);
          } else if (sortBy === 'timestamp') {
            return sortOrder === 'asc'
              ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return 0;
        });
        
        return HttpResponse.json({
          items: sortedItems,
          totalItems: sortedItems.length,
        });
      })
    );
    
    // Render the component
    render(<ExplanationHistory />);
    
    // Wait for initial data to load
    await screen.findByText(mockExplanations[0].modelType);
    
    // Get the model type header and click it to sort by model type
    const modelTypeHeader = screen.getByText('Model Type').closest('th');
    if (!modelTypeHeader) {
      throw new Error('Could not find Model Type header');
    }
    
    // Click to sort by model type (first click sorts ascending)
    fireEvent.click(modelTypeHeader);
    
    // Wait for the sorted data to be displayed
    await screen.findByText(mockExplanations[1].modelType);
    
    // Get all table rows (skip header row)
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    
    // Get the model type cells from each row (they should be the second cell in each row)
    const modelTypeCells = rows.map(row => 
      row.querySelector('td:nth-child(2)')
    );
    
    // Verify the cells contain the expected model types in the correct order
    // After first click, it should be sorted by modelType in ascending order
    const expectedOrder = [...mockExplanations]
      .sort((a, b) => a.modelType.localeCompare(b.modelType))
      .map(item => item.modelType);
    
    expect(modelTypeCells[0]).toHaveTextContent(expectedOrder[0]);
    expect(modelTypeCells[1]).toHaveTextContent(expectedOrder[1]);
  });

  it('should support pagination', async () => {
    // Mock handler that returns all items on the first page since the default page size is 10
    const requestHandler = http.get('/api/explanations', ({ request }) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      console.log(`API Request - page: ${page}, limit: ${limit}`);
      
      // For testing, we'll return both items on the first page since the default limit is 10
      return HttpResponse.json({
        items: [mockExplanations[0], mockExplanations[1]],
        totalItems: 2,
      });
    });
    
    server.use(requestHandler);

    // Render the component
    render(<ExplanationHistory />);
    
    // Wait for items to load
    const firstItem = await screen.findByText(mockExplanations[0].modelType);
    expect(firstItem).toBeInTheDocument();
    
    // Since both items fit on one page (limit=10), we should see both items
    const secondItem = await screen.findByText(mockExplanations[1].modelType);
    expect(secondItem).toBeInTheDocument();
    
    // Check pagination shows 1-2 of 2 since both items are on the first page
    const paginationText = screen.getByText(/1–2 of 2/);
    expect(paginationText).toBeInTheDocument();
    
    // Get pagination controls
    const nextButton = screen.getByRole('button', { name: /next page/i }) as HTMLButtonElement;
    const prevButton = screen.getByRole('button', { name: /previous page/i }) as HTMLButtonElement;
    
    // The next button should be disabled since we're showing all items on one page
    expect(nextButton).toBeDisabled();
    // The previous button should be disabled since we're on the first page
    expect(prevButton).toBeDisabled();
  });

  it('matches snapshot', async () => {
    // Mock the API response
    server.use(
      http.get('/api/explanations', () => {
        return HttpResponse.json({
          items: mockExplanations,
          totalItems: mockExplanations.length,
        });
      })
    );

    // Render the component
    const { container } = render(<ExplanationHistory />);
    
    // Wait for data to load
    await screen.findByText(mockExplanations[0].modelType);
    
    // Take a snapshot of the rendered component
    expect(container).toMatchSnapshot();
  });
});
