'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';
import { hasPermission, Permission } from '@/utils/rbac';
import { Box, Typography, Button } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission: Permission;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading: isLoading, isAuthenticated } = useAuth(); // Renamed loading to isLoading for clarity if preferred
  const router = useRouter();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <Typography>Loading session...</Typography> {/* More specific loading message */}
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Session is resolved, and user is definitively not authenticated
    router.push('/login');
    return null; // Or a more explicit "Redirecting to login..." message
  }

  // At this point, isAuthenticated is true, so the user object should exist.
  // It's a good practice to still check if the user object itself is populated before accessing its properties.
  if (!user) {
    // This case implies an issue with how the session user data is populated or typed if isAuthenticated is true.
    console.error("ProtectedRoute: Contradiction - isAuthenticated is true, but user object is null/undefined. Check session population in NextAuth callbacks and type definitions (next-auth.d.ts).");
    // Optionally, redirect to an error page or login with an error indicator
    router.push('/login?error=session_data_missing');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="error">Session error. Redirecting to login...</Typography>
      </Box>
    );
  }

  const hasAccess = hasPermission(
    user.role,
    requiredPermission.action,
    requiredPermission.resource
  );

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Access Denied
        </Typography>
        <Typography>
          You don't have permission to access this resource.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
