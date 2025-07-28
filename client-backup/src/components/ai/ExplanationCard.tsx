import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Divider
} from '@mui/material';
import { 
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ModelExplanation } from '../../types/ai.js';
import FeatureImportanceChart from './FeatureImportanceChart.js';

interface ExplanationCardProps {
  explanation: ModelExplanation;
  loading?: boolean;
  error?: string | null;
  onExport?: (format: 'json' | 'csv' | 'pdf' | 'png') => void;
  className?: string;
}

/**
 * Card component to display model explanation details
 */
const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  loading = false,
  error = null,
  onExport: _onExport, // Intentionally unused
  className = ''
}) => {
  // Format the timestamp
  const formattedDate = useMemo(() => {
    return new Date(explanation.timestamp).toLocaleString();
  }, [explanation.timestamp]);

  // Get status color and icon
  const getStatusInfo = () => {
    if (error) {
      return { color: 'error', icon: <ErrorIcon /> };
    }
    if (loading) {
      return { color: 'info', icon: <InfoIcon /> };
    }
    return { color: 'success', icon: <SuccessIcon /> };
  };

  const status = getStatusInfo();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Loading Explanation...
            </Typography>
            <Chip 
              icon={status.icon} 
              label="Loading" 
              color={status.color as any} 
              size="small" 
            />
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert severity="error">
            <AlertTitle>Error Loading Explanation</AlertTitle>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div">
              {explanation.explainabilityType.toUpperCase()} Explanation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              icon={status.icon} 
              label={explanation.explainabilityType.toUpperCase()} 
              color={status.color as any} 
              size="small" 
            />
            {explanation.modelType && (
              <Chip 
                label={explanation.modelType} 
                variant="outlined" 
                size="small"
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Feature Importance Chart */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Feature Importance
          </Typography>
          <FeatureImportanceChart 
            features={explanation.features} 
            modelType={explanation.modelType || 'unknown'}
            confidence={explanation.confidence || 0}
          />
        </Box>
        
        {/* Prediction and Actual Value */}
        <Box display="flex" gap={4} mb={3}>
          <Box>
            <Typography variant="subtitle2">Prediction</Typography>
            <Typography variant="body1">
              {explanation.prediction}
            </Typography>
          </Box>
          {explanation.actualValue !== undefined && (
            <Box>
              <Typography variant="subtitle2">Actual</Typography>
              <Typography variant="body1">
                {explanation.actualValue}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Metadata */}
        {explanation.metadata && Object.keys(explanation.metadata).length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Information
            </Typography>
            <Box component="pre" sx={{ 
              bgcolor: 'background.paper', 
              p: 1, 
              borderRadius: 1,
              fontSize: '0.8rem',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(explanation.metadata, null, 2)}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;
