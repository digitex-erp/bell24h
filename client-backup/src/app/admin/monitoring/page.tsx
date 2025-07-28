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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Monitor as MonitorIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  uptime: number;
  errorRate: number;
  responseTime: number;
  throughput: number;
}

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  service: string;
  stack?: string;
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  errorRate: number;
  throughput: number;
  cpu: number;
  memory: number;
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError('');

      const [healthResponse, metricsResponse, logsResponse, performanceResponse] = await Promise.all([
        fetch('/api/admin/monitoring/health'),
        fetch('/api/admin/monitoring/server-metrics'),
        fetch(`/api/admin/monitoring/error-logs?timeRange=${timeRange}`),
        fetch(`/api/admin/monitoring/performance?timeRange=${timeRange}`),
      ]);

      if (!healthResponse.ok || !metricsResponse.ok || !logsResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const [health, metrics, logs, performance] = await Promise.all([
        healthResponse.json(),
        metricsResponse.json(),
        logsResponse.json(),
        performanceResponse.json(),
      ]);

      setSystemHealth(health);
      setServerMetrics(metrics);
      setErrorLogs(logs);
      setPerformanceData(performance);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load monitoring data');
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Refresh data every 10 seconds
    const interval = setInterval(fetchMonitoringData, 10000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getErrorLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
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
    <ProtectedRoute requiredPermission={{ action: 'view', resource: 'monitoring' }}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                System Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="1h">Last Hour</MenuItem>
                  <MenuItem value="6h">Last 6 Hours</MenuItem>
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchMonitoringData} disabled={loading}>
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
          {systemHealth && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h6">System Health</Typography>
                {getStatusIcon(systemHealth.status)}
                <Chip
                  label={systemHealth.status.toUpperCase()}
                  color={getStatusColor(systemHealth.status) as any}
                  size="small"
                />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {formatUptime(systemHealth.uptime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={systemHealth.errorRate > 5 ? 'error' : 'success'}>
                      {systemHealth.errorRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Error Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {systemHealth.responseTime}ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Response Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">
                      {systemHealth.throughput}/s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Throughput
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Server Metrics */}
          {serverMetrics && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <SpeedIcon color="primary" />
                      <Typography variant="h6">CPU Usage</Typography>
                    </Box>
                    <Typography variant="h4" color={serverMetrics.cpu > 80 ? 'error' : 'primary'}>
                      {serverMetrics.cpu}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={serverMetrics.cpu}
                      color={serverMetrics.cpu > 80 ? 'error' : 'primary'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <MemoryIcon color="secondary" />
                      <Typography variant="h6">Memory Usage</Typography>
                    </Box>
                    <Typography variant="h4" color={serverMetrics.memory > 80 ? 'error' : 'secondary'}>
                      {serverMetrics.memory}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={serverMetrics.memory}
                      color={serverMetrics.memory > 80 ? 'error' : 'secondary'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <StorageIcon color="success" />
                      <Typography variant="h6">Disk Usage</Typography>
                    </Box>
                    <Typography variant="h4" color={serverMetrics.disk > 80 ? 'error' : 'success'}>
                      {serverMetrics.disk}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={serverMetrics.disk}
                      color={serverMetrics.disk > 80 ? 'error' : 'success'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <NetworkIcon color="info" />
                      <Typography variant="h6">Network</Typography>
                    </Box>
                    <Typography variant="h4" color="info.main">
                      {serverMetrics.network}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={serverMetrics.network}
                      color="info"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Performance Charts */}
          {performanceData.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Response Time Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Error Rate Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="errorRate" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Error Logs */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Error Logs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errorLogs.slice(0, 10).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.level.toUpperCase()}
                          color={getErrorLevelColor(log.level) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.service}</TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <TimelineIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 