'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'enterprise';
  avatar?: string;
  companyName?: string;
  jobTitle?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check for existing session only on client-side
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('bell24h_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock authentication - in production, this would call your API
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        companyName: 'Tech Solutions Pvt Ltd',
        jobTitle: 'Procurement Manager',
        department: 'Operations',
      };

      setUser(mockUser);

      // Only use localStorage on client-side
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bell24h_user', JSON.stringify(mockUser));
        } catch (error) {
          console.error('Error saving user to localStorage:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);

    // Only remove from localStorage on client-side
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bell24h_user');
      } catch (error) {
        console.error('Error removing user from localStorage:', error);
      }
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock registration
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || '',
        email: userData.email || '',
        role: 'user',
        ...userData,
      };

      setUser(newUser);

      // Only use localStorage on client-side
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bell24h_user', JSON.stringify(newUser));
        } catch (error) {
          console.error('Error saving new user to localStorage:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide fallback values during SSR
  const contextValue = {
    user: isClient ? user : null,
    isLoading: isClient ? isLoading : true,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
