// src/components/suppliers/SupplierDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  VerifiedUser as QualityIcon,
  Message as CommunicationIcon,
  AttachMoney as PricingIcon,
  EventAvailable as ReliabilityIcon
} from '@mui/icons-material';
import { 
  getSuppliers, 
  getSuppliersByTier, 
  Supplier, 
  SupplierTier,
  PerformanceCategory
} from '../../utils/supplierRatingService.js';
import SupplierTierBadge from './SupplierTierBadge.js';

const SupplierDashboard: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSuppliers: 0,
    tierCounts: {
      [SupplierTier.PLATINUM]: 0,
      [SupplierTier.GOLD]: 0,
      [SupplierTier.SILVER]: 0,
      [SupplierTier.BRONZE]: 0
    },
    avgRating: 0,
    totalOrders: 0,
    completionRate: 0,
    onTimeDeliveryRate: 0,
    qualityIssueRate: 0,
    avgResponseTime: 0,
    categoryAverages: {
      [PerformanceCategory.DELIVERY]: 0,
      [PerformanceCategory.QUALITY]: 0,
      [PerformanceCategory.COMMUNICATION]: 0,
      [PerformanceCategory.PRICING]: 0,
      [PerformanceCategory.RELIABILITY]: 0
    },
    topPerformers: [] as Supplier[],
    needsImprovement: [] as Supplier[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const allSuppliers = getSuppliers();
    setSuppliers(allSuppliers);
    
    // Calculate metrics
    calculateMetrics(allSuppliers);
    setLoading(false);
  };

  const calculateMetrics = (suppliersList: Supplier[]) => {
    // Skip calculation if no suppliers
    if (suppliersList.length === 0) {
      return;
    }

    // Count suppliers by tier
    const tierCounts = {
      [SupplierTier.PLATINUM]: 0,
      [SupplierTier.GOLD]: 0,
      [SupplierTier.SILVER]: 0,
      [SupplierTier.BRONZE]: 0
    };
    
    suppliersList.forEach(supplier => {
      tierCounts[supplier.rating.tier]++;
    });
    
    // Calculate averages
    const totalRating = suppliersList.reduce((sum, supplier) => sum + supplier.rating.overallScore, 0);
    const avgRating = totalRating / suppliersList.length;
    
    const totalOrders = suppliersList.reduce((sum, supplier) => sum + supplier.rating.totalOrders, 0);
    const completedOrders = suppliersList.reduce((sum, supplier) => sum + supplier.rating.completedOrders, 0);
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    
    const onTimeDeliverySum = suppliersList.reduce((sum, supplier) => sum + supplier.rating.onTimeDeliveryRate, 0);
    const avgOnTimeDelivery = onTimeDeliverySum / suppliersList.length;
    
    const qualityIssueSum = suppliersList.reduce((sum, supplier) => sum + supplier.rating.qualityIssueRate, 0);
    const avgQualityIssue = qualityIssueSum / suppliersList.length;
    
    const responseTimeSum = suppliersList.reduce((sum, supplier) => sum + supplier.rating.responseTime, 0);
    const avgResponseTime = responseTimeSum / suppliersList.length;
    
    // Calculate category averages
    const categoryAverages = {
      [PerformanceCategory.DELIVERY]: 0,
      [PerformanceCategory.QUALITY]: 0,
      [PerformanceCategory.COMMUNICATION]: 0,
      [PerformanceCategory.PRICING]: 0,
      [PerformanceCategory.RELIABILITY]: 0
    };
    
    Object.values(PerformanceCategory).forEach(category => {
      const categorySum = suppliersList.reduce((sum, supplier) => sum + supplier.rating.categoryScores[category], 0);
      categoryAverages[category] = categorySum / suppliersList.length;
    });
    
    // Find top performers and those needing improvement
    const sortedByRating = [...suppliersList].sort((a, b) => b.rating.overallScore - a.rating.overallScore);
    const topPerformers = sortedByRating.slice(0, 3);
    const needsImprovement = [...sortedByRating].reverse().slice(0, 3);
    
    setMetrics({
      totalSuppliers: suppliersList.length,
      tierCounts,
      avgRating,
      totalOrders,
      completionRate,
      onTimeDeliveryRate: avgOnTimeDelivery,
      qualityIssueRate: avgQualityIssue,
      avgResponseTime,
      categoryAverages,
      topPerformers,
      needsImprovement
    });
  };

  const getCategoryIcon = (category: PerformanceCategory) => {
    switch (category) {
      case PerformanceCategory.DELIVERY:
        return <ShippingIcon />;
      case PerformanceCategory.QUALITY:
        return <QualityIcon />;
      case PerformanceCategory.COMMUNICATION:
        return <CommunicationIcon />;
      case PerformanceCategory.PRICING:
        return <PricingIcon />;
      case PerformanceCategory.RELIABILITY:
        return <ReliabilityIcon />;
      default:
        return <StarIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading supplier metrics...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Supplier Performance Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Total Suppliers
              </Typography>
              <Typography variant="h4">
                {metrics.totalSuppliers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Average Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4">
                  {metrics.avgRating.toFixed(1)}
                </Typography>
                <StarIcon sx={{ color: '#FFD700', ml: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {metrics.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Order Completion Rate
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="h4">
                  {metrics.completionRate.toFixed(1)}%
                </Typography>
                {metrics.completionRate > 90 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', ml: 1 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', ml: 1 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tier Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Supplier Tier Distribution" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(metrics.tierCounts).map(([tier, count]) => (
                  <Grid item xs={6} key={tier}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SupplierTierBadge tier={tier as SupplierTier} showTooltip={false} />
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.totalSuppliers > 0 ? (count / metrics.totalSuppliers) * 100 : 0} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Performance Metrics" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShippingIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      On-Time Delivery Rate
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                      {metrics.onTimeDeliveryRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.onTimeDeliveryRate} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={metrics.onTimeDeliveryRate > 90 ? "success" : metrics.onTimeDeliveryRate > 70 ? "warning" : "error"}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <QualityIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Quality Issue Rate
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                      {metrics.qualityIssueRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100 - metrics.qualityIssueRate} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={metrics.qualityIssueRate < 5 ? "success" : metrics.qualityIssueRate < 15 ? "warning" : "error"}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CommunicationIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Average Response Time
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                      {metrics.avgResponseTime.toFixed(1)} hours
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100 - (metrics.avgResponseTime / 24) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={metrics.avgResponseTime < 6 ? "success" : metrics.avgResponseTime < 12 ? "warning" : "error"}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Category Performance */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Category Performance" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(metrics.categoryAverages).map(([category, score]) => (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                        {getCategoryIcon(category as PerformanceCategory)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon 
                              key={i} 
                              fontSize="small" 
                              sx={{ 
                                color: i < Math.floor(score) ? '#FFD700' : '#e0e0e0',
                                opacity: i === Math.floor(score) && score % 1 >= 0.5 ? 0.5 : 1
                              }} 
                            />
                          ))}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            ({score.toFixed(1)})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Top Performing Suppliers" />
            <Divider />
            <CardContent>
              <List>
                {metrics.topPerformers.map((supplier) => (
                  <ListItem key={supplier.id}>
                    <ListItemAvatar>
                      <Avatar 
                        alt={supplier.name} 
                        src={supplier.logo}
                        sx={{ 
                          border: `2px solid ${supplier.rating.tier === SupplierTier.PLATINUM ? '#8892b0' : 
                                              supplier.rating.tier === SupplierTier.GOLD ? '#ffd700' : 
                                              supplier.rating.tier === SupplierTier.SILVER ? '#c0c0c0' : '#cd7f32'}`,
                          bgcolor: supplier.logo ? 'transparent' : 'primary.main'
                        }}
                      >
                        {!supplier.logo && <BusinessIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {supplier.name}
                          </Typography>
                          <SupplierTierBadge 
                            tier={supplier.rating.tier} 
                            size="small" 
                            showTooltip={true}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon 
                              key={i} 
                              fontSize="small" 
                              sx={{ 
                                color: i < Math.floor(supplier.rating.overallScore) ? '#FFD700' : '#e0e0e0',
                                opacity: i === Math.floor(supplier.rating.overallScore) && supplier.rating.overallScore % 1 >= 0.5 ? 0.5 : 1
                              }} 
                            />
                          ))}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            ({supplier.rating.overallScore.toFixed(1)})
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Needs Improvement */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Suppliers Needing Improvement" />
            <Divider />
            <CardContent>
              <List>
                {metrics.needsImprovement.map((supplier) => (
                  <ListItem key={supplier.id}>
                    <ListItemAvatar>
                      <Avatar 
                        alt={supplier.name} 
                        src={supplier.logo}
                        sx={{ 
                          border: `2px solid ${supplier.rating.tier === SupplierTier.PLATINUM ? '#8892b0' : 
                                              supplier.rating.tier === SupplierTier.GOLD ? '#ffd700' : 
                                              supplier.rating.tier === SupplierTier.SILVER ? '#c0c0c0' : '#cd7f32'}`,
                          bgcolor: supplier.logo ? 'transparent' : 'primary.main'
                        }}
                      >
                        {!supplier.logo && <BusinessIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {supplier.name}
                          </Typography>
                          <SupplierTierBadge 
                            tier={supplier.rating.tier} 
                            size="small" 
                            showTooltip={true}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon 
                              key={i} 
                              fontSize="small" 
                              sx={{ 
                                color: i < Math.floor(supplier.rating.overallScore) ? '#FFD700' : '#e0e0e0',
                                opacity: i === Math.floor(supplier.rating.overallScore) && supplier.rating.overallScore % 1 >= 0.5 ? 0.5 : 1
                              }} 
                            />
                          ))}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            ({supplier.rating.overallScore.toFixed(1)})
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierDashboard;
