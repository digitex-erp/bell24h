import React from 'react';
import { Box, Flex, Text, Badge } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Cell } from 'recharts';
import Tooltip from '@mui/material/Tooltip';

interface Feature {
  name: string;
  importance: number;
  direction?: 'positive' | 'negative' | 'neutral';
  value?: string | number;
  description?: string;
}

interface FeatureImportanceChartProps {
  features: Feature[];
  modelType: string;
  confidence?: number;
  enableTooltips?: boolean;
  colorByDirection?: boolean;
}

const getBarColor = (direction?: string) => {
  switch (direction) {
    case 'positive': return '#4caf50'; // green
    case 'negative': return '#e53935'; // red
    case 'neutral': return '#bdbdbd'; // gray
    default: return '#8884d8'; // default
  }
};

/**
 * Component to visualize feature importance in AI model explanations
 */
const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  features,
  modelType,
  confidence,
  enableTooltips,
  colorByDirection
}) => {
  if (!features || features.length === 0) {
    return <div>No feature importance data available.</div>;
  }

  const boxBg = '#fff';
  const borderColor = '#e2e8f0';
  const textColor = '#1a202c';
  
  // Sort features by importance
  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance);
  
  // Colors based on model type
  const modelColors = {
    'rfq_classification': 'blue',
    'bid_pricing': 'green',
    'product_categorization': 'purple'
  };
  
  const colorScheme = modelColors[modelType as keyof typeof modelColors] || 'blue';
  
  // Format confidence percentage
  const confidencePercentage = Math.round(confidence * 100);
  
  return (
    <Box
      bg={boxBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
      boxShadow="md"
      width="100%"
    >
      <Flex justify="space-between" width="100%" align="flex-start" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Feature Importance Analysis
        </Text>
        <span title="Features ranked by their importance in the AI model's decision making process">
          <InfoOutlineIcon color="gray.500" />
        </span>
      </Flex>
      
      <Flex mb={4} align="center">
        <Text mr={2}>Model Type:</Text>
        <Badge colorScheme={colorScheme} px={2} py={1}>
          {modelType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </Badge>
        <Text ml={4} mr={2}>Confidence:</Text>
        <Badge colorScheme={confidencePercentage > 80 ? 'green' : 
                            confidencePercentage > 60 ? 'blue' : 
                            confidencePercentage > 40 ? 'yellow' : 'red'} 
               px={2} py={1}>
          {confidencePercentage}%
        </Badge>
      </Flex>
      
      <Box height="1px" bg={borderColor} mb={4} />
      
      {sortedFeatures.length === 0 ? (
        <Text color="gray.500" py={4} textAlign="center">No feature data available</Text>
      ) : (
        sortedFeatures.map((feature, index) => (
          <Box key={index} mb={3}>
            <Flex justify="space-between" mb={1}>
              <Text fontWeight="medium" title={feature.description || `Value: ${feature.value}`}>{feature.name}</Text>
              <Text>{(feature.importance * 100).toFixed(1)}%</Text>
            </Flex>
            <Box
              height="8px"
              width={`${feature.importance * 100}%`}
              bg={colorScheme}
              borderRadius="full"
              mt={1}
            />
          </Box>
        ))
      )}
      
      <Text fontSize="sm" color="gray.500" mt={4}>
        Based on {sortedFeatures.length} features extracted using SHAP/LIME analysis
      </Text>
    </Box>
  );
};

export default FeatureImportanceChart;
