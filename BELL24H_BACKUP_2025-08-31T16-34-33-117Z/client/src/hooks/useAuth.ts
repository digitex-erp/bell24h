import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const tokens = getStoredTokens();

        if (tokens?.accessToken) {
          // Verify token and fetch user data
          const userData = await fetchCurrentUser(tokens.accessToken);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        clearStoredTokens();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper function to fetch current user
  const fetchCurrentUser = async (token: string): Promise<User> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await api.post<{
        user: User;
        tokens: AuthTokens;
      }>('/auth/login', { email, password });

      // Store tokens
      storeTokens(data.tokens);
      setUser(data.user);

      // Redirect to dashboard or intended URL
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await api.post<{
        user: User;
        tokens: AuthTokens;
      }>('/auth/register', { name, email, password });

      // Store tokens
      storeTokens(data.tokens);
      setUser(data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state
      clearStoredTokens();
      setUser(null);

      // Redirect to login
      router.push('/login');
    }
  };

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<AuthTokens | null> => {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) return null;

      const data = await api.post<{ tokens: AuthTokens }>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      // Store new tokens
      storeTokens(data.tokens);
      return data.tokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return null;
    }
  }, []);

  // Helper functions for token management
  const storeTokens = (tokens: AuthTokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    }
  };

  const getStoredTokens = (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  };

  const clearStoredTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens');
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
  };
};

export default useAuth;
