import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Admin } from './Admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Admin', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Admin />
      </QueryClientProvider>
    );
  };

  it('renders the admin dashboard with all sections', async () => {
    renderComponent();

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/supplier verification/i)).toBeInTheDocument();
    expect(screen.getByText(/content moderation/i)).toBeInTheDocument();
    expect(screen.getByText(/system settings/i)).toBeInTheDocument();
  });

  it('displays admin metrics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/total users/i)).toBeInTheDocument();
      expect(screen.getByText(/total suppliers/i)).toBeInTheDocument();
      expect(screen.getByText(/total buyers/i)).toBeInTheDocument();
      expect(screen.getByText(/total transactions/i)).toBeInTheDocument();
    });
  });

  it('manages users', async () => {
    renderComponent();

    // Search for a user
    fireEvent.change(screen.getByLabelText(/search users/i), {
      target: { value: 'test@example.com' },
    });

    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
    });

    // Update user role
    fireEvent.click(screen.getByRole('button', { name: /edit role/i }));
    fireEvent.click(screen.getByText(/admin/i));

    await waitFor(() => {
      expect(screen.getByText(/role updated successfully/i)).toBeInTheDocument();
    });
  });

  it('verifies suppliers', async () => {
    renderComponent();

    // View pending verifications
    fireEvent.click(screen.getByText(/pending verifications/i));

    await waitFor(() => {
      expect(screen.getByText(/test supplier/i)).toBeInTheDocument();
    });

    // Approve verification
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() => {
      expect(screen.getByText(/supplier verified successfully/i)).toBeInTheDocument();
    });
  });

  it('moderates content', async () => {
    renderComponent();

    // View reported content
    fireEvent.click(screen.getByText(/reported content/i));

    await waitFor(() => {
      expect(screen.getByText(/reported item/i)).toBeInTheDocument();
    });

    // Approve content
    fireEvent.click(screen.getByRole('button', { name: /approve content/i }));

    await waitFor(() => {
      expect(screen.getByText(/content approved successfully/i)).toBeInTheDocument();
    });
  });

  it('manages system settings', async () => {
    renderComponent();

    // Toggle maintenance mode
    fireEvent.click(screen.getByLabelText(/maintenance mode/i));

    await waitFor(() => {
      expect(screen.getByText(/maintenance mode updated successfully/i)).toBeInTheDocument();
    });

    // Update registration settings
    fireEvent.click(screen.getByLabelText(/enable registration/i));

    await waitFor(() => {
      expect(screen.getByText(/registration settings updated successfully/i)).toBeInTheDocument();
    });
  });

  it('generates reports', async () => {
    renderComponent();

    // Select report type
    fireEvent.change(screen.getByLabelText(/report type/i), {
      target: { value: 'USER_ACTIVITY' },
    });

    // Select date range
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: '2024-12-31' },
    });

    // Generate report
    fireEvent.click(screen.getByRole('button', { name: /generate report/i }));

    await waitFor(() => {
      expect(screen.getByText(/report generated successfully/i)).toBeInTheDocument();
    });
  });

  it('manages audit logs', async () => {
    renderComponent();

    // View audit logs
    fireEvent.click(screen.getByText(/audit logs/i));

    await waitFor(() => {
      expect(screen.getByText(/system audit logs/i)).toBeInTheDocument();
    });

    // Filter logs
    fireEvent.change(screen.getByLabelText(/log type/i), {
      target: { value: 'USER_ACTION' },
    });

    await waitFor(() => {
      expect(screen.getByText(/filtered logs/i)).toBeInTheDocument();
    });
  });

  it('manages backups', async () => {
    renderComponent();

    // Create backup
    fireEvent.click(screen.getByRole('button', { name: /create backup/i }));

    await waitFor(() => {
      expect(screen.getByText(/backup created successfully/i)).toBeInTheDocument();
    });

    // View backup history
    fireEvent.click(screen.getByText(/backup history/i));

    await waitFor(() => {
      expect(screen.getByText(/backup list/i)).toBeInTheDocument();
    });
  });

  it('manages API keys', async () => {
    renderComponent();

    // Generate API key
    fireEvent.click(screen.getByRole('button', { name: /generate api key/i }));

    await waitFor(() => {
      expect(screen.getByText(/api key generated successfully/i)).toBeInTheDocument();
    });

    // View API keys
    fireEvent.click(screen.getByText(/api keys/i));

    await waitFor(() => {
      expect(screen.getByText(/active api keys/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/admin/dashboard', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error loading admin dashboard/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('maintains state after page refresh', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });

    // Simulate page refresh
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
  });
}); 