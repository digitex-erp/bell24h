'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/dashboard/Dashboard';
import { Box, Container, CircularProgress } from '@mui/material';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login'); // Not authenticated
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Dashboard />
      </Box>
    </Container>
  );
}
