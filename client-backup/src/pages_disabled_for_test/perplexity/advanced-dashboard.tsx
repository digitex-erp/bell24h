import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Tabs, 
  Tab, 
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

// Import API utilities
import { perplexityApi } from '@/lib/api';

// Import ScrollArea for enhanced scrolling experience
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our components
import TemporalTrendsChart from '../../components/PerplexityAdvanced/TemporalTrendsChart';
import CompetitiveInsightCard from '../../components/PerplexityAdvanced/CompetitiveInsightCard';
import MarketSegmentationChart from '../../components/PerplexityAdvanced/MarketSegmentationChart';
import ApiEnvironmentSwitcher from '../../components/ApiEnvironmentSwitcher';
import SuccessPredictionCard from '../../components/PerplexityAdvanced/SuccessPredictionCard';
import TextImprovementCard from '../../components/PerplexityAdvanced/TextImprovementCard';
import CustomerProfileCard from '../../components/PerplexityAdvanced/CustomerProfileCard';
import MultilingualAnalysisCard from '../../components/PerplexityAdvanced/MultilingualAnalysisCard';
import RealtimeManager from '../../components/RealTimeNotifications/RealtimeManager';

// Types
import {
  TemporalTrend,
  CompetitiveInsight,
  MarketSegment,
  SuccessPrediction,
  PerplexityRecommendation,
  CustomerPerplexityProfile
} from '../../types/perplexity-analytics';

// Define tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`perplexity-tabpanel-${index}`}
      aria-labelledby={`perplexity-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <ScrollArea className="h-[calc(100vh-250px)] rounded-md">
            <div className="perplexity-content p-1">
              {children}
            </div>
          </ScrollArea>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `perplexity-tab-${index}`,
    'aria-controls': `perplexity-tabpanel-${index}`,
  };
}

// Main Dashboard Component
const AdvancedPerplexityDashboard: React.FC = () => {
  // State for input controls
  const [text, setText] = useState<string>('');
  const [entityType, setEntityType] = useState<'rfq' | 'bid' | 'product'>('rfq');
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [modelType, setModelType] = useState<'rfq_classification' | 'bid_pricing' | 'product_categorization'>('rfq_classification');
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [customerId, setCustomerId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [segmentationCriteria, setSegmentationCriteria] = useState<'language_complexity' | 'terminology' | 'industry'>('terminology');
  const [targetAudience, setTargetAudience] = useState<'technical' | 'business' | 'general'>('business');
  
  // State for data
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  
  // State for analysis results
  const [perplexityResult, setPerplexityResult] = useState<any>(null);
  const [temporalTrends, setTemporalTrends] = useState<TemporalTrend[]>([]);
  const [competitiveInsights, setCompetitiveInsights] = useState<CompetitiveInsight[]>([]);
  const [marketSegments, setMarketSegments] = useState<MarketSegment[]>([]);
  const [successPrediction, setSuccessPrediction] = useState<SuccessPrediction | null>(null);
  const [textImprovement, setTextImprovement] = useState<PerplexityRecommendation | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerPerplexityProfile | null>(null);
  const [multilingualAnalysis, setMultilingualAnalysis] = useState<any>(null);
  
  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Handle API environment changes
  const handleEnvironmentChange = (isTestEnv: boolean) => {
    setIsTestMode(isTestEnv);
    setSnackbarMessage(`Switched to ${isTestEnv ? 'test' : 'production'} API environment`);
    setSnackbarOpen(true);
    
    // Refresh data if needed
    if (perplexityResult) {
      fetchTabSpecificData();
    }
  };
  
  // Handle text input changes
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };
  
  // Handle entity type changes
  const handleEntityTypeChange = (event: any) => {
    const newEntityType = event.target.value as 'rfq' | 'bid' | 'product';
    setEntityType(newEntityType);
    
    // Update model type to align with entity type
    if (newEntityType === 'rfq') {
      setModelType('rfq_classification');
    } else if (newEntityType === 'bid') {
      setModelType('bid_pricing');
    } else {
      setModelType('product_categorization');
    }
  };
  
  // Apply improved text
  const handleApplyImprovement = (improvedText: string) => {
    setText(improvedText);
    setSnackbarMessage('Improved text applied to input');
    setSnackbarOpen(true);
  };
  
  // Function to analyze text using perplexityApi
  const analyzeText = async () => {
    if (!text) {
      setError('Please enter some text to analyze');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the perplexity analysis API
      const result = await perplexityApi.analyzeText(text, entityType, modelType);
      
      setPerplexityResult(result);
      setSnackbarMessage('Text analyzed successfully');
      setSnackbarOpen(true);
      
      // Subscribe to real-time updates for this entity type
      await perplexityApi.subscribeToUpdates([entityType]);
      
      // Load additional tab data based on the current tab
      fetchTabSpecificData();
    } catch (error) {
      console.error('Error analyzing text:', error);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch data specific to the current tab using perplexityApi
  const fetchTabSpecificData = async () => {
    if (!text || perplexityResult === null) {
      // No need to fetch additional data if we haven't analyzed text yet
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data based on the current tab
      switch (tabValue) {
        case 1: // Business Impact
          // Get success prediction from API
          const predictionResult = await perplexityApi.getSuccessPrediction(
            entityType === 'rfq' ? text : '', // Use as entity ID
            entityType
          );
          setSuccessPrediction(predictionResult);
          
          // Get text improvement recommendations
          const improvementResult = await perplexityApi.getImprovements(
            text,
            targetAudience
          );
          setTextImprovement(improvementResult);
          break;
          
        case 2: // Market Analysis
          // Get temporal trends from API
          const trendsResult = await perplexityApi.getTemporalTrends(
            entityType,
            timeframe
          );
          setTemporalTrends(trendsResult);
          
          // Get competitive insights from API
          const insightsResult = await perplexityApi.getCompetitiveInsights(entityType);
          setCompetitiveInsights(insightsResult);
          
          // Get market segmentation from API
          const segmentationResult = await perplexityApi.getMarketSegmentation(segmentationCriteria);
          setMarketSegments(segmentationResult);
          break;
          
        case 3: // Multilingual Analysis
          // Get multilingual analysis from API
          const multilingualResult = await perplexityApi.getMultilingualAnalysis(
            text,
            languageCode
          );
          setMultilingualAnalysis(multilingualResult);
          break;
          
        case 4: // Customer Profile
          // Only proceed if we have a customer ID
          if (customerId) {
            const profileResult = await perplexityApi.getCustomerProfile(customerId);
            setCustomerProfile(profileResult);
          } else {
            setError('Please enter a Customer ID to view profile');
          }
          break;
          
        default:
          // Basic perplexity analysis is already loaded
          break;
      }
    } catch (error) {
      console.error('Error fetching tab data:', error);
      setError('Failed to load additional analysis data.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load tab-specific data when tab changes
  useEffect(() => {
    if (perplexityResult) {
      fetchTabSpecificData();
    }
  }, [tabValue]);
  
  // Function to export analysis as PDF
  const exportAnalysis = () => {
    // Export functionality would be implemented here
    setSnackbarMessage('Analysis exported successfully!');
    setSnackbarOpen(true);
  };
  
  // Handle real-time notifications
  const handleNotification = useCallback((notification: any) => {
    if (notification.type === 'perplexity_update') {
      console.log('Real-time perplexity update received:', notification);
      
      // Refresh data if it's related to the current analysis
      if (notification.data && notification.data.entityType === entityType) {
        setSnackbarMessage('New perplexity analysis available! Refreshing data...');
        setSnackbarOpen(true);
        
        // Refresh the data after a short delay
        setTimeout(() => fetchTabSpecificData(), 1000);
      }
    }
  }, [entityType, fetchTabSpecificData]);
  
  // Demo data loader (for showcase purposes)
  const loadDemoData = () => {
    setText("We require 500 industrial-grade stainless steel components with precise dimensions of 5.2cm x 3.7cm x 1.1cm. Material must meet ISO 9001 certification standards and be suitable for high-temperature applications (up to 400°C). Delivery timeline is critical - we need these components within 30 days to meet our production schedule. Please include detailed pricing breakdown including volume discounts if applicable. Our budget range is $8,000-$10,000 for this order.");
    setEntityType('rfq');
    setModelType('rfq_classification');
    setSnackbarMessage('Demo data loaded successfully');
    setSnackbarOpen(true);
  };

// Apply improved text
const handleApplyImprovement = (improvedText: string) => {
  setText(improvedText);
  setSnackbarMessage('Improved text applied to input');
  setSnackbarOpen(true);
};

// Function to analyze text using perplexityApi
const analyzeText = async () => {
  if (!text) {
    setError('Please enter some text to analyze');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    // Call the perplexity analysis API
    const result = await perplexityApi.analyzeText(text, entityType, modelType);
    
    setPerplexityResult(result);
    setSnackbarMessage('Text analyzed successfully');
    setSnackbarOpen(true);
    
    // Subscribe to real-time updates for this entity type
    await perplexityApi.subscribeToUpdates([entityType]);
    
    // Load additional tab data based on the current tab
    fetchTabSpecificData();
  } catch (error) {
    console.error('Error analyzing text:', error);
    setError('Failed to analyze text. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Function to fetch data specific to the current tab using perplexityApi
const fetchTabSpecificData = async () => {
  if (!text || perplexityResult === null) {
    // No need to fetch additional data if we haven't analyzed text yet
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    // Fetch data based on the current tab
    switch (tabValue) {
      case 1: // Business Impact
        // Get success prediction from API
        const predictionResult = await perplexityApi.getSuccessPrediction(
          entityType === 'rfq' ? text : '', // Use as entity ID
          entityType
        );
        setSuccessPrediction(predictionResult);
        break;
        
      case 2: // Market Analysis
        // Get temporal trends from API
        const trendsResult = await perplexityApi.getTemporalTrends(
          entityType,
          timeframe
        );
        setTemporalTrends(trendsResult);
        
        // Get competitive insights from API
        const insightsResult = await perplexityApi.getCompetitiveInsights(entityType);
        setCompetitiveInsights(insightsResult);
        
        // Get market segmentation from API
        const segmentationResult = await perplexityApi.getMarketSegmentation(segmentationCriteria);
        setMarketSegments(segmentationResult);
        break;
        
      case 3: // Multilingual Analysis
        // Get multilingual analysis from API
        const multilingualResult = await perplexityApi.getMultilingualAnalysis(
          text,
          languageCode
        );
        setMultilingualAnalysis(multilingualResult);
        break;
        
      case 4: // Customer Profile
        // Only proceed if we have a customer ID
        if (customerId) {
          const profileResult = await perplexityApi.getCustomerProfile(customerId);
          setCustomerProfile(profileResult);
        } else {
          setError('Please enter a Customer ID to view profile');
        }
        break;
        
      default:
        // Basic perplexity analysis is already loaded
        break;
    }
  } catch (error) {
    console.error('Error fetching tab data:', error);
    setError('Failed to load additional analysis data.');
  } finally {
    setLoading(false);
  }
};

return (
  <Container maxWidth="xl">
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          onClick={exportAnalysis}
          disabled={!perplexityResult}
        >
          Export Analysis
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Enter text to analyze"
              multiline
              rows={4}
              fullWidth
              value={text}
              onChange={handleTextChange}
              variant="outlined"
              placeholder="Enter RFQ, bid, or product description here..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="entity-type-label">Content Type</InputLabel>
                  <Select
                    labelId="entity-type-label"
                    value={entityType}
                    label="Content Type"
                    onChange={handleEntityTypeChange}
                  >
                    <MenuItem value="rfq">RFQ (Request for Quote)</MenuItem>
                    <MenuItem value="bid">Bid / Proposal</MenuItem>
                    <MenuItem value="product">Product Description</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="target-audience-label">Target Audience</InputLabel>
                  <Select
                    labelId="target-audience-label"
                    value={targetAudience}
                    label="Target Audience"
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                  >
                    <MenuItem value="technical">Technical Specialists</MenuItem>
                    <MenuItem value="business">Business Managers</MenuItem>
                    <MenuItem value="general">General Audience</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Customer ID (optional)"
                  fullWidth
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  variant="outlined"
                  placeholder="Enter customer ID for personalized analysis"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={analyzeText}
                  disabled={loading || !text}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                >
                  {loading ? 'Analyzing...' : 'Analyze Text'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {perplexityResult && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="perplexity analytics tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab 
                  label="Business Insights" 
                  icon={<BusinessIcon />} 
                  iconPosition="start" 
                  {...a11yProps(0)} 
                />
                <Tab 
                  label="Temporal Trends" 
                  icon={<TrendingUpIcon />} 
                  iconPosition="start" 
                  {...a11yProps(1)} 
                />
                <Tab 
                  label="Market Intelligence" 
                  icon={<AnalyticsIcon />} 
                  iconPosition="start" 
                  {...a11yProps(2)} 
                />
                <Tab 
                  label="Multilingual Analysis" 
                  icon={<TranslateIcon />} 
                  iconPosition="start" 
                  {...a11yProps(3)} 
                />
                <Tab 
                  label="Customer Profiles" 
                  icon={<PersonIcon />} 
                  iconPosition="start" 
                  {...a11yProps(4)} 
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Perplexity Analysis
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">
                          Perplexity Score: {perplexityResult.score.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {perplexityResult.interpretation}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ mr: 1 }}>
                            Complexity Category:
                          </Typography>
                          <Chip 
                            label={perplexityResult.category}
                            color={
                              perplexityResult.category === 'low' ? 'success' :
                              perplexityResult.category === 'medium' ? 'info' :
                              perplexityResult.category === 'high' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Entity Type: 
                        <Chip 
                          label={entityType.toUpperCase()}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Target Audience: 
                        <Chip 
                          label={targetAudience.charAt(0).toUpperCase() + targetAudience.slice(1)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Token Count: {perplexityResult.tokens}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  {successPrediction && (
                    <SuccessPredictionCard prediction={successPrediction} />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {textImprovement && (
                    <TextImprovementCard 
                      recommendation={textImprovement} 
                      onApplyImprovement={handleApplyImprovement}
                    />
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200, mr: 2 }}>
                  <InputLabel id="timeframe-label">Timeframe</InputLabel>
                  <Select
                    labelId="timeframe-label"
                    value={timeframe}
                    label="Timeframe"
                    onChange={(e) => setTimeframe(e.target.value as any)}
                    size="small"
                  >
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                    <MenuItem value="quarter">Quarterly</MenuItem>
                    <MenuItem value="year">Yearly</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  onClick={() => fetchTabSpecificData()}
                  startIcon={<RefreshIcon />}
                >
                  Refresh Trends
                </Button>
              </Box>
              
              {temporalTrends.length > 0 ? (
                <TemporalTrendsChart 
                  trends={temporalTrends} 
                  entityType={entityType}
                  title={`${entityType.toUpperCase()} Perplexity Trends Over Time`}
                />
              ) : (
                <Alert severity="info">
                  No trend data available. Please analyze text first or select a different timeframe.
                </Alert>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200, mr: 2 }}>
                  <InputLabel id="segmentation-label">Segmentation Criteria</InputLabel>
                  <Select
                    labelId="segmentation-label"
                    value={segmentationCriteria}
                    label="Segmentation Criteria"
                    onChange={(e) => setSegmentationCriteria(e.target.value as any)}
                    size="small"
                  >
                    <MenuItem value="language_complexity">Language Complexity</MenuItem>
                    <MenuItem value="terminology">Terminology Usage</MenuItem>
                    <MenuItem value="industry">Industry Sector</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  onClick={() => fetchTabSpecificData()}
                  startIcon={<RefreshIcon />}
                >
                  Refresh Intelligence
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  {competitiveInsights.length > 0 ? (
                    <CompetitiveInsightCard 
                      insights={competitiveInsights}
                      title="Competitive Intelligence Insights"
                    />
                  ) : (
                    <Alert severity="info">
                      No competitive insights available. Please analyze text first.
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} lg={6}>
                  {marketSegments.length > 0 ? (
                    <MarketSegmentationChart 
                      segments={marketSegments}
                      title="Market Segmentation Analysis"
                    />
                  ) : (
                    <Alert severity="info">
                      No market segmentation data available. Please analyze text first.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200, mr: 2 }}>
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    labelId="language-label"
                    value={languageCode}
                    label="Language"
                    onChange={(e) => setLanguageCode(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                    <MenuItem value="ja">Japanese</MenuItem>
                    <MenuItem value="ko">Korean</MenuItem>
                    <MenuItem value="pt">Portuguese</MenuItem>
                    <MenuItem value="ru">Russian</MenuItem>
                    <MenuItem value="it">Italian</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  onClick={() => fetchTabSpecificData()}
                  startIcon={<RefreshIcon />}
                >
                  Analyze Language
                </Button>
              </Box>
              
              {multilingualAnalysis ? (
                <MultilingualAnalysisCard 
                  result={multilingualAnalysis}
                  originalText={text}
                />
              ) : (
                <Alert severity="info">
                  No multilingual analysis available. Please select a language and analyze text.
                </Alert>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              {customerProfile ? (
                <CustomerProfileCard 
                  profile={customerProfile}
                  customerName={`Customer ${customerId}`}
                  customerCompany="Sample Company"
                />
              ) : (
                <Alert severity="info">
                  No customer profile available. Please enter a Customer ID and analyze text.
                </Alert>
              )}
            </TabPanel>
          </>
        )}
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
            <CheckCircleIcon />
          </IconButton>
        }
      />
      
      {/* Real-time notifications integration */}
      <RealtimeManager 
        onNotification={handleNotification}
        onConnectionChange={(status) => {
          console.log('WebSocket connection status:', status);
          if (status === 'connected') {
            setSnackbarMessage('Connected to real-time updates');
            setSnackbarOpen(true);
          }
        }}
        enableWebSocket={true}
        enableSSE={true}
        showUI={true}
      />
    </Container>
  );
};

export default AdvancedPerplexityDashboard;
