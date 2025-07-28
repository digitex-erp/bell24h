import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Alert,
  AlertTitle,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ShowChart as ChartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useAIDecision } from '../../hooks/useAIDecision';
import AIDecisionPanel from '../../components/ai/AIDecisionPanel';

// Sample data for different model types
const SAMPLE_CONTEXTS = {
  pricing: {
    productData: {
      id: 'prod_123',
      name: 'Raspberry Pi 4 Model B (4GB RAM)',
      cost: 35.00,
      category: 'Electronics',
      supplierId: 'supplier_456',
    },
    marketData: {
      competitorPrice: 49.99,
      demand: 'high',
      marketTrend: 'increasing',
      competitorPrices: [45.99, 49.99, 52.50, 48.75],
    },
    constraints: {
      minMargin: 0.2,
      maxPrice: 59.99,
      priceIncrement: 0.5,
    },
  },
  supplier_selection: {
    requirements: {
      productCategory: 'Electronics',
      requiredCertifications: ['ISO 9001', 'RoHS'],
      minRating: 4.0,
      maxLeadTime: 30, // days
      targetPrice: 45.00,
      locationPreferences: ['China', 'Taiwan', 'South Korea'],
    },
    constraints: {
      maxSuppliers: 5,
      minOrderQuantity: 100,
      preferredShippingMethods: ['air', 'sea'],
    },
  },
  inventory: {
    inventoryData: {
      productId: 'prod_123',
      currentStock: 150,
      reorderPoint: 100,
      leadTime: 14, // days
      holdingCost: 2.5, // per unit per month
      orderCost: 50, // fixed cost per order
    },
    demandForecast: {
      expectedDemand: 200,
      demandVariance: 25,
      seasonalityFactor: 1.2,
      historicalDemand: [180, 195, 210, 225, 200, 190, 205, 220],
    },
    constraints: {
      maxStock: 500,
      minOrderQuantity: 50,
      budget: 10000,
    },
  },
  rfq_analysis: {
    rfq: {
      id: 'rfq_789',
      product: 'Raspberry Pi 4 Model B (4GB RAM)',
      quantity: 1000,
      requiredBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 50000,
      currency: 'USD',
      specifications: {
        ram: '4GB',
        processor: 'Broadcom BCM2711',
        connectivity: ['WiFi', 'Bluetooth 5.0', 'Gigabit Ethernet'],
        ports: ['2x USB 3.0', '2x USB 2.0', '2x micro-HDMI', '3.5mm audio'],
      },
    },
    supplier: {
      id: 'supplier_456',
      name: 'Global Electronics Inc.',
      rating: 4.5,
      responseTime: '2h 15m',
      completionRate: 0.92,
      location: 'Shenzhen, China',
      yearsInBusiness: 8,
      certifications: ['ISO 9001', 'RoHS', 'REACH'],
    },
    marketConditions: {
      demand: 'high',
      supply: 'moderate',
      priceTrend: 'increasing',
      competitorPrices: [45, 48, 52, 47],
    },
  },
};

const AIDecisionDemo: React.FC = () => {
  const theme = useTheme();
  const [modelType, setModelType] = useState<keyof typeof SAMPLE_CONTEXTS>('rfq_analysis');
  const [context, setContext] = useState<any>(SAMPLE_CONTEXTS.rfq_analysis);
  const [expandedContext, setExpandedContext] = useState<boolean>(false);
  
  const { 
    loading, 
    explanation, 
    recommendations, 
    error, 
    analyze, 
    reset 
  } = useAIDecision({
    modelType,
    onDecision: (decision) => {
      console.log('AI Decision:', decision);
    },
    onError: (err) => {
      console.error('AI Decision Error:', err);
    },
  });

  const handleModelTypeChange = (event: SelectChangeEvent) => {
    const newModelType = event.target.value as keyof typeof SAMPLE_CONTEXTS;
    setModelType(newModelType);
    setContext(SAMPLE_CONTEXTS[newModelType]);
  };

  const handleContextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newContext = JSON.parse(event.target.value);
      setContext(newContext);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const handleAnalyze = () => {
    analyze(context);
  };

  const handleReset = () => {
    reset();
    setContext(SAMPLE_CONTEXTS[modelType]);
  };

  const handleUseSample = () => {
    setContext(SAMPLE_CONTEXTS[modelType]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <AutoAwesomeIcon fontSize="large" sx={{ verticalAlign: 'middle', mr: 1 }} />
        AI Decision Support Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This demo showcases the integration of AZR (Absolute Zero Reasoner) and RLVR (Reinforcement Learning with 
        Value-based Reasoning) to provide explainable AI-powered decisions and recommendations for various business scenarios.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left side - Controls and Input */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <PsychologyIcon sx={{ mr: 1 }} />
                  <span>AI Decision Input</span>
                </Box>
              }
              subheader="Configure the AI decision parameters"
              action={
                <Tooltip title="Reset to default">
                  <IconButton onClick={handleReset} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="model-type-label">Decision Scenario</InputLabel>
                <Select
                  labelId="model-type-label"
                  value={modelType}
                  label="Decision Scenario"
                  onChange={handleModelTypeChange}
                  disabled={loading}
                >
                  <MenuItem value="rfq_analysis">RFQ Analysis</MenuItem>
                  <MenuItem value="pricing">Pricing Optimization</MenuItem>
                  <MenuItem value="supplier_selection">Supplier Selection</MenuItem>
                  <MenuItem value="inventory">Inventory Optimization</MenuItem>
                </Select>
              </FormControl>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Context Data</Typography>
                  <Box>
                    <Button 
                      size="small" 
                      onClick={handleUseSample}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Use Sample
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => setExpandedContext(!expandedContext)}
                      endIcon={expandedContext ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      {expandedContext ? 'Collapse' : 'Expand'}
                    </Button>
                  </Box>
                </Box>
                
                <Collapse in={expandedContext} collapsedSize={120}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    variant="outlined"
                    value={JSON.stringify(context, null, 2)}
                    onChange={handleContextChange}
                    disabled={loading}
                    InputProps={{
                      style: {
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                      },
                    }}
                  />
                </Collapse>
              </Box>
              
              <Box mt="auto" pt={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                  size="large"
                >
                  {loading ? 'Analyzing...' : 'Get AI Decision'}
                </Button>
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <AlertTitle>Error</AlertTitle>
                    {error.message || 'Failed to get AI decision. Please try again.'}
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right side - AI Decision Panel */}
        <Grid item xs={12} md={7}>
          <AIDecisionPanel 
            context={context} 
            modelType={modelType as any} 
            onDecision={(decision) => {
              console.log('Decision made:', decision);
            }}
            onError={(err) => {
              console.error('Decision error:', err);
            }}
          />
        </Grid>
      </Grid>
      
      <Box mt={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            <InfoIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
            About This Demo
          </Typography>
          <Typography variant="body2" paragraph>
            This demo showcases how Bell24H uses advanced AI to provide explainable decisions and recommendations 
            for various business scenarios. The system combines:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader
                  title="AZR (Absolute Zero Reasoner)"
                  subheader="Explainable AI for transparent decision making"
                  avatar={<PsychologyIcon color="primary" />}
                />
                <CardContent>
                  <Typography variant="body2">
                    AZR provides human-understandable explanations for AI decisions, helping you understand the 'why' 
                    behind each recommendation. It evaluates multiple factors and provides a clear reasoning path.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader
                  title="RLVR (Reinforcement Learning with Value-based Reasoning)"
                  subheader="Adaptive learning for optimal outcomes"
                  avatar={<TimelineIcon color="secondary" />}
                />
                <CardContent>
                  <Typography variant="body2">
                    RLVR uses reinforcement learning to continuously improve recommendations based on feedback and 
                    changing conditions. It optimizes for long-term value while considering business constraints.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default AIDecisionDemo;
