import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Props for analytics: expects an array of explanations (from history)
interface Feature {
  name: string;
  importance: number;
  direction?: 'positive' | 'negative' | 'neutral';
  value?: string | number;
}

interface ModelExplanation {
  id: string;
  timestamp: string;
  modelType: string;
  explainabilityType: 'shap' | 'lime';
  prediction: number | string;
  actualValue?: number | string;
  features: Feature[];
  metadata?: Record<string, any>;
  modelId?: string;
  instanceId?: string;
}

interface ExplainabilityAnalyticsProps {
  history: ModelExplanation[];
}

// Helper: aggregate feature importances across explanations
function aggregateFeatureImportances(history: ModelExplanation[]) {
  const featureMap: Record<string, { name: string; importances: number[] }> = {};
  history.forEach(exp => {
    exp.features.forEach(f => {
      if (!featureMap[f.name]) featureMap[f.name] = { name: f.name, importances: [] };
      featureMap[f.name].importances.push(f.importance);
    });
  });
  return Object.values(featureMap).map(f => ({
    name: f.name,
    avgImportance: f.importances.reduce((a, b) => a + b, 0) / f.importances.length,
    minImportance: Math.min(...f.importances),
    maxImportance: Math.max(...f.importances),
    count: f.importances.length
  }));
}

// Helper: trend of average importance per feature over time
function getFeatureTrends(history: ModelExplanation[]) {
  // For simplicity, group by day
  const trendMap: Record<string, Record<string, number[]>> = {};
  history.forEach(exp => {
    const day = exp.timestamp.split('T')[0];
    exp.features.forEach(f => {
      if (!trendMap[day]) trendMap[day] = {};
      if (!trendMap[day][f.name]) trendMap[day][f.name] = [];
      trendMap[day][f.name].push(f.importance);
    });
  });
  // Format for recharts
  return Object.entries(trendMap).map(([day, features]) => {
    const entry: any = { day };
    Object.entries(features).forEach(([fname, vals]) => {
      entry[fname] = vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    return entry;
  });
}

const ExplainabilityAnalytics: React.FC<ExplainabilityAnalyticsProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <Typography>No analytics available. Not enough explanation history.</Typography>;
  }

  const agg = aggregateFeatureImportances(history);
  const trends = getFeatureTrends(history);
  const featureNames = agg.map(f => f.name);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Explainability Analytics</Typography>
        <Box my={2}>
          <Typography variant="subtitle1">Average Feature Importance</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agg} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgImportance" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box my={2}>
          <Typography variant="subtitle1">Feature Importance Trends Over Time</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {featureNames.map(name => (
                <Line key={name} type="monotone" dataKey={name} stroke="#d32f2f" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExplainabilityAnalytics;
