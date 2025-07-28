import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  SelectChangeEvent, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAZR } from '../../contexts/AZRContext';
import AZRExplanationView from '../../components/ai/AZRExplanationView';

// Sample supplier data for demonstration
const SAMPLE_SUPPLIER = {
  id: 'supplier-123',
  name: 'Global Electronics Inc.',
  rating: 4.5,
  responseTime: '2h 15m',
  completionRate: 0.92,
  location: 'Shenzhen, China',
  yearsInBusiness: 8,
  certifications: ['ISO 9001', 'RoHS', 'REACH'],
  riskFactors: {
    financialStability: 0.75,
    deliveryReliability: 0.85,
    qualityConsistency: 0.78,
    complianceHistory: 0.9,
  },
  recentIncidents: [
    { type: 'delayed_shipment', count: 2, severity: 'low' },
    { type: 'quality_issue', count: 1, severity: 'medium' },
  ],
};

// Model types for the demo
const MODEL_TYPES = [
  { value: 'rfq_classification', label: 'RFQ Classification' },
  { value: 'bid_pricing', label: 'Bid Pricing' },
  { value: 'product_categorization', label: 'Product Categorization' },
  { value: 'supplier_risk', label: 'Supplier Risk Analysis' },
  { value: 'esg_scoring', label: 'ESG Scoring' },
];

// Sample input templates for different model types
const SAMPLE_INPUTS: Record<string, any> = {
  rfq_classification: {
    text: 'Looking for a supplier of 1000 units of Raspberry Pi 4 Model B with 4GB RAM. Need delivery within 4 weeks to New York.',
    category: 'Electronics',
    budget: 50000,
    currency: 'USD',
  },
  bid_pricing: {
    product: 'Raspberry Pi 4 Model B (4GB RAM)',
    quantity: 1000,
    supplierLocation: 'China',
    destination: 'New York, USA',
    shippingMethod: 'express',
    marketDemand: 'high',
    competitorPrices: [45, 48, 52, 47],
  },
  product_categorization: {
    title: 'Raspberry Pi 4 Model B 4GB RAM Single Board Computer',
    description: 'The Raspberry Pi 4 Model B is the latest product in the popular Raspberry Pi range of computers. It offers ground-breaking increases in processor speed, multimedia performance, memory, and connectivity compared to the prior-generation Raspberry Pi 3 Model B+...',
    price: 55.00,
    keywords: ['single board computer', 'raspberry pi', 'maker board', 'iot'],
  },
  supplier_risk: SAMPLE_SUPPLIER,
  esg_scoring: {
    ...SAMPLE_SUPPLIER,
    esgData: {
      environmental: {
        carbonFootprint: 0.75,
        energyEfficiency: 0.8,
        wasteManagement: 0.7,
      },
      social: {
        laborPractices: 0.85,
        communityImpact: 0.9,
        humanRights: 0.8,
      },
      governance: {
        boardDiversity: 0.7,
        businessEthics: 0.9,
        transparency: 0.8,
      },
    },
  },
};

const AZRDemoPage: React.FC = () => {
  const theme = useTheme();
  const { 
    explanation, 
    loading, 
    error, 
    getExplanation, 
    isServiceAvailable,
    checkServiceStatus,
  } = useAZR();
  
  const [modelType, setModelType] = useState<string>('supplier_risk');
  const [inputText, setInputText] = useState<string>('');
  const [showRawInput, setShowRawInput] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'features' | 'raw'>('explanation');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Initialize with sample data
  useEffect(() => {
    updateSampleInput(modelType);
    checkServiceAvailability();
  }, []);

  const checkServiceAvailability = async () => {
    setServiceStatus('checking');
    try {
      const isAvailable = await checkServiceStatus();
      setServiceStatus(isAvailable ? 'available' : 'unavailable');
    } catch (error) {
      console.error('Failed to check service status:', error);
      setServiceStatus('unavailable');
    }
  };

  const updateSampleInput = (type: string) => {
    const sample = SAMPLE_INPUTS[type] || {};
    setInputText(JSON.stringify(sample, null, 2));
  };

  const handleModelTypeChange = (event: SelectChangeEvent) => {
    const newModelType = event.target.value;
    setModelType(newModelType);
    updateSampleInput(newModelType);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      let inputData;
      try {
        inputData = JSON.parse(inputText);
      } catch (error) {
        console.error('Invalid JSON input:', error);
        return;
      }

      await getExplanation({
        input: inputData,
        modelType: modelType as any,
        context: {
          userId: 'demo-user-123',
          sessionId: 'demo-session-456',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error getting explanation:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'explanation' | 'features' | 'raw') => {
    setActiveTab(newValue);
  };

  const handleUseSample = () => {
    updateSampleInput(modelType);
  };

  const renderServiceStatus = () => {
    switch (serviceStatus) {
      case 'checking':
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="body2">Checking AZR service status...</Typography>
          </Box>
        );
      case 'available':
        return (
          <Box display="flex" alignItems="center" gap={1} color="success.main">
            <CheckCircleIcon fontSize="small" />
            <Typography variant="body2">AZR service is available</Typography>
          </Box>
        );
      case 'unavailable':
        return (
          <Box display="flex" alignItems="center" gap={1} color="error.main">
            <ErrorIcon fontSize="small" />
            <Typography variant="body2">AZR service is unavailable</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Box display="flex" alignItems="center" gap={2}>
            <PsychologyIcon color="primary" />
            AZR Absolute Zero Reasoner Demo
          </Box>
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The AZR (Absolute Zero Reasoner) provides explainable AI insights for your business decisions.
          Try it out by selecting a model type and providing input data.
        </Typography>
        
        <Box mt={2} mb={3}>
          {renderServiceStatus()}
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Input
              </Typography>
              <Box>
                <Button 
                  size="small" 
                  startIcon={<RefreshIcon />}
                  onClick={handleUseSample}
                  disabled={loading}
                >
                  Use Sample
                </Button>
              </Box>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="model-type-label">Model Type</InputLabel>
              <Select
                labelId="model-type-label"
                value={modelType}
                onChange={handleModelTypeChange}
                label="Model Type"
                disabled={loading}
              >
                {MODEL_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={2} mb={1} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="textSecondary">
                Input Data
              </Typography>
              <Button 
                size="small" 
                onClick={() => setShowRawInput(!showRawInput)}
                endIcon={showRawInput ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showRawInput ? 'Hide Raw' : 'Show Raw'}
              </Button>
            </Box>

            <Collapse in={showRawInput}>
              <TextField
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                value={inputText}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter input data as JSON..."
                sx={{ 
                  fontFamily: 'monospace',
                  '& .MuiInputBase-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Collapse>

            {!showRawInput && (
              <Card variant="outlined" sx={{ mt: 1, maxHeight: '300px', overflow: 'auto' }}>
                <CardHeader 
                  title={
                    <Typography variant="subtitle2" color="textSecondary">
                      {MODEL_TYPES.find(mt => mt.value === modelType)?.label} Input
                    </Typography>
                  }
                  action={
                    <Tooltip title="View Raw">
                      <IconButton size="small" onClick={() => setShowRawInput(true)}>
                        <CodeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{ 
                    pb: 0, 
                    '& .MuiCardHeader-action': { m: 0 } 
                  }}
                />
                <CardContent>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}>
                    {JSON.stringify(JSON.parse(inputText || '{}'), null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading || !isServiceAvailable}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />}
              >
                {loading ? 'Analyzing...' : 'Get Explanation'}
              </Button>
            </Box>

            {!isServiceAvailable && serviceStatus === 'unavailable' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <AlertTitle>Service Unavailable</AlertTitle>
                The AZR service is currently unavailable. Please try again later or contact support.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Explanation
              </Typography>
              {explanation && (
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ minHeight: 'auto' }}
                >
                  <Tab value="explanation" label="Reasoning" />
                  <Tab value="features" label="Features" />
                  <Tab value="raw" label="Raw Data" />
                </Tabs>
              )}
            </Box>

            <Box flexGrow={1} minHeight="300px">
              {error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <AlertTitle>Error</AlertTitle>
                  {error}
                </Alert>
              ) : explanation ? (
                <Box>
                  <AZRExplanationView 
                    explanation={explanation} 
                    loading={loading}
                    onFeatureSelect={(feature) => {
                      console.log('Feature selected:', feature);
                    }}
                  />
                </Box>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  textAlign="center"
                  p={4}
                  color="text.secondary"
                >
                  <PsychologyIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Explanation Generated Yet
                  </Typography>
                  <Typography variant="body2">
                    Enter your input data and click "Get Explanation" to see the AI's reasoning process.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About AZR Absolute Zero Reasoner
          </Typography>
          <Typography variant="body1" paragraph>
            The AZR (Absolute Zero Reasoner) is an advanced AI reasoning framework that provides 
            transparent and explainable insights for AI-driven decisions. It helps you understand 
            the "why" behind AI predictions and recommendations.
          </Typography>
          <Typography variant="body1">
            <strong>Key Features:</strong>
          </Typography>
          <ul>
            <li>Transparent decision-making with human-readable explanations</li>
            <li>Customizable reasoning rules for different business domains</li>
            <li>Feature importance and impact analysis</li>
            <li>Support for multiple model types and use cases</li>
            <li>Integration with existing AI/ML workflows</li>
          </ul>
        </Paper>
      </Box>
    </Box>
  );
};

export default AZRDemoPage;
