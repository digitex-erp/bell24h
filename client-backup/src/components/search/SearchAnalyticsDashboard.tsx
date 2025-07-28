import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  useTheme,
  Tabs,
  Tab,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { searchAnalyticsService } from '../../services/search/SearchAnalyticsService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SearchAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState('searches');

  useEffect(() => {
    const loadStats = () => {
      setLoading(true);
      const analyticsStats = searchAnalyticsService.getSearchStats();
      setStats(analyticsStats);
      setLoading(false);
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const handleMetricChange = (event: any) => {
    setSelectedMetric(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const searchTypeData = [
    { name: 'Categories', value: stats.searchByType.category },
    { name: 'Subcategories', value: stats.searchByType.subcategory },
    { name: 'RFQs', value: stats.searchByType.rfq }
  ];

  // Generate time series data
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    searches: Math.floor(Math.random() * 100),
    results: Math.floor(Math.random() * 200),
    success: Math.floor(Math.random() * 80)
  }));

  // Generate heat map data
  const heatMapData = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      value: Math.floor(Math.random() * 100)
    }))
  ).flat();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Search Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Searches
              </Typography>
              <Typography variant="h4">
                {stats.totalSearches.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Results per Search
              </Typography>
              <Typography variant="h4">
                {stats.averageResultsPerSearch.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Search Success Rate
              </Typography>
              <Typography variant="h4">
                {((stats.mostSelectedResults.length / stats.totalSearches) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Search Time
              </Typography>
              <Typography variant="h4">
                {Math.floor(Math.random() * 5) + 1}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Search Trends" />
                <Tab label="Popular Searches" />
                <Tab label="Search Types" />
                <Tab label="Time Analysis" />
              </Tabs>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={handleTimeRangeChange}
                  >
                    <MenuItem value="day">Last 24 Hours</MenuItem>
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Metric</InputLabel>
                  <Select
                    value={selectedMetric}
                    label="Metric"
                    onChange={handleMetricChange}
                  >
                    <MenuItem value="searches">Searches</MenuItem>
                    <MenuItem value="results">Results</MenuItem>
                    <MenuItem value="success">Success Rate</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeSeriesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Search Query</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Avg. Results</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.mostPopularSearches.map((search: any) => (
                  <TableRow key={search.query}>
                    <TableCell component="th" scope="row">
                      {search.query}
                    </TableCell>
                    <TableCell align="right">{search.count}</TableCell>
                    <TableCell align="right">
                      {((search.count / stats.totalSearches) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      {Math.floor(Math.random() * 20) + 1}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={searchTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {searchTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={searchTypeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey="hour" name="Hour" />
                <YAxis type="number" dataKey="day" name="Day" />
                <ZAxis type="number" dataKey="value" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  data={heatMapData}
                  fill={theme.palette.primary.main}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Performance Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="searches"
                    stroke={theme.palette.primary.main}
                    name="Searches"
                  />
                  <Line
                    type="monotone"
                    dataKey="results"
                    stroke={theme.palette.secondary.main}
                    name="Results"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke={theme.palette.success.main}
                    name="Success Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SearchAnalyticsDashboard; 