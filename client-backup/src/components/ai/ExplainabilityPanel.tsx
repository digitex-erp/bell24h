import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  CircularProgress,
  Alert,
  AlertTitle,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import { getShapExplanation, getLimeExplanation } from '../../services/explainabilityService';
import { 
  ExplanationRequest, 
  ModelExplanation, 
  FeatureImportance,
  // Re-export any additional types needed from ai.ts
} from '../../types/ai';
import React, { Suspense, lazy } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

// Lazy load heavy components
const FeatureImportanceChart = lazy(() => import('./FeatureImportanceChart'));
const ExplanationHistory = lazy(() => import('./ExplanationHistory'));
import FeedbackPanel from './FeedbackPanel';
import ExportExplanationButton from './ExportExplanationButton';
import ExplainabilityAnalytics from './ExplainabilityAnalytics';
import { explanationHistoryService } from '../../services/explanationHistoryService';

interface ExplainabilityPanelProps {
  modelId: string;
  instanceId: string;
  features: Record<string, number | string | boolean>;
  prediction?: number | string;
  actualValue?: number | string;
  onExplanationGenerated?: (explanation: ModelExplanation) => void;
}

/**
 * Panel for generating and displaying SHAP and LIME explanations
 */
const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  modelId,
  instanceId,
  features,
  // We're not using these props directly, but keeping them for API consistency
  prediction, // eslint-disable-line
  actualValue, // eslint-disable-line
  onExplanationGenerated
}) => {
  const [activeTab, setActiveTab] = useState<'shap' | 'lime' | 'history' | 'analytics'>('shap');
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ModelExplanation | null>(null);
  // Track the last used model name for analytics
  const [lastModelName, setLastModelName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  
  // Define function to update history count from localStorage
  const updateHistoryCount = () => {
    const history = explanationHistoryService.getHistory();
    setHistoryCount(history.length);
  };
  
  // Load history count on component mount
  useEffect(() => {
    updateHistoryCount();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'shap' | 'lime' | 'history') => {
    setActiveTab(newValue);
    // Clear previous explanation when switching tabs
    setExplanation(null);
    setError(null);
  };

  const handleGenerateExplanation = async () => {
    setLoading(true);
    setError(null);

    // Only generate an explanation if we're on a valid explainability tab (not history)
    if (activeTab !== 'history') {
      const request: ExplanationRequest = {
        modelId,
        instanceId,
        explainabilityType: activeTab,
        features
      };

      try {
        const response = activeTab === 'shap' 
          ? await getShapExplanation(request)
          : await getLimeExplanation(request);

        if (response.success && response.explanation) {
          // Add modelId, instanceId, and ensure all required fields are present
          const enhancedExplanation: ModelExplanation = {
            ...response.explanation,
            id: response.explanation.id || `expl_${Date.now()}`,
            modelId,
            instanceId,
            explainabilityType: activeTab,
            features: response.explanation.features.map((f: FeatureImportance) => ({
              ...f,
              direction: f.direction || (f.importance >= 0 ? 'positive' : 'negative'),
              value: f.value || features[f.feature] || null
            })),
            timestamp: response.explanation.timestamp || new Date().toISOString(),
            modelName: response.explanation.modelName || `Model ${modelId}`,
            predictionClass: response.explanation.predictionClass || String(response.explanation.prediction || ''),
            method: response.explanation.method || activeTab.toUpperCase()
          };
          
          // Update last used model name
          setLastModelName(enhancedExplanation.modelName || '');
          
          // Save explanation to history
          explanationHistoryService.saveExplanation(enhancedExplanation);
          
          // Update history count
          updateHistoryCount();
          
          // Set current explanation
          setExplanation(enhancedExplanation);
          
          if (onExplanationGenerated) {
            onExplanationGenerated(enhancedExplanation);
          }
        } else {
          setError(response.error || 'Failed to generate explanation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      // If on history tab, just stop loading
      setLoading(false);
    }
  };



  // Refresh explanations
  const handleRefresh = async () => {
    setRefreshing(true);
    await handleGenerateExplanation();
    setRefreshing(false);
  };

  // Download explanation as CSV
  const handleDownloadCSV = () => {
    if (!explanation) return;
    const headers = ['feature', 'importance', 'direction', 'value'];
    const rows = explanation.features.map(f =>
      [f.feature, f.importance, f.direction, features[f.feature] || 'N/A'].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `explanation_${explanation.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle selecting an explanation from history
  const handleSelectFromHistory = (selectedExplanation: ModelExplanation) => {
    setExplanation(selectedExplanation);
    // Set the active tab to match the explanation type (only shap or lime)
    setActiveTab(selectedExplanation.explainabilityType);
  };

  // Convert our FeatureImportance[] to the format expected by FeatureImportanceChart
  const formatFeaturesForChart = (featureImportances: FeatureImportance[]) => {
    if (!featureImportances) return [];
    return featureImportances.map(fi => ({
      name: fi.feature,
      importance: Math.abs(fi.importance), // Absolute value for chart display
      description: `Direction: ${fi.direction}`,
      value: features[fi.feature] || 'N/A'
    }));
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <ErrorBoundary>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" gutterBottom>
              AI Explainability
            </Typography>
            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={loading || refreshing} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {explanation && (
                <Tooltip title="Download as CSV">
                  <IconButton onClick={handleDownloadCSV} size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange as any}
            sx={{ mb: 2 }}
          >
            <Tab label="SHAP" value="shap" />
            <Tab label="LIME" value="lime" />
            <Tab 
              label={
                <Badge badgeContent={historyCount} color="primary" showZero={false}>
                  History
                </Badge>
              } 
              value="history" 
            />
            <Tab label="Analytics" value="analytics" />
          </Tabs>
          
          {activeTab === 'shap' || activeTab === 'lime' ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                {activeTab === 'shap' 
                  ? 'SHAP (SHapley Additive exPlanations) explains individual predictions by computing the contribution of each feature.'
                  : 'LIME (Local Interpretable Model-agnostic Explanations) explains predictions by approximating the model locally with an interpretable one.'}
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleGenerateExplanation}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : `Generate ${activeTab.toUpperCase()} Explanation`}
              </Button>
            </Box>
          ) : activeTab === 'history' ? (
            <Suspense fallback={<Skeleton variant="rectangular" height={220} sx={{ my: 2 }} />}>
              <ExplanationHistory 
                modelId={modelId}
                instanceId={instanceId}
                onSelectExplanation={handleSelectFromHistory}
              />
            </Suspense>
          ) : (
            <ExplainabilityAnalytics history={explanationHistoryService.getHistory()} />
          )}

          {loading && (
            <Skeleton variant="rectangular" height={220} sx={{ my: 2 }} />
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {!loading && !error && !explanation && activeTab !== 'history' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No explanation data available. Try generating an explanation.
            </Typography>
          )}

          {explanation && activeTab !== 'history' && (
            <Box mt={3}>
              <FeatureImportanceChart 
                features={formatFeaturesForChart(explanation.features)}
                modelType={explanation.modelType}
                confidence={0.85} // This value should come from the explanation if available
                enableTooltips
                colorByDirection
              />
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Generated on {new Date(explanation.timestamp).toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <ExportExplanationButton explanation={explanation} format="csv" />
                  <ExportExplanationButton explanation={explanation} format="json" />
                  <ExportExplanationButton explanation={explanation} format="pdf" />
                </Stack>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box mt={2}>
                <FeedbackPanel explanationId={explanation.id} />
              </Box>
            </Box>
          )}
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export default ExplainabilityPanel;
