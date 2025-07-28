import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../api/client';
import { theme } from '../theme';

export const LogisticsTrackingScreen = () => {
  const [shipmentId, setShipmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const trackShipment = async () => {
    setLoading(true);
    setError(null);
    setTracking(null);
    try {
      const res = await api.post('/api/logistics/shiprocket/track', { shipmentId });
      setTracking(res.data);
    } catch (e) {
      setError('Tracking failed. Please check the shipment ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Logistics Tracking</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter Shipment ID"
          value={shipmentId}
          onChangeText={setShipmentId}
        />
        <TouchableOpacity style={styles.trackBtn} onPress={trackShipment}>
          <Text style={styles.trackText}>Track</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 20}} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {tracking && (
        <View style={styles.section}>
          <Text style={styles.label}>Status: <Text style={{fontWeight:'bold'}}>{tracking.status}</Text></Text>
          <Text style={styles.label}>Last Update: {tracking.lastUpdate}</Text>
          <Text style={styles.label}>Checkpoints:</Text>
          {tracking.checkpoints && tracking.checkpoints.map((c: any, i: number) => (
            <Text key={i} style={styles.checkpoint}>• {c.time} - {c.location}: {c.status}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
  trackBtn: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8 },
  trackText: { color: '#fff', fontWeight: '600' },
  section: { marginTop: 24, marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 4 },
  checkpoint: { fontSize: 15, marginLeft: 12, color: '#555' },
  error: { color: '#F44336', marginTop: 12, fontSize: 15 },
}); 