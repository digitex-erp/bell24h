import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Types
export interface AZRReasoningStep {
  step: number;
  rule: string;
  result: any;
  confidence?: number;
  impact?: 'high' | 'medium' | 'low';
}

export interface AZRExplanationProps {
  explanation: {
    text: string;
    confidence: number;
    reasoningPath: AZRReasoningStep[];
    metadata: {
      modelType: string;
      timestamp: string;
      features?: Record<string, any>;
      featureImportances?: Record<string, number>;
      featureDescriptions?: Record<string, string>;
    };
  };
  loading?: boolean;
  error?: string | null;
  onFeatureSelect?: (feature: { name: string; value: any }) => void;
  className?: string;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(1, 0),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  minHeight: 'auto',
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1, 0),
    '&.Mui-expanded': {
      margin: theme.spacing(1, 0),
    },
  },
}));

const ConfidenceBadge = styled('span')<{ confidence: number }>(({ theme, confidence }) => {
  let color = theme.palette.success.main;
  if (confidence < 0.7) color = theme.palette.warning.main;
  if (confidence < 0.5) color = theme.palette.error.main;
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 1),
    borderRadius: '12px',
    backgroundColor: `${color}15`,
    color: color,
    fontWeight: 500,
    fontSize: '0.75rem',
    '& svg': {
      fontSize: '0.9em',
      marginRight: theme.spacing(0.5),
    },
  };
});

const ImpactChip = styled(Chip)<{ impact?: 'high' | 'medium' | 'low' }>(({ theme, impact = 'medium' }) => {
  const styles = {
    high: {
      bgcolor: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
    medium: {
      bgcolor: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    low: {
      bgcolor: theme.palette.success.light,
      color: theme.palette.success.dark,
    },
  };
  
  return {
    height: '20px',
    fontSize: '0.7rem',
    fontWeight: 600,
    ...styles[impact],
  };
});

const AZRExplanationView: React.FC<AZRExplanationProps> = ({
  explanation,
  loading = false,
  error = null,
  onFeatureSelect,
  className = '',
}) => {
  const theme = useTheme();
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'features' | 'raw'>('reasoning');
  
  // Initialize with all steps expanded
  useEffect(() => {
    if (explanation?.reasoningPath?.length > 0) {
      setExpandedSteps(explanation.reasoningPath.map((_, index) => index));
    }
  }, [explanation]);

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAllSteps = () => {
    if (expandedSteps.length === explanation?.reasoningPath?.length) {
      setExpandedSteps([]);
    } else {
      setExpandedSteps(explanation?.reasoningPath?.map((_, i) => i) || []);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Failed to load explanation</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!explanation) {
    return (
      <Alert severity="info">
        No explanation available. Run the model to see the reasoning process.
      </Alert>
    );
  }

  const { confidence, reasoningPath, metadata } = explanation;
  const hasFeatures = metadata.features && Object.keys(metadata.features).length > 0;

  const renderConfidenceBadge = (value: number) => (
    <ConfidenceBadge confidence={value}>
      {value >= 0.8 ? (
        <CheckCircleIcon fontSize="inherit" />
      ) : value >= 0.5 ? (
        <WarningIcon fontSize="inherit" />
      ) : (
        <ErrorIcon fontSize="inherit" />
      )}
      {Math.round(value * 100)}%
    </ConfidenceBadge>
  );

  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toString();
  };

  return (
    <Paper elevation={0} className={className}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              AI Explanation
            </Typography>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="body2" color="textSecondary">
                Model: <strong>{metadata.modelType}</strong>
              </Typography>
              <Box component="span" mx={1}>•</Box>
              <Typography variant="body2" color="textSecondary">
                Confidence: {renderConfidenceBadge(confidence)}
              </Typography>
              <Box component="span" mx={1}>•</Box>
              <Typography variant="body2" color="textSecondary">
                {new Date(metadata.timestamp || new Date()).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Reasoning Path">
              <IconButton
                size="small"
                color={activeTab === 'reasoning' ? 'primary' : 'default'}
                onClick={() => setActiveTab('reasoning')}
              >
                <PsychologyIcon />
              </IconButton>
            </Tooltip>
            {hasFeatures && (
              <Tooltip title="Features">
                <IconButton
                  size="small"
                  color={activeTab === 'features' ? 'primary' : 'default'}
                  onClick={() => setActiveTab('features')}
                >
                  <ScienceIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Raw Data">
              <IconButton
                size="small"
                color={activeTab === 'raw' ? 'primary' : 'default'}
                onClick={() => setActiveTab('raw')}
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {activeTab === 'reasoning' && (
          <Box>
            <Box mb={3}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                EXPLANATION SUMMARY
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography>{explanation.text}</Typography>
              </Paper>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                REASONING PATH
              </Typography>
              <Typography 
                variant="caption" 
                color="primary" 
                onClick={toggleAllSteps}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                {expandedSteps.length === reasoningPath.length ? 'Collapse All' : 'Expand All'}
              </Typography>
            </Box>

            <Box>
              {reasoningPath.map((step, index) => (
                <StyledAccordion 
                  key={index} 
                  expanded={expandedSteps.includes(index)}
                  onChange={() => toggleStep(index)}
                >
                  <StyledAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`reasoning-step-${index}-content`}
                    id={`reasoning-step-${index}-header`}
                  >
                    <Box width="100%" display="flex" alignItems="center">
                      <Box 
                        sx={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box flexGrow={1}>
                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" noWrap>
                            {step.rule}
                          </Typography>
                          {step.impact && (
                            <ImpactChip 
                              size="small" 
                              label={step.impact.toUpperCase()} 
                              impact={step.impact}
                            />
                          )}
                          {typeof step.confidence === 'number' && (
                            <Box ml="auto">
                              {renderConfidenceBadge(step.confidence)}
                            </Box>
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {typeof step.result === 'string' 
                            ? step.result 
                            : 'Click to view details'}
                        </Typography>
                      </Box>
                    </Box>
                  </StyledAccordionSummary>
                  <AccordionDetails>
                    <Box 
                      component="pre" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper', 
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: '300px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {typeof step.result === 'string' 
                        ? step.result 
                        : JSON.stringify(step.result, null, 2)}
                    </Box>
                  </AccordionDetails>
                </StyledAccordion>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 'features' && hasFeatures && (
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              FEATURE IMPORTANCE
            </Typography>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box>
                {Object.entries(metadata.features || {}).map(([key, value]) => (
                  <Box 
                    key={key}
                    onClick={() => onFeatureSelect?.({ name: key, value })}
                    sx={{
                      p: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2">{key}</Typography>
                        {metadata.featureDescriptions?.[key] && (
                          <Typography variant="caption" color="textSecondary">
                            {metadata.featureDescriptions[key]}
                          </Typography>
                        )}
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2">
                          {renderFeatureValue(value)}
                        </Typography>
                        {metadata.featureImportances?.[key] !== undefined && (
                          <Box width="100px">
                            <Box 
                              sx={{
                                height: '4px',
                                bgcolor: 'divider',
                                borderRadius: '2px',
                                overflow: 'hidden',
                              }}
                            >
                              <Box 
                                sx={{
                                  height: '100%',
                                  width: `${Math.min(100, Math.abs(metadata.featureImportances?.[key] || 0) * 100)}%`,
                                  bgcolor: (metadata.featureImportances?.[key] || 0) >= 0 
                                    ? 'success.main' 
                                    : 'error.main',
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="caption" 
                              color={metadata.featureImportances?.[key] >= 0 ? 'success.main' : 'error.main'}
                              align="right"
                              display="block"
                            >
                              {(metadata.featureImportances?.[key] || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {activeTab === 'raw' && (
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              RAW EXPLANATION DATA
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: '500px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(explanation, null, 2)}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AZRExplanationView;
