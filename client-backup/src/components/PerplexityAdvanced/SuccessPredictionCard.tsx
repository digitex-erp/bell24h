import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Divider,
  Tooltip,
  CircularProgress,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface SuccessFactor {
  factor: string;
  impact: number;
}

interface SuccessPrediction {
  entityId: string;
  entityType: 'rfq' | 'bid' | 'product';
  probability: number;
  confidenceScore: number;
  keyFactors: SuccessFactor[];
  recommendedActions: string[];
}

interface SuccessPredictionCardProps {
  prediction: SuccessPrediction;
  title?: string;
}

const SuccessPredictionCard: React.FC<SuccessPredictionCardProps> = ({ 
  prediction, 
  title = "Success Prediction" 
}) => {
  if (!prediction) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No prediction data available</Typography>
        </CardContent>
      </Card>
    );
  }

  const { probability, confidenceScore, keyFactors, recommendedActions, entityType } = prediction;
  
  // Determine the success likelihood category
  const getLikelihoodCategory = (prob: number): {
    label: string;
    color: string;
    icon: JSX.Element;
  } => {
    if (prob >= 0.7) {
      return { 
        label: 'High', 
        color: '#4caf50', 
        icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />
      };
    } else if (prob >= 0.4) {
      return { 
        label: 'Moderate', 
        color: '#ff9800',
        icon: <InfoIcon sx={{ color: '#ff9800' }} />
      };
    } else {
      return { 
        label: 'Low', 
        color: '#f44336',
        icon: <WarningIcon sx={{ color: '#f44336' }} />
      };
    }
  };
  
  const likelihood = getLikelihoodCategory(probability);
  
  // Format the entity type for display
  const formatEntityType = (type: string): string => {
    switch (type) {
      case 'rfq':
        return 'RFQ';
      case 'bid':
        return 'Bid';
      case 'product':
        return 'Product Showcase';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader 
        title={title}
        subheader={`${formatEntityType(entityType)} Analysis`}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
            <CircularProgress 
              variant="determinate" 
              value={probability * 100} 
              size={80}
              thickness={4}
              sx={{ color: likelihood.color }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" color="text.secondary">
                {Math.round(probability * 100)}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {likelihood.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {likelihood.label} Likelihood
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Confidence: {Math.round(confidenceScore * 100)}%
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Key Factors
          </Typography>
          <List dense>
            {keyFactors.map((factor, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {factor.impact > 0 ? 
                    <TrendingUpIcon color="success" /> : 
                    <TrendingDownIcon color="error" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={factor.factor}
                  secondary={
                    <Box sx={{ width: '100%', mt: 0.5 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.abs(factor.impact * 100)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: factor.impact < 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: factor.impact < 0 ? '#f44336' : '#4caf50',
                          }
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Recommended Actions
          </Typography>
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {recommendedActions.map((action, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InfoIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={action} />
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {getBusinessInsight(prediction)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper function to generate business insights
const getBusinessInsight = (prediction: SuccessPrediction): string => {
  const { probability, entityType } = prediction;
  
  if (entityType === 'rfq') {
    if (probability >= 0.7) {
      return 'This RFQ has a high likelihood of success. Focus on responding promptly with a detailed proposal addressing the key factors highlighted above.';
    } else if (probability >= 0.4) {
      return 'This RFQ has moderate success potential. Consider addressing the recommended actions to improve your response quality and differentiate from competitors.';
    } else {
      return 'This RFQ has lower success probability. Evaluate if it aligns with your business capabilities before investing significant resources.';
    }
  } else if (entityType === 'bid') {
    if (probability >= 0.7) {
      return 'This bid has a high likelihood of being accepted. Emphasize the key factors in your communication with the client.';
    } else if (probability >= 0.4) {
      return 'This bid has moderate acceptance potential. Consider adjusting your pricing or terms based on the recommended actions.';
    } else {
      return 'This bid may need significant revision. Review the key factors and consider a different approach or pricing strategy.';
    }
  } else { // product
    if (probability >= 0.7) {
      return 'This product showcase is likely to generate strong interest. Highlight the key selling points in your marketing materials.';
    } else if (probability >= 0.4) {
      return 'This product showcase has moderate potential. Consider enhancing the product description with the recommended actions.';
    } else {
      return 'This product showcase may not resonate strongly with your target audience. Consider revising the messaging or targeting different market segments.';
    }
  }
};

export default SuccessPredictionCard;
