// Mock NextAuth for development - Replace with real NextAuth in production
import React from 'react';

// Enhanced mock session state
let currentMockSession: any = null;

// Demo users database
const demoUsers = {
  'demo@bell24h.com': {
    id: '1',
    email: 'demo@bell24h.com',
    name: 'Demo User',
    role: 'user',
    companyName: 'Demo Company Ltd',
    password: 'demo123',
  },
  'admin@bell24h.com': {
    id: '2',
    email: 'admin@bell24h.com',
    name: 'Admin User',
    role: 'admin',
    companyName: 'Bell24H Admin',
    password: 'admin123',
  },
};

// Mock session object
const createMockSession = (userData: any) => ({
  user: {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    companyName: userData.companyName,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
});

// Initialize session from localStorage immediately
const initializeSession = () => {
  if (typeof window !== 'undefined') {
    const savedSession = localStorage.getItem('bell24h-session');
    if (savedSession) {
      try {
        currentMockSession = JSON.parse(savedSession);
        console.log('🔄 Session restored from localStorage:', currentMockSession.user?.name);
        return currentMockSession;
      } catch (e) {
        console.log('❌ Invalid session in localStorage, clearing...');
        localStorage.removeItem('bell24h-session');
      }
    }
  }
  return null;
};

// **ENHANCED: Better State Management with immediate initialization**
export const useSession = () => {
  const [session, setSession] = React.useState(() => {
    // Initialize session immediately on first render
    return initializeSession();
  });

  const [status, setStatus] = React.useState<'loading' | 'authenticated' | 'unauthenticated'>(
    () => {
      // Set initial status based on session
      const initialSession = initializeSession();
      return initialSession ? 'authenticated' : 'unauthenticated';
    }
  );

  React.useEffect(() => {
    // Double-check session state on mount
    const savedSession = initializeSession();
    if (savedSession && !session) {
      setSession(savedSession);
      setStatus('authenticated');
    } else if (!savedSession && session) {
      setSession(null);
      setStatus('unauthenticated');
    }

    console.log(
      '📊 useSession initialized - Status:',
      status,
      'Session:',
      session?.user?.name || 'None'
    );
  }, []);

  return {
    data: session,
    status,
    update: async (data?: any) => {
      if (data?.user) {
        currentMockSession = data;
        setSession(data);
        setStatus('authenticated');
        if (typeof window !== 'undefined') {
          localStorage.setItem('bell24h-session', JSON.stringify(data));
        }
      }
      return currentMockSession;
    },
  };
};

// **ENHANCED: Better signIn function with credential validation**
export const signIn = async (provider?: string, options?: any) => {
  console.log('Mock signIn called with provider:', provider, 'options:', options);

  if (provider === 'credentials' && options) {
    const { email, password, redirect = true } = options;

    // Validate credentials
    const user = demoUsers[email as keyof typeof demoUsers];
    if (!user || user.password !== password) {
      console.log('❌ Invalid credentials for:', email);
      return { ok: false, error: 'Invalid credentials' };
    }

    // Create session for authenticated user
    const newSession = createMockSession(user);
    currentMockSession = newSession;

    // Persist session
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell24h-session', JSON.stringify(newSession));
      console.log(
        '✅ Successfully signed in as:',
        newSession.user.name,
        '(Role:',
        newSession.user.role + ')'
      );

      // Handle redirect
      if (redirect !== false) {
        if (options?.callbackUrl) {
          setTimeout(() => {
            window.location.href = options.callbackUrl;
          }, 100);
        }
      }
    }

    return { ok: true, error: null, user: newSession.user };
  }

  // Default behavior for other providers
  console.log('❌ Unsupported provider or missing credentials');
  return { ok: false, error: 'Unsupported authentication method' };
};

// **ENHANCED: Better signOut function**
export const signOut = async (options?: any) => {
  console.log('Mock signOut called');

  // Clear session
  currentMockSession = null;

  // Clear persisted session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bell24h-session');
    console.log('✅ Successfully signed out');

    // Redirect if callback URL provided
    if (options?.callbackUrl) {
      setTimeout(() => {
        window.location.href = options.callbackUrl;
      }, 100);
    } else {
      // Go to homepage
      window.location.href = '/';
    }
  }

  return { ok: true };
};

// Fixed SessionProvider component - prevents hydration errors
export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, {}, children);
};

// Mock getSession function
export const getSession = async () => {
  if (typeof window !== 'undefined') {
    const savedSession = localStorage.getItem('bell24h-session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        localStorage.removeItem('bell24h-session');
      }
    }
  }
  return currentMockSession;
};

// Mock getCsrfToken function
export const getCsrfToken = async () => {
  return 'mock-csrf-token';
};

// Mock getProviders function
export const getProviders = async () => {
  return {
    credentials: {
      id: 'credentials',
      name: 'credentials',
      type: 'credentials',
    },
  };
};

// **NEW: Helper function to check authentication status**
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    const savedSession = localStorage.getItem('bell24h-session');
    return !!savedSession;
  }
  return !!currentMockSession;
};

// **NEW: Get current user info**
export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const savedSession = localStorage.getItem('bell24h-session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession).user;
      } catch (e) {
        return null;
      }
    }
  }
  return currentMockSession?.user || null;
};
