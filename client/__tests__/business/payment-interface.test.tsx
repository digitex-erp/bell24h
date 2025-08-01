import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentInterface from '@/app/payment/checkout/page';

/**
 * Phase D: Payment Interface UI Testing (Cursor-safe)
 * Tests payment flow in test mode - no real transactions
 * Keep under 60 lines to prevent hanging
 */

// Mock Razorpay
global.Razorpay = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  on: jest.fn(),
}));

// Mock order data
const mockOrder = {
  orderId: 'ORD123456',
  amount: 175000,
  items: [{ name: 'Premium Subscription', price: 175000, quantity: 1 }],
};

// Mock API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        razorpayOrderId: 'rzp_test_123',
        key: 'rzp_test_key',
      }),
  })
);

describe('Payment Interface - UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders payment summary correctly', () => {
    render(<PaymentInterface order={mockOrder} />);

    expect(screen.getByText(/Payment Checkout/i)).toBeInTheDocument();
    expect(screen.getByText('₹1,75,000')).toBeInTheDocument();
    expect(screen.getByText('Premium Subscription')).toBeInTheDocument();
  });

  test('payment method selection works', () => {
    render(<PaymentInterface order={mockOrder} />);

    const upiOption = screen.getByLabelText(/UPI/i);
    const cardOption = screen.getByLabelText(/Credit.*Card/i);

    fireEvent.click(upiOption);
    expect(upiOption).toBeChecked();

    fireEvent.click(cardOption);
    expect(cardOption).toBeChecked();
  });

  test('proceed to payment triggers Razorpay', async () => {
    render(<PaymentInterface order={mockOrder} />);

    const payButton = screen.getByRole('button', { name: /Pay.*₹1,75,000/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.Razorpay).toHaveBeenCalled();
    });
  });
});
