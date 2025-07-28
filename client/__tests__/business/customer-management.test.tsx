import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomerManagement from '@/app/admin/customers/page';

/**
 * Phase D: Customer Management UI Testing (Cursor-safe)
 * Tests customer CRUD operations with mock data
 * Keep under 60 lines to prevent hanging
 */

// Mock customer data
const mockCustomers = [
  { id: 1, name: 'ABC Industries', email: 'contact@abc.com', status: 'Active', revenue: 125000 },
  { id: 2, name: 'XYZ Corp', email: 'info@xyz.com', status: 'Active', revenue: 85000 },
  { id: 3, name: 'Tech Solutions', email: 'sales@tech.com', status: 'Inactive', revenue: 0 },
];

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ customers: mockCustomers }),
  })
);

describe('Customer Management - UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders customer list with data', async () => {
    render(<CustomerManagement />);

    expect(screen.getByText(/Customer Management/i)).toBeInTheDocument();

    // Wait for customers to load
    const customer1 = await screen.findByText('ABC Industries');
    expect(customer1).toBeInTheDocument();
    expect(screen.getByText('₹1,25,000')).toBeInTheDocument();
  });

  test('add new customer button opens form', () => {
    render(<CustomerManagement />);

    const addButton = screen.getByRole('button', { name: /Add Customer/i });
    fireEvent.click(addButton);

    expect(screen.getByLabelText(/Customer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  test('search filters customer list', async () => {
    render(<CustomerManagement />);

    await screen.findByText('ABC Industries');

    const searchInput = screen.getByPlaceholderText(/Search customers/i);
    fireEvent.change(searchInput, { target: { value: 'XYZ' } });

    expect(screen.queryByText('ABC Industries')).not.toBeInTheDocument();
    expect(screen.getByText('XYZ Corp')).toBeInTheDocument();
  });
});
