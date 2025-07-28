import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Badge,
  Grid,
  Paper,
  Avatar,
  Divider,
  Rating,
  LinearProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import MessageIcon from '@mui/icons-material/Message';
import SchoolIcon from '@mui/icons-material/School';

interface CustomerPerplexityProfile {
  customerId: string;
  preferredComplexity: 'low' | 'medium' | 'high' | 'very-high';
  industrySpecificTerms: string[];
  responseRate: number;
  engagementScore: number;
  communicationPreferences: {
    detailLevel: 'minimal' | 'moderate' | 'detailed';
    formalityLevel: 'casual' | 'neutral' | 'formal';
    technicalLevel: 'basic' | 'moderate' | 'advanced';
  };
}

interface CustomerProfileCardProps {
  profile: CustomerPerplexityProfile;
  title?: string;
  customerName?: string;
  customerCompany?: string;
}

const CustomerProfileCard: React.FC<CustomerProfileCardProps> = ({ 
  profile, 
  title = "Customer Communication Profile",
  customerName = "Customer",
  customerCompany = "Organization"
}) => {
  if (!profile) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No customer profile available</Typography>
        </CardContent>
      </Card>
    );
  }

  const { 
    preferredComplexity, 
    industrySpecificTerms, 
    responseRate, 
    engagementScore,
    communicationPreferences
  } = profile;
  
  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'low':
        return '#4caf50'; // green
      case 'medium':
        return '#2196f3'; // blue
      case 'high':
        return '#ff9800'; // orange
      case 'very-high':
        return '#f44336'; // red
      default:
        return '#757575'; // grey
    }
  };
  
  const getDetailLevelText = (level: string): string => {
    switch (level) {
      case 'minimal':
        return 'Prefers concise, to-the-point communications';
      case 'moderate':
        return 'Prefers balanced communication with key details';
      case 'detailed':
        return 'Prefers comprehensive information with full context';
      default:
        return '';
    }
  };
  
  const getFormalityLevelText = (level: string): string => {
    switch (level) {
      case 'casual':
        return 'Prefers casual, conversational tone';
      case 'neutral':
        return 'Prefers standard professional tone';
      case 'formal':
        return 'Prefers formal business communication';
      default:
        return '';
    }
  };
  
  const getTechnicalLevelText = (level: string): string => {
    switch (level) {
      case 'basic':
        return 'Prefers simplified technical language';
      case 'moderate':
        return 'Comfortable with standard industry terminology';
      case 'advanced':
        return 'Comfortable with specialized technical language';
      default:
        return '';
    }
  };
  
  const getRatingValue = (level: string, type: string): number => {
    if (type === 'detail') {
      return level === 'minimal' ? 1 : level === 'moderate' ? 3 : 5;
    } else if (type === 'formality') {
      return level === 'casual' ? 1 : level === 'neutral' ? 3 : 5;
    } else { // technical
      return level === 'basic' ? 1 : level === 'moderate' ? 3 : 5;
    }
  };

  return (
    <Card>
      <CardHeader 
        title={title}
        subheader={`Personalized communication analysis for ${customerName}`}
        avatar={
          <Avatar sx={{ bgcolor: getComplexityColor(preferredComplexity) }}>
            <PersonIcon />
          </Avatar>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle1">{customerCompany}</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preferred Complexity:
              </Typography>
              <Chip 
                label={preferredComplexity.replace('-', ' ')}
                sx={{ 
                  bgcolor: getComplexityColor(preferredComplexity),
                  color: 'white',
                  textTransform: 'capitalize',
                  fontWeight: 'medium'
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {preferredComplexity === 'low' && 'Prefers simple, clear language with common terms'}
                {preferredComplexity === 'medium' && 'Prefers standard business language with some industry terms'}
                {preferredComplexity === 'high' && 'Prefers detailed communications with specialized terminology'}
                {preferredComplexity === 'very-high' && 'Prefers highly technical language with specialized concepts'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Engagement Metrics:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 120 }}>
                  Response Rate:
                </Typography>
                <Box sx={{ width: '100%', ml: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={responseRate * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 2,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: responseRate > 0.7 ? '#4caf50' : responseRate > 0.4 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {Math.round(responseRate * 100)}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ minWidth: 120 }}>
                  Engagement:
                </Typography>
                <Box sx={{ width: '100%', ml: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={engagementScore * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 2,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: engagementScore > 0.7 ? '#4caf50' : engagementScore > 0.4 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {Math.round(engagementScore * 100)}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Communication Preferences
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Detail Level:</Typography>
                  <Rating 
                    value={getRatingValue(communicationPreferences.detailLevel, 'detail')} 
                    readOnly 
                    max={5}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                  {getDetailLevelText(communicationPreferences.detailLevel)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Formality:</Typography>
                  <Rating 
                    value={getRatingValue(communicationPreferences.formalityLevel, 'formality')} 
                    readOnly 
                    max={5}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                  {getFormalityLevelText(communicationPreferences.formalityLevel)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Technical Level:</Typography>
                  <Rating 
                    value={getRatingValue(communicationPreferences.technicalLevel, 'technical')} 
                    readOnly 
                    max={5}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                  {getTechnicalLevelText(communicationPreferences.technicalLevel)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Industry-Specific Terms:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {industrySpecificTerms.map((term, index) => (
                  <Chip 
                    key={index} 
                    label={term} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {getRecommendedApproach(profile)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper function to generate recommended approach
const getRecommendedApproach = (profile: CustomerPerplexityProfile): string => {
  const { 
    preferredComplexity, 
    responseRate, 
    engagementScore,
    communicationPreferences
  } = profile;
  
  let approach = "Based on this customer's profile, it's recommended to ";
  
  if (preferredComplexity === 'low' || preferredComplexity === 'medium') {
    approach += "use clear, straightforward language ";
  } else {
    approach += "include detailed technical information ";
  }
  
  if (communicationPreferences.detailLevel === 'minimal') {
    approach += "with concise messaging focused on key points. ";
  } else if (communicationPreferences.detailLevel === 'detailed') {
    approach += "with comprehensive explanation and context. ";
  } else {
    approach += "with a balance of important details without overwhelming. ";
  }
  
  if (communicationPreferences.formalityLevel === 'formal') {
    approach += "Maintain a formal tone in all communications. ";
  } else if (communicationPreferences.formalityLevel === 'casual') {
    approach += "A conversational, approachable tone will likely resonate best. ";
  }
  
  if (responseRate < 0.5) {
    approach += "Given the lower response rate, consider more engaging subject lines and follow-ups.";
  } else if (engagementScore > 0.7) {
    approach += "This customer shows high engagement, making them a good candidate for more detailed discussions.";
  }
  
  return approach;
};

export default CustomerProfileCard;
