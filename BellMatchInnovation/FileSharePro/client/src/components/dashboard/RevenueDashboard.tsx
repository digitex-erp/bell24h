import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { LineChart, PieChart } from '../ui/chart';
import { useToast } from '../../hooks/use-toast';

export function RevenueDashboard() {
  const [timeframe, setTimeframe] = useState('daily');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe]);

  async function fetchRevenueData() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/revenue?timeframe=${timeframe}`);
      const data = await res.json();
      setData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch revenue data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Revenue Dashboard</h2>
        <div className="flex gap-4">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' }
            ]}
          />
          <Button onClick={fetchRevenueData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold mt-2">₹{data?.totalRevenue?.toLocaleString() || 0}</p>
          <span className={`text-sm ${data?.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.revenueGrowth}% vs last period
          </span>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Subscription Revenue</h3>
          <p className="text-2xl font-bold mt-2">₹{data?.subscriptionRevenue?.toLocaleString() || 0}</p>
          <span className="text-sm text-gray-500">{data?.activeSubscriptions || 0} active</span>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Transaction Fees</h3>
          <p className="text-2xl font-bold mt-2">₹{data?.transactionFees?.toLocaleString() || 0}</p>
          <span className="text-sm text-gray-500">{data?.totalTransactions || 0} transactions</span>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Escrow Fees</h3>
          <p className="text-2xl font-bold mt-2">₹{data?.escrowFees?.toLocaleString() || 0}</p>
          <span className="text-sm text-gray-500">{data?.escrowTransactions || 0} in escrow</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          <LineChart 
            data={data?.revenueTrend || []}
            categories={['Total', 'Transactions', 'Subscriptions', 'Escrow']}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Revenue Distribution</h3>
          <PieChart 
            data={data?.revenueDistribution || []}
            labels={['Transaction Fees', 'Subscriptions', 'Escrow Fees']}
          />
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Top Performing Categories</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Category</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">Growth</th>
              </tr>
            </thead>
            <tbody>
              {data?.topCategories?.map((category: any) => (
                <tr key={category.name}>
                  <td className="py-2">{category.name}</td>
                  <td className="py-2">₹{category.revenue.toLocaleString()}</td>
                  <td className={`py-2 ${category.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {category.growth}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {data?.recentTransactions?.map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-gray-500">{tx.date}</p>
                </div>
                <p className="font-medium">₹{tx.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}