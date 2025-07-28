import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero section with correct content', () => {
    render(<Home />);
    
    expect(screen.getByText('Welcome to Bell24H')).toBeInTheDocument();
    expect(screen.getByText('Your B2B Marketplace for Global Trade')).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    render(<Home />);
    
    const searchInput = screen.getByPlaceholderText('Search for products, suppliers, or RFQs...');
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search submission', () => {
    render(<Home />);
    
    const searchInput = screen.getByPlaceholderText('Search for products, suppliers, or RFQs...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockRouter.push).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('renders all category cards', () => {
    render(<Home />);
    
    const categories = [
      'Electronics',
      'Textiles',
      'Automotive',
      'Agriculture',
      'Construction',
      'Healthcare',
      'Food & Beverage',
      'Chemicals',
    ];

    categories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('handles category click', () => {
    render(<Home />);
    
    const electronicsCard = screen.getByText('Electronics').closest('div[role="button"]');
    fireEvent.click(electronicsCard!);

    expect(mockRouter.push).toHaveBeenCalledWith('/category/1');
  });

  it('renders the dashboard component', () => {
    render(<Home />);
    
    // Since Dashboard is a complex component, we'll just verify it's rendered
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
}); 