import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../api/client';
import { theme } from '../theme';

export const PricingDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [optimized, setOptimized] = useState<any>(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      // For demo, use a static RFQ ID
      const rfqId = 'demo-rfq-id';
      const sRes = await api.post('/api/pricing/suggest', { rfqId });
      setSuggestion(sRes.data);
      const oRes = await api.post('/api/pricing/optimize', { rfqId });
      setOptimized(oRes.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dynamic Pricing Dashboard</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Suggested Price: <Text style={styles.value}>₹{suggestion?.suggestedPrice}</Text></Text>
        <Text style={styles.label}>Market Trend: {suggestion?.marketTrend}</Text>
        <Text style={styles.label}>Confidence: {Math.round((suggestion?.confidence || 0) * 100)}%</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Optimized Price: <Text style={styles.value}>₹{optimized?.optimizedPrice}</Text></Text>
        <Text style={styles.label}>Market Trend: {optimized?.marketTrend}</Text>
        <Text style={styles.label}>Confidence: {Math.round((optimized?.confidence || 0) * 100)}%</Text>
      </View>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchPricing}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'bold', color: theme.colors.primary },
  refreshBtn: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  refreshText: { color: '#fff', fontWeight: '600', fontSize: 16 },
}); 