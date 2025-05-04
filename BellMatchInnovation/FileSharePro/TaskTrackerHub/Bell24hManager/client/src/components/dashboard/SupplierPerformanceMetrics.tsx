
import React from 'react';
import { Card } from '../ui/card';
import { Chart } from '../ui/chart';

interface SupplierMetrics {
  responseTime: number;
  quoteAcceptanceRate: number;
  deliveryPerformance: number;
  qualityRating: number;
}

export const SupplierPerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = React.useState<SupplierMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/supplier/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card className="p-6"><div>Loading metrics...</div></Card>;
  }

  if (!metrics) {
    return <Card className="p-6"><div>No metrics available</div></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Supplier Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Response Time</h3>
          <Chart
            type="gauge"
            data={[metrics.responseTime]}
            options={{
              min: 0,
              max: 100,
              label: 'Average Response Time (hours)'
            }}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Quote Acceptance</h3>
          <Chart
            type="pie"
            data={[
              metrics.quoteAcceptanceRate,
              100 - metrics.quoteAcceptanceRate
            ]}
            labels={['Accepted', 'Rejected']}
          />
        </div>
      </div>
    </Card>
  );
};
