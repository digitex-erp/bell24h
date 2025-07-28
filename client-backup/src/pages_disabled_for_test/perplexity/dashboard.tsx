import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Flex,
  Text,
  Textarea,
  Button,
  Select,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import PerplexityChart from '../../components/ai/PerplexityChart';
import FeatureImportanceChart from '../../components/ai/FeatureImportanceChart';
import { calculatePerplexity, getShapExplanation, getLimeExplanation, getFullExplanation } from '../../services/perplexity-service';

// Sample RFQ templates for quick testing
const SAMPLE_TEXTS = [
  "I need 50 units of industrial-grade steel pipes, 6 inches diameter, by next month. Budget is around $5000.",
  "Looking for a supplier who can provide 1000 USB-C cables, must be at least 2 meters long and support fast charging.",
  "Need quotation for 25 office chairs with ergonomic design, lumbar support, and adjustable height. Required within 2 weeks.",
  "Immediate requirement: 5 high-performance workstations with i9 processors, 64GB RAM, and RTX 4090 graphics cards for our design team.",
  "Request for 200kg of organic cocoa beans, single-origin from Ghana or Ecuador, for our premium chocolate production."
];

const PerplexityDashboard: React.FC = () => {
  // State management
  const [textInput, setTextInput] = useState('');
  const [modelType, setModelType] = useState('rfq_classification');
  const [analysisType, setAnalysisType] = useState('perplexity');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perplexityResult, setPerplexityResult] = useState<any>(null);
  const [shapResult, setShapResult] = useState<any>(null);
  const [limeResult, setLimeResult] = useState<any>(null);
  const [fullExplanation, setFullExplanation] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<Array<{
    text: string;
    type: string;
    score: number;
    timestamp: Date;
  }>>([]);

  const toast = useToast();

  // Handler for analysis button click
  const handleAnalyze = async () => {
    if (!textInput.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter some text to analyze',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Reset previous results
      setPerplexityResult(null);
      setShapResult(null);
      setLimeResult(null);
      setFullExplanation(null);

      // Perform the selected analysis type
      switch (analysisType) {
        case 'perplexity':
          const result = await calculatePerplexity(textInput);
          setPerplexityResult(result);
          
          // Add to recent analyses
          setRecentAnalyses(prev => [
            {
              text: textInput.length > 50 ? textInput.substring(0, 50) + '...' : textInput,
              type: 'Perplexity',
              score: result.normalized_perplexity,
              timestamp: new Date()
            },
            ...prev.slice(0, 4) // Keep only the 5 most recent
          ]);
          break;
          
        case 'shap':
          const shapExplanation = await getShapExplanation(textInput, modelType as any);
          setShapResult(shapExplanation);
          
          // Add to recent analyses
          setRecentAnalyses(prev => [
            {
              text: textInput.length > 50 ? textInput.substring(0, 50) + '...' : textInput,
              type: 'SHAP',
              score: shapExplanation.modelConfidence || 0,
              timestamp: new Date()
            },
            ...prev.slice(0, 4)
          ]);
          break;
          
        case 'lime':
          const limeExplanation = await getLimeExplanation(textInput, modelType as any);
          setLimeResult(limeExplanation);
          
          // Add to recent analyses
          setRecentAnalyses(prev => [
            {
              text: textInput.length > 50 ? textInput.substring(0, 50) + '...' : textInput,
              type: 'LIME',
              score: limeExplanation.modelConfidence || 0,
              timestamp: new Date()
            },
            ...prev.slice(0, 4)
          ]);
          break;
          
        case 'full':
          const fullResult = await getFullExplanation(textInput, modelType as any);
          setFullExplanation(fullResult);
          
          // Add to recent analyses
          setRecentAnalyses(prev => [
            {
              text: textInput.length > 50 ? textInput.substring(0, 50) + '...' : textInput,
              type: 'Full Analysis',
              score: fullResult.combinedConfidence || 0,
              timestamp: new Date()
            },
            ...prev.slice(0, 4)
          ]);
          break;
      }

      toast({
        title: 'Analysis complete',
        description: 'Text analysis completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load a sample text
  const loadSample = (index: number) => {
    setTextInput(SAMPLE_TEXTS[index]);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>
        Bell24H Perplexity AI Dashboard
      </Heading>
      <Text mb={8} color="gray.600">
        Analyze text complexity and get AI model explanations for RFQs, bids, and product descriptions
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Text Analysis</StatLabel>
              <StatNumber>{recentAnalyses.length}</StatNumber>
              <StatHelpText>Recent analyses</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>AI Models</StatLabel>
              <StatNumber>3</StatNumber>
              <StatHelpText>SHAP, LIME, Perplexity</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Integration Status</StatLabel>
              <Flex align="center">
                <CheckCircleIcon color="green.500" mr={2} />
                <StatNumber>Active</StatNumber>
              </Flex>
              <StatHelpText>Connected to Perplexity AI</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Input Panel */}
        <Box>
          <Card mb={6}>
            <CardBody>
              <Heading size="md" mb={4}>Text Input</Heading>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter RFQ text, product description, or any other text to analyze..."
                size="md"
                rows={8}
                mb={4}
              />
              
              <Flex direction={{ base: 'column', sm: 'row' }} gap={4} mb={4}>
                <Select 
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  width={{ base: 'full', sm: '50%' }}
                >
                  <option value="perplexity">Perplexity Analysis</option>
                  <option value="shap">SHAP Explanation</option>
                  <option value="lime">LIME Explanation</option>
                  <option value="full">Full Analysis</option>
                </Select>
                
                {(analysisType === 'shap' || analysisType === 'lime' || analysisType === 'full') && (
                  <Select 
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    width={{ base: 'full', sm: '50%' }}
                  >
                    <option value="rfq_classification">RFQ Classification</option>
                    <option value="bid_pricing">Bid Pricing</option>
                    <option value="product_categorization">Product Categorization</option>
                  </Select>
                )}
              </Flex>
              
              <Button 
                colorScheme="blue" 
                isLoading={isLoading}
                loadingText="Analyzing..."
                width="full"
                onClick={handleAnalyze}
                mb={4}
              >
                Analyze Text
              </Button>
              
              <Text fontSize="sm" mb={2}>Sample texts:</Text>
              <Flex wrap="wrap" gap={2}>
                {SAMPLE_TEXTS.map((_, index) => (
                  <Button 
                    key={index} 
                    size="sm" 
                    variant="outline" 
                    onClick={() => loadSample(index)}
                  >
                    Sample {index + 1}
                  </Button>
                ))}
              </Flex>
            </CardBody>
          </Card>
          
          {/* Recent Analyses */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Recent Analyses</Heading>
              {recentAnalyses.length === 0 ? (
                <Text color="gray.500">No recent analyses</Text>
              ) : (
                recentAnalyses.map((analysis, index) => (
                  <Flex 
                    key={index} 
                    justify="space-between" 
                    align="center" 
                    p={2} 
                    borderBottom={index < recentAnalyses.length - 1 ? "1px solid" : "none"} 
                    borderColor="gray.200"
                  >
                    <Box>
                      <Text noOfLines={1}>{analysis.text}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {analysis.timestamp.toLocaleString()}
                      </Text>
                    </Box>
                    <Flex align="center">
                      <Badge colorScheme={analysis.type === 'Perplexity' ? 'blue' : 'green'} mr={2}>
                        {analysis.type}
                      </Badge>
                      <Text>
                        {analysis.type === 'Perplexity' 
                          ? `${analysis.score.toFixed(1)}%` 
                          : `${(analysis.score * 100).toFixed(0)}%`}
                      </Text>
                    </Flex>
                  </Flex>
                ))
              )}
            </CardBody>
          </Card>
        </Box>
        
        {/* Results Panel */}
        <Box>
          {error && (
            <Alert status="error" mb={6} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}
          
          {isLoading ? (
            <Flex direction="column" align="center" justify="center" p={10} borderRadius="md" bg="gray.50">
              <Spinner size="xl" mb={4} color="blue.500" />
              <Text>Analyzing your text...</Text>
            </Flex>
          ) : (
            <Card>
              <CardBody>
                {!perplexityResult && !shapResult && !limeResult && !fullExplanation ? (
                  <Flex direction="column" align="center" justify="center" p={10}>
                    <InfoIcon boxSize={10} color="blue.400" mb={4} />
                    <Text fontSize="lg" fontWeight="medium" mb={2}>No Analysis Results Yet</Text>
                    <Text color="gray.500" textAlign="center">
                      Enter some text and click "Analyze Text" to see results here
                    </Text>
                  </Flex>
                ) : (
                  <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                      {perplexityResult && <Tab>Perplexity</Tab>}
                      {shapResult && <Tab>SHAP</Tab>}
                      {limeResult && <Tab>LIME</Tab>}
                      {fullExplanation && <Tab>Combined</Tab>}
                    </TabList>
                    <TabPanels>
                      {perplexityResult && (
                        <TabPanel>
                          <PerplexityChart
                            perplexity={perplexityResult.perplexity}
                            normalizedScore={perplexityResult.normalized_perplexity}
                            tokens={perplexityResult.tokens}
                            category={perplexityResult.complexity_category}
                            interpretation={perplexityResult.interpretation}
                          />
                        </TabPanel>
                      )}
                      
                      {shapResult && (
                        <TabPanel>
                          <FeatureImportanceChart
                            features={shapResult.features}
                            modelType={modelType}
                            confidence={shapResult.modelConfidence || 0.5}
                          />
                          {shapResult.perplexity && (
                            <Box mt={6}>
                              <PerplexityChart
                                perplexity={shapResult.perplexity.score}
                                normalizedScore={shapResult.perplexity.normalizedScore}
                                tokens={shapResult.perplexity.tokens}
                                category={shapResult.perplexity.category}
                                interpretation={shapResult.perplexity.interpretation}
                              />
                            </Box>
                          )}
                        </TabPanel>
                      )}
                      
                      {limeResult && (
                        <TabPanel>
                          <FeatureImportanceChart
                            features={limeResult.features}
                            modelType={modelType}
                            confidence={limeResult.modelConfidence || 0.5}
                          />
                          {limeResult.perplexity && (
                            <Box mt={6}>
                              <PerplexityChart
                                perplexity={limeResult.perplexity.score}
                                normalizedScore={limeResult.perplexity.normalizedScore}
                                tokens={limeResult.perplexity.tokens}
                                category={limeResult.perplexity.category}
                                interpretation={limeResult.perplexity.interpretation}
                              />
                            </Box>
                          )}
                        </TabPanel>
                      )}
                      
                      {fullExplanation && (
                        <TabPanel>
                          <Alert status="info" mb={4} borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <AlertTitle>Data Quality Assessment</AlertTitle>
                              <AlertDescription>{fullExplanation.dataQualitySummary}</AlertDescription>
                            </Box>
                          </Alert>
                          
                          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                            <FeatureImportanceChart
                              features={fullExplanation.shap.features}
                              modelType={modelType}
                              confidence={fullExplanation.combinedConfidence}
                            />
                            
                            <PerplexityChart
                              perplexity={fullExplanation.perplexity.score}
                              normalizedScore={fullExplanation.perplexity.normalizedScore}
                              tokens={fullExplanation.perplexity.tokens}
                              category={fullExplanation.perplexity.category}
                              interpretation={fullExplanation.perplexity.interpretation}
                            />
                          </SimpleGrid>
                        </TabPanel>
                      )}
                    </TabPanels>
                  </Tabs>
                )}
              </CardBody>
            </Card>
          )}
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default PerplexityDashboard;
