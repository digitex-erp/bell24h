import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RFQList } from './RFQList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('RFQList', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RFQList />
      </QueryClientProvider>
    );
  };

  it('renders the RFQ list with all sections', async () => {
    renderComponent();

    expect(screen.getByText(/rfq list/i)).toBeInTheDocument();
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });

  it('displays RFQ items', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
      expect(screen.getByText(/test description/i)).toBeInTheDocument();
      expect(screen.getByText(/open/i)).toBeInTheDocument();
    });
  });

  it('filters RFQs by status', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'OPEN' },
    });

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });
  });

  it('filters RFQs by category', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Electronics' },
    });

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });
  });

  it('sorts RFQs by date', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: 'DATE_DESC' },
    });

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });
  });

  it('sorts RFQs by price', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: 'PRICE_ASC' },
    });

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });
  });

  it('searches RFQs', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'test' },
    });

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    renderComponent();

    // Click next page
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/page 2/i)).toBeInTheDocument();
    });

    // Click previous page
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    await waitFor(() => {
      expect(screen.getByText(/page 1/i)).toBeInTheDocument();
    });
  });

  it('displays RFQ details on click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/test rfq/i));

    await waitFor(() => {
      expect(screen.getByText(/rfq details/i)).toBeInTheDocument();
      expect(screen.getByText(/test description/i)).toBeInTheDocument();
      expect(screen.getByText(/category: electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity: 100/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/rfqs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error loading rfqs/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('maintains state after page refresh', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });

    // Simulate page refresh
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/test rfq/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no RFQs found', async () => {
    server.use(
      rest.get('/api/rfqs', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: [], total: 0, page: 1, limit: 10 }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no rfqs found/i)).toBeInTheDocument();
    });
  });

  it('displays error state for invalid search', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'invalid-search-term' },
    });

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it('displays error state for invalid filter combination', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'INVALID_STATUS' },
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid filter combination/i)).toBeInTheDocument();
    });
  });
}); 