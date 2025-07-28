'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useApi } from '@/hooks/useApi';
import { ApiStateHandler } from '@/components/ui/ApiStateHandler';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Types
interface PerformanceData {
  kpis: {
    metric: string;
    value: number;
    target: number;
    trend: number;
    unit: string;
  }[];
  trends: {
    date: string;
    efficiency: number;
    quality: number;
    cost: number;
  }[];
  distribution: {
    category: string;
    value: number;
  }[];
  comparisons: {
    metric: string;
    current: number;
    previous: number;
    change: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PerformanceMetrics = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const { data, isLoading, error, refetch } = useApi<PerformanceData>(
    ['performance', timeRange],
    '/api/performance',
    {
      timeout: 5000,
      retries: 2,
      queryOptions: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retryOnMount: true,
      },
    }
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    handleMenuClose();
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === '₹') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(value);
    }
    return value.toLocaleString();
  };

  const renderKpiCard = (kpi: PerformanceData['kpis'][0]) => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {kpi.metric}
      </Typography>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {formatValue(kpi.value, kpi.unit)}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {kpi.trend > 0 ? (
          <TrendingUpIcon color="success" />
        ) : (
          <TrendingDownIcon color="error" />
        )}
        <Typography
          variant="body2"
          color={kpi.trend > 0 ? 'success.main' : 'error.main'}
        >
          {Math.abs(kpi.trend)}% vs target
        </Typography>
      </Stack>
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={(kpi.value / kpi.target) * 100}
          color={kpi.value >= kpi.target ? 'success' : 'error'}
        />
        <Typography variant="caption" color="text.secondary">
          Target: {formatValue(kpi.target, kpi.unit)}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Performance Metrics
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleTimeRangeChange('7d')}>Last 7 Days</MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('30d')}>Last 30 Days</MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('90d')}>Last 90 Days</MenuItem>
            <MenuItem onClick={handleMenuClose}>Export as CSV</MenuItem>
            <MenuItem onClick={handleMenuClose}>Export as PDF</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <ApiStateHandler
        isLoading={isLoading}
        error={error}
        retry={refetch}
        loadingComponent={<LoadingSpinner />}
      >
        {data && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {data.kpis.map((kpi) => (
                <Grid item xs={12} sm={6} md={3} key={kpi.metric}>
                  {renderKpiCard(kpi)}
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#8884d8"
                        name="Efficiency"
                      />
                      <Line
                        type="monotone"
                        dataKey="quality"
                        stroke="#82ca9d"
                        name="Quality"
                      />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        stroke="#ffc658"
                        name="Cost"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.distribution}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.comparisons}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="current" fill="#8884d8" name="Current Period" />
                      <Bar dataKey="previous" fill="#82ca9d" name="Previous Period" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </ApiStateHandler>
    </Box>
  );
}; 