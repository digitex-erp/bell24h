import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  IconButton, 
  Typography, 
  Box, 
  CircularProgress,
  Chip,
  Tooltip,
  Collapse,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { AIDecision, AIRequestContext, ModelType } from '../../../types/ai';
import { aiService } from '../../../services/ai/AIService';

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

const AIDecisionPanel: React.FC<AIDecisionPanelProps> = ({
  context,
  modelType,
  onDecision,
  onError,
  className = '',
  autoFetch = true,
  collapsible = true,
  showRefresh = true,
  title = 'AI Analysis',
  subtitle = '',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [decision, setDecision] = useState<AIDecision | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  // Format the model type for display
  const formatModelType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get the appropriate status icon based on confidence level
  const getStatusIcon = (confidence: number) => {
    if (confidence >= 0.8) {
      return <CheckCircleIcon color="success" />;
    } else if (confidence >= 0.5) {
      return <WarningIcon color="warning" />;
    } else {
      return <ErrorIcon color="error" />;
    }
  };

  // Fetch the AI decision
  const fetchDecision = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await aiService.analyze(modelType, context);
      setDecision(result);
      onDecision?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('AI analysis failed');
      console.error('AI Decision Error:', error);
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [context, modelType, onDecision, onError]);

  // Auto-fetch decision on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchDecision().catch(() => {
        // Error is already handled in fetchDecision
      });
    }
  }, [autoFetch, fetchDecision]);

  // Toggle the expanded state
  const toggleExpanded = () => setExpanded(!expanded);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDecision().catch(() => {
      // Error is already handled in fetchDecision
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
        <Box ml={2}>
          <Typography>Analyzing with AI...</Typography>
        </Box>
      </Box>
    );
  }


  // Render error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <ErrorIcon color="error" />
              <Box ml={1}>AI Analysis Failed</Box>
            </Box>
          }
          action={
            collapsible && (
              <IconButton onClick={toggleExpanded}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )
          }
        />
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Box color="error.main" display="flex" alignItems="center">
              <ErrorIcon color="error" />
              <Box ml={1}>
                <Typography>{error.message || 'Failed to load AI analysis'}</Typography>
              </Box>
            </Box>
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    );
  }

  // Render no decision state
  if (!decision) {
    return (
      <Card className={className}>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No analysis available. Click refresh to analyze.</Typography>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Analyze
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Render the decision
  const confidencePercentage = Math.round(decision.confidence * 100);
  const confidenceColor = 
    decision.confidence >= 0.8 
      ? 'success' 
      : decision.confidence >= 0.5 
        ? 'warning' 
        : 'error';

  return (
    <Card className={className}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            <Tooltip title={`Confidence: ${confidencePercentage}%`}>
              <Chip
                label={`${confidencePercentage}%`}
                color={confidenceColor as any}
                size="small"
                sx={{ ml: 1, fontWeight: 'bold' }}
                icon={getStatusIcon(decision.confidence)}
              />
            </Tooltip>
            <Box flexGrow={1} />
            {collapsible && (
              <IconButton 
                onClick={toggleExpanded} 
                size="small"
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        }
        subheader={subtitle || formatModelType(modelType)}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary">
              {new Date(decision.timestamp).toLocaleString()}
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Analysis
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {decision.reasoning || 'No analysis available.'}
            </Typography>
          </Box>

          {decision.recommendations?.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Recommendations
              </Typography>
              <List dense>
                {decision.recommendations.map((rec, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText primary={rec} />
                    </ListItem>
                    {index < decision.recommendations.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {showRefresh && (
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Refresh Analysis
              </Button>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default AIDecisionPanel;
