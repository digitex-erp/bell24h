import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TuneIcon from '@mui/icons-material/Tune';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Styled components
const ExplainerCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const getColor = (value: number, theme: any): string => {
  if (value > 0.8) return theme.palette.success.light;
  if (value > 0.5) return theme.palette.info.light;
  return theme.palette.grey[300];
};

const HighlightedText = styled(Box)<{ importance: number }>(({ theme, importance }) => ({
  backgroundColor: getColor(importance, theme),
  padding: '2px 4px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '2px',
}));

interface ImageAnalysisExplainerProps {
  imageRfqId: string | number;
  imageUrl?: string;
}

const ImageAnalysisExplainer: React.FC<ImageAnalysisExplainerProps> = ({ imageRfqId, imageUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setDisplayImage(imageUrl);
    }
    
    fetchExplanation();
  }, [imageRfqId, imageUrl]);

  const fetchExplanation = async () => {
    if (!imageRfqId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/image-rfq/${imageRfqId}/explain`, {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch image analysis explanation');
      }
      
      setExplanation(data.explanation);
      
      // If no imageUrl was provided, use the one from the response
      if (!imageUrl && data.imageUrl) {
        setDisplayImage(data.imageUrl);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the explanation');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = explanation?.keyFeatures?.map((feature: any) => ({
    name: feature.feature,
    importance: feature.importance * 100, // Convert to percentage
  })) || [];

  return (
    <ExplainerCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TuneIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">
          Image Analysis Explainer (SHAP/LIME)
        </Typography>
        <Tooltip title="This explains how our AI analyzed your image using SHAP/LIME techniques">
          <InfoIcon sx={{ ml: 1, color: 'text.secondary', cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        This analysis shows how our AI interpreted your image, what features were most important, and how confident the system is in its analysis.
      </Typography>
      
      {loading && (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Analyzing image...</Typography>
        </Box>
      )}
      
      {error && (
        <Box sx={{ my: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {explanation && (
        <Grid container spacing={3}>
          {/* Image preview */}
          {displayImage && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" justifyContent="center">
                  <VisibilityIcon sx={{ mr: 1 }} />
                  Original Image
                </Typography>
                <Box
                  component="img"
                  src={displayImage}
                  alt="Analyzed image"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              </Paper>
            </Grid>
          )}
          
          {/* Confidence scores */}
          <Grid item xs={12} md={displayImage ? 8 : 12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                AI Confidence Scores
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Text Recognition</Typography>
                  <Typography variant="body2">{Math.round(explanation.textConfidence * 100)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={explanation.textConfidence * 100} 
                  color={explanation.textConfidence > 0.7 ? "success" : "primary"}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Object Recognition</Typography>
                  <Typography variant="body2">{Math.round(explanation.objectConfidence * 100)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={explanation.objectConfidence * 100}
                  color={explanation.objectConfidence > 0.7 ? "success" : "primary"}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Feature importance chart */}
              <Typography variant="subtitle1" gutterBottom>
                Feature Importance
              </Typography>
              
              <Box sx={{ height: 200, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value}%`, 'Importance']}
                      labelFormatter={(label) => `Feature: ${label}`}
                    />
                    <Bar dataKey="importance" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Text importance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Text Importance Analysis
              </Typography>
              
              <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                {explanation.textImportance?.segments?.map((segment: any, index: number) => (
                  <HighlightedText key={index} importance={segment.importance}>
                    <Tooltip title={`Importance: ${Math.round(segment.importance * 100)}%`}>
                      <span>{segment.text}</span>
                    </Tooltip>
                  </HighlightedText>
                ))}
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mr: 1 }}>Importance scale:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 10, bgcolor: 'grey.300', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ mr: 1 }}>Low</Typography>
                  <Box sx={{ width: 20, height: 10, bgcolor: 'info.light', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ mr: 1 }}>Medium</Typography>
                  <Box sx={{ width: 20, height: 10, bgcolor: 'success.light', mr: 0.5 }} />
                  <Typography variant="caption">High</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </ExplainerCard>
  );
};

export default ImageAnalysisExplainer;
