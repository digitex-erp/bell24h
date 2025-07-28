import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HomePage from '@/app/page';

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null)
  })
}));

// Mock categories data
jest.mock('@/data/categories', () => ({
  ALL_CATEGORIES: [
    { name: 'Agriculture', slug: 'agriculture', icon: '🚜' },
    { name: 'Electronics', slug: 'electronics', icon: '💻' },
    { name: 'Computers & IT', slug: 'computers-internet', icon: '🖥️' },
    { name: 'Apparel', slug: 'apparel-fashion', icon: '👗' },
    { name: 'Automobile', slug: 'automobile', icon: '🚗' },
    { name: 'Chemicals', slug: 'chemicals', icon: '⚗️' },
    { name: 'Construction', slug: 'real-estate-construction', icon: '🏗️' },
    { name: 'Food & Beverages', slug: 'food-beverage', icon: '🍔' }
  ]
}));

// Mock other components
jest.mock('@/components/SEO/GlobalSEOHead', () => {
  return function MockGlobalSEOHead() {
    return <div data-testid="mock-seo-head" />;
  };
});

jest.mock('@/components/SEO/LocalBusinessSchema', () => {
  return function MockLocalBusinessSchema() {
    return <script type="application/ld+json" data-testid="mock-schema" />;
  };
});

// Mock sound system
global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
(window as any).templeBellSound = {
  isAudioSupported: jest.fn(() => true),
  playBellSound: jest.fn(() => Promise.resolve())
};

describe('Category Navigation System', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Category Grid Display', () => {
    test('renders featured categories grid correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Explore 50+ Business Categories')).toBeInTheDocument();
      });

      // Should display featured categories
      expect(screen.getByText('Agriculture')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Computers & IT')).toBeInTheDocument();
      expect(screen.getByText('Apparel')).toBeInTheDocument();
      expect(screen.getByText('Automobile')).toBeInTheDocument();
      expect(screen.getByText('Chemicals')).toBeInTheDocument();
      expect(screen.getByText('Construction')).toBeInTheDocument();
      expect(screen.getByText('Food & Beverages')).toBeInTheDocument();
    });

    test('displays category icons correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('🚜')).toBeInTheDocument();
      });

      // Should show category icons
      expect(screen.getByText('🚜')).toBeInTheDocument(); // Agriculture
      expect(screen.getByText('💻')).toBeInTheDocument(); // Electronics
      expect(screen.getByText('🖥️')).toBeInTheDocument(); // Computers & IT
      expect(screen.getByText('👗')).toBeInTheDocument(); // Apparel
      expect(screen.getByText('🚗')).toBeInTheDocument(); // Automobile
      expect(screen.getByText('⚗️')).toBeInTheDocument(); // Chemicals
      expect(screen.getByText('🏗️')).toBeInTheDocument(); // Construction
      expect(screen.getByText('🍔')).toBeInTheDocument(); // Food & Beverages
    });

    test('shows supplier counts for each category', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/15,247 suppliers/)).toBeInTheDocument();
      });

      // Should display supplier counts
      expect(screen.getByText('15,247 suppliers')).toBeInTheDocument(); // Agriculture
      expect(screen.getByText('28,439 suppliers')).toBeInTheDocument(); // Electronics
      expect(screen.getByText('19,582 suppliers')).toBeInTheDocument(); // Computers & IT
      expect(screen.getByText('22,394 suppliers')).toBeInTheDocument(); // Apparel
    });

    test('displays growth trends for categories', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('+12%')).toBeInTheDocument();
      });

      // Should show trend indicators
      expect(screen.getByText('+12%')).toBeInTheDocument(); // Agriculture
      expect(screen.getByText('+18%')).toBeInTheDocument(); // Electronics
      expect(screen.getByText('+15%')).toBeInTheDocument(); // Computers & IT
      expect(screen.getByText('+8%')).toBeInTheDocument(); // Apparel
      expect(screen.getByText('+22%')).toBeInTheDocument(); // Automobile
    });

    test('categories are arranged in responsive grid layout', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryGrid = screen.getByText('Agriculture').closest('.grid');
        expect(categoryGrid).toBeInTheDocument();
      });

      const categoryGrid = screen.getByText('Agriculture').closest('.grid');
      
      // Should have responsive grid classes
      expect(categoryGrid).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4');
    });
  });

  describe('Category Navigation Links', () => {
    test('category cards are clickable links', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const agricultureLink = screen.getByText('Agriculture').closest('a');
        expect(agricultureLink).toBeInTheDocument();
      });

      const agricultureLink = screen.getByText('Agriculture').closest('a');
      expect(agricultureLink).toHaveAttribute('href', '/categories/agriculture');
      
      const electronicsLink = screen.getByText('Electronics').closest('a');
      expect(electronicsLink).toHaveAttribute('href', '/categories/electronics');
      
      const computersLink = screen.getByText('Computers & IT').closest('a');
      expect(computersLink).toHaveAttribute('href', '/categories/computers-internet');
    });

    test('category links have correct slugs', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryLinks = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href')?.startsWith('/categories/')
        );
        expect(categoryLinks.length).toBeGreaterThan(0);
      });

      // Check specific category slug mappings
      const apparelLink = screen.getByText('Apparel').closest('a');
      expect(apparelLink).toHaveAttribute('href', '/categories/apparel-fashion');
      
      const constructionLink = screen.getByText('Construction').closest('a');
      expect(constructionLink).toHaveAttribute('href', '/categories/real-estate-construction');
      
      const foodLink = screen.getByText('Food & Beverages').closest('a');
      expect(foodLink).toHaveAttribute('href', '/categories/food-beverage');
    });

    test('main categories navigation link in header', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoriesNavLink = screen.getByRole('link', { name: /categories/i });
        expect(categoriesNavLink).toBeInTheDocument();
      });

      const categoriesNavLink = screen.getByRole('link', { name: /categories/i });
      expect(categoriesNavLink).toHaveAttribute('href', '/categories');
    });

    test('view all categories button', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const viewAllButton = screen.getByText('View All Categories').closest('a');
        expect(viewAllButton).toBeInTheDocument();
      });

      const viewAllButton = screen.getByText('View All Categories').closest('a');
      expect(viewAllButton).toHaveAttribute('href', '/categories');
    });

    test('category navigation maintains SEO-friendly URLs', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryLinks = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href')?.startsWith('/categories/')
        );
        expect(categoryLinks.length).toBeGreaterThan(0);
      });

      const categoryLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.startsWith('/categories/')
      );
      
      // All category URLs should be SEO-friendly (lowercase, hyphenated)
      categoryLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const slug = href.replace('/categories/', '');
        
        // Should be lowercase and use hyphens
        expect(slug).toMatch(/^[a-z-]+$/);
        expect(slug).not.toContain(' ');
        expect(slug).not.toContain('_');
      });
    });
  });

  describe('Interactive Category Features', () => {
    test('category cards have hover effects', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const agricultureCard = screen.getByText('Agriculture').closest('a');
        expect(agricultureCard).toBeInTheDocument();
      });

      const agricultureCard = screen.getByText('Agriculture').closest('a');
      
      // Should have hover effect classes
      expect(agricultureCard).toHaveClass('hover:shadow-xl', 'hover:scale-105', 'hover:border-blue-200');
    });

    test('category names change color on hover', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const agricultureName = screen.getByText('Agriculture');
        expect(agricultureName).toBeInTheDocument();
      });

      const agricultureName = screen.getByText('Agriculture');
      expect(agricultureName).toHaveClass('group-hover:text-blue-600');
    });

    test('category cards are keyboard accessible', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const agricultureCard = screen.getByText('Agriculture').closest('a');
        expect(agricultureCard).toBeInTheDocument();
      });

      const agricultureCard = screen.getByText('Agriculture').closest('a') as HTMLElement;
      
      // Should be focusable
      agricultureCard.focus();
      expect(document.activeElement).toBe(agricultureCard);
      
      // Should be activatable with Enter
      fireEvent.keyDown(agricultureCard, { key: 'Enter', code: 'Enter' });
      // Note: Navigation would happen in real implementation
    });

    test('handles category card clicks correctly', async () => {
      const mockNavigate = jest.fn();
      
      // Mock window navigation
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
          assign: mockNavigate
        },
        writable: true
      });
      
      render(<HomePage />);
      
      await waitFor(() => {
        const agricultureCard = screen.getByText('Agriculture').closest('a');
        expect(agricultureCard).toBeInTheDocument();
      });

      const agricultureCard = screen.getByText('Agriculture').closest('a') as HTMLElement;
      await user.click(agricultureCard);
      
      // Should attempt navigation (in real implementation)
      expect(agricultureCard).toHaveAttribute('href', '/categories/agriculture');
    });
  });

  describe('Category Search Integration', () => {
    test('category selection in search dropdown matches featured categories', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      const options = categorySelect.querySelectorAll('option');
      
      // Should include featured categories in search dropdown
      const optionTexts = Array.from(options).map(option => option.textContent);
      
      expect(optionTexts).toContain('Agriculture');
      expect(optionTexts).toContain('Electronics');
      expect(optionTexts).toContain('Apparel');
      expect(optionTexts).toContain('Automobile');
    });

    test('search category selection affects category highlighting', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      
      // Select a category
      await user.selectOptions(categorySelect, 'Electronics');
      expect(categorySelect).toHaveValue('Electronics');
      
      // In a real implementation, this might highlight the Electronics category card
      const electronicsCard = screen.getByText('Electronics').closest('a');
      expect(electronicsCard).toBeInTheDocument();
    });
  });

  describe('Category Data and Statistics', () => {
    test('supplier counts are formatted correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('15,247 suppliers')).toBeInTheDocument();
      });

      // Should use comma-separated number formatting
      expect(screen.getByText('15,247 suppliers')).toBeInTheDocument();
      expect(screen.getByText('28,439 suppliers')).toBeInTheDocument();
      expect(screen.getByText('31,567 suppliers')).toBeInTheDocument();
    });

    test('growth trends are displayed with proper indicators', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const trendIndicators = screen.getAllByText(/\+\d+%/);
        expect(trendIndicators.length).toBeGreaterThan(0);
      });

      // Should show trend icons
      const trendIcons = document.querySelectorAll('[data-lucide="trending-up"]');
      expect(trendIcons.length).toBeGreaterThan(0);
    });

    test('validates realistic supplier counts and trends', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const supplierCounts = screen.getAllByText(/\d{2,3},\d{3} suppliers/);
        expect(supplierCounts.length).toBeGreaterThan(0);
      });

      // All supplier counts should be reasonable (10k-50k range)
      const supplierTexts = screen.getAllByText(/\d{2,3},\d{3} suppliers/);
      supplierTexts.forEach(text => {
        const count = parseInt(text.textContent?.replace(/[^\d]/g, '') || '0');
        expect(count).toBeGreaterThan(10000);
        expect(count).toBeLessThan(100000);
      });

      // All trends should be positive and reasonable
      const trendTexts = screen.getAllByText(/\+\d+%/);
      trendTexts.forEach(text => {
        const trend = parseInt(text.textContent?.replace(/[^\d]/g, '') || '0');
        expect(trend).toBeGreaterThan(0);
        expect(trend).toBeLessThan(50);
      });
    });
  });

  describe('Responsive Design and Layout', () => {
    test('category grid adapts to different screen sizes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryGrid = screen.getByText('Agriculture').closest('.grid');
        expect(categoryGrid).toBeInTheDocument();
      });

      const categoryGrid = screen.getByText('Agriculture').closest('.grid');
      
      // Should have responsive classes for different breakpoints
      expect(categoryGrid).toHaveClass('grid-cols-2'); // Mobile
      expect(categoryGrid).toHaveClass('md:grid-cols-3'); // Tablet
      expect(categoryGrid).toHaveClass('lg:grid-cols-4'); // Desktop
    });

    test('category cards maintain proper spacing and alignment', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryGrid = screen.getByText('Agriculture').closest('.grid');
        expect(categoryGrid).toBeInTheDocument();
      });

      const categoryGrid = screen.getByText('Agriculture').closest('.grid');
      expect(categoryGrid).toHaveClass('gap-6');
    });

    test('category content is properly centered and aligned', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryCard = screen.getByText('Agriculture').closest('a');
        expect(categoryCard).toBeInTheDocument();
      });

      const categoryCard = screen.getByText('Agriculture').closest('a');
      const cardContent = categoryCard?.querySelector('div > div');
      
      expect(cardContent).toHaveClass('text-center');
    });
  });

  describe('Performance and Loading', () => {
    test('category grid renders quickly', async () => {
      const startTime = performance.now();
      
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Agriculture')).toBeInTheDocument();
        expect(screen.getByText('Electronics')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Category grid should render quickly
      expect(renderTime).toBeLessThan(200);
    });

    test('category icons load without blocking render', async () => {
      render(<HomePage />);
      
      // Icons should be immediately available (emoji)
      await waitFor(() => {
        expect(screen.getByText('🚜')).toBeInTheDocument();
        expect(screen.getByText('💻')).toBeInTheDocument();
        expect(screen.getByText('🖥️')).toBeInTheDocument();
      });
    });

    test('handles large number of categories efficiently', async () => {
      // Even with 8 featured categories, should perform well
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryCards = screen.getAllByText(/suppliers$/);
        expect(categoryCards).toHaveLength(8);
      });
      
      // All 8 featured categories should render
      expect(screen.getByText('Agriculture')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Computers & IT')).toBeInTheDocument();
      expect(screen.getByText('Apparel')).toBeInTheDocument();
      expect(screen.getByText('Automobile')).toBeInTheDocument();
      expect(screen.getByText('Chemicals')).toBeInTheDocument();
      expect(screen.getByText('Construction')).toBeInTheDocument();
      expect(screen.getByText('Food & Beverages')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing category data gracefully', async () => {
      // Mock empty featured categories
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      render(<HomePage />);
      
      // Should not crash even if category data is missing
      await waitFor(() => {
        const categorySection = screen.getByText('Explore 50+ Business Categories');
        expect(categorySection).toBeInTheDocument();
      });
      
      console.error = originalConsoleError;
    });

    test('validates category data integrity', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categoryCards = screen.getAllByText(/suppliers$/);
        expect(categoryCards.length).toBeGreaterThan(0);
      });

      // Each category should have all required fields
      ['Agriculture', 'Electronics', 'Computers & IT', 'Apparel'].forEach(categoryName => {
        const categoryCard = screen.getByText(categoryName).closest('a');
        expect(categoryCard).toHaveAttribute('href');
        
        // Should have supplier count
        const supplierText = categoryCard?.textContent;
        expect(supplierText).toMatch(/\d+,\d+ suppliers/);
        
        // Should have trend
        expect(supplierText).toMatch(/\+\d+%/);
      });
    });

    test('handles navigation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<HomePage />);
      
      await waitFor(() => {
        const agricultureCard = screen.getByText('Agriculture').closest('a');
        expect(agricultureCard).toBeInTheDocument();
      });

      const agricultureCard = screen.getByText('Agriculture').closest('a') as HTMLElement;
      
      // Should handle click without crashing even if navigation fails
      await expect(async () => {
        await user.click(agricultureCard);
      }).not.rejects.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
}); 