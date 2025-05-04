import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants';
import { ExportDialog } from '@/components/export/export-dialog';

// Simple SVG chart based on the design reference
const MarketTrendChart = ({ data }: { data: any }) => {
  if (!data || !data.points || data.points.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p className="text-sm">No market trend data available</p>
      </div>
    );
  }

  const points = data.points;
  const maxValue = Math.max(...points.map((p: any) => p.value));
  const minValue = Math.min(...points.map((p: any) => p.value));
  const range = maxValue - minValue;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Create SVG path
  let pathD = '';
  let areaPathD = '';
  
  points.forEach((point: any, index: number) => {
    const x = (index / (points.length - 1)) * 600;
    const y = 180 - ((point.value - minValue) / range) * 140;
    
    if (index === 0) {
      pathD += `M${x},${y}`;
      areaPathD += `M${x},${y}`;
    } else {
      // Using a simple cubic bezier for smooth curve
      const prevPoint = points[index - 1];
      const prevX = ((index - 1) / (points.length - 1)) * 600;
      const prevY = 180 - ((prevPoint.value - minValue) / range) * 140;
      
      const cpX1 = prevX + (x - prevX) / 3;
      const cpX2 = prevX + 2 * (x - prevX) / 3;
      
      pathD += ` C${cpX1},${prevY} ${cpX2},${y} ${x},${y}`;
      areaPathD += ` C${cpX1},${prevY} ${cpX2},${y} ${x},${y}`;
    }
  });
  
  // Complete the area path
  areaPathD += ` L600,180 L0,180 Z`;

  return (
    <div className="w-full h-full px-2 py-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{data.title || 'Price Index'}</h4>
        <div className={`text-xs ${data.changeDirection === 'up' ? 'text-success-600' : 'text-danger-600'} flex items-center`}>
          <i className={`fas fa-arrow-${data.changeDirection} mr-1`}></i>
          <span>{data.changeText || `${data.changeValue}% this month`}</span>
        </div>
      </div>
      <div className="relative h-[180px]">
        <div className="absolute inset-0">
          <svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.5)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
              </linearGradient>
            </defs>
            <path d={pathD} stroke={CHART_COLORS.PRIMARY} strokeWidth="3" fill="none" />
            <path d={areaPathD} fill="url(#lineGradient)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1">
          {data.labels ? (
            data.labels.map((label: string, index: number) => (
              <span key={index}>{label}</span>
            ))
          ) : (
            months.slice(0, 6).map((month, index) => (
              <span key={index}>{month}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const MarketInsights = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  
  // Fetch market insights data
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['/api/market-insights', { timeframe }],
    refetchOnWindowFocus: false,
  });
  
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };
  
  // Prepare data for export in a structured format
  const prepareMarketDataForExport = () => {
    if (!insightsData) return [];
    
    const exportData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    
    // Add chart data points
    if (insightsData.chartData && insightsData.chartData.points) {
      insightsData.chartData.points.forEach((point: any, index: number) => {
        // Create a date based on the timeframe
        let date;
        if (timeframe === 'daily') {
          date = new Date(today);
          date.setDate(today.getDate() - (insightsData.chartData.points.length - index - 1));
        } else if (timeframe === 'weekly') {
          date = new Date(today);
          date.setDate(today.getDate() - (insightsData.chartData.points.length - index - 1) * 7);
        } else {
          // Monthly
          date = new Date(today);
          date.setMonth(today.getMonth() - (insightsData.chartData.points.length - index - 1));
        }
        
        exportData.push({
          date: date.toISOString().split('T')[0],
          metric: insightsData.chartData.title || 'Price Index',
          value: point.value,
          change: point.change || (index > 0 ? (point.value - insightsData.chartData.points[index-1].value) : 0),
          forecast: ''
        });
      });
    }
    
    // Add price forecast
    if (insightsData.priceChange) {
      exportData.push({
        date: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0],
        metric: 'Price Forecast',
        value: '',
        change: insightsData.priceChange,
        forecast: 'Yes'
      });
    }
    
    // Add supply chain status
    if (insightsData.supplyStatus) {
      exportData.push({
        date: insightsData.supplyTimeframe || new Date(today.getFullYear(), today.getMonth() + 3, 1).toISOString().split('T')[0],
        metric: 'Supply Chain',
        value: insightsData.supplyStatus,
        change: '',
        forecast: 'Yes'
      });
    }
    
    // Add market events
    if (insightsData.events && insightsData.events.length > 0) {
      insightsData.events.forEach((event: any) => {
        exportData.push({
          date: typeof event.date === 'string' ? event.date : new Date().toISOString().split('T')[0],
          metric: 'Market Event',
          value: event.description,
          change: event.impact || '',
          forecast: 'No'
        });
      });
    }
    
    return exportData;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Market Insights</h2>
          <p className="text-sm text-gray-500">Real-time trends for your industry</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className={`text-sm ${timeframe === 'daily' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'} px-2 py-1 rounded hover:bg-gray-100`}
            onClick={() => handleTimeframeChange('daily')}
          >
            Daily
          </button>
          <button 
            className={`text-sm ${timeframe === 'weekly' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'} px-2 py-1 rounded hover:bg-gray-100`}
            onClick={() => handleTimeframeChange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`text-sm ${timeframe === 'monthly' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'} px-2 py-1 rounded hover:bg-gray-100`}
            onClick={() => handleTimeframeChange('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="chart-container mb-6" id="marketTrendsChart">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="text-sm">Loading market trend data...</p>
            </div>
          ) : (
            <MarketTrendChart data={insightsData?.chartData} />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600">Price Forecast</h4>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {isLoading ? '...' : (insightsData?.priceChange || '+2.8%')}
                </p>
                <p className="text-xs text-gray-500">
                  {isLoading ? '...' : (insightsData?.priceTimeframe || 'Next 30 days')}
                </p>
              </div>
              <div className="text-success-500 text-xl">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600">Supply Chain</h4>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {isLoading ? '...' : (insightsData?.supplyStatus || 'Stable')}
                </p>
                <p className="text-xs text-gray-500">
                  {isLoading ? '...' : (insightsData?.supplyTimeframe || 'Q3 2025')}
                </p>
              </div>
              <div className="text-primary-500 text-xl">
                <i className="fas fa-truck"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Related Market Events</h4>
          
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex items-start space-x-3 animate-pulse">
                <span className="text-gray-300 mt-0.5"><i className="fas fa-circle"></i></span>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="flex items-start space-x-3 animate-pulse">
                <span className="text-gray-300 mt-0.5"><i className="fas fa-circle"></i></span>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {(insightsData?.events || []).length === 0 ? (
                <li className="text-center text-gray-500 py-2 text-sm">No market events found</li>
              ) : (
                (insightsData?.events || []).map((event: any, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className={`text-${event.impact === 'positive' ? 'success' : event.impact === 'negative' ? 'danger' : 'warning'}-500 mt-0.5`}>
                      <i className={`fas fa-${event.impact === 'positive' ? 'arrow-up' : event.impact === 'negative' ? 'arrow-down' : 'exclamation-circle'}`}></i>
                    </span>
                    <div>
                      <p className="text-sm text-gray-800">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {typeof event.date === 'string' ? formatDate(event.date) : event.date}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        
        <div className="mt-4 flex justify-center items-center space-x-4">
          <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
            View Complete Market Analysis
          </button>
          
          {!isLoading && insightsData && (
            <ExportDialog
              data={prepareMarketDataForExport()}
              columns={[
                { header: 'Date', key: 'date' },
                { header: 'Metric', key: 'metric' },
                { header: 'Value', key: 'value' },
                { header: 'Change', key: 'change' },
                { header: 'Forecast', key: 'forecast' },
              ]}
              title="Export Market Insights"
              description="Export market trends and forecasts to analyze offline."
              defaultFilename="bell24h_market_insights.csv"
              trigger={
                <button className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center">
                  <i className="fas fa-file-export mr-1"></i> Export Market Data
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
