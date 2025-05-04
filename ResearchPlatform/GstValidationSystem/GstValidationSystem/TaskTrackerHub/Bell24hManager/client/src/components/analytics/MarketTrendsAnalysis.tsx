
import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Line } from 'react-chartjs-2';
import { toast } from '../ui/toast';

interface MarketTrendsProps {
  supplierId: string;
  industry: string;
}

export const MarketTrendsAnalysis: React.FC<MarketTrendsProps> = ({ supplierId, industry }) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketTrends();
  }, [supplierId, industry]);

  const fetchMarketTrends = async () => {
    try {
      const response = await fetch(`/api/market-trends/${industry}/${supplierId}`);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch market trends data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card className="p-6"><div>Loading market trends...</div></Card>;
  }

  if (!marketData) {
    return <Card className="p-6"><div>No market data available</div></Card>;
  }

  const chartData = {
    labels: marketData.trends.map((t: any) => t.date),
    datasets: [{
      label: 'Industry Price Trend',
      data: marketData.trends.map((t: any) => t.price),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Market Position Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Market Share</p>
            <div className="flex items-center gap-2">
              <Progress value={marketData.marketShare} className="flex-1" />
              <span className="text-sm font-medium">{marketData.marketShare.toFixed(1)}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Industry Growth</p>
            <span className={`text-sm font-medium ${
              marketData.industryGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {marketData.industryGrowth > 0 ? '+' : ''}{marketData.industryGrowth.toFixed(1)}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Competitive Position</p>
            <Progress value={marketData.competitivePosition} className="mt-2" />
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <Line 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: false
              }
            }
          }}
        />
      </div>
    </Card>
  );
};
