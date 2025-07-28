import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store/store';
import { fetchRFQs } from '../store/slices/rfqSlice';
import { fetchWalletBalance } from '../store/slices/walletSlice';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { rfqs, loading } = useSelector((state: RootState) => state.rfq);
  const { balance } = useSelector((state: RootState) => state.wallet);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchRFQs());
    if (user?.id) {
      dispatch(fetchWalletBalance(user.id));
    }
  }, [dispatch, user?.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const getActiveRFQs = () => rfqs.filter(rfq => rfq.status === 'active').length;
  const getCompletedRFQs = () => rfqs.filter(rfq => rfq.status === 'completed').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="home" size={32} color="#2563eb" />
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.name || 'User'}!</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <Ionicons name="wallet" size={24} color="#10b981" />
              <Text style={styles.statLabel}>Balance</Text>
            </View>
            <Text style={styles.statValue}>
              {balance ? formatCurrency(balance.balance) : '₹0.00'}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <Ionicons name="document-text" size={24} color="#f59e0b" />
              <Text style={styles.statLabel}>Active RFQs</Text>
            </View>
            <Text style={styles.statValue}>{getActiveRFQs()}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <Text style={styles.statValue}>{getCompletedRFQs()}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="mic" size={24} color="#2563eb" />
              </View>
              <Text style={styles.actionText}>Voice RFQ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={24} color="#10b981" />
              </View>
              <Text style={styles.actionText}>New RFQ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="people" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Suppliers</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="analytics" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={styles.activityCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {rfqs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          ) : (
            rfqs.slice(0, 5).map((rfq, index) => (
              <View key={rfq.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="document-text" size={20} color="#2563eb" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{rfq.title}</Text>
                  <Text style={styles.activitySubtitle}>{rfq.category}</Text>
                </View>
                <View style={styles.activityStatus}>
                  <Text style={[
                    styles.statusText,
                    { color: rfq.status === 'active' ? '#10b981' : '#6b7280' }
                  ]}>
                    {rfq.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Market Insights */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Market Insights</Text>
          
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color="#10b981" />
            <Text style={styles.insightText}>Steel prices up 5% this week</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="trending-down" size={20} color="#ef4444" />
            <Text style={styles.insightText}>Electronics demand down 3%</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color="#10b981" />
            <Text style={styles.insightText}>Textile exports increased 12%</Text>
          </View>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionsCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  activityCard: {
    margin: 16,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  insightsCard: {
    margin: 16,
    elevation: 2,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
});

export default DashboardScreen; 