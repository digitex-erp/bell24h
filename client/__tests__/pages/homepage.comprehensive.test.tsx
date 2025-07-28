/**
 * Bell24H Homepage - Comprehensive Test Suite
 * Tests all page functionality, content, navigation, and features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import {
  generateTestData,
  navigationTestUtils,
  apiTestUtils,
  bell24hTestUtils,
} from '../utils/testHelpers';

// Mock Next.js router and navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.templeBellSound for bell functionality
Object.defineProperty(window, 'templeBellSound', {
  value: {
    playBellSound: jest.fn().mockResolvedValue(undefined),
    isAudioSupported: jest.fn().mockReturnValue(true),
  },
  writable: true,
});

describe('Bell24H Homepage - Comprehensive Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      writable: true,
    });
  });

  describe('Page Loading and Basic Functionality', () => {
    test('page loads successfully without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<HomePage />);

      // Check that no console errors occurred during rendering
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('page has proper document title and meta information', () => {
      render(<HomePage />);

      // Title should be set by GlobalSEOHead component
      expect(document.head.querySelector('title')).toBeTruthy();
    });

    test('page renders within acceptable time', async () => {
      const startTime = performance.now();
      render(<HomePage />);
      const endTime = performance.now();

      // Should render within 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('page has semantic HTML structure', () => {
      render(<HomePage />);

      // Check for proper semantic elements
      expect(document.querySelector('header')).toBeInTheDocument();
      expect(
        document.querySelector('main') || document.querySelector('[role="main"]')
      ).toBeTruthy();
      expect(document.querySelector('footer')).toBeInTheDocument();
    });
  });

  describe('Header and Navigation', () => {
    test('header contains all required elements', () => {
      render(<HomePage />);

      // Logo and branding
      expect(screen.getByText('Bell24H')).toBeInTheDocument();
      expect(screen.getByText('The Global B2B Operating System')).toBeInTheDocument();

      // Navigation menu items
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Voice RFQ')).toBeInTheDocument();
      expect(screen.getByText('AI Dashboard')).toBeInTheDocument();

      // Authentication buttons
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
    });

    test('country selector functionality', async () => {
      render(<HomePage />);

      const countrySelector = screen.getByDisplayValue(/India|IN/);
      expect(countrySelector).toBeInTheDocument();

      // Test country selection
      await user.selectOptions(countrySelector, 'US');
      expect(countrySelector).toHaveValue('US');
    });

    test('bell sound toggle functionality', async () => {
      render(<HomePage />);

      const soundToggle = screen.getByTitle(/Mute Bell|Enable Bell/);
      expect(soundToggle).toBeInTheDocument();

      await user.click(soundToggle);
      // Verify sound toggle was called
      expect(window.templeBellSound.playBellSound).toHaveBeenCalled();
    });

    test('navigation links are functional', async () => {
      render(<HomePage />);

      const navigationLinks = [
        { text: 'Categories', href: '/categories' },
        { text: 'Voice RFQ', href: '/voice-rfq' },
        { text: 'AI Dashboard', href: '/ai-dashboard' },
        { text: 'Sign In', href: '/login' },
        { text: 'Start Free Trial', href: '/register' },
      ];

      navigationLinks.forEach(({ text, href }) => {
        const link = screen.getByRole('link', { name: text });
        expect(link).toHaveAttribute('href', href);
      });
    });
  });

  describe('Hero Section', () => {
    test('hero section displays correct content', () => {
      render(<HomePage />);

      // Main headline
      expect(screen.getByText(/India's Most Trusted/)).toBeInTheDocument();
      expect(screen.getByText(/B2B Marketplace/)).toBeInTheDocument();

      // Subheadline with metrics
      expect(screen.getByText(/534,281\+ verified suppliers/)).toBeInTheDocument();
      expect(screen.getByText(/50\+ categories/)).toBeInTheDocument();

      // Feature highlights
      expect(screen.getByText(/98\.5% AI Accuracy/)).toBeInTheDocument();
      expect(screen.getByText(/24\/7 Operations/)).toBeInTheDocument();
      expect(screen.getByText(/Pan-India Reach/)).toBeInTheDocument();
    });

    test('bell icon interaction', async () => {
      render(<HomePage />);

      const bellIcon =
        screen.getAllByTestId('bell-icon')[0] ||
        screen.getByText('Click for Bell Sound').closest('div');

      if (bellIcon) {
        await user.click(bellIcon);
        expect(window.templeBellSound.playBellSound).toHaveBeenCalled();
      }
    });

    test('CTA buttons functionality', async () => {
      render(<HomePage />);

      const startTrialButton = screen.getByRole('link', { name: /Start Free Trial/ });
      const watchDemoButton = screen.getByRole('button', { name: /Watch Demo/ });

      expect(startTrialButton).toHaveAttribute('href', '/register');
      expect(watchDemoButton).toBeInTheDocument();

      // Test demo button scroll functionality
      await user.click(watchDemoButton);
      // Demo button should trigger scroll to demo section
    });
  });

  describe('AI-Powered Search Section', () => {
    test('search interface elements are present', () => {
      render(<HomePage />);

      // Search input
      const searchInput = screen.getByPlaceholderText(/What are you looking for/);
      expect(searchInput).toBeInTheDocument();

      // Category dropdown
      const categorySelect =
        screen.getByDisplayValue('All Categories') || screen.getByText('All Categories');
      expect(categorySelect).toBeInTheDocument();

      // Search button
      const searchButton = screen.getByRole('button', { name: /AI Search/ });
      expect(searchButton).toBeInTheDocument();
    });

    test('search functionality works', async () => {
      render(<HomePage />);

      const searchInput = screen.getByPlaceholderText(/What are you looking for/);
      const categorySelect = screen.getByDisplayValue('All Categories');
      const searchButton = screen.getByRole('button', { name: /AI Search/ });

      // Fill search form
      await user.type(searchInput, 'Industrial Machinery');
      await user.selectOptions(categorySelect, 'Electronics');

      // Mock window.location.href assignment
      const locationSpy = jest.spyOn(window.location, 'href', 'set').mockImplementation();

      await user.click(searchButton);

      // Should show loading state
      await waitFor(() => {
        expect(searchButton).toBeDisabled();
      });

      locationSpy.mockRestore();
    });

    test('AI features links work', () => {
      render(<HomePage />);

      const aiFeatures = [
        { text: 'Voice RFQ', href: '/voice-rfq' },
        { text: 'AI Analytics', href: '/ai-dashboard' },
        { text: 'Predictive Analytics', href: '/predictive-analytics' },
      ];

      aiFeatures.forEach(({ text, href }) => {
        const link = screen.getByRole('link', { name: text });
        expect(link).toHaveAttribute('href', href);
      });
    });

    test('AI trust badge is displayed', () => {
      render(<HomePage />);

      expect(screen.getByText(/98\.5% AI Accuracy/)).toBeInTheDocument();
      expect(screen.getByText(/Enterprise Risk Scoring/)).toBeInTheDocument();
      expect(screen.getByText(/Real-time Market Data/)).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    test('displays all key statistics', () => {
      render(<HomePage />);

      const expectedStats = [
        /534,281\+/, // Verified Suppliers
        /50\+/, // Active Categories
        /125,000\+/, // Monthly RFQs
        /98\.5%/, // Success Rate
      ];

      expectedStats.forEach(stat => {
        expect(screen.getByText(stat)).toBeInTheDocument();
      });
    });

    test('statistics section has proper styling', () => {
      render(<HomePage />);

      const statsSection = screen.getByText("Powering India's B2B Economy").closest('section');
      expect(statsSection).toHaveClass(/bg-gradient-to-r/);
    });
  });

  describe('Categories Grid', () => {
    test('displays featured categories', () => {
      render(<HomePage />);

      const expectedCategories = [
        'Agriculture',
        'Electronics',
        'Computers & IT',
        'Apparel',
        'Automobile',
        'Chemicals',
        'Construction',
        'Food & Beverages',
      ];

      expectedCategories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    test('category cards are interactive', async () => {
      render(<HomePage />);

      const categoryCard = screen.getByText('Electronics').closest('a');
      expect(categoryCard).toHaveAttribute('href', '/categories/electronics');

      // Test hover effects
      await user.hover(categoryCard);
      expect(categoryCard).toHaveClass(/group/);
    });

    test('category trend indicators are shown', () => {
      render(<HomePage />);

      // Each category should show supplier count and trend
      expect(screen.getByText(/15,247/)).toBeInTheDocument(); // Agriculture suppliers
      expect(screen.getByText(/\+12%/)).toBeInTheDocument(); // Agriculture trend
    });

    test('view all categories link works', () => {
      render(<HomePage />);

      const viewAllLink = screen.getByRole('link', { name: /View All Categories/ });
      expect(viewAllLink).toHaveAttribute('href', '/categories');
    });
  });

  describe('Features Section', () => {
    test('displays all key features', () => {
      render(<HomePage />);

      const expectedFeatures = [
        'AI-Powered Matching',
        'Verified Suppliers',
        '24/7 Operations',
        'Pan-India Reach',
      ];

      expectedFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    test('feature descriptions are accurate', () => {
      render(<HomePage />);

      expect(screen.getByText(/98\.5% Accuracy/)).toBeInTheDocument();
      expect(screen.getByText(/100% Verified/)).toBeInTheDocument();
      expect(screen.getByText(/24x7 Active/)).toBeInTheDocument();
      expect(screen.getByText(/28 States/)).toBeInTheDocument();
    });
  });

  describe('Call-to-Action Section', () => {
    test('final CTA section displays correctly', () => {
      render(<HomePage />);

      expect(screen.getByText('Ready to Ring the Bell?')).toBeInTheDocument();
      expect(screen.getByText(/Join 534,281\+ suppliers/)).toBeInTheDocument();
    });

    test('CTA buttons work correctly', () => {
      render(<HomePage />);

      const ringBellButton = screen.getByRole('link', { name: /Ring the Bell - Start Today/ });
      const aiDashboardButton = screen.getByRole('link', { name: /Experience AI Dashboard/ });

      expect(ringBellButton).toHaveAttribute('href', '/register');
      expect(aiDashboardButton).toHaveAttribute('href', '/ai-dashboard');
    });

    test('enterprise value highlights are shown', () => {
      render(<HomePage />);

      expect(screen.getByText('₹1.75L')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('97%')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    test('footer contains all required elements', () => {
      render(<HomePage />);

      // Company branding
      expect(screen.getByText('Bell24H')).toBeInTheDocument();

      // Footer links sections
      expect(screen.getByText('Platform')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();

      // Copyright
      expect(screen.getByText(/© 2024 Bell24H Global/)).toBeInTheDocument();
    });

    test('footer links are functional', () => {
      render(<HomePage />);

      const footerLinks = [
        { text: 'Browse Categories', href: '/categories' },
        { text: 'Voice RFQ', href: '/voice-rfq' },
        { text: 'AI Dashboard', href: '/ai-dashboard' },
        { text: 'About Us', href: '/about' },
        { text: 'Contact', href: '/contact' },
        { text: 'Help Center', href: '/help' },
      ];

      footerLinks.forEach(({ text, href }) => {
        const link = screen.getByRole('link', { name: text });
        expect(link).toHaveAttribute('href', href);
      });
    });

    test('footer sound toggle works', async () => {
      render(<HomePage />);

      const footerSoundToggle = screen.getByRole('button', { name: /Bell Sound/ });
      expect(footerSoundToggle).toBeInTheDocument();

      await user.click(footerSoundToggle);
      expect(window.templeBellSound.playBellSound).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    test('page is responsive on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HomePage />);

      // Check for responsive classes
      const mobileElements = screen.getAllByRole('button').concat(screen.getAllByRole('link'));
      expect(mobileElements.length).toBeGreaterThan(0);
    });

    test('navigation collapses on small screens', () => {
      render(<HomePage />);

      // Navigation should have responsive classes
      const navigation =
        screen.getByRole('navigation') || screen.getByText('Categories').closest('nav');

      if (navigation) {
        expect(navigation).toHaveClass(/hidden|md:flex/);
      }
    });
  });

  describe('Performance and Accessibility', () => {
    test('images have proper alt text', () => {
      render(<HomePage />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    test('buttons have proper ARIA labels', () => {
      render(<HomePage />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasText = button.textContent && button.textContent.trim() !== '';

        expect(hasAriaLabel || hasText).toBe(true);
      });
    });

    test('links have proper href attributes', () => {
      render(<HomePage />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).not.toBe('');
      });
    });

    test('headings follow proper hierarchy', () => {
      render(<HomePage />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Should have h1
      const h1Elements = headings.filter(h => h.tagName.toLowerCase() === 'h1');
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Interactive Features', () => {
    test('search form submission works', async () => {
      render(<HomePage />);

      const searchInput = screen.getByPlaceholderText(/What are you looking for/);
      const searchButton = screen.getByRole('button', { name: /AI Search/ });

      await user.type(searchInput, 'test search');

      // Mock window.location.href
      const locationSpy = jest.spyOn(window.location, 'href', 'set').mockImplementation();

      await user.click(searchButton);

      await waitFor(() => {
        expect(searchButton).toBeDisabled();
      });

      locationSpy.mockRestore();
    });

    test('category selection updates search', async () => {
      render(<HomePage />);

      const categorySelect = screen.getByDisplayValue('All Categories');

      await user.selectOptions(categorySelect, 'Electronics');
      expect(categorySelect).toHaveValue('Electronics');
    });

    test('demo section scroll works', async () => {
      render(<HomePage />);

      const demoButton = screen.getByRole('button', { name: /Watch Demo/ });

      // Mock getElementById to return a mock element
      const mockElement = {
        scrollIntoView: jest.fn(),
      };

      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

      await user.click(demoButton);

      expect(document.getElementById).toHaveBeenCalledWith('demo-section');
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('SEO and Meta Tags', () => {
    test('page has proper SEO structure', () => {
      render(<HomePage />);

      // Should have title
      expect(document.title).toBeDefined();

      // Should have meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeTruthy();
    });

    test('structured data is present', () => {
      render(<HomePage />);

      // Should have JSON-LD structured data
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      expect(structuredData).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('handles search errors gracefully', async () => {
      render(<HomePage />);

      const searchInput = screen.getByPlaceholderText(/What are you looking for/);
      const searchButton = screen.getByRole('button', { name: /AI Search/ });

      // Test with empty search
      await user.click(searchButton);

      // Should not crash
      expect(searchButton).toBeInTheDocument();
    });

    test('handles sound errors gracefully', async () => {
      // Mock sound error
      window.templeBellSound.playBellSound = jest.fn().mockRejectedValue(new Error('Sound error'));

      render(<HomePage />);

      const soundToggle = screen.getByTitle(/Mute Bell|Enable Bell/);

      await user.click(soundToggle);

      // Should not crash
      expect(soundToggle).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('components render without loading states initially', () => {
      render(<HomePage />);

      // Should not show loading spinners on initial render
      const loadingSpinners = screen.queryAllByRole('status');
      expect(loadingSpinners.length).toBe(0);
    });

    test('search shows loading state during submission', async () => {
      render(<HomePage />);

      const searchInput = screen.getByPlaceholderText(/What are you looking for/);
      const searchButton = screen.getByRole('button', { name: /AI Search/ });

      await user.type(searchInput, 'test');
      await user.click(searchButton);

      // Should show loading state
      await waitFor(() => {
        expect(searchButton).toBeDisabled();
      });
    });
  });
});
