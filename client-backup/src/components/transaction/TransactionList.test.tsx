import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionList } from './TransactionList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('TransactionList', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TransactionList />
      </QueryClientProvider>
    );
  };

  it('renders the transaction list with all sections', async () => {
    renderComponent();

    expect(screen.getByText(/transaction list/i)).toBeInTheDocument();
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });

  it('displays transaction items', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });
  });

  it('filters transactions by status', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'PENDING' },
    });

    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  it('filters transactions by date range', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: '2024-12-31' },
    });

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });
  });

  it('filters transactions by amount range', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/min amount/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText(/max amount/i), {
      target: { value: '150' },
    });

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });
  });

  it('sorts transactions by amount', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: 'AMOUNT_ASC' },
    });

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });
  });

  it('sorts transactions by date', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: 'DATE_DESC' },
    });

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });
  });

  it('searches transactions', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'test' },
    });

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
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

  it('displays transaction details on click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/\$100/i));

    await waitFor(() => {
      expect(screen.getByText(/transaction details/i)).toBeInTheDocument();
      expect(screen.getByText(/payment method: credit card/i)).toBeInTheDocument();
      expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
    });
  });

  it('approves a transaction', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() => {
      expect(screen.getByText(/transaction approved successfully/i)).toBeInTheDocument();
    });
  });

  it('rejects a transaction', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /reject/i }));

    await waitFor(() => {
      expect(screen.getByText(/transaction rejected successfully/i)).toBeInTheDocument();
    });
  });

  it('handles dispute resolution', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /resolve dispute/i }));

    await waitFor(() => {
      expect(screen.getByText(/dispute resolution/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /release funds/i }));

    await waitFor(() => {
      expect(screen.getByText(/dispute resolved successfully/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error loading transactions/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('maintains state after page refresh', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });

    // Simulate page refresh
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no transactions found', async () => {
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: [], total: 0, page: 1, limit: 10 }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
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