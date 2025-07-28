import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { theme } from '../theme';
import { api } from '../api/client';
import { ErrorMessage } from '../components/ErrorMessage';

interface RiskFactor {
  feature: string;
  importance: number;
  description: string;
}

interface RiskExplanation {
  matchScore: number;
  features: RiskFactor[];
  localExplanation: string;
  globalExplanation: string;
  confidenceScore: number;
}

export const SupplierExplanationScreen = () => {
  const route = useRoute();
  const { supplierId } = route.params as { supplierId: string };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<RiskExplanation | null>(null);

  useEffect(() => {
    fetchRiskExplanation();
  }, [supplierId]);

  const fetchRiskExplanation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/supplier/${supplierId}/explain-score`);
      setExplanation(response.data.explanation);
    } catch (err) {
      setError('Failed to load risk explanation');
      console.error('Error fetching risk explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} />
        <TouchableOpacity style={styles.retryButton} onPress={fetchRiskExplanation}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!explanation) {
    return (
      <View style={styles.container}>
        <Text>No risk explanation available</Text>
      </View>
    );
  }

  const getRiskColor = (score: number) => {
    if (score <= 0.3) return '#4CAF50';
    if (score <= 0.6) return '#FFC107';
    return '#F44336';
  };

  const pieChartData = explanation.features.slice(0, 4).map((feature, index) => ({
    name: feature.feature,
    population: Math.abs(feature.importance * 100),
    color: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0'
    ][index],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Risk Score Section */}
      <View style={[
        styles.scoreSection,
        { backgroundColor: getRiskColor(explanation.matchScore) }
      ]}>
        <Text style={styles.scoreTitle}>Risk Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>
            {Math.round(explanation.matchScore * 100)}
          </Text>
          <Text style={styles.confidenceScore}>
            Confidence: {Math.round(explanation.confidenceScore)}%
          </Text>
        </View>
      </View>

      {/* Global Risk Assessment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Assessment Overview</Text>
        <Text style={styles.explanationText}>{explanation.globalExplanation}</Text>
      </View>

      {/* Risk Distribution Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Factor Distribution</Text>
        <PieChart
          data={pieChartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* Detailed Risk Factors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Factor Analysis</Text>
        {explanation.features.map((factor, index) => (
          <View key={index} style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <MaterialIcons
                name={factor.importance > 0 ? 'warning' : 'check-circle'}
                size={24}
                color={factor.importance > 0 ? '#F44336' : '#4CAF50'}
              />
              <Text style={styles.factorTitle}>{factor.feature}</Text>
            </View>
            <Text style={styles.factorDescription}>{factor.description}</Text>
            <View style={[
              styles.riskBar,
              {
                width: `${Math.abs(factor.importance * 100)}%`,
                backgroundColor: factor.importance > 0 ? '#F44336' : '#4CAF50'
              }
            ]} />
          </View>
        ))}
      </View>

      {/* Specific Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Insights</Text>
        <Text style={styles.explanationText}>{explanation.localExplanation}</Text>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendationItem}>
          <MaterialIcons name="lightbulb" size={24} color="#FFC107" />
          <Text style={styles.recommendationText}>
            Monitor the highest risk factors and request additional documentation if needed.
          </Text>
        </View>
        <View style={styles.recommendationItem}>
          <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.recommendationText}>
            Consider the strong positive factors when making your final decision.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreSection: {
    padding: 20,
    alignItems: 'center',
  },
  scoreTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  confidenceScore: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  factorItem: {
    marginBottom: 20,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  factorDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 34,
    marginBottom: 5,
  },
  riskBar: {
    height: 4,
    borderRadius: 2,
    marginLeft: 34,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 