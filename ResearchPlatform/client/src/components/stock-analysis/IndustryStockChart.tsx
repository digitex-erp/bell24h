import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IndustryStockAnalysis } from '../../../../shared/stock-analysis.types';

interface IndustryStockChartProps {
  data: IndustryStockAnalysis;
}

export default function IndustryStockChart({ data }: IndustryStockChartProps) {
  const chartData = useMemo(() => {
    // Combine top and worst performers into a single dataset for chart
    const combined = [
      ...data.topPerformers.map(performer => ({
        ...performer,
        performanceType: 'Top Performer'
      })),
      ...data.worstPerformers.map(performer => ({
        ...performer,
        performanceType: 'Worst Performer'
      }))
    ];
    
    // Sort by change percent to create a nice visual flow
    return combined.sort((a, b) => b.changePercent - a.changePercent);
  }, [data]);
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="symbol" 
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            label={{ value: 'Change %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(2)}%`, 
              props.payload.performanceType
            ]}
            labelFormatter={(label) => {
              const item = chartData.find(item => item.symbol === label);
              return `${item?.symbol} - ${item?.name}`;
            }}
          />
          <Legend />
          <Bar 
            dataKey="changePercent" 
            name="Performance" 
            fill={(entry) => {
              // Color bars based on positive/negative performance
              return entry.changePercent >= 0 ? '#10b981' : '#ef4444';
            }}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}