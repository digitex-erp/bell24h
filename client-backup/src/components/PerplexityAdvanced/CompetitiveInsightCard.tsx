import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  LinearProgress,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface CompetitiveInsight {
  term: string;
  frequency: number;
  uniqueness: number;
  emergingScore: number;
  businessValue: number;
}

interface CompetitiveInsightCardProps {
  insights: CompetitiveInsight[];
  title?: string;
}

const CompetitiveInsightCard: React.FC<CompetitiveInsightCardProps> = ({ 
  insights, 
  title = "Competitive Intelligence Insights" 
}) => {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No competitive insights available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title={title}
        action={
          <Tooltip title="These insights compare language patterns in your communications against industry standards and competitors">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <List>
          {insights.map((insight, index) => (
            <React.Fragment key={index}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  insight.emergingScore > 0.7 && (
                    <Tooltip title="Rapidly growing term">
                      <TrendingUpIcon color="success" />
                    </Tooltip>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        {insight.term}
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        {Math.round(insight.businessValue * 100)}%
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          Frequency:
                        </Typography>
                        <Box sx={{ width: '100%', ml: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={insight.frequency * 100} 
                            sx={{ height: 8, borderRadius: 2 }}
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          Uniqueness:
                        </Typography>
                        <Box sx={{ width: '100%', ml: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={insight.uniqueness * 100} 
                            sx={{ height: 8, borderRadius: 2 }}
                            color="secondary"
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          Emerging:
                        </Typography>
                        <Box sx={{ width: '100%', ml: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={insight.emergingScore * 100} 
                            sx={{ height: 8, borderRadius: 2 }}
                            color="success"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {getInsightSummary(insight)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < insights.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            These insights can help you align your communication strategy with emerging industry trends and differentiate from competitors.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper function to generate insight summaries
const getInsightSummary = (insight: CompetitiveInsight): string => {
  if (insight.businessValue > 0.7) {
    return `High-value term that strongly influences business outcomes.`;
  } else if (insight.emergingScore > 0.7) {
    return `Rapidly growing term in your industry. Consider increasing usage.`;
  } else if (insight.uniqueness > 0.7) {
    return `Distinctive term that sets your communications apart.`;
  } else {
    return `Common industry term with moderate business impact.`;
  }
};

export default CompetitiveInsightCard;
