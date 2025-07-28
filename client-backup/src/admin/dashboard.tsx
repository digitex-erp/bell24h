import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const METRIC_LABELS = [
  'RFQ Volume',
  'Transaction Fees',
  'Escrow Amount',
  'Ad Revenue',
  'Invoice Discounting'
];
const METRIC_KEYS = [
  'rfq_volume_total',
  'transaction_fees_total',
  'escrow_amount_total',
  'ad_revenue_total',
  'invoice_discounting_total'
];

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<{ [k: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics');
        const text = await res.text();
        // Parse Prometheus exposition format
        const lines = text.split('\n');
        const data: { [k: string]: number } = {};
        for (const line of lines) {
          const [key, value] = line.split(' ');
          if (key && value && !key.startsWith('#')) {
            data[key] = parseFloat(value);
          }
        }
        setMetrics(data);
      } catch (e) {
        setMetrics({});
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: METRIC_LABELS,
    datasets: [
      {
        label: 'Current Value',
        data: METRIC_KEYS.map((k) => metrics[k] || 0),
        backgroundColor: [
          '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'
        ]
      }
    ]
  };

  return (
    <div className="admin-dashboard">
      <h2>Revenue & Metrics Dashboard</h2>
      <div className="metrics">
        {loading ? (
          <p>Loading metrics...</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              {METRIC_KEYS.map((key, i) => (
                <div key={key} style={{ background: '#f4f4f4', borderRadius: 8, padding: 16, minWidth: 180 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{METRIC_LABELS[i]}</h3>
                  <p style={{ fontSize: 24, margin: 0 }}>
                    ₹{metrics[key] ? metrics[key].toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                  </p>
                </div>
              ))}
            </div>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Key Revenue Metrics' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
