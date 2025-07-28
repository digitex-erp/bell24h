import { useState } from 'react';

// Types for authentication
export interface User {
  id: number;
  email: string;
  fullName: string;
  companyName?: string;
  role: 'buyer' | 'supplier' | 'admin';
  organizationId?: number;
  profileImage?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  userType: 'buyer' | 'supplier';
}

// API endpoints
const API_URL = '/api';
const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  LOGOUT: `${API_URL}/auth/logout`,
  VERIFY: `${API_URL}/auth/verify`,
  SOCIAL_LOGIN: `${API_URL}/auth/social`,
};

// Helper function for API requests
const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Authentication service functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>(AUTH_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const logout = async (): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(AUTH_ENDPOINTS.LOGOUT, {
    method: 'POST',
  });
};

export const verifyToken = async (): Promise<{ user: User; success: boolean }> => {
  return apiRequest<{ user: User; success: boolean }>(AUTH_ENDPOINTS.VERIFY, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const socialLogin = async (provider: string, token: string): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>(`${AUTH_ENDPOINTS.SOCIAL_LOGIN}/${provider}`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

// Function to get the current auth token from local storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Authentication context hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login(credentials);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(data);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await logout();
      localStorage.removeItem('token');
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await verifyToken();
      
      if (response.success) {
        setUser(response.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string, token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await socialLogin(provider, token);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Social login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,
    socialLogin: handleSocialLogin,
  };
};
