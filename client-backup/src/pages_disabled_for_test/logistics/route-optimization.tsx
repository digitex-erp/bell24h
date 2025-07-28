import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  VStack,
  HStack,
  Checkbox,
  Divider,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import { FaRoute, FaMapMarkedAlt, FaChartBar } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import LogisticsNavigation from '../../components/logistics/LogisticsNavigation';
import { RouteOptimizationService, Location, OptimizedRoute } from '../../services/logistics/route-optimization-service';

// Import for the Map component
import dynamic from 'next/dynamic';

// Dynamically load the map component with no SSR
const MapWithNoSSR = dynamic(
  () => import('../../components/logistics/ShipmentTrackingMap'),
  { ssr: false }
);

interface FormData {
  origin: Location;
  destination: Location;
  options: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    optimizeFor: 'distance' | 'time' | 'fuel';
    departureTime: string;
    vehicleType: 'car' | 'truck' | 'van';
    trafficModel: 'best_guess' | 'pessimistic' | 'optimistic';
    getAlternatives: boolean;
  };
}

export default function RouteOptimizationPage() {
  const toast = useToast();
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [alternatives, setAlternatives] = useState<OptimizedRoute[]>([]);
  const [showMap, setShowMap] = useState(false);
  
  // Initial form state
  const [formData, setFormData] = useState<FormData>({
    origin: {
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
    destination: {
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
    options: {
      avoidTolls: false,
      avoidHighways: false,
      optimizeFor: 'time',
      departureTime: new Date().toISOString().slice(0, 16),
      vehicleType: 'truck',
      trafficModel: 'best_guess',
      getAlternatives: false,
    },
  });
  
  // Mutation for optimizing routes
  const optimizeRouteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/logistics/routes/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to optimize route');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.alternatives) {
        setAlternatives(data.alternatives);
        setOptimizedRoute(data.alternatives[0]);
      } else {
        setOptimizedRoute(data);
        setAlternatives([]);
      }
      setShowMap(true);
      
      toast({
        title: 'Route optimized successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error optimizing route',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });
  
  // Handle form field changes
  const handleChange = (section: 'origin' | 'destination' | 'options', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [field]: checked,
      },
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    optimizeRouteMutation.mutate(formData);
  };
  
  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };
  
  // Check if form is valid
  const isFormValid = (): boolean => {
    const { origin, destination } = formData;
    return (
      !!origin.address && !!origin.city && !!origin.country && !!origin.postalCode &&
      !!destination.address && !!destination.city && !!destination.country && !!destination.postalCode
    );
  };
  
  // Format address for display
  const formatAddress = (location: Location): string => {
    return `${location.address}, ${location.city}, ${location.state ? location.state + ', ' : ''}${location.postalCode}, ${location.country}`;
  };
  
  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={6}>
          {/* Sidebar Navigation */}
          <GridItem>
            <LogisticsNavigation />
          </GridItem>
          
          {/* Main Content */}
          <GridItem>
            <Box mb={6}>
              <Heading size="lg" mb={2}>Route Optimization</Heading>
              <Text color="gray.600">
                Optimize shipping routes to save time, fuel, and costs. Plan the most efficient paths for your shipments.
              </Text>
            </Box>
            
            <Grid templateColumns={{ base: "1fr", lg: showMap ? "350px 1fr" : "1fr" }} gap={6}>
              {/* Form Section */}
              <GridItem>
                <Card>
                  <CardBody>
                    <form onSubmit={handleSubmit}>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Heading size="sm" mb={4}>Origin</Heading>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel>Address</FormLabel>
                              <Input 
                                value={formData.origin.address}
                                onChange={(e) => handleChange('origin', 'address', e.target.value)}
                                placeholder="Street address"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>City</FormLabel>
                              <Input 
                                value={formData.origin.city}
                                onChange={(e) => handleChange('origin', 'city', e.target.value)}
                                placeholder="City"
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={4}>
                            <FormControl>
                              <FormLabel>State</FormLabel>
                              <Input 
                                value={formData.origin.state}
                                onChange={(e) => handleChange('origin', 'state', e.target.value)}
                                placeholder="State/Province"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Postal Code</FormLabel>
                              <Input 
                                value={formData.origin.postalCode}
                                onChange={(e) => handleChange('origin', 'postalCode', e.target.value)}
                                placeholder="Postal/ZIP Code"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Country</FormLabel>
                              <Select
                                value={formData.origin.country}
                                onChange={(e) => handleChange('origin', 'country', e.target.value)}
                              >
                                <option value="India">India</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Singapore">Singapore</option>
                                <option value="United Arab Emirates">United Arab Emirates</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                        </Box>
                        
                        <Divider />
                        
                        <Box>
                          <Heading size="sm" mb={4}>Destination</Heading>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                            <FormControl isRequired>
                              <FormLabel>Address</FormLabel>
                              <Input 
                                value={formData.destination.address}
                                onChange={(e) => handleChange('destination', 'address', e.target.value)}
                                placeholder="Street address"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>City</FormLabel>
                              <Input 
                                value={formData.destination.city}
                                onChange={(e) => handleChange('destination', 'city', e.target.value)}
                                placeholder="City"
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={4}>
                            <FormControl>
                              <FormLabel>State</FormLabel>
                              <Input 
                                value={formData.destination.state}
                                onChange={(e) => handleChange('destination', 'state', e.target.value)}
                                placeholder="State/Province"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Postal Code</FormLabel>
                              <Input 
                                value={formData.destination.postalCode}
                                onChange={(e) => handleChange('destination', 'postalCode', e.target.value)}
                                placeholder="Postal/ZIP Code"
                              />
                            </FormControl>
                            
                            <FormControl isRequired>
                              <FormLabel>Country</FormLabel>
                              <Select
                                value={formData.destination.country}
                                onChange={(e) => handleChange('destination', 'country', e.target.value)}
                              >
                                <option value="India">India</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Singapore">Singapore</option>
                                <option value="United Arab Emirates">United Arab Emirates</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                        </Box>
                        
                        <Divider />
                        
                        <Box>
                          <Heading size="sm" mb={4}>Optimization Options</Heading>
                          
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Optimize For</FormLabel>
                              <Select
                                value={formData.options.optimizeFor}
                                onChange={(e) => handleChange('options', 'optimizeFor', e.target.value)}
                              >
                                <option value="time">Time (Fastest)</option>
                                <option value="distance">Distance (Shortest)</option>
                                <option value="fuel">Fuel Efficiency</option>
                              </Select>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel>Vehicle Type</FormLabel>
                              <Select
                                value={formData.options.vehicleType}
                                onChange={(e) => handleChange('options', 'vehicleType', e.target.value)}
                              >
                                <option value="truck">Truck</option>
                                <option value="van">Van</option>
                                <option value="car">Car</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                          
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
                            <FormControl>
                              <FormLabel>Departure Time</FormLabel>
                              <Input 
                                type="datetime-local"
                                value={formData.options.departureTime}
                                onChange={(e) => handleChange('options', 'departureTime', e.target.value)}
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel>Traffic Model</FormLabel>
                              <Select
                                value={formData.options.trafficModel}
                                onChange={(e) => handleChange('options', 'trafficModel', e.target.value)}
                              >
                                <option value="best_guess">Best Guess</option>
                                <option value="pessimistic">Pessimistic</option>
                                <option value="optimistic">Optimistic</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                          
                          <Stack direction={{ base: "column", sm: "row" }} spacing={4} mt={4}>
                            <Checkbox
                              isChecked={formData.options.avoidTolls}
                              onChange={(e) => handleCheckboxChange('avoidTolls', e.target.checked)}
                            >
                              Avoid Tolls
                            </Checkbox>
                            
                            <Checkbox
                              isChecked={formData.options.avoidHighways}
                              onChange={(e) => handleCheckboxChange('avoidHighways', e.target.checked)}
                            >
                              Avoid Highways
                            </Checkbox>
                            
                            <Checkbox
                              isChecked={formData.options.getAlternatives}
                              onChange={(e) => handleCheckboxChange('getAlternatives', e.target.checked)}
                            >
                              Show Alternatives
                            </Checkbox>
                          </Stack>
                        </Box>
                        
                        <Button
                          type="submit"
                          colorScheme="blue"
                          size="lg"
                          leftIcon={<FaRoute />}
                          isLoading={optimizeRouteMutation.isPending}
                          loadingText="Optimizing..."
                          isDisabled={!isFormValid()}
                        >
                          Optimize Route
                        </Button>
                      </VStack>
                    </form>
                  </CardBody>
                </Card>
              </GridItem>
              
              {/* Results Section */}
              {showMap && optimizedRoute && (
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* Map */}
                    <Card>
                      <CardBody p={0} overflow="hidden" borderRadius="lg">
                        <Box height="400px">
                          <MapWithNoSSR
                            origin={formatAddress(formData.origin)}
                            destination={formatAddress(formData.destination)}
                            updates={[]}
                            polyline={optimizedRoute.polyline}
                          />
                        </Box>
                      </CardBody>
                    </Card>
                    
                    {/* Route Stats */}
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Route Details</Heading>
                        
                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                          <Stat>
                            <StatLabel>Total Distance</StatLabel>
                            <StatNumber>{optimizedRoute.totalDistance.toFixed(1)} km</StatNumber>
                          </Stat>
                          
                          <Stat>
                            <StatLabel>Travel Time</StatLabel>
                            <StatNumber>{formatDuration(optimizedRoute.totalDuration)}</StatNumber>
                          </Stat>
                          
                          <Stat>
                            <StatLabel>Fuel Consumption</StatLabel>
                            <StatNumber>{optimizedRoute.fuelConsumption.toFixed(1)} L</StatNumber>
                          </Stat>
                          
                          <Stat>
                            <StatLabel>CO2 Emission</StatLabel>
                            <StatNumber>{optimizedRoute.co2Emission.toFixed(1)} kg</StatNumber>
                          </Stat>
                        </SimpleGrid>
                        
                        <Divider my={4} />
                        
                        <HStack spacing={4}>
                          <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                            {formData.options.optimizeFor === 'time' ? 'Fastest Route' : 
                             formData.options.optimizeFor === 'distance' ? 'Shortest Route' : 
                             'Fuel-Efficient Route'}
                          </Badge>
                          
                          {formData.options.avoidTolls && (
                            <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                              Toll-Free
                            </Badge>
                          )}
                          
                          {formData.options.avoidHighways && (
                            <Badge colorScheme="orange" px={2} py={1} borderRadius="md">
                              Avoiding Highways
                            </Badge>
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                    
                    {/* Alternative Routes */}
                    {alternatives.length > 1 && (
                      <Card>
                        <CardBody>
                          <Heading size="md" mb={4}>Alternative Routes</Heading>
                          
                          <Tabs variant="enclosed" colorScheme="blue">
                            <TabList>
                              {alternatives.map((_, index) => (
                                <Tab key={index}>Route {index + 1}</Tab>
                              ))}
                            </TabList>
                            
                            <TabPanels>
                              {alternatives.map((route, index) => (
                                <TabPanel key={index} px={0}>
                                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                    <Stat>
                                      <StatLabel>Total Distance</StatLabel>
                                      <StatNumber>{route.totalDistance.toFixed(1)} km</StatNumber>
                                    </Stat>
                                    
                                    <Stat>
                                      <StatLabel>Travel Time</StatLabel>
                                      <StatNumber>{formatDuration(route.totalDuration)}</StatNumber>
                                    </Stat>
                                    
                                    <Stat>
                                      <StatLabel>Fuel Consumption</StatLabel>
                                      <StatNumber>{route.fuelConsumption.toFixed(1)} L</StatNumber>
                                    </Stat>
                                    
                                    <Stat>
                                      <StatLabel>CO2 Emission</StatLabel>
                                      <StatNumber>{route.co2Emission.toFixed(1)} kg</StatNumber>
                                    </Stat>
                                  </SimpleGrid>
                                  
                                  <Button
                                    mt={4}
                                    colorScheme="blue"
                                    variant="outline"
                                    leftIcon={<FaMapMarkedAlt />}
                                    onClick={() => setOptimizedRoute(route)}
                                    size="sm"
                                  >
                                    View on Map
                                  </Button>
                                </TabPanel>
                              ))}
                            </TabPanels>
                          </Tabs>
                        </CardBody>
                      </Card>
                    )}
                  </VStack>
                </GridItem>
              )}
            </Grid>
          </GridItem>
        </Grid>
      </Container>
    </Layout>
  );
}
