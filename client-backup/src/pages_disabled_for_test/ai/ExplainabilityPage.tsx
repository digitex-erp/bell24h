import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Grid, 
  MenuItem, 
  Button, 
  Divider, 
  Paper,
  Alert
} from '@mui/material';
import ExplainabilityPanel from '../../components/ai/ExplainabilityPanel.tsx';
import { ModelExplanation } from '../../types/ai.js';

// Sample model configurations for the demo
const MODELS = [
  { id: 'rfq_analyzer', name: 'RFQ Analysis Model', type: 'rfq_classification' },
  { id: 'price_predictor', name: 'Price Prediction Model', type: 'bid_pricing' },
  { id: 'category_classifier', name: 'Product Category Classifier', type: 'product_categorization' }
];

// Sample feature sets for demonstration
const SAMPLE_FEATURES = {
  'rfq_analyzer': {
    'quantity': 500,
    'delivery_urgency': 'high',
    'has_previous_orders': true,
    'customer_tier': 'premium',
    'product_category': 'electronics',
    'international_shipping': true,
    'payment_terms': 'net_30',
    'currency': 'USD'
  },
  'price_predictor': {
    'base_price': 149.99,
    'quantity': 250,
    'competitor_price': 159.99,
    'customer_tier': 'standard',
    'seasonal_factor': 1.1,
    'days_to_delivery': 14,
    'location_factor': 0.95,
    'raw_material_index': 105.2
  },
  'category_classifier': {
    'product_name': 'Smart LED Display Panel',
    'description': 'High resolution display with touch capability for commercial applications',
    'weight_kg': 2.5,
    'dimensions': '500x300x25',
    'has_electronics': true,
    'material': 'metal_glass',
    'price_point': 'premium',
    'power_consumption': 65
  }
};

/**
 * Page for demonstrating and using AI explainability features (SHAP/LIME)
 */
const ExplainabilityPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [instanceId, setInstanceId] = useState(`instance_${Date.now()}`);
  const [predictionValue, setPredictionValue] = useState('0.873');
  const [features, setFeatures] = useState<Record<string, any>>(SAMPLE_FEATURES[MODELS[0].id as keyof typeof SAMPLE_FEATURES]);
  const [explanations, setExplanations] = useState<ModelExplanation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const modelId = event.target.value;
    const model = MODELS.find(m => m.id === modelId) || MODELS[0];
    setSelectedModel(model);
    setFeatures(SAMPLE_FEATURES[model.id as keyof typeof SAMPLE_FEATURES]);
    setInstanceId(`instance_${Date.now()}`);
  };

  const handleFeatureChange = (key: string, value: any) => {
    setFeatures(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExplanationGenerated = (explanation: ModelExplanation) => {
    setExplanations(prev => [explanation, ...prev]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Explainability Lab
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Visualize and understand AI model predictions using SHAP and LIME explanations
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
          <Button size="small" onClick={() => setErrorMessage(null)} sx={{ ml: 2 }}>
            Dismiss
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Configuration
              </Typography>
              <Box component="form" noValidate sx={{ mt: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Model"
                  value={selectedModel.id}
                  onChange={handleModelChange}
                  margin="normal"
                >
                  {MODELS.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  fullWidth
                  label="Instance ID"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  margin="normal"
                  helperText="Unique identifier for this prediction instance"
                />
                
                <TextField
                  fullWidth
                  label="Prediction Value"
                  value={predictionValue}
                  onChange={(e) => setPredictionValue(e.target.value)}
                  margin="normal"
                  helperText="Model's prediction result"
                />
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Input Features
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(features).map(([key, value]) => (
                  <TextField
                    key={key}
                    fullWidth
                    label={key.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                    value={value.toString()}
                    onChange={(e) => handleFeatureChange(key, 
                      typeof value === 'number' 
                        ? parseFloat(e.target.value) 
                        : typeof value === 'boolean'
                          ? e.target.value === 'true'
                          : e.target.value
                    )}
                    margin="normal"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <ExplainabilityPanel
            modelId={selectedModel.id}
            instanceId={instanceId}
            features={features}
            prediction={predictionValue}
            onExplanationGenerated={handleExplanationGenerated}
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Recent Explanations
          </Typography>
          
          {explanations.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography color="text.secondary">
                No explanations generated yet. Use the panel above to generate SHAP or LIME explanations.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {explanations.map((exp, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {exp.explainabilityType.toUpperCase()} Explanation ({exp.modelType})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated on {new Date(exp.timestamp).toLocaleString()} for instance {exp.id}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Top factors: {exp.features.slice(0, 3).map(f => f.feature).join(', ')}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExplainabilityPage;
