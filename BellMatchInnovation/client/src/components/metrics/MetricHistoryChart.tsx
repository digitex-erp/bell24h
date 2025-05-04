import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { BusinessMetric, MetricHistoryPoint } from '../../hooks/use-procurement-context';

interface MetricHistoryChartProps {
  metric: BusinessMetric;
  height?: number;
  showTarget?: boolean;
  showGrid?: boolean;
  className?: string;
}

/**
 * Component for visualizing the history of a metric over time
 */
export const MetricHistoryChart: React.FC<MetricHistoryChartProps> = ({
  metric,
  height = 200,
  showTarget = true,
  showGrid = true,
  className = ''
}) => {
  // If there's no history or just one point, create a simple dataset
  const chartData = !metric.history || metric.history.length <= 1
    ? [
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), value: metric.value * 0.95 },
        { date: new Date(), value: metric.value }
      ]
    : [...metric.history].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Format the dates for display
  const formattedData = chartData.map(point => ({
    date: format(new Date(point.date), 'MMM d'),
    value: point.value,
    fullDate: point.date
  }));

  // Determine the color based on the trend
  const lineColor = metric.trend === 'up' 
    ? '#10b981' // green
    : metric.trend === 'down' 
      ? '#ef4444' // red
      : '#6366f1'; // purple/indigo for stable

  // Calculate Y-axis domain with some padding
  const values = formattedData.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || max * 0.1; // 10% padding, handling case where min=max
  
  const yDomain: [number, number] = [
    Math.max(0, min - padding), // Never go below 0
    max + padding
  ];

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />}
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }} 
            tickLine={false}
            axisLine={{ opacity: 0.3 }}
          />
          <YAxis 
            domain={yDomain}
            tick={{ fontSize: 11 }} 
            tickLine={false}
            axisLine={{ opacity: 0.3 }}
            tickFormatter={(value) => `${value}${metric.unit}`}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [`${value}${metric.unit}`, metric.name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor }}
            activeDot={{ r: 5 }}
            animationDuration={500}
          />
          
          {/* Show target reference line if requested and target exists */}
          {showTarget && metric.targetValue && (
            <ReferenceLine
              y={metric.targetValue}
              stroke="#9333ea" // purple
              strokeDasharray="3 3"
              label={{ 
                value: `Target: ${metric.targetValue}${metric.unit}`,
                position: 'insideBottomRight',
                fill: '#9333ea',
                fontSize: 10
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricHistoryChart;