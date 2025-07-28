'use client';

import { ReactNode, useEffect, useState, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, AuthContext } from '@/providers/AuthProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import CopilotWrapper from '@/providers/copilot';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth wrapper to handle protected routes
function AuthConsumer({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  // Access auth context safely
  const { isAuthenticated = false, isLoading = true } = useContext(AuthContext) || {};

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/about', '/contact', '/privacy', '/terms'];
  const isPublicRoute = publicRoutes.includes(pathname || '');

  // Always render children for public routes
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // Show loading state if still checking auth or not client-side yet
  if (isLoading || !isClient) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated and not on a public route
  if (!isAuthenticated) {
    if (isClient) {
      router.push('/login');
    }
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
            <CopilotWrapper>
              <AuthConsumer>
                {children}
              </AuthConsumer>
              <ReactQueryDevtools initialIsOpen={false} />
            </CopilotWrapper>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export { AppLayout };
