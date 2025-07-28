import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuoteForm } from './QuoteForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('QuoteForm', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockRFQ = {
    id: '1',
    title: 'Test RFQ',
    description: 'Test Description',
    category: 'Electronics',
    quantity: 100,
    unit: 'pcs',
    deliveryDate: '2024-12-31',
  };

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <QuoteForm rfq={mockRFQ} />
      </QueryClientProvider>
    );
  };

  it('renders the form with all required fields', () => {
    renderComponent();

    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment terms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/validity period/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays RFQ details', () => {
    renderComponent();

    expect(screen.getByText(mockRFQ.title)).toBeInTheDocument();
    expect(screen.getByText(mockRFQ.description)).toBeInTheDocument();
    expect(screen.getByText(mockRFQ.category)).toBeInTheDocument();
    expect(screen.getByText(`${mockRFQ.quantity} ${mockRFQ.unit}`)).toBeInTheDocument();
    expect(screen.getByText(mockRFQ.deliveryDate)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
      expect(screen.getByText(/delivery time is required/i)).toBeInTheDocument();
      expect(screen.getByText(/payment terms is required/i)).toBeInTheDocument();
      expect(screen.getByText(/validity period is required/i)).toBeInTheDocument();
    });
  });

  it('validates price format', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: 'invalid' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/price must be a valid number/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/delivery time/i), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText(/payment terms/i), {
      target: { value: 'Net 30' },
    });
    fireEvent.change(screen.getByLabelText(/validity period/i), {
      target: { value: '7' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/quote submitted successfully/i)).toBeInTheDocument();
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
      rest.post('/api/quotes', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/delivery time/i), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText(/payment terms/i), {
      target: { value: 'Net 30' },
    });
    fireEvent.change(screen.getByLabelText(/validity period/i), {
      target: { value: '7' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error submitting quote/i)).toBeInTheDocument();
    });
  });

  it('clears the form after successful submission', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/delivery time/i), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText(/payment terms/i), {
      target: { value: 'Net 30' },
    });
    fireEvent.change(screen.getByLabelText(/validity period/i), {
      target: { value: '7' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/price/i)).toHaveValue('');
      expect(screen.getByLabelText(/delivery time/i)).toHaveValue('');
      expect(screen.getByLabelText(/payment terms/i)).toHaveValue('');
      expect(screen.getByLabelText(/validity period/i)).toHaveValue('');
    });
  });
}); 