'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Monitor as MonitorIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface DashboardMetrics {
  totalUsers: number;
  totalSuppliers: number;
  totalBuyers: number;
  totalRFQs: number;
  totalTransactions: number;
  revenue: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  pendingApprovals: number;
  errorRate: number;
  responseTime: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  badge?: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Quick actions for admin
  const quickActions: QuickAction[] = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <PeopleIcon />,
      href: '/admin/users',
      color: 'primary',
      badge: metrics?.pendingApprovals,
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed analytics and reports',
      icon: <AnalyticsIcon />,
      href: '/admin/analytics',
      color: 'secondary',
    },
    {
      title: 'System Monitoring',
      description: 'Monitor system health and performance',
      icon: <MonitorIcon />,
      href: '/admin/monitoring',
      color: 'success',
    },
    {
      title: 'RFQ Management',
      description: 'Review and moderate RFQs',
      icon: <AssessmentIcon />,
      href: '/admin/rfqs',
      color: 'warning',
    },
    {
      title: 'Security Settings',
      description: 'Configure security and access controls',
      icon: <SecurityIcon />,
      href: '/admin/security',
      color: 'error',
    },
    {
      title: 'Notifications',
      description: 'Manage system notifications',
      icon: <NotificationsIcon />,
      href: '/admin/notifications',
      color: 'primary',
    },
  ];

  // Fetch dashboard metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/dashboard/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'error';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission={{ action: 'view', resource: 'admin-dashboard' }}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.name || 'Admin'}. Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Metrics">
                <IconButton onClick={fetchMetrics} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* System Health Status */}
          {metrics && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6">System Status</Typography>
                {getSystemHealthIcon(metrics.systemHealth)}
                <Chip
                  label={metrics.systemHealth.toUpperCase()}
                  color={getSystemHealthColor(metrics.systemHealth) as any}
                  size="small"
                />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Error Rate</Typography>
                  <Typography variant="h6" color={metrics.errorRate > 5 ? 'error' : 'success'}>
                    {metrics.errorRate.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Response Time</Typography>
                  <Typography variant="h6">{metrics.responseTime}ms</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Active Users</Typography>
                  <Typography variant="h6">{metrics.activeUsers}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Pending Approvals</Typography>
                  <Typography variant="h6" color="warning.main">
                    {metrics.pendingApprovals}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Key Metrics */}
          {metrics && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Users</Typography>
                        <Typography variant="h4">{metrics.totalUsers.toLocaleString()}</Typography>
                      </Box>
                      <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                        <Typography variant="h4">{formatCurrency(metrics.revenue)}</Typography>
                      </Box>
                      <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total RFQs</Typography>
                        <Typography variant="h4">{metrics.totalRFQs.toLocaleString()}</Typography>
                      </Box>
                      <AssessmentIcon color="secondary" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Transactions</Typography>
                        <Typography variant="h4">{metrics.totalTransactions.toLocaleString()}</Typography>
                      </Box>
                      <DashboardIcon color="info" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => router.push(action.href)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Badge badgeContent={action.badge} color="error">
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: `${action.color}.light`,
                              color: `${action.color}.main`,
                            }}
                          >
                            {action.icon}
                          </Box>
                        </Badge>
                        <Box>
                          <Typography variant="h6">{action.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activity feed will be displayed here showing recent user actions, system events, and alerts.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 