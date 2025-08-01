import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubscriptionPage from '@/app/subscription/page';

/**
 * Phase D: Subscription Flow UI Testing (Cursor-safe)
 * Tests subscription plan selection and upgrade
 * Keep under 60 lines to prevent hanging
 */

// Mock subscription plans
const mockPlans = [
  { id: 'basic', name: 'Basic', price: 25000, features: ['100 RFQs/month', 'Basic Analytics'] },
  {
    id: 'pro',
    name: 'Professional',
    price: 75000,
    features: ['500 RFQs/month', 'Advanced Analytics', 'API Access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 175000,
    features: ['Unlimited RFQs', 'AI Insights', 'Dedicated Support'],
  },
];

// Mock current subscription
const mockCurrentPlan = { planId: 'basic', expiresAt: '2024-12-31' };

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Subscription Flow - UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays all subscription plans', () => {
    render(<SubscriptionPage plans={mockPlans} currentPlan={mockCurrentPlan} />);

    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('₹1,75,000')).toBeInTheDocument();
  });

  test('shows current plan indicator', () => {
    render(<SubscriptionPage plans={mockPlans} currentPlan={mockCurrentPlan} />);

    const currentPlanCard = screen.getByText('Basic').closest('div');
    expect(currentPlanCard).toHaveClass('border-blue-500');
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });

  test('upgrade button works for higher plans', () => {
    const mockPush = jest.fn();
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
    });

    render(<SubscriptionPage plans={mockPlans} currentPlan={mockCurrentPlan} />);

    const upgradeButton = screen.getAllByText(/Upgrade/i)[0];
    fireEvent.click(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/payment/checkout?plan=pro');
  });

  test('features list displays correctly', () => {
    render(<SubscriptionPage plans={mockPlans} currentPlan={mockCurrentPlan} />);

    expect(screen.getByText('Unlimited RFQs')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });
});
