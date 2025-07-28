import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import { Card, CardHeader, CardContent, Typography, Box, Chip, Stack, Grid } from '@mui/material';

interface MarketSegment {
  id: string;
  name: string;
  size: number;
  averagePerplexity: number;
  averageDealSize?: number;
  keyTerms: string[];
  growthRate?: number;
}

interface MarketSegmentationChartProps {
  segments: MarketSegment[];
  title?: string;
}

const MarketSegmentationChart: React.FC<MarketSegmentationChartProps> = ({
  segments,
  title = "Market Segmentation Analysis"
}) => {
  if (!segments || segments.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No market segmentation data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Transform segment data for the scatter plot
  const scatterData = segments.map((segment) => ({
    name: segment.name,
    perplexity: segment.averagePerplexity,
    dealSize: segment.averageDealSize || 5000, // Default value if not provided
    size: segment.size,
    growthRate: segment.growthRate || 0
  }));

  // Calculate the total market size
  const totalMarketSize = segments.reduce((total, segment) => total + segment.size, 0);

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="perplexity" 
                  name="Perplexity" 
                  unit=""
                  label={{ value: 'Avg. Perplexity', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="dealSize" 
                  name="Deal Size" 
                  unit="$"
                  label={{ value: 'Avg. Deal Size ($)', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="size" 
                  range={[60, 400]} 
                  name="Segment Size"
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'perplexity') return [`${value.toFixed(1)}`, 'Perplexity Score'];
                    if (name === 'dealSize') return [`$${value.toLocaleString()}`, 'Avg. Deal Size'];
                    if (name === 'size') return [`${value}`, 'Segment Size'];
                    return [value, name];
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Legend />
                {segments.map((segment, index) => (
                  <Scatter
                    key={segment.id}
                    name={segment.name}
                    data={[scatterData[index]]}
                    fill={getSegmentColor(index)}
                  >
                    <LabelList dataKey="name" position="top" />
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Segment Breakdown
              </Typography>
              {segments.map((segment, index) => (
                <Box key={segment.id} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {segment.name}
                    </Typography>
                    <Chip 
                      label={`${Math.round((segment.size / totalMarketSize) * 100)}%`} 
                      size="small"
                      sx={{ 
                        bgcolor: getSegmentColor(index), 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {segment.growthRate && segment.growthRate > 0 
                      ? `Growing at ${(segment.growthRate * 100).toFixed(1)}%` 
                      : 'Stable segment'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {segment.keyTerms.slice(0, 3).map((term, i) => (
                      <Chip 
                        key={i} 
                        label={term} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Larger bubbles represent bigger market segments. High perplexity combined with high deal size often indicates specialized technical segments where expertise is valued.
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Business Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getInsights(segments)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getSegmentColor = (index: number): string => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  return colors[index % colors.length];
};

const getInsights = (segments: MarketSegment[]): string => {
  // Find high-value segments (high growth rate or large deal size)
  const highValueSegments = segments.filter(
    (s) => (s.growthRate && s.growthRate > 0.15) || (s.averageDealSize && s.averageDealSize > 50000)
  );
  
  if (highValueSegments.length > 0) {
    const names = highValueSegments.map(s => s.name).join(' and ');
    return `The ${names} segment${highValueSegments.length > 1 ? 's' : ''} represent high-value opportunities. Consider tailoring communications with appropriate complexity levels for each segment.`;
  }
  
  // Find the largest segment
  const largestSegment = segments.reduce(
    (max, segment) => segment.size > max.size ? segment : max, 
    segments[0]
  );
  
  return `${largestSegment.name} is your largest market segment. Optimize communications with a perplexity level of ${Math.round(largestSegment.averagePerplexity)} to match this segment's preferences.`;
};

export default MarketSegmentationChart;
