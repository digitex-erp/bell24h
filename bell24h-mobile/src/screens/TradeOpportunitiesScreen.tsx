import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../api/client';
import { theme } from '../theme';

export const TradeOpportunitiesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const iRes = await api.get('/api/trade/insights');
      setInsights(iRes.data);
      const oRes = await api.get('/api/trade/opportunities');
      setOpportunities(oRes.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Global Trade Insights</Text>
      {insights && (
        <View style={styles.section}>
          <Text style={styles.label}>Country: {insights.country}</Text>
          <Text style={styles.label}>Product: {insights.product}</Text>
          <Text style={styles.label}>Summary: {insights.summary}</Text>
          <Text style={styles.label}>Trends:</Text>
          {insights.trends && insights.trends.map((t: any, i: number) => (
            <Text key={i} style={styles.trend}>• {t.year}: Export ₹{t.export}, Import ₹{t.import}</Text>
          ))}
        </View>
      )}
      <Text style={styles.subtitle}>Opportunities</Text>
      {opportunities.map((o, i) => (
        <View key={i} style={styles.oppCard}>
          <Text style={styles.oppTitle}>{o.sector} in {o.country}</Text>
          <Text style={styles.oppDesc}>{o.opportunity}</Text>
        </View>
      ))}
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
  trend: { fontSize: 15, marginLeft: 12, color: '#555' },
  oppCard: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 12 },
  oppTitle: { fontWeight: 'bold', fontSize: 16 },
  oppDesc: { fontSize: 15, color: '#333' },
}); 