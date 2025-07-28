import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { Dashboard } from './Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Dashboard', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );
  };

  it('renders the dashboard with all sections', async () => {
    renderComponent();

    expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  it('displays analytics metrics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/total users/i)).toBeInTheDocument();
      expect(screen.getByText(/total rfqs/i)).toBeInTheDocument();
      expect(screen.getByText(/total quotes/i)).toBeInTheDocument();
      expect(screen.getByText(/total transactions/i)).toBeInTheDocument();
    });
  });

  it('displays recent activity', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/new rfq created/i)).toBeInTheDocument();
    });
  });

  it('displays quick action buttons', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /create rfq/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view quotes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view transactions/i })).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/analytics/dashboard', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('updates metrics in real-time', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('50')).toBeInTheDocument(); // Total RFQs
      expect(screen.getByText('200')).toBeInTheDocument(); // Total Quotes
      expect(screen.getByText('75')).toBeInTheDocument(); // Total Transactions
    });
  });

  it('displays charts and graphs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('rfq-trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('quote-distribution-chart')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-volume-chart')).toBeInTheDocument();
    });
  });

  it('displays user statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/active users/i)).toBeInTheDocument();
      expect(screen.getByText(/new users/i)).toBeInTheDocument();
      expect(screen.getByText(/user growth/i)).toBeInTheDocument();
    });
  });

  it('displays transaction statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/total volume/i)).toBeInTheDocument();
      expect(screen.getByText(/average transaction/i)).toBeInTheDocument();
      expect(screen.getByText(/success rate/i)).toBeInTheDocument();
    });
  });

  it('displays supplier statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/total suppliers/i)).toBeInTheDocument();
      expect(screen.getByText(/verified suppliers/i)).toBeInTheDocument();
      expect(screen.getByText(/supplier growth/i)).toBeInTheDocument();
    });
  });

  it('displays buyer statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/total buyers/i)).toBeInTheDocument();
      expect(screen.getByText(/active buyers/i)).toBeInTheDocument();
      expect(screen.getByText(/buyer growth/i)).toBeInTheDocument();
    });
  });

  it('displays category distribution', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/category distribution/i)).toBeInTheDocument();
      expect(screen.getByTestId('category-distribution-chart')).toBeInTheDocument();
    });
  });

  it('displays geographic distribution', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/geographic distribution/i)).toBeInTheDocument();
      expect(screen.getByTestId('geographic-distribution-map')).toBeInTheDocument();
    });
  });

  it('displays performance metrics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/response time/i)).toBeInTheDocument();
      expect(screen.getByText(/quote acceptance rate/i)).toBeInTheDocument();
      expect(screen.getByText(/transaction completion rate/i)).toBeInTheDocument();
    });
  });

  it('displays system health metrics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/system uptime/i)).toBeInTheDocument();
      expect(screen.getByText(/error rate/i)).toBeInTheDocument();
      expect(screen.getByText(/api performance/i)).toBeInTheDocument();
    });
  });
}); 