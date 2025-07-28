'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession, SessionContextValue } from 'next-auth/react';

// User type can be inferred from NextAuth's session.user or defined if custom fields are added via callbacks
// For now, we'll rely on NextAuth's default User type and extend it if needed via next-auth.d.ts

interface AuthContextType {
  user: SessionContextValue['data']['user'] | null | undefined; // User from NextAuth session
  loading: boolean; // Derived from NextAuth status
  error: string | null; // For custom login errors
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean; // Derived from NextAuth status
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  console.log('AuthContext - Session Status:', status);
  console.log('AuthContext - Session Data:', session);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  // NextAuth's useSession handles session loading and state automatically.
  // The `status` variable reflects this: 'loading', 'authenticated', 'unauthenticated'.
  // The `session` variable contains user data when authenticated.

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error);
        throw new Error(result.error);
      }

      if (result?.ok && !result.error) {
        // Successful sign-in, NextAuth session will be updated by useSession
        // router.push('/dashboard'); // Navigation can be handled by the calling component or a useEffect watching session status
      }
    } catch (err) {
      // Error already set if it's a NextAuth error, otherwise set a generic one
      if (!error) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
      }
      // Rethrow to allow calling component to handle if needed
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut({ redirect: false });
      // NextAuth session will be cleared by useSession
      router.push('/login'); // Explicitly redirect after sign out
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      console.error('Logout failed:', err);
    }
  };

  const clearError = () => setError(null);

  // Log authentication values before rendering provider
  console.log('AuthContext - isAuthenticated:', status === 'authenticated');

  return (
    <AuthContext.Provider
      value={{
        user: session?.user,
        loading: status === 'loading',
        error,
        login,
        logout,
        isAuthenticated: status === 'authenticated',
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
