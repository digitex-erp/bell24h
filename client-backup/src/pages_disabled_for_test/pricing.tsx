import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  VStack,
  useColorModeValue,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import { FiCheck, FiCamera, FiVideo, FiClock, FiDollarSign, FiStar, FiShield, FiBarChart2, FiZap, FiX } from 'react-icons/fi';

// Define the pricing tiers
interface PricingPlan {
  name: string;
  price: {
    monthly: string;
    yearly: string;
  };
  description: string;
  features: {
    text: string;
    included: boolean;
    tooltip?: string;
  }[];
  videoFeatures: {
    text: string;
    included: boolean;
    tooltip?: string;
  }[];
  callToAction: string;
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: {
      monthly: '₹0',
      yearly: '₹0',
    },
    description: 'Basic access for small businesses just getting started.',
    features: [
      { text: '5 RFQs/month', included: true },
      { text: 'Basic AI matching', included: true },
      { text: 'Wallet access', included: true },
      { text: 'Transaction fees: 5%', included: true, tooltip: 'Fee charged on successful transactions' },
      { text: 'Invoice financing', included: false },
      { text: 'Escrow services (2% fee)', included: false },
      { text: 'Ad placement', included: false },
    ],
    videoFeatures: [
      { text: 'Basic video uploads', included: true },
      { text: 'Auto-generated thumbnails', included: false },
      { text: 'Video analytics', included: false },
      { text: 'Branded video player', included: false },
    ],
    callToAction: 'Sign Up Free',
  },
  {
    name: 'Pro',
    price: {
      monthly: '₹8,000',
      yearly: '₹80,000',
    },
    description: 'For growing businesses with increasing transaction volume.',
    features: [
      { text: 'Unlimited RFQs', included: true },
      { text: 'SHAP AI explanations', included: true, tooltip: 'Detailed AI-powered explanations for supplier matches' },
      { text: 'Priority support', included: true },
      { text: 'Transaction fees: 3%', included: true, tooltip: 'Reduced fee on successful transactions' },
      { text: 'Invoice financing via KredX', included: true, tooltip: '0.5% fee on invoice amount' },
      { text: 'Escrow services (1.5% fee)', included: true },
      { text: 'Basic ad placement', included: true },
    ],
    videoFeatures: [
      { text: 'Enhanced video uploads', included: true, tooltip: 'High-quality video processing with faster upload speeds' },
      { text: 'Custom thumbnail generator', included: true, tooltip: 'Create and select custom thumbnails at any point in your video' },
      { text: 'Basic video analytics', included: true, tooltip: 'Track views, engagement, and completion rates' },
      { text: 'Branded video player', included: false },
    ],
    callToAction: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: {
      monthly: '₹50,000',
      yearly: '₹500,000',
    },
    description: 'Custom solutions for large enterprises with high volume needs.',
    features: [
      { text: 'Custom AI models', included: true, tooltip: 'AI models trained specifically for your business needs' },
      { text: 'Dedicated account manager', included: true },
      { text: 'API access', included: true },
      { text: 'Transaction fees: 2%', included: true, tooltip: 'Lowest fee on successful transactions' },
      { text: 'Invoice financing via KredX', included: true, tooltip: '0.3% fee on invoice amount' },
      { text: 'Escrow services (1% fee)', included: true },
      { text: 'Premium ad placement', included: true, tooltip: 'Featured placement on homepage and search results' },
    ],
    videoFeatures: [
      { text: 'Premium video uploads', included: true, tooltip: 'Highest quality video processing with unlimited storage' },
      { text: 'Advanced thumbnail generator', included: true, tooltip: 'AI-powered thumbnail suggestions and custom editing' },
      { text: 'Comprehensive analytics', included: true, tooltip: 'Advanced metrics with custom reports and insights' },
      { text: 'Custom branded video player', included: true, tooltip: 'Fully customizable video player with your brand colors and logo' },
    ],
    callToAction: 'Contact Sales',
  },
];

// Auxiliary fee information
const auxiliaryFees = [
  {
    name: 'Transaction Fees',
    description: 'Fee charged on successful transactions through the platform.',
    tiers: [
      { plan: 'Free', value: '5%' },
      { plan: 'Pro', value: '3%' },
      { plan: 'Enterprise', value: '2%' },
    ],
  },
  {
    name: 'Escrow Services',
    description: 'Secure payment holding service for transaction safety.',
    tiers: [
      { plan: 'Free', value: '2%' },
      { plan: 'Pro', value: '1.5%' },
      { plan: 'Enterprise', value: '1%' },
    ],
  },
  {
    name: 'Invoice Financing',
    description: 'Early payment financing through our KredX partnership.',
    tiers: [
      { plan: 'Free', value: 'Not available' },
      { plan: 'Pro', value: '0.5%' },
      { plan: 'Enterprise', value: '0.3%' },
    ],
  },
  {
    name: 'Ad Placement',
    description: 'Promote your products and services on Bell24H.',
    tiers: [
      { plan: 'Free', value: 'Not available' },
      { plan: 'Pro', value: 'Basic placement' },
      { plan: 'Enterprise', value: 'Premium placement' },
    ],
  },
];

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  
  // Calculate savings for yearly billing
  const getSavings = (monthly: string, yearly: string) => {
    const monthlyValue = parseFloat(monthly.replace(/[^\d.]/g, ''));
    const yearlyValue = parseFloat(yearly.replace(/[^\d.]/g, ''));
    const monthlyCost = monthlyValue * 12;
    return Math.round(((monthlyCost - yearlyValue) / monthlyCost) * 100);
  };

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        <VStack spacing={4} textAlign="center">
          <Heading as="h1" size="2xl">Pricing & Plans</Heading>
          <Text fontSize="xl" maxW="3xl" color="gray.500">
            Choose the right plan for your business and start connecting with suppliers and buyers across India.
          </Text>
          
          {/* Billing period toggle */}
          <HStack spacing={2} mt={6}>
            <Button 
              variant={billingPeriod === 'monthly' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setBillingPeriod('monthly')}
              size="md"
            >
              Monthly Billing
            </Button>
            <Button 
              variant={billingPeriod === 'yearly' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setBillingPeriod('yearly')}
              size="md"
            >
              Yearly Billing
              <Badge ml={2} colorScheme="green" variant="solid" fontSize="xs" px={2} borderRadius="full">
                Save 15-20%
              </Badge>
            </Button>
          </HStack>
        </VStack>

        {/* Pricing cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
          {plans.map((plan, index) => {
            const savingsPercent = getSavings(plan.price.monthly, plan.price.yearly);
            return (
              <Box
                key={index}
                position="relative"
                bg={bgColor}
                borderWidth="1px"
                borderColor={plan.popular ? accentColor : borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow={plan.popular ? 'lg' : 'base'}
                p={6}
                transform={plan.popular ? { lg: 'scale(1.05)' } : undefined}
                zIndex={plan.popular ? 1 : 0}
              >
                {plan.popular && (
                  <Badge
                    position="absolute"
                    top={0}
                    right={6}
                    colorScheme="blue"
                    mt={-2}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize="xs"
                    letterSpacing="wide"
                  >
                    Most Popular
                  </Badge>
                )}

                <VStack spacing={4} align="flex-start">
                  <Heading size="lg">{plan.name}</Heading>
                  <HStack>
                    <Text fontSize="4xl" fontWeight="bold">
                      {billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </Text>
                    <Box fontWeight="medium" fontSize="sm" color="gray.500">
                      {billingPeriod === 'monthly' ? '/month' : '/year'}
                    </Box>
                  </HStack>
                  {billingPeriod === 'yearly' && (
                    <Badge colorScheme="green" fontSize="sm" p={1}>
                      Save {savingsPercent}% with yearly billing
                    </Badge>
                  )}
                  <Text color="gray.500">{plan.description}</Text>
                  
                  <Divider my={2} />
                  
                  <Text fontWeight="bold" color={accentColor}>
                    Core Features
                  </Text>
                  <List spacing={3} w="full">
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx}>
                        <HStack>
                          <ListIcon 
                            as={feature.included ? FiCheck : FiX} 
                            color={feature.included ? 'green.500' : 'red.500'} 
                          />
                          <Text>{feature.text}</Text>
                          {feature.tooltip && feature.included && (
                            <Tooltip label={feature.tooltip} placement="top">
                              <Box as="span" fontSize="sm" color="gray.500" cursor="help">
                                ⓘ
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider my={2} />
                  
                  <Text fontWeight="bold" color={accentColor}>
                    <HStack>
                      <Icon as={FiVideo} />
                      <span>Video Features</span>
                    </HStack>
                  </Text>
                  <List spacing={3} w="full">
                    {plan.videoFeatures.map((feature, idx) => (
                      <ListItem key={idx}>
                        <HStack>
                          <ListIcon 
                            as={feature.included ? FiCheck : FiX} 
                            color={feature.included ? 'green.500' : 'red.500'} 
                          />
                          <Text>{feature.text}</Text>
                          {feature.tooltip && feature.included && (
                            <Tooltip label={feature.tooltip} placement="top">
                              <Box as="span" fontSize="sm" color="gray.500" cursor="help">
                                ⓘ
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button 
                    colorScheme="blue" 
                    size="lg" 
                    w="full" 
                    mt={4}
                    variant={plan.popular ? 'solid' : 'outline'}
                  >
                    {plan.callToAction}
                  </Button>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Additional fee information */}
        <Box w="full" mt={12}>
          <Heading size="lg" mb={6} textAlign="center">Additional Service Fees</Heading>
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <SimpleGrid columns={{ base: 1, md: 4 }} borderBottomWidth="1px">
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} fontWeight="bold">Service</Box>
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} fontWeight="bold">Free Plan</Box>
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} fontWeight="bold">Pro Plan</Box>
              <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} fontWeight="bold">Enterprise Plan</Box>
            </SimpleGrid>
            
            {auxiliaryFees.map((fee, idx) => (
              <SimpleGrid key={idx} columns={{ base: 1, md: 4 }} borderBottomWidth={idx < auxiliaryFees.length - 1 ? "1px" : "0"}>
                <Box p={4}>
                  <Text fontWeight="medium">{fee.name}</Text>
                  <Text fontSize="sm" color="gray.500">{fee.description}</Text>
                </Box>
                {fee.tiers.map((tier, tIdx) => (
                  <Box key={tIdx} p={4} bg={tier.plan === 'Pro' ? useColorModeValue('blue.50', 'blue.900') : undefined}>
                    {tier.value}
                  </Box>
                ))}
              </SimpleGrid>
            ))}
          </Box>
        </Box>

        {/* FAQ Section */}
        <Box w="full" mt={12}>
          <Heading size="lg" mb={6} textAlign="center">Frequently Asked Questions</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <VStack align="start" spacing={4} p={5} borderWidth="1px" borderRadius="lg">
              <Heading size="md">What is included in the transaction fee?</Heading>
              <Text>The transaction fee covers payment processing, platform usage, and basic customer service for each transaction processed through Bell24H. This fee is only charged on successful transactions.</Text>
            </VStack>
            
            <VStack align="start" spacing={4} p={5} borderWidth="1px" borderRadius="lg">
              <Heading size="md">How do the video features work?</Heading>
              <Text>Our enhanced video features allow you to upload high-quality videos for product showcases and RFQs. You can generate custom thumbnails, track viewer engagement, and use our analytics to improve your content.</Text>
            </VStack>
            
            <VStack align="start" spacing={4} p={5} borderWidth="1px" borderRadius="lg">
              <Heading size="md">Is there a limit on video length or storage?</Heading>
              <Text>Free accounts can upload videos up to 2 minutes in length with a total storage limit of 100MB. Pro accounts extend this to 10 minutes and 2GB, while Enterprise accounts have unlimited storage and 30-minute videos.</Text>
            </VStack>
            
            <VStack align="start" spacing={4} p={5} borderWidth="1px" borderRadius="lg">
              <Heading size="md">How does invoice financing work?</Heading>
              <Text>Through our partnership with KredX, approved sellers can receive early payment on their invoices for a small fee. This helps improve cash flow while waiting for buyers to complete their payment terms.</Text>
            </VStack>
          </SimpleGrid>
        </Box>

        {/* Call to action */}
        <Box w="full" mt={16} mb={8} p={10} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg" textAlign="center">
          <Heading size="lg" mb={4}>Ready to grow your business?</Heading>
          <Text fontSize="lg" mb={6} maxW="2xl" mx="auto">Join thousands of businesses across India that use Bell24H to find suppliers, manage RFQs, and close deals efficiently.</Text>
          <Button size="lg" colorScheme="blue" px={8}>
            Start Your Free Trial
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default PricingPage;
