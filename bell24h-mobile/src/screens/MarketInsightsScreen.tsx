import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { api } from '../api/client';
import { theme } from '../theme';

export const MarketInsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    fetchInsights();
    fetchTrends();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/market/insights?industry=default');
      setInsights(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await api.get('/api/market/trends?symbols=NIFTY50,SENSEX');
      setTrends(res.data);
    } catch {}
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Market Insights</Text>
      {insights && (
        <View style={styles.section}>
          <Text style={styles.label}>Trend: <Text style={{fontWeight:'bold'}}>{insights.trend}</Text></Text>
          <Text style={styles.label}>Confidence: {Math.round(insights.confidence * 100)}%</Text>
          <Text style={styles.label}>Recommendation: {insights.recommendation}</Text>
          <Text style={styles.label}>Key Factors:</Text>
          {insights.factors && insights.factors.map((f: string, i: number) => (
            <Text key={i} style={styles.factor}>• {f}</Text>
          ))}
        </View>
      )}
      <Text style={styles.subtitle}>Index Trends</Text>
      {trends.length > 0 && (
        <BarChart
          data={{
            labels: trends.map(t => t.symbol),
            datasets: [{ data: trends.map(t => t.price) }]
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          yAxisLabel="₹"
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            style: { borderRadius: 16 }
          }}
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 4 },
  factor: { fontSize: 15, marginLeft: 12, color: '#555' },
  chart: { marginVertical: 8, borderRadius: 16 },
}); 