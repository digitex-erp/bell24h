import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoriesPage from '@/app/categories/page';

/**
 * Phase B: AI Categorization UI Testing (Cursor-safe)
 * Tests category selection and filtering UI only
 * All API calls mocked - under 80 lines
 */

// Mock category data
const mockCategories = [
  { id: 1, name: 'Electronics', count: 1250, trend: '+12%' },
  { id: 2, name: 'Industrial', count: 890, trend: '+8%' },
  { id: 3, name: 'Textiles', count: 567, trend: '+15%' },
];

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock API fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ categories: mockCategories }),
  })
);

describe('AI Categorization - Basic UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders categories page with grid', async () => {
    render(<CategoriesPage />);

    expect(screen.getByText(/Categories/i)).toBeInTheDocument();

    // Wait for categories to load
    const electronicsCard = await screen.findByText('Electronics');
    expect(electronicsCard).toBeInTheDocument();
    expect(screen.getByText('Industrial')).toBeInTheDocument();
    expect(screen.getByText('Textiles')).toBeInTheDocument();
  });

  test('displays category counts and trends', async () => {
    render(<CategoriesPage />);

    await screen.findByText('Electronics');

    expect(screen.getByText('1250')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  test('category cards are clickable', async () => {
    const mockPush = jest.fn();
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
    });

    render(<CategoriesPage />);

    const electronicsCard = await screen.findByText('Electronics');
    fireEvent.click(electronicsCard.closest('div'));

    expect(mockPush).toHaveBeenCalledWith('/categories/electronics');
  });

  test('search filter updates category display', async () => {
    render(<CategoriesPage />);

    const searchInput = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(searchInput, { target: { value: 'Elec' } });

    // Should filter to show only Electronics
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.queryByText('Industrial')).not.toBeInTheDocument();
  });
});
