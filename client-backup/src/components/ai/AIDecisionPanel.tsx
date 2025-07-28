import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  CardActions,
} from '@material-ui/core';
import {
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@material-ui/icons';
import { AIDecision, ModelType, AIRequestContext } from '../../types/ai';
import { aiService } from '../../services/ai/AIService';

interface AIDecisionPanelProps {
  /** The context data for the AI decision */
  context: AIRequestContext;
  /** The type of AI model to use */
  modelType: ModelType;
  /** Callback when a decision is made */
  onDecision?: (decision: AIDecision) => void;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Additional CSS class */
  className?: string;
  /** Whether to auto-fetch the decision on mount */
  autoFetch?: boolean;
  /** Whether the panel can be expanded/collapsed */
  collapsible?: boolean;
  /** Whether to show the refresh button */
  showRefresh?: boolean;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiCardHeader-title': {
      fontWeight: 600,
    },
  },
  cardContent: {
    flexGrow: 1,
    overflow: 'auto',
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  chip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  reasoningStep: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  confidenceMeter: {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.grey[200],
    '& > div': {
      height: '100%',
      borderRadius: 4,
      backgroundColor: theme.palette.success.main,
    },
  },
  tabPanel: {
    padding: theme.spacing(2, 0),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  success: {
    color: theme.palette.success.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  info: {
    color: theme.palette.info.main,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-decision-tabpanel-${index}`}
      aria-labelledby={`ai-decision-tab-${index}`}
      className={classes.tabPanel}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `ai-decision-tab-${index}`,
    'aria-controls': `ai-decision-tabpanel-${index}`,
  };
}

interface AIDecisionPanelProps {
  context: any;
  modelType: 'rfq_analysis' | 'pricing' | 'supplier_selection' | 'inventory';
  onDecision?: (decision: any) => void;
  onError?: (error: Error) => void;
}

const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({
  context,
  modelType,
  onDecision,
  onError,
}) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getRecommendationIcon = (confidence: number) => {
    if (confidence >= 0.8) {
      return <CheckCircleIcon className={classes.success} />;
    } else if (confidence >= 0.5) {
      return <WarningIcon className={classes.warning} />;
    } else {
      return <ErrorIcon className={classes.error} />;
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'primary';
    if (confidence >= 0.5) return 'default';
    return 'secondary';
  };

  const analyzeWithAZR = async () => {
    try {
      setLoading(true);
      const result = await azrService.getExplanation({
        input: context,
        modelType: modelType as any,
        depth: 3,
      });
      setExplanation(result);
      return result;
    } catch (error) {
      console.error('AZR analysis failed:', error);
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRLVRRecommendations = async (context: any) => {
    try {
      setLoading(true);
      let result;
      
      switch (modelType) {
        case 'pricing':
          result = await rlvrService.optimizePricing(
            context.productData,
            context.marketData,
            context.constraints || {}
          );
          setRecommendations([{ type: 'pricing', data: result }]);
          break;
          
        case 'supplier_selection':
          result = await rlvrService.recommendSuppliers(
            context.requirements,
            context.constraints || {}
          );
          setRecommendations(result.recommendations || []);
          break;
          
        case 'inventory':
          result = await rlvrService.optimizeInventory(
            context.inventoryData,
            context.demandForecast,
            context.constraints || {}
          );
          setRecommendations([{ type: 'inventory', data: result }]);
          break;
          
        default:
          throw new Error(`Unsupported model type: ${modelType}`);
      }
      
      return result;
    } catch (error) {
      console.error('RLVR recommendation failed:', error);
      onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      const explanation = await analyzeWithAZR();
      await getRLVRRecommendations({
        ...context,
        azrExplanation: explanation,
      });
      
      if (onDecision) {
        onDecision({
          explanation,
          recommendations,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  useEffect(() => {
    if (context) {
      // Auto-analyze when context changes
      handleAnalyze();
    }
  }, [context]);

  const renderExplanation = () => {
    if (!explanation) return null;
    
    return (
      <div className={classes.section}>
        <Typography variant="h6" gutterBottom>
          AI Explanation
        </Typography>
        <Paper variant="outlined" style={{ padding: 16, marginBottom: 16 }}>
          <Typography variant="body1" paragraph>
            {explanation.text}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="subtitle2" style={{ marginRight: 8 }}>
              Confidence:
            </Typography>
            <Box flexGrow={1} mr={2}>
              <div className={classes.confidenceMeter}>
                <div style={{ width: `${explanation.confidence * 100}%` }} />
              </div>
            </Box>
            <Chip
              size="small"
              label={`${Math.round(explanation.confidence * 100)}%`}
              color={getConfidenceColor(explanation.confidence)}
            />
          </Box>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Reasoning Path:
          </Typography>
          <List>
            {explanation.reasoningPath?.map((step: any, index: number) => (
              <React.Fragment key={index}>
                <ListItem 
                  button 
                  onClick={() => toggleStep(index)}
                  className={classes.reasoningStep}
                >
                  <ListItemIcon>
                    {step.impact === 'high' ? (
                      <ErrorIcon color="error" />
                    ) : step.impact === 'medium' ? (
                      <WarningIcon className={classes.warning} />
                    ) : (
                      <InfoIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Step ${step.step}: ${step.rule}`}
                    secondary={`Confidence: ${Math.round(step.confidence * 100)}%`}
                  />
                  {expandedSteps[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItem>
                <Collapse in={expandedSteps[index]} timeout="auto" unmountOnExit>
                  <Box pl={6} pr={2} py={1} bgcolor="action.hover" borderRadius={4}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) return null;
    
    return (
      <div className={classes.section}>
        <Typography variant="h6" gutterBottom>
          AI Recommendations
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardHeader
                  avatar={getRecommendationIcon(rec.confidence || 0.8)}
                  action={
                    <Tooltip title="Confidence level">
                      <Chip
                        size="small"
                        label={getConfidenceLabel(rec.confidence || 0.8)}
                        color={getConfidenceColor(rec.confidence || 0.8)}
                        variant="outlined"
                      />
                    </Tooltip>
                  }
                  title={`Recommendation #${index + 1}`}
                  subheader={`${rec.type || 'General'} recommendation`}
                />
                <CardContent>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                    {JSON.stringify(rec.data || rec, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };

  const renderFeatures = () => {
    if (!explanation?.metadata?.features) return null;
    
    return (
      <div className={classes.section}>
        <Typography variant="h6" gutterBottom>
          Feature Importance
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(explanation.metadata.features).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Paper variant="outlined" style={{ padding: 16 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {key}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {explanation.metadata.featureDescriptions?.[key] || 'No description available'}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label={`Importance: ${(explanation.metadata.featureImportances?.[key] * 100).toFixed(1)}%`}
                    className={classes.chip}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };

  const renderLoading = () => (
    <Box className={classes.loadingContainer}>
      <Box textAlign="center">
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
          Analyzing data and generating insights...
        </Typography>
      </Box>
    </Box>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    
    return (
      <>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="AI decision tabs"
        >
          <Tab label="Explanation" icon={<InfoIcon />} {...a11yProps(0)} />
          <Tab label="Recommendations" icon={<AssessmentIcon />} {...a11yProps(1)} />
          <Tab label="Features" icon={<ChartIcon />} {...a11yProps(2)} />
          <Tab label="Insights" icon={<TimelineIcon />} {...a11yProps(3)} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {renderExplanation()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderRecommendations()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {renderFeatures()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1" color="textSecondary">
            Additional insights and analytics will be displayed here.
          </Typography>
        </TabPanel>
      </>
    );
  };

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          title={
            <Box display="flex" alignItems="center">
              <AssessmentIcon style={{ marginRight: 8 }} />
              <span>AI Decision Support</span>
              <Tooltip title="This panel provides AI-powered explanations and recommendations based on your current context.">
                <IconButton size="small" style={{ marginLeft: 8, color: 'inherit' }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          subheader={`Model: ${modelType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        />
        <CardContent className={classes.cardContent}>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDecisionPanel;
