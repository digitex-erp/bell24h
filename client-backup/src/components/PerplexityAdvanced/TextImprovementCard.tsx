import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  TextField,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Stack,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

interface PerplexityRecommendation {
  originalText: string;
  improvedText: string;
  originalPerplexity: number;
  improvedPerplexity: number;
  improvementRationale: string;
  businessImpact: string;
}

interface TextImprovementCardProps {
  recommendation: PerplexityRecommendation;
  title?: string;
  onApplyImprovement?: (text: string) => void;
}

const TextImprovementCard: React.FC<TextImprovementCardProps> = ({ 
  recommendation, 
  title = "Text Improvement Recommendations",
  onApplyImprovement
}) => {
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  if (!recommendation) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No text improvement recommendations available</Typography>
        </CardContent>
      </Card>
    );
  }

  const { 
    originalText, 
    improvedText, 
    originalPerplexity, 
    improvedPerplexity,
    improvementRationale,
    businessImpact
  } = recommendation;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleApply = () => {
    if (onApplyImprovement) {
      onApplyImprovement(improvedText);
    }
  };
  
  // Calculate improvement percentage
  const getPerplexityDifference = () => {
    // For perplexity, lower is generally better (more predictable)
    if (originalPerplexity > improvedPerplexity) {
      return {
        label: 'Simplified',
        percentage: Math.round(((originalPerplexity - improvedPerplexity) / originalPerplexity) * 100),
        isPositive: true
      };
    } else if (originalPerplexity < improvedPerplexity) {
      return {
        label: 'Enhanced',
        percentage: Math.round(((improvedPerplexity - originalPerplexity) / originalPerplexity) * 100),
        isPositive: true
      };
    } else {
      return {
        label: 'Unchanged',
        percentage: 0,
        isPositive: false
      };
    }
  };
  
  const difference = getPerplexityDifference();

  return (
    <Card>
      <CardHeader 
        title={title}
        action={
          <Button
            startIcon={<CompareArrowsIcon />}
            onClick={() => setShowComparison(!showComparison)}
            size="small"
          >
            {showComparison ? 'Hide Comparison' : 'Show Comparison'}
          </Button>
        }
      />
      <CardContent>
        <Collapse in={showComparison}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Original Text (Perplexity: {originalPerplexity.toFixed(1)})
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2, borderRadius: 1 }}
            >
              <Typography>{originalText}</Typography>
            </Paper>
            
            <Typography variant="subtitle1" gutterBottom>
              Improved Text (Perplexity: {improvedPerplexity.toFixed(1)})
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}
            >
              <Typography>{improvedText}</Typography>
            </Paper>
          </Box>
          <Divider sx={{ my: 2 }} />
        </Collapse>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Improved Text
          </Typography>
          <TextField
            multiline
            fullWidth
            minRows={4}
            maxRows={6}
            value={improvedText}
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                  <IconButton onClick={handleCopy} size="small">
                    {copied ? <CheckCircleOutlineIcon color="success" /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              )
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2">
              Perplexity Change: 
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={`${difference.label} by ${difference.percentage}%`}
                color={difference.isPositive ? "success" : "default"}
                size="small"
                icon={difference.isPositive ? <ArrowCircleUpIcon /> : undefined}
              />
              <Typography variant="body2" color="text.secondary">
                {originalPerplexity.toFixed(1)} → {improvedPerplexity.toFixed(1)}
              </Typography>
            </Stack>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            startIcon={<ThumbUpIcon />}
            disabled={!onApplyImprovement}
          >
            Apply Changes
          </Button>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Improvement Rationale
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 1 }}>
            <Typography variant="body2">{improvementRationale}</Typography>
          </Paper>
          
          <Typography variant="subtitle1" gutterBottom>
            Business Impact
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="body2">{businessImpact}</Typography>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TextImprovementCard;
