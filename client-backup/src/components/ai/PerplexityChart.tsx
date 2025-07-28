import React from 'react';
import { Box, Flex, Text, Badge } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

interface PerplexityChartProps {
  perplexity: number;
  normalizedScore: number;
  tokens: number;
  category: string;
  interpretation: string;
}

/**
 * Component to visualize perplexity score with color-coded indicators
 */
const PerplexityChart: React.FC<PerplexityChartProps> = ({
  perplexity,
  normalizedScore,
  tokens,
  category,
  interpretation
}) => {
  // Colors based on perplexity category
  const categoryColors = {
    'simple': 'green.500',
    'low': 'green.500',
    'moderate': 'blue.500',
    'medium': 'blue.500',
    'complex': 'orange.500',
    'high': 'orange.500',
    'very complex': 'red.500',
    'very-high': 'red.500'
  };
  
  const boxBg = '#fff';
  const borderColor = '#e2e8f0';
  const textColor = '#1a202c';
  
  // Normalize category key
  const categoryKey = category.toLowerCase().replace('-', ' ') as keyof typeof categoryColors;
  const color = categoryColors[categoryKey] || 'blue.500';
  
  // Format perplexity to 2 decimal places
  const formattedPerplexity = perplexity.toFixed(2);
  const formattedNormalizedScore = normalizedScore.toFixed(1);
  
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
      <Flex direction="column" align="center">
        <Flex justify="space-between" width="100%" align="flex-start" mb={4}>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Text Complexity Analysis
          </Text>
          <span title="Perplexity Score: Lower is simpler, higher is more complex">
            <InfoOutlineIcon color="gray.500" />
          </span>
        </Flex>
        
        <Flex wrap="wrap" justify="space-between" width="100%">
          <Box textAlign="center" flex="1" minW="150px" mb={4}>
            <Box width="80px" height="80px" borderRadius="50%" borderWidth="8px" borderColor={color} display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="lg" fontWeight="bold">{formattedPerplexity}</Text>
            </Box>
            <Text mt={2} fontSize="sm" color="gray.500">
              Complexity Score
            </Text>
          </Box>
          
          <Box flex="2" minW="200px">
            <Box>
              <Text fontSize="sm">Normalized Score</Text>
              <Text fontWeight="bold">{formattedNormalizedScore}/100</Text>
            </Box>
            <Box height="1px" bg={borderColor} my={4} />
            <Flex align="center" mt={2}>
              <Badge colorScheme={color.split('.')[0]} px={2} py={1} borderRadius="md">
                {category.charAt(0).toUpperCase() + category.slice(1)} Complexity
              </Badge>
            </Flex>
            <Box>
              <Text fontSize="sm">Tokens</Text>
              <Text fontWeight="bold">{tokens}</Text>
              <Text fontSize="xs" color="gray.500">in context</Text>
            </Box>
            
            <Text mt={2} fontSize="sm" color="gray.600">
              {interpretation}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PerplexityChart;
