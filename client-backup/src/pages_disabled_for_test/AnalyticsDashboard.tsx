import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

interface UserEngagement {
  users: number;
  active: number;
  retention: number;
}
interface RFQTrends {
  months: string[];
  rfqs: number[];
}
interface PaymentStats {
  total: number;
  completed: number;
  failed: number;
}

export default function AnalyticsDashboard() {
  const [userEngagement, setUserEngagement] = useState<UserEngagement | null>(null);
  const [rfqTrends, setRFQTrends] = useState<RFQTrends | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const ue = await fetch('/api/analytics/user-engagement').then(r => r.json());
      const rt = await fetch('/api/analytics/rfq-trends').then(r => r.json());
      const ps = await fetch('/api/analytics/payment-stats').then(r => r.json());
      setUserEngagement(ue);
      setRFQTrends(rt);
      setPaymentStats(ps);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <Box p={3}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">User Engagement</Typography>
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userEngagement ? [
              { name: 'Total', value: userEngagement.users },
              { name: 'Active', value: userEngagement.active },
              { name: 'Retention', value: Math.round(userEngagement.retention * 100) }
            ] : []}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">RFQ Trends</Typography>
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rfqTrends && rfqTrends.months ? rfqTrends.months.map((month, i) => ({ month, rfqs: rfqTrends.rfqs[i] })) : []}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rfqs" stroke="#388e3c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Payment Stats</Typography>
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentStats ? [
                  { name: 'Completed', value: paymentStats.completed },
                  { name: 'Failed', value: paymentStats.failed }
                ] : []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                <Cell key="completed" fill="#43a047" />
                <Cell key="failed" fill="#e53935" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box mt={2}>
          <strong>Total Payments:</strong> ${paymentStats?.total}
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6">AI Insights</Typography>
        <AIInsightsSection />
      </Paper>
    </Box>
  );
}

function AIInsightsSection() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [probability, setProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Example RFQ for demo
  const sampleRFQ = {
    id: 'demo',
    category: 'Electronics',
    region: 'Asia',
    urgency: 'normal',
    value: 12000
  };

  useEffect(() => {
    async function fetchAI() {
      const recRes = await fetch('/api/ai/rfq-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleRFQ)
      }).then(r => r.json());
      setRecommendations(recRes.recommended || []);
      const probRes = await fetch('/api/ai/rfq-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleRFQ)
      }).then(r => r.json());
      setProbability(probRes.probability || null);
      setLoading(false);
    }
    fetchAI();
    // eslint-disable-next-line
  }, []);

  if (loading) return <CircularProgress size={24} />;

  return (
    <Box>
      <Typography variant="subtitle1">Supplier Recommendations (sample RFQ):</Typography>
      <ul>
        {recommendations.map((s, i) => (
          <li key={i}>{s.name} ({s.region}, {s.category})</li>
        ))}
      </ul>
      <Typography variant="subtitle1">Predicted Acceptance Probability:</Typography>
      <Typography color={probability && probability > 0.7 ? 'success.main' : 'warning.main'}>
        {probability !== null ? `${Math.round(probability * 100)}%` : 'N/A'}
      </Typography>
    </Box>
  );
}
