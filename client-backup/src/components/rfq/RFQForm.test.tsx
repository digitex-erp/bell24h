import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RFQForm } from './RFQForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('RFQForm', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RFQForm />
      </QueryClientProvider>
    );
  };

  it('renders the form with all required fields', () => {
    renderComponent();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
      expect(screen.getByText(/unit is required/i)).toBeInTheDocument();
      expect(screen.getByText(/delivery date is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test RFQ' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Electronics' },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/unit/i), {
      target: { value: 'pcs' },
    });
    fireEvent.change(screen.getByLabelText(/delivery date/i), {
      target: { value: '2024-12-31' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/rfq created successfully/i)).toBeInTheDocument();
    });
  });

  it('handles file upload correctly', async () => {
    renderComponent();

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/attachments/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.post('/api/rfqs', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test RFQ' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Electronics' },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/unit/i), {
      target: { value: 'pcs' },
    });
    fireEvent.change(screen.getByLabelText(/delivery date/i), {
      target: { value: '2024-12-31' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error creating rfq/i)).toBeInTheDocument();
    });
  });

  it('clears the form after successful submission', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test RFQ' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Electronics' },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/unit/i), {
      target: { value: 'pcs' },
    });
    fireEvent.change(screen.getByLabelText(/delivery date/i), {
      target: { value: '2024-12-31' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
      expect(screen.getByLabelText(/category/i)).toHaveValue('');
      expect(screen.getByLabelText(/quantity/i)).toHaveValue('');
      expect(screen.getByLabelText(/unit/i)).toHaveValue('');
      expect(screen.getByLabelText(/delivery date/i)).toHaveValue('');
    });
  });
}); 