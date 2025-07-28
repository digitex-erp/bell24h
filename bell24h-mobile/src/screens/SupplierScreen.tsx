import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Supplier {
  id: string;
  name: string;
  company: string;
  category: string;
  rating: number;
  location: string;
  riskScore: number;
  verified: boolean;
}

const SupplierScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data - replace with API call
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      company: 'SteelCorp Industries',
      category: 'Steel',
      rating: 4.5,
      location: 'Mumbai, Maharashtra',
      riskScore: 85,
      verified: true,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      company: 'TechSolutions Ltd',
      category: 'Electronics',
      rating: 4.2,
      location: 'Bangalore, Karnataka',
      riskScore: 78,
      verified: true,
    },
    {
      id: '3',
      name: 'Amit Patel',
      company: 'TextileWorld',
      category: 'Textiles',
      rating: 4.8,
      location: 'Ahmedabad, Gujarat',
      riskScore: 92,
      verified: false,
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      company: 'Chemicals Plus',
      category: 'Chemicals',
      rating: 4.0,
      location: 'Chennai, Tamil Nadu',
      riskScore: 72,
      verified: true,
    },
  ];

  const categories = ['All', 'Steel', 'Electronics', 'Textiles', 'Chemicals'];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRiskColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={32} color="#2563eb" />
        <Text style={styles.title}>Suppliers</Text>
        <Text style={styles.subtitle}>Find and connect with verified suppliers</Text>
      </View>

      {/* Search and Filter */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <TextInput
            placeholder="Search suppliers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map(category => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
                style={styles.categoryChip}
                mode={selectedCategory === category ? 'flat' : 'outlined'}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Supplier List */}
      {filteredSuppliers.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No suppliers found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
            </View>
          </Card.Content>
        </Card>
      ) : (
        filteredSuppliers.map(supplier => (
          <Card key={supplier.id} style={styles.supplierCard}>
            <Card.Content>
              <View style={styles.supplierHeader}>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierCompany}>{supplier.company}</Text>
                  <View style={styles.supplierMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#f59e0b" />
                      <Text style={styles.rating}>{supplier.rating}</Text>
                    </View>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={16} color="#6b7280" />
                      <Text style={styles.location}>{supplier.location}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.supplierActions}>
                  {supplier.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                  
                  <View style={styles.riskContainer}>
                    <Text style={[styles.riskScore, { color: getRiskColor(supplier.riskScore) }]}>
                      {supplier.riskScore}
                    </Text>
                    <Text style={[styles.riskLabel, { color: getRiskColor(supplier.riskScore) }]}>
                      {getRiskLabel(supplier.riskScore)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.supplierFooter}>
                <Chip style={styles.categoryChip} mode="outlined">
                  {supplier.category}
                </Chip>
                
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    compact
                    style={styles.actionButton}
                    onPress={() => {/* Navigate to supplier details */}}
                  >
                    View Details
                  </Button>
                  <Button
                    mode="contained"
                    compact
                    style={styles.actionButton}
                    onPress={() => {/* Contact supplier */}}
                  >
                    Contact
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
          <Text style={styles.sectionTitle}>Supplier Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{suppliers.length}</Text>
              <Text style={styles.statLabel}>Total Suppliers</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {suppliers.filter(s => s.verified).length}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {suppliers.filter(s => s.riskScore >= 80).length}
              </Text>
              <Text style={styles.statLabel}>Low Risk</Text>
            </View>
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
  searchCard: {
    margin: 16,
    elevation: 2,
  },
  searchInput: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: 8,
  },
  supplierCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  supplierCompany: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  supplierMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#374151',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  supplierActions: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  riskContainer: {
    alignItems: 'center',
  },
  riskScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  supplierFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});

export default SupplierScreen; 