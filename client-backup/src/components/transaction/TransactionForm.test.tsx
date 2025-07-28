import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('TransactionForm', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockQuote = {
    id: '1',
    price: 1000,
    deliveryTime: '30 days',
    paymentTerms: 'Net 30',
    validityPeriod: '7 days',
    supplier: {
      id: '1',
      name: 'Test Supplier',
    },
  };

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TransactionForm quote={mockQuote} />
      </QueryClientProvider>
    );
  };

  it('renders the form with all required fields', () => {
    renderComponent();

    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shipping address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/billing address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays quote details', () => {
    renderComponent();

    expect(screen.getByText(`$${mockQuote.price}`)).toBeInTheDocument();
    expect(screen.getByText(mockQuote.deliveryTime)).toBeInTheDocument();
    expect(screen.getByText(mockQuote.paymentTerms)).toBeInTheDocument();
    expect(screen.getByText(mockQuote.validityPeriod)).toBeInTheDocument();
    expect(screen.getByText(mockQuote.supplier.name)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/payment method is required/i)).toBeInTheDocument();
      expect(screen.getByText(/shipping address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/billing address is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'CREDIT_CARD' },
    });
    fireEvent.change(screen.getByLabelText(/shipping address/i), {
      target: { value: '123 Test St, Test City, 12345' },
    });
    fireEvent.change(screen.getByLabelText(/billing address/i), {
      target: { value: '123 Test St, Test City, 12345' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/transaction created successfully/i)).toBeInTheDocument();
    });
  });

  it('handles payment method selection correctly', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'CREDIT_CARD' },
    });

    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'BANK_TRANSFER' },
    });

    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/routing number/i)).toBeInTheDocument();
  });

  it('validates credit card details', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'CREDIT_CARD' },
    });

    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: 'invalid' },
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: 'invalid' },
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: 'invalid' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid card number/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid expiry date/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid cvv/i)).toBeInTheDocument();
    });
  });

  it('validates bank transfer details', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'BANK_TRANSFER' },
    });

    fireEvent.change(screen.getByLabelText(/account number/i), {
      target: { value: 'invalid' },
    });
    fireEvent.change(screen.getByLabelText(/routing number/i), {
      target: { value: 'invalid' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid account number/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid routing number/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.post('/api/transactions', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'CREDIT_CARD' },
    });
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' },
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/25' },
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/shipping address/i), {
      target: { value: '123 Test St, Test City, 12345' },
    });
    fireEvent.change(screen.getByLabelText(/billing address/i), {
      target: { value: '123 Test St, Test City, 12345' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error creating transaction/i)).toBeInTheDocument();
    });
  });

  it('clears the form after successful submission', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: 'CREDIT_CARD' },
    });
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' },
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '12/25' },
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/shipping address/i), {
      target: { value: '123 Test St, Test City, 12345' },
    });
    fireEvent.change(screen.getByLabelText(/billing address/i), {
      target: { value: '123 Test St, Test City, 12345' },
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/payment method/i)).toHaveValue('');
      expect(screen.getByLabelText(/shipping address/i)).toHaveValue('');
      expect(screen.getByLabelText(/billing address/i)).toHaveValue('');
    });
  });
}); 