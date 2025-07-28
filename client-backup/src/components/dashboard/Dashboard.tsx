'use client';

import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/utils/rbac';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SupplierRiskDashboard } from './SupplierRiskDashboard';
import { TransactionMonitoring } from './TransactionMonitoring';
import { PerformanceMetrics } from './PerformanceMetrics';
import { Grid, Paper, Typography, Button, Box } from '@mui/material';
import { People as PeopleIcon, Person as PersonIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const canViewAnalytics = hasPermission(user?.role, 'view', 'analytics');
  const canViewSupplierRisk = hasPermission(user?.role, 'view', 'supplier-risk');
  const canViewTransactions = hasPermission(user?.role, 'view', 'transactions');
  const canViewPerformance = hasPermission(user?.role, 'view', 'performance');
  const isAdmin = user?.role === 'admin';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => router.push('/profile')}
            >
              Profile
            </Button>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => router.push('/admin/users')}
              >
                Manage Users
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>

      {canViewAnalytics && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analytics Dashboard
            </Typography>
            <AnalyticsDashboard />
          </Paper>
        </Grid>
      )}

      {canViewSupplierRisk && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Supplier Risk
            </Typography>
            <SupplierRiskDashboard />
          </Paper>
        </Grid>
      )}

      {canViewTransactions && (
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Monitoring
            </Typography>
            <TransactionMonitoring />
          </Paper>
        </Grid>
      )}

      {canViewPerformance && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <PerformanceMetrics />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
