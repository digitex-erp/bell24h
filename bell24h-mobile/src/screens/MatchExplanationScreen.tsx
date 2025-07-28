import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const MatchExplanationScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={32} color="#2563eb" />
        <Text style={styles.title}>Match Explanation</Text>
        <Text style={styles.subtitle}>AI-powered supplier matching insights</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Matching Criteria</Text>
          <View style={styles.criteriaItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.criteriaText}>Price competitiveness</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.criteriaText}>Quality rating</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.criteriaText}>Delivery time</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.criteriaText}>Past performance</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <Text style={styles.description}>
            Our AI system analyzes multiple factors to find the best suppliers for your requirements.
            This includes historical data, market trends, and supplier performance metrics.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <Text style={styles.description}>
            Based on your RFQ requirements, we recommend suppliers that best match your criteria.
            Each recommendation includes detailed reasoning and confidence scores.
          </Text>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.button}
          >
            View Recommendations
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 5,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  criteriaText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6b7280',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default MatchExplanationScreen; 