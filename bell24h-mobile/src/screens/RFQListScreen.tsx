import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Chip, Button, TextInput, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store/store';
import { fetchRFQs } from '../store/slices/rfqSlice';

const RFQListScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { rfqs, loading } = useSelector((state: RootState) => state.rfq);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRFQs());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchRFQs());
    setRefreshing(false);
  };

  const statuses = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rfq.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === 'All' || rfq.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#2563eb';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Ionicons name="list" size={32} color="#2563eb" />
          <Text style={styles.title}>RFQs</Text>
          <Text style={styles.subtitle}>Manage your requests for quotations</Text>
        </View>

        {/* Search and Filter */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <TextInput
              placeholder="Search RFQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              mode="outlined"
              left={<TextInput.Icon icon="magnify" />}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusContainer}>
              {statuses.map(status => (
                <Chip
                  key={status}
                  selected={selectedStatus === status}
                  onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  style={styles.statusChip}
                  mode={selectedStatus === status ? 'flat' : 'outlined'}
                >
                  {status}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* RFQ List */}
        {filteredRFQs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No RFQs found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || selectedStatus ? 'Try adjusting your filters' : 'Create your first RFQ'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          filteredRFQs.map(rfq => (
            <Card key={rfq.id} style={styles.rfqCard}>
              <Card.Content>
                <View style={styles.rfqHeader}>
                  <View style={styles.rfqInfo}>
                    <Text style={styles.rfqTitle}>{rfq.title}</Text>
                    <Text style={styles.rfqDescription} numberOfLines={2}>
                      {rfq.description}
                    </Text>
                    <View style={styles.rfqMeta}>
                      <View style={styles.categoryContainer}>
                        <Ionicons name="pricetag" size={16} color="#6b7280" />
                        <Text style={styles.category}>{rfq.category}</Text>
                      </View>
                      {rfq.budget && (
                        <View style={styles.budgetContainer}>
                          <Ionicons name="wallet" size={16} color="#6b7280" />
                          <Text style={styles.budget}>{formatCurrency(rfq.budget)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.rfqActions}>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: getStatusColor(rfq.status) + '20' }]}
                      textStyle={{ color: getStatusColor(rfq.status) }}
                    >
                      {rfq.status}
                    </Chip>
                  </View>
                </View>

                {rfq.requirements && rfq.requirements.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsTitle}>Requirements:</Text>
                    <View style={styles.requirementsList}>
                      {rfq.requirements.slice(0, 3).map((req, index) => (
                        <Chip key={index} style={styles.requirementChip} mode="outlined" compact>
                          {req}
                        </Chip>
                      ))}
                      {rfq.requirements.length > 3 && (
                        <Chip style={styles.requirementChip} mode="outlined" compact>
                          +{rfq.requirements.length - 3} more
                        </Chip>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.rfqFooter}>
                  <View style={styles.rfqStats}>
                    <Text style={styles.rfqDate}>
                      Created: {rfq.createdAt ? formatDate(rfq.createdAt) : 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <Button
                      mode="outlined"
                      compact
                      style={styles.actionButton}
                      onPress={() => {/* Navigate to RFQ details */}}
                    >
                      View Details
                    </Button>
                    <Button
                      mode="contained"
                      compact
                      style={styles.actionButton}
                      onPress={() => {/* Edit RFQ */}}
                    >
                      Edit
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>RFQ Overview</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{rfqs.length}</Text>
                <Text style={styles.statLabel}>Total RFQs</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {rfqs.filter(r => r.status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {rfqs.filter(r => r.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {/* Navigate to create RFQ */}}
        label="New RFQ"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  searchCard: {
    margin: 16,
    elevation: 2,
  },
  searchInput: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusChip: {
    marginRight: 8,
  },
  rfqCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  rfqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rfqInfo: {
    flex: 1,
  },
  rfqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  rfqDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  rfqMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  category: {
    marginLeft: 4,
    fontSize: 14,
    color: '#374151',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budget: {
    marginLeft: 4,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  rfqActions: {
    alignItems: 'flex-end',
  },
  requirementsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  requirementChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  rfqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rfqStats: {
    flex: 1,
  },
  rfqDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyCard: {
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
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
  },
});

export default RFQListScreen; 