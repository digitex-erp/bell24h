import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Collapse
} from '@mui/material';
import { aiService } from '../../services/ai/AIService';

interface Analysis {
  decision: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export const AIIntegration: React.FC = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiService.analyze();
      setAnalysis(result);
    } catch (err) {
      setError('Error performing analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No analysis available
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Analysis
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            Decision: {analysis.decision}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Confidence: {(analysis.confidence * 100).toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reasoning: {analysis.reasoning}
          </Typography>
        </Box>

        <Collapse in={showFeatures}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" gutterBottom>
              Feature Importance
            </Typography>
            {/* Add feature importance visualization here */}
          </Box>
        </Collapse>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowFeatures(!showFeatures)}
            sx={{ mr: 1 }}
          >
            {showFeatures ? 'Hide Features' : 'Show Features'}
          </Button>
          <Button
            variant="contained"
            onClick={fetchAnalysis}
            startIcon={<CircularProgress size={20} />}
          >
            Refresh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}; 