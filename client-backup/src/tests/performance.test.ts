import { render } from '@testing-library/react';
import Home from '@/app/page';
import Dashboard from '@/components/dashboard/Dashboard';
import { useAuth } from '@/context/auth/AuthContext';

// Mock auth context
jest.mock('@/context/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Performance Tests', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });
  });

  it('should render home page within 100ms', () => {
    const startTime = performance.now();
    
    render(<Home />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100);
  });

  it('should render dashboard within 150ms', () => {
    const startTime = performance.now();
    
    render(<Dashboard />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(150);
  });

  it('should handle search input changes efficiently', () => {
    const { getByPlaceholderText } = render(<Home />);
    const searchInput = getByPlaceholderText('Search for products, suppliers, or RFQs...');
    
    const startTime = performance.now();
    
    // Simulate rapid input changes
    for (let i = 0; i < 10; i++) {
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(50); // Should handle 10 changes within 50ms
  });

  it('should handle category navigation efficiently', () => {
    const { getAllByRole } = render(<Home />);
    const categoryCards = getAllByRole('button');
    
    const startTime = performance.now();
    
    // Simulate rapid category clicks
    for (let i = 0; i < 5; i++) {
      categoryCards[i].click();
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(100); // Should handle 5 clicks within 100ms
  });

  it('should maintain smooth scrolling performance', () => {
    const { container } = render(<Home />);
    
    const startTime = performance.now();
    
    // Simulate scroll events
    for (let i = 0; i < 10; i++) {
      container.dispatchEvent(new Event('scroll', { bubbles: true }));
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(50); // Should handle 10 scroll events within 50ms
  });

  it('should handle window resize efficiently', () => {
    const { container } = render(<Home />);
    
    const startTime = performance.now();
    
    // Simulate window resize events
    for (let i = 0; i < 5; i++) {
      window.dispatchEvent(new Event('resize', { bubbles: true }));
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(100); // Should handle 5 resize events within 100ms
  });
}); 