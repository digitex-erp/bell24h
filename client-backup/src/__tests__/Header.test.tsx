import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/header';

describe('Header', () => {
  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('RFQs')).toBeInTheDocument();
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
  });

  it('shows auth buttons when unauthenticated', () => {
    render(<Header />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});
