import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Paper } from '@mui/material';
import FeatureImportanceChart from '@/components/ai/FeatureImportanceChart';
import FeedbackPanel from '@/components/ai/FeedbackPanel';

// Define data structures
interface FeatureImportance {
  name: string;
  value: number; // SHAP or LIME value
  originalValue?: string | number; // Optional: The actual value of the feature
}

interface ExplanationData {
  baseValue?: number; // Common for SHAP
  features: FeatureImportance[];
  modelType: 'SHAP' | 'LIME' | 'Other'; // To know what kind of explanation it is
}

interface ExplainabilityPanelProps {
  rfqId: string;
}

const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ rfqId }) => {
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/rfq/${rfqId}/explainability`);
        if (!response.ok) {
          let errorText = `API error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorText = errorData.message || errorData.error || errorText;
          } catch (e) {
            // If parsing error data fails, use the original errorText
          }
          throw new Error(errorText);
        }
        const data: ExplanationData = await response.json();

        // Sort features by absolute importance before setting state
        const sortedData = {
          ...data,
          features: [...data.features].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
        };
        
        setExplanation(sortedData);
      } catch (err) {
        console.error('Failed to fetch explanation data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching explanation data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (rfqId) {
      fetchExplanationData();
    }
  }, [rfqId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress data-testid="explainability-loading" />
        <Typography ml={2}>Loading Explainability Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading explainability data: {error}</Alert>;
  }

  if (!explanation) {
    return <Alert severity="info">No explainability data available for this RFQ.</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        AI Model Explanation ({explanation.modelType})
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Details for RFQ ID: {rfqId}
      </Typography>
      
      {explanation.baseValue !== undefined && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          Base Model Prediction Value: {explanation.baseValue.toFixed(4)}
        </Typography>
      )}

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Feature Importances:
      </Typography>
      <List dense>
        {explanation.features.map((feature, index) => (
          <ListItem key={index} divider>
            <ListItemText 
              primary={feature.name + ': ' + feature.value.toFixed(4)}
              secondary={feature.originalValue !== undefined ? '(Actual Value: ' + feature.originalValue + ')' : null}
            />
          </ListItem>
        ))}
      </List>
      
      {/* TODO: Integrate FeedbackPanel */}
      {explanation && explanation.features && explanation.features.length > 0 && (
        <FeatureImportanceChart features={explanation.features} />
      )}
      <FeedbackPanel rfqId={rfqId} />
    </Paper>
  );
};

export default ExplainabilityPanel;
