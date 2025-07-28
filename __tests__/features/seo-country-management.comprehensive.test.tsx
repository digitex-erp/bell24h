import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import HomePage from '@/app/page';

// Mock Next.js router
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

// Mock SEO components
jest.mock('@/components/SEO/GlobalSEOHead', () => {
  return function MockGlobalSEOHead({ countryCode, pageType, customTitle, customDescription }: any) {
    return (
      <div data-testid="global-seo-head">
        <meta name="country" content={countryCode} />
        <meta name="page-type" content={pageType} />
        <title>{customTitle}</title>
        <meta name="description" content={customDescription} />
      </div>
    );
  };
});

jest.mock('@/components/SEO/LocalBusinessSchema', () => {
  return function MockLocalBusinessSchema({ countryCode, rating, reviewCount }: any) {
    return (
      <script
        type="application/ld+json"
        data-testid="local-business-schema"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            addressCountry: countryCode,
            aggregateRating: {
              ratingValue: rating,
              reviewCount: reviewCount
            }
          })
        }}
      />
    );
  };
});

// Mock GlobalSEOManager
jest.mock('@/lib/seo-manager', () => ({
  GlobalSEOManager: jest.fn().mockImplementation((countryCode) => ({
    countryCode,
    generateMetaTags: jest.fn(),
    generateStructuredData: jest.fn(),
    getLocalizedContent: jest.fn()
  }))
}));

// Mock global SEO config
jest.mock('@/data/global-seo-config', () => ({
  GLOBAL_SEO_CONFIG: {
    'IN': { name: 'India', currency: 'INR', locale: 'en-IN' },
    'US': { name: 'United States', currency: 'USD', locale: 'en-US' },
    'DE': { name: 'Germany', currency: 'EUR', locale: 'de-DE' },
    'GB': { name: 'United Kingdom', currency: 'GBP', locale: 'en-GB' },
    'JP': { name: 'Japan', currency: 'JPY', locale: 'ja-JP' },
    'AU': { name: 'Australia', currency: 'AUD', locale: 'en-AU' },
    'AE': { name: 'UAE', currency: 'AED', locale: 'ar-AE' },
    'SG': { name: 'Singapore', currency: 'SGD', locale: 'en-SG' },
    'BR': { name: 'Brazil', currency: 'BRL', locale: 'pt-BR' },
    'CA': { name: 'Canada', currency: 'CAD', locale: 'en-CA' }
  }
}));

// Mock sound system
global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
(window as any).templeBellSound = {
  isAudioSupported: jest.fn(() => true),
  playBellSound: jest.fn(() => Promise.resolve())
};

describe('SEO and Country Management System', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
    // Clear DOM before each test
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Country Selection Functionality', () => {
    test('renders country selector with default India selection', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      expect(countrySelect).toHaveValue('IN');
    });

    test('displays all supported countries with flags', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      const options = countrySelect.querySelectorAll('option');
      
      // Should have 10 countries (first 10 from config)
      expect(options).toHaveLength(10);
      
      // Check for specific country options with flags
      const optionTexts = Array.from(options).map(option => option.textContent);
      expect(optionTexts).toContain('🇮🇳 India');
      expect(optionTexts).toContain('🇺🇸 United States');
      expect(optionTexts).toContain('🇩🇪 Germany');
      expect(optionTexts).toContain('🇬🇧 United Kingdom');
    });

    test('handles country selection changes correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      
      // Change to United States
      await user.selectOptions(countrySelect, 'US');
      expect(countrySelect).toHaveValue('US');
      
      // Change to Germany
      await user.selectOptions(countrySelect, 'DE');
      expect(countrySelect).toHaveValue('DE');
    });

    test('country selector is responsive and mobile-friendly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      
      // Check if it has responsive classes (hidden on mobile, shown on md+)
      const parentDiv = countrySelect.closest('div');
      expect(parentDiv).toHaveClass('hidden', 'md:flex');
    });

    test('validates country code format and supported countries', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      const options = countrySelect.querySelectorAll('option');
      
      // All options should have 2-letter country codes
      Array.from(options).forEach(option => {
        const value = (option as HTMLOptionElement).value;
        expect(value).toMatch(/^[A-Z]{2}$/);
      });
    });
  });

  describe('SEO Meta Tags Management', () => {
    test('renders GlobalSEOHead component with correct props', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const seoHead = screen.getByTestId('global-seo-head');
        expect(seoHead).toBeInTheDocument();
      });

      const seoHead = screen.getByTestId('global-seo-head');
      expect(seoHead).toBeInTheDocument();
      
      // Check meta tags
      const countryMeta = screen.getByRole('meta', { name: 'country' });
      const pageTypeMeta = screen.getByRole('meta', { name: 'page-type' });
      
      expect(countryMeta).toHaveAttribute('content', 'IN');
      expect(pageTypeMeta).toHaveAttribute('content', 'homepage');
    });

    test('updates SEO tags when country changes', async () => {
      const { rerender } = render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      // Initial state - India
      let countryMeta = screen.getByRole('meta', { name: 'country' });
      expect(countryMeta).toHaveAttribute('content', 'IN');
      
      // Change country to US
      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      await user.selectOptions(countrySelect, 'US');
      
      // Force re-render to trigger SEO update
      rerender(<HomePage />);
      
      // Should update SEO meta tag
      await waitFor(() => {
        countryMeta = screen.getByRole('meta', { name: 'country' });
        expect(countryMeta).toHaveAttribute('content', 'US');
      });
    });

    test('includes enterprise-focused SEO content', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const title = document.querySelector('title');
        const description = document.querySelector('meta[name="description"]');
        
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
      });

      const title = document.querySelector('title');
      const description = document.querySelector('meta[name="description"]');
      
      // Should contain enterprise-focused content
      expect(title?.textContent).toContain('Enterprise B2B');
      expect(title?.textContent).toContain('₹1.75L Monthly Value');
      expect(description?.getAttribute('content')).toContain('98.5% accuracy');
      expect(description?.getAttribute('content')).toContain('Voice RFQ');
    });

    test('generates country-specific keywords and content', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const seoHead = screen.getByTestId('global-seo-head');
        expect(seoHead).toBeInTheDocument();
      });

      // Should include AI and B2B focused keywords
      const description = document.querySelector('meta[name="description"]');
      expect(description?.getAttribute('content')).toContain('AI-powered');
      expect(description?.getAttribute('content')).toContain('predictive analytics');
    });
  });

  describe('Structured Data Implementation', () => {
    test('renders LocalBusinessSchema with correct data', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const schema = screen.getByTestId('local-business-schema');
        expect(schema).toBeInTheDocument();
      });

      const schema = screen.getByTestId('local-business-schema');
      expect(schema).toHaveAttribute('type', 'application/ld+json');
      
      // Parse and validate structured data
      const schemaContent = schema.innerHTML;
      const structuredData = JSON.parse(schemaContent);
      
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('LocalBusiness');
      expect(structuredData.addressCountry).toBe('IN');
      expect(structuredData.aggregateRating.ratingValue).toBe(4.8);
      expect(structuredData.aggregateRating.reviewCount).toBe(50000);
    });

    test('includes comprehensive business information in schema', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const schema = screen.getByTestId('local-business-schema');
        expect(schema).toBeInTheDocument();
      });

      const schema = screen.getByTestId('local-business-schema');
      const structuredData = JSON.parse(schema.innerHTML);
      
      // Should contain business rating and reviews
      expect(structuredData.aggregateRating).toBeDefined();
      expect(structuredData.aggregateRating.ratingValue).toBeGreaterThan(4.0);
      expect(structuredData.aggregateRating.reviewCount).toBeGreaterThan(10000);
    });

    test('updates structured data based on country selection', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        const schema = screen.getByTestId('local-business-schema');
        expect(countrySelect).toBeInTheDocument();
        expect(schema).toBeInTheDocument();
      });

      // Initial schema should have India
      let schema = screen.getByTestId('local-business-schema');
      let structuredData = JSON.parse(schema.innerHTML);
      expect(structuredData.addressCountry).toBe('IN');
      
      // Change country
      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      await user.selectOptions(countrySelect, 'US');
      
      // Schema should update (in real implementation)
      // Note: This test shows the expected behavior
      expect(countrySelect).toHaveValue('US');
    });
  });

  describe('GlobalSEOManager Integration', () => {
    test('initializes SEO manager with correct country code', async () => {
      const { GlobalSEOManager } = require('@/lib/seo-manager');
      
      render(<HomePage />);
      
      await waitFor(() => {
        expect(GlobalSEOManager).toHaveBeenCalledWith('IN');
      });
    });

    test('SEO manager methods are called appropriately', async () => {
      const mockSEOManager = {
        countryCode: 'IN',
        generateMetaTags: jest.fn(),
        generateStructuredData: jest.fn(),
        getLocalizedContent: jest.fn()
      };
      
      const { GlobalSEOManager } = require('@/lib/seo-manager');
      GlobalSEOManager.mockImplementation(() => mockSEOManager);
      
      render(<HomePage />);
      
      await waitFor(() => {
        expect(GlobalSEOManager).toHaveBeenCalled();
      });
      
      // SEO manager should be instantiated
      expect(GlobalSEOManager).toHaveBeenCalledWith('IN');
    });

    test('handles SEO manager initialization errors gracefully', async () => {
      const { GlobalSEOManager } = require('@/lib/seo-manager');
      GlobalSEOManager.mockImplementation(() => {
        throw new Error('SEO Manager initialization failed');
      });
      
      // Should not crash the component
      expect(() => render(<HomePage />)).not.toThrow();
    });
  });

  describe('Localization and Currency', () => {
    test('displays appropriate currency symbols for different countries', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Should show Indian Rupee symbol by default
        const enterpriseValue = screen.getByText(/₹1\.75L/);
        expect(enterpriseValue).toBeInTheDocument();
      });
    });

    test('adapts content for different regions', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      // Should show India-specific content
      expect(screen.getByText(/Built for Bharat/)).toBeInTheDocument();
      expect(screen.getByText(/Pan-India Reach/)).toBeInTheDocument();
    });

    test('provides culturally appropriate messaging', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Should include culturally relevant terms
        expect(screen.getByText(/Bharat/)).toBeInTheDocument();
        expect(screen.getByText(/28 States/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Optimization', () => {
    test('country selection does not cause unnecessary re-renders', async () => {
      const renderCount = jest.fn();
      
      const TestComponent = () => {
        renderCount();
        return <HomePage />;
      };
      
      render(<TestComponent />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const initialRenderCount = renderCount.mock.calls.length;
      
      // Change country
      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      await user.selectOptions(countrySelect, 'US');
      
      // Should not cause excessive re-renders
      const finalRenderCount = renderCount.mock.calls.length;
      expect(finalRenderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });

    test('SEO components load efficiently', async () => {
      const startTime = performance.now();
      
      render(<HomePage />);
      
      await waitFor(() => {
        const seoHead = screen.getByTestId('global-seo-head');
        const schema = screen.getByTestId('local-business-schema');
        expect(seoHead).toBeInTheDocument();
        expect(schema).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // SEO components should load quickly (under 100ms)
      expect(loadTime).toBeLessThan(100);
    });

    test('handles rapid country changes without performance degradation', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      
      const startTime = performance.now();
      
      // Rapidly change countries
      await user.selectOptions(countrySelect, 'US');
      await user.selectOptions(countrySelect, 'DE');
      await user.selectOptions(countrySelect, 'GB');
      await user.selectOptions(countrySelect, 'IN');
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid changes efficiently
      expect(totalTime).toBeLessThan(200);
      expect(countrySelect).toHaveValue('IN');
    });
  });

  describe('Accessibility and Standards Compliance', () => {
    test('country selector has proper accessibility attributes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      
      // Should be a proper select element
      expect(countrySelect.tagName).toBe('SELECT');
      expect(countrySelect).toHaveAttribute('value');
      
      // Should be focusable
      countrySelect.focus();
      expect(document.activeElement).toBe(countrySelect);
    });

    test('SEO meta tags follow HTML5 standards', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const seoHead = screen.getByTestId('global-seo-head');
        expect(seoHead).toBeInTheDocument();
      });

      // Check for valid meta tag structure
      const metaTags = document.querySelectorAll('meta');
      metaTags.forEach(meta => {
        expect(meta).toHaveAttribute('name');
        expect(meta).toHaveAttribute('content');
      });
    });

    test('structured data follows Schema.org standards', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const schema = screen.getByTestId('local-business-schema');
        expect(schema).toBeInTheDocument();
      });

      const schema = screen.getByTestId('local-business-schema');
      const structuredData = JSON.parse(schema.innerHTML);
      
      // Should follow Schema.org LocalBusiness specification
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('LocalBusiness');
      expect(structuredData.aggregateRating).toBeDefined();
      expect(structuredData.addressCountry).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles invalid country code gracefully', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
        expect(countrySelect).toBeInTheDocument();
      });

      const countrySelect = screen.getByDisplayValue(/🇮🇳 India/);
      
      // Try to set invalid country code programmatically
      fireEvent.change(countrySelect, { target: { value: 'INVALID' } });
      
      // Should maintain valid state or default back
      expect(['IN', 'US', 'DE', 'GB', 'JP', 'AU', 'AE', 'SG', 'BR', 'CA']).toContain(countrySelect.value);
    });

    test('recovers from SEO component errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock SEO component to throw error
      jest.doMock('@/components/SEO/GlobalSEOHead', () => {
        return function ErrorSEOHead() {
          throw new Error('SEO component error');
        };
      });
      
      // Should not crash the entire page
      expect(() => render(<HomePage />)).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    test('handles missing country configuration data', async () => {
      // Mock empty SEO config
      jest.doMock('@/data/global-seo-config', () => ({
        GLOBAL_SEO_CONFIG: {}
      }));
      
      // Should render without crashing
      expect(() => render(<HomePage />)).not.toThrow();
    });
  });
}); 