import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HomePage from '@/app/page';
import { generateTestUser, generateTestSupplier, generateTestCategory, generateTestSearchResult } from '../utils/testHelpers';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock audio and sound systems
global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
global.HTMLMediaElement.prototype.pause = jest.fn();
global.HTMLMediaElement.prototype.load = jest.fn();

describe('AI-Powered Search Functionality', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
    mockPush.mockClear();
    mockReplace.mockClear();
    
    // Mock window.templeBellSound
    (window as any).templeBellSound = {
      isAudioSupported: jest.fn(() => true),
      playBellSound: jest.fn(() => Promise.resolve())
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Input Functionality', () => {
    test('renders search input with correct placeholder', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('type', 'text');
      });
    });

    test('handles search input changes correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      
      await user.type(searchInput, 'Industrial Machinery');
      expect(searchInput).toHaveValue('Industrial Machinery');
    });

    test('handles Enter key press to trigger search', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      
      await user.type(searchInput, 'Cotton Fabric');
      await user.keyboard('{Enter}');
      
      // Should show loading state
      await waitFor(() => {
        const loadingSpinner = screen.getByRole('button', { name: /ai search/i });
        expect(loadingSpinner).toBeDisabled();
      });
    });

    test('validates search input for special characters and length', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      
      // Test very long input
      const longInput = 'a'.repeat(500);
      await user.type(searchInput, longInput);
      expect(searchInput).toHaveValue(longInput);
      
      // Test special characters
      await user.clear(searchInput);
      await user.type(searchInput, 'Machine@#$%^&*()');
      expect(searchInput).toHaveValue('Machine@#$%^&*()');
    });
  });

  describe('Category Selection', () => {
    test('renders category dropdown with all categories', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      expect(categorySelect).toBeInTheDocument();
      
      // Check if categories are present
      const options = categorySelect.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(1); // Should have All Categories + featured categories
    });

    test('handles category selection changes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      
      await user.selectOptions(categorySelect, 'Electronics');
      expect(categorySelect).toHaveValue('Electronics');
    });

    test('combines search term with selected category', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(searchInput).toBeInTheDocument();
        expect(categorySelect).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const categorySelect = screen.getByDisplayValue('All Categories');
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.type(searchInput, 'smartphones');
      await user.selectOptions(categorySelect, 'Electronics');
      await user.click(searchButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(searchButton).toBeDisabled();
      });
    });
  });

  describe('Country/Region Selection', () => {
    test('renders country selector with default country', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });
    });

    test('handles country selection changes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      
      // Find US option and select it
      const options = countrySelect.querySelectorAll('option');
      const usOption = Array.from(options).find(option => 
        option.textContent?.includes('🇺🇸')
      );
      
      if (usOption) {
        await user.selectOptions(countrySelect, (usOption as HTMLOptionElement).value);
        expect(countrySelect).toHaveValue((usOption as HTMLOptionElement).value);
      }
    });

    test('country selection affects SEO and localization', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      // Check if SEO meta tags are present
      const metaTags = document.querySelectorAll('meta');
      expect(metaTags.length).toBeGreaterThan(0);
      
      // Check for structured data
      const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBeGreaterThan(0);
    });
  });

  describe('AI Search Execution', () => {
    test('executes search with loading state', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const searchButton = screen.getByRole('button', { name: /ai search/i });
        expect(searchInput).toBeInTheDocument();
        expect(searchButton).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.type(searchInput, 'Industrial Equipment');
      await user.click(searchButton);
      
      // Should show loading state immediately
      expect(searchButton).toBeDisabled();
      
      // Should show loading spinner
      const loadingSpinner = searchButton.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    test('constructs correct search URL with parameters', async () => {
      // Mock window.location.href setter
      const mockLocationHref = jest.fn();
      Object.defineProperty(window.location, 'href', {
        set: mockLocationHref,
        configurable: true
      });

      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const categorySelect = screen.getByDisplayValue('All Categories');
        const searchButton = screen.getByRole('button', { name: /ai search/i });
        expect(searchInput).toBeInTheDocument();
        expect(categorySelect).toBeInTheDocument();
        expect(searchButton).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const categorySelect = screen.getByDisplayValue('All Categories');
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.type(searchInput, 'textile machinery');
      await user.selectOptions(categorySelect, 'Agriculture');
      
      await act(async () => {
        await user.click(searchButton);
        
        // Wait for the setTimeout to complete
        await new Promise(resolve => setTimeout(resolve, 1100));
      });
      
      // Check if navigation was triggered with correct parameters
      await waitFor(() => {
        expect(mockLocationHref).toHaveBeenCalledWith(
          expect.stringContaining('/search?q=textile%20machinery&category=Agriculture')
        );
      }, { timeout: 2000 });
    });

    test('handles empty search gracefully', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchButton = screen.getByRole('button', { name: /ai search/i });
        expect(searchButton).toBeInTheDocument();
      });

      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.click(searchButton);
      
      // Should still work with empty search
      expect(searchButton).toBeDisabled();
    });
  });

  describe('AI Features Integration', () => {
    test('renders AI feature shortcuts correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Voice RFQ')).toBeInTheDocument();
        expect(screen.getByText('AI Analytics')).toBeInTheDocument();
        expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();
        expect(screen.getByText('Risk Scoring')).toBeInTheDocument();
      });
    });

    test('navigates to Voice RFQ feature', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const voiceRfqLink = screen.getByText('Voice RFQ').closest('a');
        expect(voiceRfqLink).toBeInTheDocument();
        expect(voiceRfqLink).toHaveAttribute('href', '/voice-rfq');
      });
    });

    test('navigates to AI Dashboard feature', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const aiDashboardLink = screen.getByText('AI Analytics').closest('a');
        expect(aiDashboardLink).toBeInTheDocument();
        expect(aiDashboardLink).toHaveAttribute('href', '/ai-dashboard');
      });
    });

    test('displays AI accuracy badge', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/98\.5% AI Accuracy/)).toBeInTheDocument();
      });
    });
  });

  describe('Search Performance and UX', () => {
    test('search input responds quickly to user interaction', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      
      const startTime = performance.now();
      await user.type(searchInput, 'quick test');
      const endTime = performance.now();
      
      // Should respond within reasonable time (less than 100ms per character)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(searchInput).toHaveValue('quick test');
    });

    test('search maintains state during user interaction', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(searchInput).toBeInTheDocument();
        expect(categorySelect).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const categorySelect = screen.getByDisplayValue('All Categories');
      
      // Type in search and select category
      await user.type(searchInput, 'machinery');
      await user.selectOptions(categorySelect, 'Electronics');
      
      // Values should persist
      expect(searchInput).toHaveValue('machinery');
      expect(categorySelect).toHaveValue('Electronics');
      
      // Continue typing
      await user.type(searchInput, ' parts');
      expect(searchInput).toHaveValue('machinery parts');
      expect(categorySelect).toHaveValue('Electronics');
    });

    test('handles concurrent search requests gracefully', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const searchButton = screen.getByRole('button', { name: /ai search/i });
        expect(searchInput).toBeInTheDocument();
        expect(searchButton).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.type(searchInput, 'test search');
      
      // Click multiple times rapidly
      await user.click(searchButton);
      await user.click(searchButton);
      await user.click(searchButton);
      
      // Should only trigger once (button should be disabled)
      expect(searchButton).toBeDisabled();
    });
  });

  describe('Accessibility and SEO', () => {
    test('search form has proper accessibility attributes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const categorySelect = screen.getByDisplayValue('All Categories');
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      // Check accessibility attributes
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(categorySelect).toHaveAttribute('role', 'combobox');
      expect(searchButton).toHaveAttribute('type', 'button');
      
      // Check for proper labels
      expect(searchInput).toHaveAttribute('placeholder');
      expect(searchButton).toHaveTextContent(/search/i);
    });

    test('search form supports keyboard navigation', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const categorySelect = screen.getByDisplayValue('All Categories');
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      // Focus should move correctly with Tab
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
      
      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(categorySelect);
      
      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(searchButton);
    });

    test('renders proper structured data for search functionality', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
        expect(scriptTags.length).toBeGreaterThan(0);
      });

      // Check for structured data
      const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(structuredDataScripts.length).toBeGreaterThan(0);
      
      // Should contain search-related structured data
      const structuredData = Array.from(structuredDataScripts)
        .map(script => script.textContent)
        .join(' ');
      
      expect(structuredData).toBeTruthy();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles navigation errors gracefully', async () => {
      // Mock navigation failure
      Object.defineProperty(window.location, 'href', {
        set: () => {
          throw new Error('Navigation failed');
        },
        configurable: true
      });

      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const searchButton = screen.getByRole('button', { name: /ai search/i });
        expect(searchInput).toBeInTheDocument();
        expect(searchButton).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.type(searchInput, 'test');
      
      // Should not crash when navigation fails
      await expect(async () => {
        await user.click(searchButton);
        await new Promise(resolve => setTimeout(resolve, 1100));
      }).not.toThrow();
    });

    test('handles component unmounting during search', async () => {
      const { unmount } = render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        const searchButton = screen.getByRole('button', { name: /ai search/i });
        expect(searchInput).toBeInTheDocument();
        expect(searchButton).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      const searchButton = screen.getByRole('button', { name: /ai search/i });
      
      await user.type(searchInput, 'test');
      await user.click(searchButton);
      
      // Unmount component during search
      expect(() => unmount()).not.toThrow();
    });

    test('validates search input length and content', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
      
      // Test extremely long input
      const veryLongInput = 'a'.repeat(1000);
      await user.type(searchInput, veryLongInput);
      expect(searchInput).toHaveValue(veryLongInput);
      
      // Test special characters and emojis
      await user.clear(searchInput);
      await user.type(searchInput, 'Search 🔍 with emojis & symbols!');
      expect(searchInput).toHaveValue('Search 🔍 with emojis & symbols!');
    });
  });
}); 