'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Stack
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useApi } from '@/hooks/useApi';
import { ApiStateHandler } from '@/components/ui/ApiStateHandler';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Types
interface AnalyticsData {
  transactions: {
    date: string;
    amount: number;
    count: number;
  }[];
  suppliers: {
    category: string;
    value: number;
  }[];
  performance: {
    metric: string;
    value: number;
    target: number;
  }[];
  risk: {
    level: string;
    count: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const { data, isLoading, error, refetch } = useApi<AnalyticsData>(
    ['analytics', timeRange],
    '/api/analytics',
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

  const handleExport = (format: 'csv' | 'pdf') => {
    setExportFormat(format);
    // Implement export logic
    handleMenuClose();
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    handleMenuClose();
  };

  const renderMetricCard = (title: string, value: number, target: number, unit: string = '') => (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value.toLocaleString()}{unit}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Target: {target.toLocaleString()}{unit}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '4px',
          background: value >= target ? '#4caf50' : '#f44336',
        }}
      />
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
          Analytics Dashboard
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
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
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
              {data.performance.map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.metric}>
                  {renderMetricCard(
                    metric.metric,
                    metric.value,
                    metric.target,
                    metric.metric.includes('Amount') ? ' ₹' : ''
                  )}
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Transaction Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.transactions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        name="Amount"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="count"
                        stroke="#82ca9d"
                        name="Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Supplier Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.suppliers}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.suppliers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.risk}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Number of Suppliers" />
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