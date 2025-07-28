import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [category, setCategory] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [groupBy, setGroupBy] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');

  // Fetch analytics data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;
      const result = await analyticsService.getAnalytics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: category || undefined,
        action: action || undefined,
        groupBy: groupBy || undefined
      });
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const handleExport = async () => {
    try {
      const [startDate, endDate] = dateRange;
      const exportData = await analyticsService.exportData(
        {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          category: category || undefined,
          action: action || undefined,
          groupBy: groupBy || undefined
        },
        exportFormat
      );

      // Create and download file
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export.${exportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, [dateRange, category, action, groupBy]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('analytics.dashboard')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <DatePicker
                label={t('analytics.startDate')}
                value={dateRange[0]}
                onChange={(date) => setDateRange([date, dateRange[1]])}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label={t('analytics.endDate')}
                value={dateRange[1]}
                onChange={(date) => setDateRange([dateRange[0], date])}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('analytics.category')}</InputLabel>
                <Select
                  value={category}
                  label={t('analytics.category')}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {data?.aggregations?.byCategory?.map((item: any) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item._id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('analytics.action')}</InputLabel>
                <Select
                  value={action}
                  label={t('analytics.action')}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {data?.aggregations?.byAction?.map((item: any) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item._id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('analytics.groupBy')}</InputLabel>
                <Select
                  value={groupBy}
                  label={t('analytics.groupBy')}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <MenuItem value="">{t('common.none')}</MenuItem>
                  <MenuItem value="category">{t('analytics.category')}</MenuItem>
                  <MenuItem value="action">{t('analytics.action')}</MenuItem>
                  <MenuItem value="userId">{t('analytics.user')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.totalEvents')}
              </Typography>
              <Typography variant="h3">{data?.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.uniqueUsers')}
              </Typography>
              <Typography variant="h3">
                {data?.aggregations?.byUser?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.categories')}
              </Typography>
              <Typography variant="h3">
                {data?.aggregations?.byCategory?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Time Series Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.timeline')}
              </Typography>
              <LineChart
                width={800}
                height={300}
                data={data?.aggregations?.byTime}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.categoryDistribution')}
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={data?.aggregations?.byCategory}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data?.aggregations?.byCategory?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.actionDistribution')}
              </Typography>
              <BarChart
                width={1200}
                height={300}
                data={data?.aggregations?.byAction}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Controls */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl sx={{ mr: 2, minWidth: 120 }}>
          <InputLabel>{t('analytics.exportFormat')}</InputLabel>
          <Select
            value={exportFormat}
            label={t('analytics.exportFormat')}
            onChange={(e) => setExportFormat(e.target.value as any)}
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="excel">Excel</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleExport}>
          {t('analytics.export')}
        </Button>
      </Box>
    </Box>
  );
}; 