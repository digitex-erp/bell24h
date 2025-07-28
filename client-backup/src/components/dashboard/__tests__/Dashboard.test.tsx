import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';
import Dashboard from '../Dashboard';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth context
jest.mock('@/context/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Dashboard Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile button for all users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });

    render(<Dashboard />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders admin button for admin users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'admin' },
    });

    render(<Dashboard />);
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
  });

  it('renders analytics dashboard for users with permission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });

    render(<Dashboard />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('renders supplier risk dashboard for users with permission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });

    render(<Dashboard />);
    expect(screen.getByText('Supplier Risk')).toBeInTheDocument();
  });

  it('renders transaction monitoring for users with permission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });

    render(<Dashboard />);
    expect(screen.getByText('Transaction Monitoring')).toBeInTheDocument();
  });

  it('renders performance metrics for users with permission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });

    render(<Dashboard />);
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  it('handles profile navigation', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'user' },
    });

    render(<Dashboard />);
    const profileButton = screen.getByText('Profile');
    profileButton.click();

    expect(mockRouter.push).toHaveBeenCalledWith('/profile');
  });

  it('handles admin navigation', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'admin' },
    });

    render(<Dashboard />);
    const adminButton = screen.getByText('Manage Users');
    adminButton.click();

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/users');
  });
}); 