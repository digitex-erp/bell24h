import React, { useState, useEffect } from 'react';
import { Box, Container, Flex, Grid, GridItem, VStack, HStack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/input';
import { Text, Heading } from '@chakra-ui/typography';
import { Textarea } from '@chakra-ui/textarea';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Select as ChakraSelect } from '@chakra-ui/select';
import { useToast } from '@chakra-ui/toast';
import { Tooltip } from '@chakra-ui/tooltip';
import { FiUpload, FiInfo, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

// Import enhanced video components
import { VideoRFQUploader } from '../components/video/VideoRFQUploader.js';
import { VideoAnalyticsPlayer } from '../components/video/VideoAnalyticsPlayer.js';
import { ThumbnailGenerator } from '../components/video/ThumbnailGenerator.js';

// Import currency related components and hooks
import { useCurrency } from '../contexts/CurrencyContext.js';
import { parseCurrency } from '../utils/currencyUtils.js';

interface ProductShowcase {
  id?: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  base_currency: string;
  prices?: {
    [currency: string]: number | undefined;
  };
  video_url?: string;
  thumbnail_url?: string;
  public_id?: string;
  user_id?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const ProductShowcasePage: React.FC = () => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoPublicId, setVideoPublicId] = useState<string | null>(null);
  const [isVideoProcessed, setIsVideoProcessed] = useState(false);

  // Currency handling
  const { currency: userCurrency, convertCurrency, getExchangeRate } = useCurrency();
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [priceInUserCurrency, setPriceInUserCurrency] = useState<number | undefined>();
  const [isConverting, setIsConverting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1);

  // Product showcase form state
  const initialShowcaseData: Omit<ProductShowcase, 'id' | 'created_at' | 'updated_at'> = {
    title: '',
    description: '',
    category: 'general',
    price: undefined,
    base_currency: 'INR',
    prices: {},
    status: 'draft',
    video_url: '',
    thumbnail_url: '',
    public_id: '',
    user_id: ''
  };

  const [showcaseData, setShowcaseData] = useState(initialShowcaseData);

  // Import categories from the marketplace categories module
  const categories = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'apparel', label: 'Apparel & Fashion' },
    { value: 'automobile', label: 'Automobile' },
    { value: 'electronics', label: 'Consumer Electronics' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'construction', label: 'Construction' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'it', label: 'IT & Software' },
    { value: 'energy', label: 'Energy' },
    { value: 'furniture', label: 'Furniture' }
    // Additional categories can be added from the comprehensive list
  ];

  // Update price in user's currency when base price or currency changes
  useEffect(() => {
    if (showcaseData.price !== undefined && showcaseData.price !== null) {
      if (baseCurrency === userCurrency) {
        setPriceInUserCurrency(showcaseData.price);
        setExchangeRate(1);
      } else {
        setIsConverting(true);
        try {
          const rate = getExchangeRate(baseCurrency, userCurrency);
          setExchangeRate(rate);
          const converted = convertCurrency(showcaseData.price, baseCurrency, userCurrency);
          setPriceInUserCurrency(converted);
        } catch (error) {
          console.error('Error converting currency:', error);
          setPriceInUserCurrency(undefined);
        } finally {
          setIsConverting(false);
        }
      }
    } else {
      setPriceInUserCurrency(undefined);
    }
  }, [showcaseData.price, baseCurrency, userCurrency, convertCurrency, getExchangeRate]);

  // Handle price change in user's currency
  const handlePriceChange = (value: string) => {
    const numericValue = parseCurrency(value);
    if (numericValue === null) {
      setPriceInUserCurrency(undefined);
      return;
    }

    setPriceInUserCurrency(numericValue);

    // Convert back to base currency for storage
    if (baseCurrency === userCurrency) {
      setShowcaseData(prev => ({
        ...prev,
        price: numericValue
      }));
    } else {
      const converted = convertCurrency(numericValue, userCurrency, baseCurrency);
      setShowcaseData(prev => ({
        ...prev,
        price: converted,
        prices: {
          ...(prev.prices || {}),
          [userCurrency]: numericValue
        }
      }));
    }
  };

  // Handle price input blur - format the displayed value
  const handlePriceBlur = () => {
    if (priceInUserCurrency !== undefined) {
      const formatted = formatPrice(priceInUserCurrency, userCurrency, false);
      const parsed = parseCurrency(formatted);
      if (parsed !== null) {
        setPriceInUserCurrency(parsed);
      }
    }
  };
  
  // Format price based on currency
  const formatPrice = (price: number | undefined, currency: string, includeSymbol = true): string => {
    if (price === undefined) return '';
    
    try {
      return new Intl.NumberFormat('en-IN', {
        style: includeSymbol ? 'currency' : 'decimal',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } catch (error) {
      console.error('Error formatting price:', error);
      return price.toString();
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Special handling for price input
    if (name === 'price') {
      handlePriceChange(value);
      return;
    }

    setShowcaseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle currency change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setBaseCurrency(newCurrency);

    // Update the price if we have a price in the new currency
    if (showcaseData.prices?.[newCurrency] !== undefined) {
      setShowcaseData(prev => ({
        ...prev,
        price: prev.prices?.[newCurrency]
      }));
    } else {
      // If no price in the new currency, keep the existing price
      // The effect will handle the conversion
      setShowcaseData(prev => ({
        ...prev,
        price: undefined
      }));
    }
  };

  // Handle video upload completion
  const handleVideoUploadComplete = (url: string, publicId: string) => {
    setVideoUrl(url);
    setVideoPublicId(publicId);
    setShowcaseData(prev => ({
      ...prev,
      video_url: url,
      public_id: publicId
    }));
    toast({
      title: 'Video uploaded',
      description: 'Your video has been successfully uploaded and is being processed.',
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };

  // Handle thumbnail generation
  const handleThumbnailGenerated = (thumbnailUrl: string) => {
    setThumbnailUrl(thumbnailUrl);
    setShowcaseData(prev => ({
      ...prev,
      thumbnail_url: thumbnailUrl
    }));
  };

  // Handle video processing complete
  const handleVideoProcessed = () => {
    setIsVideoProcessed(true);
    toast({
      title: 'Video ready',
      description: 'Your video has been processed and is ready for viewing.',
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };

  // Submit product showcase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your backend
      await axios.post('/api/product-showcases', {
        ...showcaseData,
        status: 'published',
        published_at: new Date().toISOString()
      });
      
      toast({
        title: 'Published successfully',
        description: 'Your product showcase has been published.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Reset form with initial values
      setShowcaseData(initialShowcaseData);
      
    } catch (error) {
      console.error('Error publishing product showcase:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error publishing your product showcase. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">Product Video Showcase</Heading>
        <Text color="gray.600">
          Create a compelling product showcase with video to highlight your products and services.
        </Text>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          {/* Video Upload Section */}
          <GridItem>
            <Box borderWidth="1px" borderRadius="lg" p={6}>
              <Heading size="md" mb={4}>
                <Flex align="center">
                  <FiVideo style={{ marginRight: '8px' }} />
                  Product Video
                </Flex>
              </Heading>

              {!videoUrl ? (
                <VideoRFQUploader
                  onUploadComplete={handleVideoUploadComplete}
                  maxDuration={600} // 10 minutes
                  maxSizeMB={100} // 100MB max
                  resourceType="product_showcase"
                />
              ) : (
                <VStack spacing={4} align="stretch">
                  <VideoAnalyticsPlayer
                    videoUrl={videoUrl}
                    publicId={videoPublicId || ''}
                    onProcessed={handleVideoProcessed}
                    resourceType="product_showcase"
                    autoAnalytics={true}
                  />

                  {isVideoProcessed && !thumbnailUrl && (
                    <Box mt={4}>
                      <Heading size="sm" mb={2}>Generate Thumbnail</Heading>
                      <ThumbnailGenerator
                        videoUrl={videoUrl}
                        publicId={videoPublicId || ''}
                        onThumbnailGenerated={handleThumbnailGenerated}
                      />
                    </Box>
                  )}

                  {thumbnailUrl && (
                    <Box mt={4}>
                      <Heading size="sm" mb={2}>Thumbnail</Heading>
                      <Box
                        as="img"
                        src={showcaseData.thumbnail_url || '/placeholder-thumbnail.jpg'}
                        alt="Product thumbnail"
                        objectFit="cover"
                        borderRadius="md"
                        width="150px"
                        height="150px"
                      />
                    </Box>
                  )}
                </VStack>
              )}
            </Box>
          </GridItem>

          {/* Product Details Section */}
          <GridItem>
            <Box borderWidth="1px" borderRadius="lg" p={6}>
              <Heading size="md" mb={4}>
                <Flex align="center">
                  <FiInfo style={{ marginRight: '8px' }} />
                  Product Details
                </Flex>
              </Heading>

              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Product Title</FormLabel>
                  <Input
                    name="title"
                    value={showcaseData.title}
                    onChange={handleInputChange}
                    placeholder="Enter product title"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <ChakraSelect
                    name="category"
                    value={showcaseData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </ChakraSelect>
                </FormControl>

                <FormControl id="price" isRequired>
                  <FormLabel>Price</FormLabel>
                  <HStack spacing={2} align="flex-end">
                    <Box flex={1}>
                      <InputGroup>
                        <InputLeftAddon>
                          <ChakraSelect
                            value={baseCurrency}
                            onChange={handleCurrencyChange}
                            borderRightRadius="0"
                            size="md"
                            w="80px"
                          >
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                          </ChakraSelect>
                        </InputLeftAddon>
                        <Input
                          type="text"
                          name="price"
                          value={priceInUserCurrency !== undefined ? formatPrice(priceInUserCurrency, userCurrency, false) : ''}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          onBlur={handlePriceBlur}
                          placeholder="Enter price"
                          pl={2}
                        />
                      </InputGroup>
                    </Box>
                    {isConverting ? (
                      <Box p={2}>
                        <FiRefreshCw className="animate-spin" />
                      </Box>
                    ) : priceInUserCurrency !== undefined && baseCurrency !== userCurrency ? (
                      <Tooltip
                        label={`Exchange rate: 1 ${baseCurrency} = ${exchangeRate.toFixed(4)} ${userCurrency}`}
                        placement="top"
                      >
                        <Box
                          p={2}
                          fontSize="sm"
                          color="gray.500"
                          whiteSpace="nowrap"
                        >
                          ≈ {formatPrice(priceInUserCurrency, userCurrency)}
                        </Box>
                      </Tooltip>
                    ) : null}
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {baseCurrency !== userCurrency && (
                      <>
                        Displayed in {baseCurrency}.
                        Customer will see prices in their local currency.
                      </>
                    )}
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={showcaseData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product in detail..."
                    rows={6}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Flex justify="flex-end" mt={4}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!videoUrl || !showcaseData.title || !showcaseData.description}
                leftIcon={<FiUpload />}
              >
                Publish Showcase
              </Button>
            </Flex>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default ProductShowcasePage;
