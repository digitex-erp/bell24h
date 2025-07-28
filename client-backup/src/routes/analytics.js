import express from 'express';

const router = express.Router();

// Mock analytics data
const generateMockData = () => {
  // Generate some random data for the dashboard
  const rfqData = {
    total: 48,
    pending: 12,
    completed: 28,
    rejected: 8,
    monthlyTrend: [25, 30, 35, 40, 45, 48]
  };
  
  const supplierData = {
    total: 87,
    verified: 62,
    new: 15,
    inactive: 10,
    byCategory: {
      Electronics: 24,
      Industrial: 18,
      Services: 15,
      Software: 12,
      Other: 18
    }
  };
  
  const transactionData = {
    total: 156,
    value: 1250000,
    average: 8013,
    byMonth: [
      { month: 'Jan', value: 150000 },
      { month: 'Feb', value: 175000 },
      { month: 'Mar', value: 200000 },
      { month: 'Apr', value: 225000 },
      { month: 'May', value: 250000 },
      { month: 'Jun', value: 250000 }
    ]
  };
  
  return {
    rfq: rfqData,
    suppliers: supplierData,
    transactions: transactionData,
    timestamp: new Date().toISOString()
  };
};

// Get dashboard analytics
router.get('/dashboard', (req, res) => {
  // In a real app, this data would come from database queries
  const analyticsData = generateMockData();
  res.json(analyticsData);
});

// Get RFQ analytics
router.get('/rfq', (req, res) => {
  const rfqAnalytics = {
    ...generateMockData().rfq,
    byCategory: {
      Electronics: 15,
      Industrial: 12,
      Services: 10,
      Software: 8,
      Other: 3
    },
    byStatus: {
      draft: 5,
      open: 12,
      inProgress: 15,
      completed: 16
    }
  };
  
  res.json(rfqAnalytics);
});

// Get supplier analytics
router.get('/suppliers', (req, res) => {
  const supplierAnalytics = {
    ...generateMockData().suppliers,
    verificationRate: '71%',
    responseTime: {
      average: '2.5 days',
      byCategory: {
        Electronics: '2 days',
        Industrial: '3 days',
        Services: '2 days',
        Software: '1.5 days',
        Other: '4 days'
      }
    }
  };
  
  res.json(supplierAnalytics);
});

export default router;
