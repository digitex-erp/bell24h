import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchComponent from '@/components/search/AISearchForm';

/**
 * Phase B: AI Search UI Testing (Cursor-safe)
 * Tests search form interactions only - all AI calls mocked
 * Keep under 80 lines to prevent hanging
 */

// Mock search results
const mockSearchResults = [
  { id: 1, title: 'Industrial Machinery', category: 'Industrial', relevance: 0.95 },
  { id: 2, title: 'Heavy Equipment', category: 'Industrial', relevance: 0.87 },
  { id: 3, title: 'Manufacturing Tools', category: 'Industrial', relevance: 0.82 },
];

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock API fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ results: mockSearchResults }),
  })
);

describe('AI Search - Basic UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search form with all elements', () => {
    render(<SearchComponent />);

    expect(screen.getByPlaceholderText(/What are you looking for/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI Search/i })).toBeInTheDocument();
  });

  test('search input accepts text', () => {
    render(<SearchComponent />);

    const searchInput = screen.getByPlaceholderText(/What are you looking for/i);
    fireEvent.change(searchInput, { target: { value: 'Industrial Machinery' } });

    expect(searchInput).toHaveValue('Industrial Machinery');
  });

  test('category selector works', () => {
    render(<SearchComponent />);

    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });

    expect(categorySelect).toHaveValue('Electronics');
  });

  test('search button triggers search', async () => {
    render(<SearchComponent />);

    const searchInput = screen.getByPlaceholderText(/What are you looking for/i);
    const searchButton = screen.getByRole('button', { name: /AI Search/i });

    fireEvent.change(searchInput, { target: { value: 'Machinery' } });
    fireEvent.click(searchButton);

    // Should show loading state
    expect(screen.getByText(/Searching/i)).toBeInTheDocument();

    // Should call API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search'),
        expect.any(Object)
      );
    });
  });
});
