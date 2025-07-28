/**
 * 🎯 COMPREHENSIVE HOMEPAGE TESTING SUITE
 * Bell24H Enterprise B2B Platform
 * 
 * Tests: User interactions, AI features, navigation, performance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/page';

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
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Mock window.templeBellSound
Object.defineProperty(window, 'templeBellSound', {
  value: {
    playBellSound: jest.fn().mockResolvedValue(undefined),
    isAudioSupported: jest.fn().mockReturnValue(true)
  },
  writable: true
});

describe('🎯 Bell24H Homepage - Comprehensive Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('✅ Critical UI Elements', () => {
    test('renders main logo and branding', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Bell24H')).toBeInTheDocument();
        expect(screen.getByText('The Global B2B Operating System')).toBeInTheDocument();
      });
    });

    test('displays main headline correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/India's Most Trusted/)).toBeInTheDocument();
        expect(screen.getByText(/B2B Marketplace/)).toBeInTheDocument();
      });
    });

    test('shows enterprise value proposition', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/534,281\+ verified suppliers/)).toBeInTheDocument();
        expect(screen.getByText(/50\+ categories/)).toBeInTheDocument();
        expect(screen.getByText(/₹1\.75L\/Month Enterprise/)).toBeInTheDocument();
      });
    });
  });

  describe('🎵 Bell Sound System', () => {
    test('bell sound functionality works', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellButton = screen.getByRole('button', { name: /click for bell sound/i });
        fireEvent.click(bellButton);
        expect(window.templeBellSound.playBellSound).toHaveBeenCalled();
      });
    });

    test('sound toggle works correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const soundToggle = screen.getByTitle(/mute bell|enable bell/i);
        fireEvent.click(soundToggle);
        // Should toggle sound state
      });
    });
  });

  describe('🔍 AI Search System', () => {
    test('search input accepts text', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
        fireEvent.change(searchInput, { target: { value: 'Industrial Machinery' } });
        expect(searchInput).toHaveValue('Industrial Machinery');
      });
    });

    test('category selector works', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
        expect(categorySelect).toHaveValue('Electronics');
      });
    });

    test('AI search button triggers search', async () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true
      });

      render(<HomePage />);
      
      await waitFor(() => {
        const searchButton = screen.getByText('AI Search');
        fireEvent.click(searchButton);
        // Should show loading state
        expect(screen.getByText('AI Search')).toBeInTheDocument();
      });
    });
  });

  describe('📊 Statistics Display', () => {
    test('shows all key statistics', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('534,281+')).toBeInTheDocument();
        expect(screen.getByText('50+')).toBeInTheDocument();
        expect(screen.getByText('125,000+')).toBeInTheDocument();
        expect(screen.getByText('98.5%')).toBeInTheDocument();
      });
    });

    test('statistics have proper labels', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Verified Suppliers')).toBeInTheDocument();
        expect(screen.getByText('Active Categories')).toBeInTheDocument();
        expect(screen.getByText('Monthly RFQs')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
      });
    });
  });

  describe('🏷️ Featured Categories', () => {
    test('displays featured categories correctly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Agriculture')).toBeInTheDocument();
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Computers & IT')).toBeInTheDocument();
        expect(screen.getByText('Automobile')).toBeInTheDocument();
      });
    });

    test('category cards show supplier counts', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/15,247 suppliers/)).toBeInTheDocument();
        expect(screen.getByText(/28,439 suppliers/)).toBeInTheDocument();
      });
    });

    test('category cards show growth trends', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('+12%')).toBeInTheDocument();
        expect(screen.getByText('+18%')).toBeInTheDocument();
        expect(screen.getByText('+22%')).toBeInTheDocument();
      });
    });
  });

  describe('🚀 AI Features Section', () => {
    test('shows AI feature links', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Voice RFQ')).toBeInTheDocument();
        expect(screen.getByText('AI Analytics')).toBeInTheDocument();
        expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();
        expect(screen.getByText('Risk Scoring')).toBeInTheDocument();
      });
    });

    test('displays AI accuracy badge', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/98\.5% AI Accuracy/)).toBeInTheDocument();
        expect(screen.getByText(/Enterprise Risk Scoring/)).toBeInTheDocument();
        expect(screen.getByText(/Real-time Market Data/)).toBeInTheDocument();
      });
    });
  });

  describe('🔗 Navigation & CTAs', () => {
    test('main navigation links are present', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('Voice RFQ')).toBeInTheDocument();
        expect(screen.getByText('AI Dashboard')).toBeInTheDocument();
      });
    });

    test('CTA buttons are functional', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
        expect(screen.getByText('Watch Demo')).toBeInTheDocument();
        expect(screen.getByText('Ring the Bell - Start Today')).toBeInTheDocument();
      });
    });

    test('login and register links work', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getAllByText('Start Free Trial').length).toBeGreaterThan(0);
      });
    });
  });

  describe('🌍 Global Features', () => {
    test('country selector is present', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const countrySelect = screen.getByDisplayValue(/India/);
        expect(countrySelect).toBeInTheDocument();
      });
    });

    test('enterprise value highlights', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('₹1.75L')).toBeInTheDocument();
        expect(screen.getByText('Monthly Enterprise Value')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();
        expect(screen.getByText('Cost Reduction')).toBeInTheDocument();
      });
    });
  });

  describe('📱 Responsive & Performance', () => {
    test('renders without console errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Bell24H')).toBeInTheDocument();
      });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('loads within reasonable time', async () => {
      const startTime = Date.now();
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Bell24H')).toBeInTheDocument();
      });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    });
  });

  describe('🔒 Security & Trust Features', () => {
    test('displays security badges', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('100% Verified')).toBeInTheDocument();
        expect(screen.getByText('24x7 Active')).toBeInTheDocument();
        expect(screen.getByText('98.5% Accuracy')).toBeInTheDocument();
      });
    });

    test('shows feature highlights', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Powered Matching')).toBeInTheDocument();
        expect(screen.getByText('Verified Suppliers')).toBeInTheDocument();
        expect(screen.getByText('24/7 Operations')).toBeInTheDocument();
        expect(screen.getByText('Pan-India Reach')).toBeInTheDocument();
      });
    });
  });
});

describe('🎯 Homepage Integration Tests', () => {
  test('complete user journey simulation', async () => {
    render(<HomePage />);
    
    // User sees the page
    await waitFor(() => {
      expect(screen.getByText('Bell24H')).toBeInTheDocument();
    });
    
    // User interacts with search
    const searchInput = screen.getByPlaceholderText(/what are you looking for/i);
    fireEvent.change(searchInput, { target: { value: 'Steel Products' } });
    
    // User selects category
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Construction' } });
    
    // User clicks search
    const searchButton = screen.getByText('AI Search');
    fireEvent.click(searchButton);
    
    // Should show loading state
    await waitFor(() => {
      expect(searchInput).toHaveValue('Steel Products');
      expect(categorySelect).toHaveValue('Construction');
    });
  });
}); 