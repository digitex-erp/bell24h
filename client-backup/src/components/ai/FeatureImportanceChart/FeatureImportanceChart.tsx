import React from 'react';
import { Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Interface for feature importance data (ensure this matches the one in ExplainabilityPanel)
interface FeatureImportance {
  name: string;
  value: number;
  originalValue?: string | number;
}

interface FeatureImportanceChartProps {
  features: FeatureImportance[];
  title?: string;
}

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ features, title = 'Feature Importances' }) => {
  const theme = useTheme();

  if (!features || features.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <Typography>No feature importance data to display.</Typography>
      </Paper>
    );
  }

  // Ensure features are sorted by name for consistent Y-axis ordering, or by value if preferred for chart
  // For this horizontal bar chart, sorting by value (descending absolute) is often good.
  // The parent ExplainabilityPanel already sorts by absolute value, so we can use it directly.
  // const sortedFeatures = [...features].sort((a, b) => b.value - a.value); // Or by name: a.name.localeCompare(b.name)
  const chartData = features.map(f => ({ ...f, name: f.name.length > 30 ? `${f.name.substring(0,27)}...` : f.name })); // Truncate long names for Y-axis

  const chartHeight = 60 + chartData.length * 35; // Base height + per feature height

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }} data-testid="feature-importance-chart">
      <Typography variant="h6" gutterBottom textAlign="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }} // Increased left margin for YAxis labels
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={['auto', 'auto']} tickFormatter={(tick) => tick.toFixed(3)} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150} // Adjust width based on expected label length
            interval={0} // Show all ticks
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string, props) => {
              const originalFeature = features.find(f => f.name === props.payload.name || `${f.name.substring(0,27)}...` === props.payload.name);
              let tooltipLabel = `${props.payload.name}: ${value.toFixed(4)}`;
              if (originalFeature && originalFeature.originalValue !== undefined) {
                tooltipLabel += ` (Actual: ${originalFeature.originalValue})`;
              }
              return [tooltipLabel, null]; // Second element is label for value, null hides it
            }}
            labelFormatter={(label) => features.find(f => f.name === label || `${f.name.substring(0,27)}...` === label)?.name || label} // Show full name in tooltip title
          />
          <Legend />
          <Bar dataKey="value" name="Importance Score" data-testid="feature-bar">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? theme.palette.success.main : theme.palette.error.main} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default FeatureImportanceChart;
