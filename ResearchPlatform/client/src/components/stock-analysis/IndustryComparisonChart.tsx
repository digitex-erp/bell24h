import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { IndustryComparisonItem } from '../../../../shared/stock-analysis.types';

interface IndustryComparisonChartProps {
  data: IndustryComparisonItem[];
}

export default function IndustryComparisonChart({ data }: IndustryComparisonChartProps) {
  const chartData = useMemo(() => {
    // Sort by performance to create a better visual
    return [...data].sort((a, b) => b.performance - a.performance);
  }, [data]);
  
  // Custom color logic based on performance
  const getBarColor = (performance: number) => {
    if (performance >= 5) return '#10b981'; // Strong positive - green
    if (performance > 0) return '#34d399';  // Positive - light green
    if (performance > -5) return '#f87171'; // Mild negative - light red
    return '#ef4444';                       // Strong negative - red
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          label={{ value: 'Performance (%)', position: 'insideBottom', offset: -10 }}
        />
        <YAxis 
          dataKey="industry" 
          type="category"
          width={120}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'performance') return [`${value.toFixed(2)}%`, 'Performance'];
            if (name === 'volatility') return [value.toFixed(2), 'Volatility'];
            return [value, name];
          }}
          labelFormatter={(label) => {
            const item = chartData.find(item => item.industry === label);
            return `${item?.industry}`;
          }}
        />
        <Legend />
        <Bar 
          dataKey="performance" 
          name="Performance" 
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.performance)} />
          ))}
        </Bar>
        <Bar 
          dataKey="volatility" 
          name="Volatility" 
          fill="#6366f1"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}