import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Settings,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PredictiveAnalyticsDashboardProps {
  metrics: string[];
  onRefresh: () => void;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({ metrics, onRefresh }) => {
  const { user } = useAuth();
  const { dashboardTemplates, loadTemplate } = useDashboard();
  const [activeTab, setActiveTab] = useState('predictions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [trendAnalyses, setTrendAnalyses] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load predictions and trend analyses
      const [predictionsResponse, trendAnalysesResponse] = await Promise.all([
        fetch('/api/analytics/predictions'),
        fetch('/api/analytics/trends'),
      ]);

      if (!predictionsResponse.ok || !trendAnalysesResponse.ok) {
        throw new Error('Failed to load analytics data');
      }

      const [predictionsData, trendAnalysesData] = await Promise.all([
        predictionsResponse.json(),
        trendAnalysesResponse.json(),
      ]);

      setPredictions(predictionsData.data);
      setTrendAnalyses(trendAnalysesData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: string; index: string }) => {
    return value === index ? <Box>{children}</Box> : null;
  };

  const renderPredictionChart = (metric: string) => {
    const metricPredictions = predictions.filter(p => p.metric === metric);
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={metricPredictions}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={(timestamp: number) => format(new Date(timestamp), 'MMM d')} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2196F3" />
          <Line type="monotone" dataKey="predicted" stroke="#FF9800" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderTrendAnalysis = (analysis: any) => {
    const trendIcon = analysis.trend === 'up' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
    
    return (
      <Card key={analysis.id} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {analysis.metric}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {analysis.period} trend: {trendIcon} {analysis.trend}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Magnitude: {analysis.magnitude.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Confidence: {analysis.confidence.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Key Factors:
          </Typography>
          {analysis.factors.map((factor: any) => (
            <Typography key={factor.factor} variant="body2" color="text.secondary">
              - {factor.factor}: {factor.impact.toFixed(1)}% impact
            </Typography>
          ))}
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => handleRefreshAnalysis(analysis.id)}>
            Refresh
          </Button>
        </CardActions>
      </Card>
    );
  };

  const handleRefreshAnalysis = async (analysisId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/trends/${analysisId}/refresh`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh analysis');
      }

      const data = await response.json();
      setTrendAnalyses(trendAnalyses.map(t => 
        t.id === analysisId ? data : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analysis');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'predictions':
        return (
          <Grid container spacing={3}>
            {metrics.map((metric) => (
              <Grid item xs={12} md={6} key={metric}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {metric} Prediction
                  </Typography>
                  {renderPredictionChart(metric)}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => handleRefreshAnalysis(metric)}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        );

      case 'trends':
        return (
          <Grid container spacing={3}>
            {trendAnalyses.map((analysis) => (
              <Grid item xs={12} md={6} key={analysis.id}>
                {renderTrendAnalysis(analysis)}
              </Grid>
            ))}
          </Grid>
        );

      case 'models':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Prediction Models
            </Typography>
            <Grid container spacing={3}>
              {dashboardTemplates.map((template) => (
                <Grid item xs={12} md={6} key={template.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accuracy: {template.accuracy.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Trained: {format(new Date(template.lastTrained), 'MMM d, yyyy')}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => loadTemplate(template.id)}>
                        Load
                      </Button>
                      <Button size="small" onClick={() => handleRefreshModel(template.id)}>
                        Refresh
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleRefreshModel = async (modelId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/models/${modelId}/refresh`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh model');
      }

      await loadAnalyticsData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Predictive Analytics Dashboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab value="predictions" label="Predictions" />
        <Tab value="trends" label="Trend Analysis" />
        <Tab value="models" label="Models" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderTabContent()
      )}
    </Paper>
  );
};

export default PredictiveAnalyticsDashboard;
