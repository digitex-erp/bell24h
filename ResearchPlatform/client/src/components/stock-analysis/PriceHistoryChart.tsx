import { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { PriceHistoryResponse } from '../../../../shared/stock-analysis.types';

interface PriceHistoryChartProps {
  data: PriceHistoryResponse;
}

export default function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    // Convert dates to readable format and ensure all required fields
    return data.data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
      // Calculate the daily change
      dailyChange: item.changePercent
    }));
  }, [data]);
  
  // Calculate min and max for y-axis
  const minValue = useMemo(() => {
    const prices = data.data.map(item => item.low);
    return Math.floor(Math.min(...prices) * 0.98); // Add 2% padding
  }, [data]);
  
  const maxValue = useMemo(() => {
    const prices = data.data.map(item => item.high);
    return Math.ceil(Math.max(...prices) * 1.02); // Add 2% padding
  }, [data]);
  
  const overallPositive = data.overallChangePercent >= 0;
  
  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={60}
            tickMargin={10}
          />
          <YAxis 
            domain={[minValue, maxValue]}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'price') return [`$${value.toFixed(2)}`, 'Close Price'];
              if (name === 'dailyChange') return [`${value.toFixed(2)}%`, 'Daily Change'];
              return [value, name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          
          <Area
            type="monotone"
            dataKey="close"
            name="price"
            stroke={overallPositive ? "#10b981" : "#ef4444"}
            fill={overallPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Volume Chart */}
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={chartData}
          margin={{
            top: 0,
            right: 30,
            left: 20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
          <XAxis 
            dataKey="date" 
            hide={true}
          />
          <YAxis 
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
            width={60}
            orientation="right"
            axisLine={false}
            tickLine={false}
            label={{ value: 'Volume', position: 'insideRight', offset: 0, angle: 90 }}
          />
          <Tooltip 
            formatter={(value: number) => {
              if (value >= 1000000) return [`${(value / 1000000).toFixed(2)}M`, 'Volume'];
              if (value >= 1000) return [`${(value / 1000).toFixed(2)}K`, 'Volume'];
              return [value, 'Volume'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar 
            dataKey="volume" 
            fill="#6366f1"
            opacity={0.7}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}