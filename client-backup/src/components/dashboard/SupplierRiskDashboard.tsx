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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApi } from '@/hooks/useApi';
import { ApiStateHandler } from '@/components/ui/ApiStateHandler';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Types
interface RiskData {
  overallRisk: {
    score: number;
    level: string;
    trend: 'up' | 'down' | 'stable';
  };
  riskFactors: {
    category: string;
    score: number;
    weight: number;
  }[];
  supplierDistribution: {
    riskLevel: string;
    count: number;
    percentage: number;
  }[];
  recentAlerts: {
    id: string;
    supplier: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    date: string;
    status: 'open' | 'resolved';
  }[];
}

const RISK_COLORS = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  stable: '#2196f3'
};

export const SupplierRiskDashboard = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const { data, isLoading, error, refetch } = useApi<RiskData>(
    ['supplier-risk', timeRange],
    '/api/supplier-risk',
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

  const getRiskColor = (level: string) => {
    return RISK_COLORS[level.toLowerCase() as keyof typeof RISK_COLORS] || '#757575';
  };

  const renderRiskScore = (score: number, level: string) => (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h3" component="div" sx={{ mb: 1 }}>
        {score}
      </Typography>
      <Chip
        label={level.toUpperCase()}
        sx={{
          backgroundColor: getRiskColor(level),
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    </Box>
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
          Supplier Risk Dashboard
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
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Overall Risk Score
                  </Typography>
                  {renderRiskScore(data.overallRisk.score, data.overallRisk.level)}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trend: {data.overallRisk.trend}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Factors
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={data.riskFactors}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Risk Score"
                        dataKey="score"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Supplier Risk Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.supplierDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="riskLevel" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#8884d8"
                        name="Number of Suppliers"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Risk Alerts
                  </Typography>
                  <Stack spacing={2}>
                    {data.recentAlerts.map((alert) => (
                      <Paper
                        key={alert.id}
                        sx={{
                          p: 2,
                          borderLeft: `4px solid ${getRiskColor(alert.severity)}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {alert.supplier}
                          </Typography>
                          <Chip
                            size="small"
                            label={alert.severity}
                            sx={{
                              backgroundColor: getRiskColor(alert.severity),
                              color: 'white',
                            }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {alert.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.date).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </ApiStateHandler>
    </Box>
  );
}; 