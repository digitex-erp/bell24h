import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Grid,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';

interface MultilingualAnalysisResult {
  perplexity: number;
  normalizedScore: number;
  detectedLanguage: string;
  translationConfidence: number;
  keyTerms: { term: string; confidence: number }[];
}

interface MultilingualAnalysisCardProps {
  result: MultilingualAnalysisResult;
  title?: string;
  originalText?: string;
}

// Language name mapping
const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pt': 'Portuguese',
  'it': 'Italian',
  'ru': 'Russian',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'pl': 'Polish'
};

const MultilingualAnalysisCard: React.FC<MultilingualAnalysisCardProps> = ({ 
  result, 
  title = "Multilingual Perplexity Analysis",
  originalText
}) => {
  if (!result) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No multilingual analysis available</Typography>
        </CardContent>
      </Card>
    );
  }

  const { 
    perplexity, 
    normalizedScore, 
    detectedLanguage, 
    translationConfidence,
    keyTerms
  } = result;
  
  // Determine perplexity level category
  const getPerplexityCategory = (score: number): {
    label: string;
    color: string;
  } => {
    if (score < 20) {
      return { label: 'Low Complexity', color: '#4caf50' };
    } else if (score < 80) {
      return { label: 'Medium Complexity', color: '#2196f3' };
    } else if (score < 150) {
      return { label: 'High Complexity', color: '#ff9800' };
    } else {
      return { label: 'Very High Complexity', color: '#f44336' };
    }
  };
  
  const perplexityCategory = getPerplexityCategory(perplexity);
  const languageName = languageNames[detectedLanguage] || detectedLanguage;

  return (
    <Card>
      <CardHeader 
        title={title}
        avatar={<LanguageIcon />}
        subheader={`Detected Language: ${languageName}`}
      />
      <CardContent>
        {originalText && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Analyzed Text:
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2">{originalText}</Typography>
            </Paper>
          </Box>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Perplexity Analysis
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={perplexityCategory.label}
                  sx={{ 
                    bgcolor: perplexityCategory.color,
                    color: 'white',
                    fontWeight: 'medium',
                    mb: 1
                  }}
                  size="small"
                />
              </Box>
              <Typography variant="body2" gutterBottom>
                Raw Perplexity Score: {perplexity.toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Normalized Score: {normalizedScore.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {getPerplexityInterpretation(perplexity, detectedLanguage)}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TranslateIcon fontSize="small" sx={{ mr: 0.5 }} />
                Translation Confidence
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={translationConfidence * 100} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 2,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: translationConfidence > 0.7 ? '#4caf50' : 
                                translationConfidence > 0.4 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2">
                  {Math.round(translationConfidence * 100)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {translationConfidence > 0.8 
                  ? 'High confidence in language detection and potential translations.' 
                  : translationConfidence > 0.5
                  ? 'Moderate confidence in language detection and translation.'
                  : 'Low confidence in language detection or translation. Consider manual review.'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Key Terms & Confidence
            </Typography>
            <Paper variant="outlined" sx={{ height: '100%', minHeight: 200 }}>
              <List dense>
                {keyTerms.map((term, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">{term.term}</Typography>
                            <Chip 
                              label={`${Math.round(term.confidence * 100)}%`}
                              size="small"
                              color={term.confidence > 0.7 ? "success" : "default"}
                              icon={term.confidence > 0.7 ? <CheckIcon /> : undefined}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ width: '100%', mt: 0.5 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={term.confidence * 100} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: term.confidence > 0.7 ? '#4caf50' : 
                                         term.confidence > 0.5 ? '#2196f3' : '#ff9800'
                                }
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < keyTerms.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cross-Language Business Recommendations
          </Typography>
          <Typography variant="body2">
            {getCrossLanguageRecommendations(result)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getPerplexityInterpretation = (perplexity: number, language: string): string => {
  // Base interpretation
  let baseInterpretation = '';
  if (perplexity < 20) {
    baseInterpretation = 'This text has low complexity, suggesting clear and straightforward language.';
  } else if (perplexity < 80) {
    baseInterpretation = 'This text has medium complexity, typical for standard business communications.';
  } else if (perplexity < 150) {
    baseInterpretation = 'This text has high complexity with specialized terminology or complex sentence structures.';
  } else {
    baseInterpretation = 'This text has very high complexity, which may present challenges for understanding.';
  }
  
  // Add language-specific context
  const languageName = languageNames[language] || language;
  
  return `${baseInterpretation} For ${languageName} text, this ${
    perplexity < 50 ? 'is within normal range' : 'is on the higher end of complexity'
  }.`;
};

const getCrossLanguageRecommendations = (result: MultilingualAnalysisResult): string => {
  const { perplexity, detectedLanguage, translationConfidence } = result;
  const languageName = languageNames[detectedLanguage] || detectedLanguage;
  
  let recommendations = '';
  
  if (perplexity > 100) {
    recommendations += `Consider simplifying the ${languageName} text for better understanding. `;
  }
  
  if (translationConfidence < 0.6) {
    recommendations += `Have the text reviewed by a native ${languageName} speaker for accuracy. `;
  }
  
  if (detectedLanguage !== 'en') {
    recommendations += `Ensure key technical terms have consistent translations across all communications. `;
  }
  
  if (recommendations === '') {
    recommendations = `The ${languageName} text has good clarity and is well-suited for business communications. ` +
      `Key terms are clearly identifiable and should translate well in cross-language business contexts.`;
  } else {
    recommendations += `Maintaining consistent terminology across languages will improve cross-border communication effectiveness.`;
  }
  
  return recommendations;
};

export default MultilingualAnalysisCard;
