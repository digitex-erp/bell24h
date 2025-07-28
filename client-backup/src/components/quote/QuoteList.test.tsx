import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteList } from './QuoteList';
import { render as customRender } from '../../test-utils/TestWrapper';

// Mock the quote service
jest.mock('../../services/quote/QuoteService', () => ({
  quoteService: {
    getQuotes: jest.fn().mockResolvedValue({
      items: [
        {
          id: '1',
          text: 'Test quote 1',
          author: 'Author 1',
          category: 'test'
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    })
  }
}));

describe('QuoteList', () => {
  it('renders loading state initially', () => {
    customRender(<QuoteList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays quotes when loaded', async () => {
    customRender(<QuoteList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test quote 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Author 1')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    const { quoteService } = require('../../services/quote/QuoteService');
    quoteService.getQuotes.mockRejectedValueOnce(new Error('Failed to fetch quotes'));
    
    customRender(<QuoteList />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading quotes/i)).toBeInTheDocument();
    });
  });

  it('allows refreshing quotes', async () => {
    customRender(<QuoteList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test quote 1')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
}); 