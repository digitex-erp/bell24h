import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface TemporalTrend {
  period: string;
  averagePerplexity: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  significantTerms: string[];
}

interface TemporalTrendsChartProps {
  trends: TemporalTrend[];
  title?: string;
  entityType: 'rfq' | 'bid' | 'product';
}

const getTrendIcon = (direction: string) => {
  switch (direction) {
    case 'increasing':
      return <TrendingUpIcon color="error" />;
    case 'decreasing':
      return <TrendingDownIcon color="success" />;
    default:
      return <TrendingFlatIcon color="info" />;
  }
};

const getChipColor = (direction: string) => {
  switch (direction) {
    case 'increasing':
      return 'error';
    case 'decreasing':
      return 'success';
    default:
      return 'info';
  }
};

const TemporalTrendsChart: React.FC<TemporalTrendsChartProps> = ({ 
  trends, 
  title = "Perplexity Trends Over Time",
  entityType
}) => {
  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No trend data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Get the latest trend for summary
  const latestTrend = trends[trends.length - 1];
  
  // Calculate the average and optimal perplexity range based on entity type
  const avgPerplexity = trends.reduce((sum, t) => sum + t.averagePerplexity, 0) / trends.length;
  
  // Different entity types have different optimal perplexity ranges
  const getOptimalRange = () => {
    switch (entityType) {
      case 'rfq':
        return { min: 40, max: 100 };
      case 'bid':
        return { min: 35, max: 85 };
      case 'product':
        return { min: 50, max: 120 };
      default:
        return { min: 40, max: 100 };
    }
  };
  
  const optimalRange = getOptimalRange();

  return (
    <Card>
      <CardHeader 
        title={title}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Latest trend:
            </Typography>
            <Chip 
              icon={getTrendIcon(latestTrend.trendDirection)}
              label={`${Math.abs(latestTrend.percentageChange).toFixed(1)}% ${latestTrend.trendDirection}`}
              color={getChipColor(latestTrend.trendDirection) as any}
              size="small"
            />
          </Box>
        } 
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={trends}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis domain={[0, 'dataMax + 30']} />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === 'averagePerplexity') {
                  return [`${value.toFixed(1)}`, 'Perplexity Score'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <ReferenceLine y={optimalRange.min} stroke="green" strokeDasharray="3 3" label="Optimal Min" />
            <ReferenceLine y={optimalRange.max} stroke="red" strokeDasharray="3 3" label="Optimal Max" />
            <Line
              type="monotone"
              dataKey="averagePerplexity"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Perplexity"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Key Terms in Latest Period
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {latestTrend.significantTerms.map((term, index) => (
              <Chip key={index} label={term} size="small" sx={{ mb: 1 }} />
            ))}
          </Stack>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {latestTrend.trendDirection === 'increasing' 
              ? 'Increasing complexity may indicate more detailed or technical communications.'
              : latestTrend.trendDirection === 'decreasing'
              ? 'Decreasing complexity suggests more streamlined, accessible communications.'
              : 'Stable complexity indicates consistent communication patterns.'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemporalTrendsChart;
