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

describe('Authentication and User Management', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Navigation Links', () => {
    test('renders sign in link in header', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toBeInTheDocument();
      });

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute('href', '/login');
      expect(signInLink).toHaveClass('text-gray-700', 'hover:text-blue-600');
    });

    test('renders start free trial button in header', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const trialButton = screen.getByRole('link', { name: /start free trial/i });
        expect(trialButton).toBeInTheDocument();
      });

      const trialButton = screen.getByRole('link', { name: /start free trial/i });
      expect(trialButton).toHaveAttribute('href', '/register');
      expect(trialButton).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
    });

    test('renders primary CTA buttons in hero section', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const heroTrialButton = screen.getAllByText(/start free trial/i)[0];
        expect(heroTrialButton).toBeInTheDocument();
      });

      const heroTrialButton = screen.getAllByText(/start free trial/i)[0].closest('a');
      expect(heroTrialButton).toHaveAttribute('href', '/register');
      expect(heroTrialButton).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
    });

    test('renders enterprise-focused CTA in bottom section', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const bellCTA = screen.getByText(/ring the bell - start today/i);
        expect(bellCTA).toBeInTheDocument();
      });

      const bellCTA = screen.getByText(/ring the bell - start today/i).closest('a');
      expect(bellCTA).toHaveAttribute('href', '/register');
      expect(bellCTA).toHaveClass('bg-gradient-to-r', 'from-amber-500', 'to-amber-600');
    });

    test('AI dashboard experience link for logged out users', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const aiDashboardLink = screen.getByText(/experience ai dashboard/i);
        expect(aiDashboardLink).toBeInTheDocument();
      });

      const aiDashboardLink = screen.getByText(/experience ai dashboard/i).closest('a');
      expect(aiDashboardLink).toHaveAttribute('href', '/ai-dashboard');
    });
  });

  describe('Registration Flow UX', () => {
    test('multiple registration entry points lead to same destination', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const registrationLinks = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href') === '/register'
        );
        expect(registrationLinks.length).toBeGreaterThanOrEqual(3);
      });

      const registrationLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href') === '/register'
      );
      
      // Should have multiple registration entry points
      expect(registrationLinks.length).toBeGreaterThanOrEqual(3);
      
      // All should point to same registration page
      registrationLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/register');
      });
    });

    test('registration CTAs have compelling value propositions', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Free trial emphasis
        const freeTrialButtons = screen.getAllByText(/start free trial/i);
        expect(freeTrialButtons.length).toBeGreaterThan(0);
        
        // Enterprise value proposition
        expect(screen.getByText(/₹1\.75L monthly value/i)).toBeInTheDocument();
        expect(screen.getByText(/98\.5% ai accuracy/i)).toBeInTheDocument();
      });
    });

    test('registration buttons have proper visual hierarchy', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const primaryCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
        expect(primaryCTA).toBeInTheDocument();
      });

      const primaryCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
      
      // Primary CTA should have gradient background
      expect(primaryCTA).toHaveClass('bg-gradient-to-r');
      
      // Should have hover effects
      expect(primaryCTA).toHaveClass('hover:shadow-2xl', 'transform', 'hover:scale-105');
    });

    test('enterprise value proposition accompanies registration CTAs', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Should show enterprise benefits near CTAs
        expect(screen.getByText(/₹1\.75L/i)).toBeInTheDocument();
        expect(screen.getByText(/25%/i)).toBeInTheDocument(); // Cost Reduction
        expect(screen.getByText(/97%/i)).toBeInTheDocument(); // Time Savings
      });

      // Should show monthly enterprise value
      expect(screen.getByText(/monthly enterprise value/i)).toBeInTheDocument();
      expect(screen.getByText(/cost reduction/i)).toBeInTheDocument();
      expect(screen.getByText(/time savings/i)).toBeInTheDocument();
    });
  });

  describe('Login Flow UX', () => {
    test('sign in link is easily accessible', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toBeInTheDocument();
      });

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      
      // Should be visible in header
      expect(signInLink).toBeVisible();
      expect(signInLink).toHaveClass('text-gray-700', 'hover:text-blue-600');
    });

    test('login link styling differentiates from registration', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        const trialButton = screen.getByRole('link', { name: /start free trial/i });
        expect(signInLink).toBeInTheDocument();
        expect(trialButton).toBeInTheDocument();
      });

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      const trialButton = screen.getByRole('link', { name: /start free trial/i });
      
      // Sign in should be text link
      expect(signInLink).toHaveClass('text-gray-700');
      expect(signInLink).not.toHaveClass('bg-gradient-to-r');
      
      // Trial button should be prominent
      expect(trialButton).toHaveClass('bg-gradient-to-r');
    });

    test('header layout accommodates both auth options', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const headerAuthSection = screen.getByRole('link', { name: /sign in/i }).closest('div');
        expect(headerAuthSection).toBeInTheDocument();
      });

      const headerAuthSection = screen.getByRole('link', { name: /sign in/i }).closest('div');
      
      // Should have proper spacing classes
      expect(headerAuthSection).toHaveClass('flex', 'items-center', 'space-x-4');
    });
  });

  describe('User Journey Optimization', () => {
    test('progressive disclosure of value throughout page', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Hero section value props
        expect(screen.getByText(/534,281\+ verified suppliers/i)).toBeInTheDocument();
        expect(screen.getByText(/50\+ categories/i)).toBeInTheDocument();
        
        // Statistics section
        expect(screen.getByText(/534,281\+/)).toBeInTheDocument();
        expect(screen.getByText(/98\.5%/)).toBeInTheDocument();
      });

      // Hero section should highlight key numbers
      expect(screen.getByText(/534,281\+ verified suppliers/i)).toBeInTheDocument();
      expect(screen.getByText(/50\+ categories/i)).toBeInTheDocument();
      
      // Stats section should reinforce credibility
      expect(screen.getByText('Verified Suppliers')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });

    test('builds trust through social proof before registration', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Should show large numbers and credibility indicators
        expect(screen.getByText(/534,281\+/)).toBeInTheDocument();
        expect(screen.getByText(/50\+/)).toBeInTheDocument();
        expect(screen.getByText(/125,000\+/)).toBeInTheDocument();
        expect(screen.getByText(/98\.5%/)).toBeInTheDocument();
      });

      // Should show verification and security
      expect(screen.getByText(/verified suppliers/i)).toBeInTheDocument();
      expect(screen.getByText(/100% verified/i)).toBeInTheDocument();
      expect(screen.getByText(/24x7 active/i)).toBeInTheDocument();
    });

    test('clear value proposition hierarchy', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Primary headline
        expect(screen.getByText(/india's most trusted/i)).toBeInTheDocument();
        expect(screen.getByText(/b2b marketplace/i)).toBeInTheDocument();
      });

      // Main value prop in headline
      expect(screen.getByText(/india's most trusted/i)).toBeInTheDocument();
      expect(screen.getByText(/b2b marketplace/i)).toBeInTheDocument();
      
      // Supporting benefits
      expect(screen.getByText(/built for bharat/i)).toBeInTheDocument();
      expect(screen.getByText(/designed for the world/i)).toBeInTheDocument();
    });

    test('demonstrates platform capabilities before asking for signup', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Show actual product features
        expect(screen.getByText(/ai-powered matching/i)).toBeInTheDocument();
        expect(screen.getByText(/voice rfq/i)).toBeInTheDocument();
        expect(screen.getByText(/ai analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/predictive analytics/i)).toBeInTheDocument();
      });

      // Should showcase AI capabilities
      expect(screen.getByText(/ai-powered matching/i)).toBeInTheDocument();
      expect(screen.getByText(/98\.5% accuracy/i)).toBeInTheDocument();
      
      // Should show enterprise features
      expect(screen.getByText(/voice rfq/i)).toBeInTheDocument();
      expect(screen.getByText(/predictive analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/risk scoring/i)).toBeInTheDocument();
    });
  });

  describe('Security and Trust Indicators', () => {
    test('displays verification and security badges', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/100% verified/i)).toBeInTheDocument();
        expect(screen.getByText(/verified suppliers/i)).toBeInTheDocument();
      });

      // Should show verification indicators
      expect(screen.getByText(/100% verified/i)).toBeInTheDocument();
      expect(screen.getByText(/verified suppliers/i)).toBeInTheDocument();
    });

    test('emphasizes regulatory compliance and standards', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Should show enterprise-grade messaging
        expect(screen.getByText(/enterprise b2b/i)).toBeInTheDocument();
        expect(screen.getByText(/background-checked/i)).toBeInTheDocument();
        expect(screen.getByText(/certified/i)).toBeInTheDocument();
      });
    });

    test('shows business credibility indicators', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Large scale indicators
        expect(screen.getByText(/534,281\+/)).toBeInTheDocument();
        expect(screen.getByText(/125,000\+/)).toBeInTheDocument();
        
        // Success metrics
        expect(screen.getByText(/98\.5%/)).toBeInTheDocument();
      });

      // Should show scale and success
      expect(screen.getByText('Verified Suppliers')).toBeInTheDocument();
      expect(screen.getByText('Monthly RFQs')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  describe('Call-to-Action Effectiveness', () => {
    test('CTAs use action-oriented language', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Action verbs in CTAs
        expect(screen.getByText(/start free trial/i)).toBeInTheDocument();
        expect(screen.getByText(/ring the bell/i)).toBeInTheDocument();
        expect(screen.getByText(/experience ai dashboard/i)).toBeInTheDocument();
      });

      // Should use compelling action words
      expect(screen.getByText(/start free trial/i)).toBeInTheDocument();
      expect(screen.getByText(/ring the bell - start today/i)).toBeInTheDocument();
      expect(screen.getByText(/experience ai dashboard/i)).toBeInTheDocument();
    });

    test('CTAs create urgency and value perception', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Free trial creates urgency
        expect(screen.getByText(/start free trial/i)).toBeInTheDocument();
        
        // Enterprise value
        expect(screen.getByText(/₹1\.75l monthly value/i)).toBeInTheDocument();
        
        // Immediate benefit
        expect(screen.getByText(/start today/i)).toBeInTheDocument();
      });

      // Should emphasize free trial and immediate value
      expect(screen.getByText(/free trial/i)).toBeInTheDocument();
      expect(screen.getByText(/start today/i)).toBeInTheDocument();
      expect(screen.getByText(/₹1\.75l/i)).toBeInTheDocument();
    });

    test('primary and secondary CTAs are well differentiated', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const primaryCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
        const secondaryCTA = screen.getByText(/watch demo/i).closest('button');
        expect(primaryCTA).toBeInTheDocument();
        expect(secondaryCTA).toBeInTheDocument();
      });

      const primaryCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
      const secondaryCTA = screen.getByText(/watch demo/i).closest('button');
      
      // Primary should have solid background
      expect(primaryCTA).toHaveClass('bg-gradient-to-r');
      
      // Secondary should have border style
      expect(secondaryCTA).toHaveClass('border-2');
    });

    test('CTAs maintain consistent branding', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const registrationCTAs = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href') === '/register'
        );
        expect(registrationCTAs.length).toBeGreaterThan(0);
      });

      const registrationCTAs = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href') === '/register'
      );
      
      // All registration CTAs should have gradient styling
      registrationCTAs.forEach(cta => {
        expect(cta).toHaveClass('bg-gradient-to-r');
      });
    });
  });

  describe('Mobile Authentication UX', () => {
    test('auth links are accessible on mobile', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toBeInTheDocument();
      });

      // Auth section should be visible on mobile
      const authSection = screen.getByRole('link', { name: /sign in/i }).closest('div');
      expect(authSection).toBeInTheDocument();
    });

    test('mobile CTAs are touch-friendly', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const mobileCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
        expect(mobileCTA).toBeInTheDocument();
      });

      const mobileCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
      
      // Should have adequate padding for touch
      expect(mobileCTA).toHaveClass('px-8', 'py-4');
    });

    test('responsive auth layout prevents cramping', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const authButtons = screen.getByRole('link', { name: /sign in/i }).closest('div');
        expect(authButtons).toBeInTheDocument();
      });

      const authButtons = screen.getByRole('link', { name: /sign in/i }).closest('div');
      
      // Should have responsive spacing
      expect(authButtons).toHaveClass('space-x-4');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing authentication state gracefully', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Should always show auth options for logged out state
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /start free trial/i })).toBeInTheDocument();
      });
    });

    test('handles authentication navigation errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<HomePage />);
      
      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toBeInTheDocument();
      });

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      
      // Should not crash when clicking auth links
      await expect(async () => {
        await user.click(signInLink);
      }).not.rejects.toThrow();
      
      consoleSpy.mockRestore();
    });

    test('maintains auth state consistency across page', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const allSignInLinks = screen.getAllByRole('link').filter(link => 
          link.textContent?.includes('Sign In')
        );
        const allRegisterLinks = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href') === '/register'
        );
        
        expect(allSignInLinks.length).toBeGreaterThan(0);
        expect(allRegisterLinks.length).toBeGreaterThan(0);
      });

      // All sign in links should point to login
      const allSignInLinks = screen.getAllByRole('link').filter(link => 
        link.textContent?.includes('Sign In')
      );
      allSignInLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/login');
      });

      // All registration CTAs should point to register
      const allRegisterLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href') === '/register'
      );
      expect(allRegisterLinks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Analytics and Conversion Optimization', () => {
    test('CTA buttons have tracking-friendly attributes', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        const primaryCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
        expect(primaryCTA).toBeInTheDocument();
      });

      const primaryCTA = screen.getAllByText(/start free trial/i)[0].closest('a');
      
      // Should have href for tracking
      expect(primaryCTA).toHaveAttribute('href', '/register');
      
      // Should have identifiable content for analytics
      expect(primaryCTA).toHaveTextContent(/start free trial/i);
    });

    test('multiple conversion funnels are present', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Hero section funnel
        expect(screen.getAllByText(/start free trial/i)[0]).toBeInTheDocument();
        
        // Feature showcase to AI dashboard
        expect(screen.getByText(/experience ai dashboard/i)).toBeInTheDocument();
        
        // Bottom section enterprise funnel
        expect(screen.getByText(/ring the bell - start today/i)).toBeInTheDocument();
      });

      // Should have multiple paths to conversion
      const registrationCTAs = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href') === '/register'
      );
      expect(registrationCTAs.length).toBeGreaterThanOrEqual(3);
    });

    test('value propositions are testable for A/B optimization', async () => {
      render(<HomePage />);
      
      await waitFor(() => {
        // Testable value props
        expect(screen.getByText(/98\.5% ai accuracy/i)).toBeInTheDocument();
        expect(screen.getByText(/₹1\.75l monthly value/i)).toBeInTheDocument();
        expect(screen.getByText(/534,281\+ verified suppliers/i)).toBeInTheDocument();
      });

      // Clear, measurable value propositions for testing
      expect(screen.getByText(/98\.5%/)).toBeInTheDocument();
      expect(screen.getByText(/₹1\.75l/)).toBeInTheDocument();
      expect(screen.getByText(/534,281\+/)).toBeInTheDocument();
    });
  });
}); 