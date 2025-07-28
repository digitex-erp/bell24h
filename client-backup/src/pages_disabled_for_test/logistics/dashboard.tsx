import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Text,
  Select,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { FiSearch, FiRefreshCw, FiPackage } from 'react-icons/fi';
import Layout from '../../components/Layout';
import RealTimeShipmentTracker from '../../components/logistics/RealTimeShipmentTracker';
import { ShipmentStatus } from '../../services/logistics/logistics-tracking-service';

// Pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9F46E4', '#FF4560', '#2E93fA'];

// Status display mapping
const statusDisplayMap: Record<ShipmentStatus, string> = {
  [ShipmentStatus.CREATED]: 'Created',
  [ShipmentStatus.LABEL_CREATED]: 'Label Created',
  [ShipmentStatus.PICKUP_SCHEDULED]: 'Pickup Scheduled',
  [ShipmentStatus.PICKUP_COMPLETE]: 'Pickup Complete',
  [ShipmentStatus.IN_TRANSIT]: 'In Transit',
  [ShipmentStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ShipmentStatus.DELIVERED]: 'Delivered',
  [ShipmentStatus.EXCEPTION]: 'Exception',
  [ShipmentStatus.CANCELLED]: 'Cancelled',
  [ShipmentStatus.RETURNED]: 'Returned',
};

// Types for the dashboard data
interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  internationalShipments: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  shipmentsThisMonth: number;
  shipmentsTrend: number;
}

interface StatusBreakdown {
  status: ShipmentStatus;
  count: number;
}

interface ProviderBreakdown {
  provider: string;
  count: number;
}

interface CountryBreakdown {
  country: string;
  count: number;
}

interface DailyShipment {
  date: string;
  created: number;
  delivered: number;
}

interface DashboardData {
  stats: DashboardStats;
  statusBreakdown: StatusBreakdown[];
  providerBreakdown: ProviderBreakdown[];
  destinationCountries: CountryBreakdown[];
  dailyShipments: DailyShipment[];
}

export default function LogisticsDashboard() {
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [activeShipmentId, setActiveShipmentId] = useState<number | null>(null);
  const [shipmentIdInput, setShipmentIdInput] = useState<string>('');
  const [recentShipments, setRecentShipments] = useState<number[]>([]);
  const toast = useToast();
  
  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['logistics-dashboard', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/logistics/analytics/dashboard?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json() as Promise<DashboardData>;
    },
  });
  
  // Card background color based on color mode
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value as any);
  };
  
  // Handle tracking a shipment
  const handleTrackShipment = () => {
    const shipmentId = parseInt(shipmentIdInput, 10);
    
    if (isNaN(shipmentId) || shipmentId <= 0) {
      toast({
        title: 'Invalid shipment ID',
        description: 'Please enter a valid shipment ID',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setActiveShipmentId(shipmentId);
    
    // Add to recent shipments if not already there
    if (!recentShipments.includes(shipmentId)) {
      setRecentShipments(prev => [shipmentId, ...prev].slice(0, 5));
      
      // Store in localStorage
      localStorage.setItem('recentShipments', JSON.stringify([shipmentId, ...recentShipments].slice(0, 5)));
    }
  };
  
  // Load recent shipments from localStorage
  useEffect(() => {
    const storedShipments = localStorage.getItem('recentShipments');
    if (storedShipments) {
      try {
        const parsed = JSON.parse(storedShipments);
        setRecentShipments(parsed);
        
        // Set the first one as active if we don't have an active one
        if (!activeShipmentId && parsed.length > 0) {
          setActiveShipmentId(parsed[0]);
        }
      } catch (e) {
        console.error('Failed to parse stored shipments:', e);
      }
    }
  }, []);  // Empty dependency array ensures this runs only once
  
  // Mock data if real data is not available yet
  const mockData: DashboardData = {
    stats: {
      totalShipments: 165,
      activeShipments: 42,
      completedShipments: 118,
      internationalShipments: 58,
      averageDeliveryTime: 3.4,
      onTimeDeliveryRate: 92.7,
      shipmentsThisMonth: 36,
      shipmentsTrend: 12.3,
    },
    statusBreakdown: [
      { status: ShipmentStatus.CREATED, count: 15 },
      { status: ShipmentStatus.LABEL_CREATED, count: 8 },
      { status: ShipmentStatus.PICKUP_SCHEDULED, count: 10 },
      { status: ShipmentStatus.IN_TRANSIT, count: 25 },
      { status: ShipmentStatus.OUT_FOR_DELIVERY, count: 7 },
      { status: ShipmentStatus.DELIVERED, count: 85 },
      { status: ShipmentStatus.EXCEPTION, count: 5 },
      { status: ShipmentStatus.CANCELLED, count: 7 },
      { status: ShipmentStatus.RETURNED, count: 3 },
    ],
    providerBreakdown: [
      { provider: 'Shiprocket', count: 95 },
      { provider: 'DHL', count: 62 },
      { provider: 'Other', count: 8 },
    ],
    destinationCountries: [
      { country: 'India', count: 82 },
      { country: 'United States', count: 28 },
      { country: 'United Kingdom', count: 17 },
      { country: 'Singapore', count: 12 },
      { country: 'UAE', count: 8 },
      { country: 'Other', count: 18 },
    ],
    dailyShipments: Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), 'MMM dd');
      return {
        date,
        created: Math.floor(Math.random() * 10) + 1,
        delivered: Math.floor(Math.random() * 8) + 1,
      };
    }),
  };
  
  // Use mock data if real data is not available
  const dashboardData = data || mockData;
  
  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Box mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="lg">Logistics Dashboard</Heading>
            <HStack spacing={4}>
              <Select 
                size="sm" 
                width="auto" 
                value={timeframe}
                onChange={handleTimeframeChange}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </Select>
              <Button size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </HStack>
          </Flex>
        </Box>
        
        {isLoading ? (
          <Flex justify="center" align="center" height="400px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            An error occurred loading the dashboard data.
          </Alert>
        ) : (
          <>
            {/* Key Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <Stat
                px={6}
                py={4}
                bg={cardBg}
                shadow="base"
                rounded="lg"
                borderLeft="4px solid"
                borderLeftColor="blue.500"
              >
                <StatLabel fontSize="sm" fontWeight="medium">
                  Total Shipments
                </StatLabel>
                <StatNumber>{dashboardData.stats.totalShipments}</StatNumber>
                <StatHelpText>
                  <StatArrow type={dashboardData.stats.shipmentsTrend > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(dashboardData.stats.shipmentsTrend)}% this month
                </StatHelpText>
              </Stat>
              
              <Stat
                px={6}
                py={4}
                bg={cardBg}
                shadow="base"
                rounded="lg"
                borderLeft="4px solid"
                borderLeftColor="orange.500"
              >
                <StatLabel fontSize="sm" fontWeight="medium">
                  Active Shipments
                </StatLabel>
                <StatNumber>{dashboardData.stats.activeShipments}</StatNumber>
                <StatHelpText>
                  {((dashboardData.stats.activeShipments / dashboardData.stats.totalShipments) * 100).toFixed(1)}% of total
                </StatHelpText>
              </Stat>
              
              <Stat
                px={6}
                py={4}
                bg={cardBg}
                shadow="base"
                rounded="lg"
                borderLeft="4px solid"
                borderLeftColor="green.500"
              >
                <StatLabel fontSize="sm" fontWeight="medium">
                  On-Time Delivery Rate
                </StatLabel>
                <StatNumber>{formatPercentage(dashboardData.stats.onTimeDeliveryRate)}</StatNumber>
                <StatHelpText>
                  Avg. delivery time: {dashboardData.stats.averageDeliveryTime.toFixed(1)} days
                </StatHelpText>
              </Stat>
              
              <Stat
                px={6}
                py={4}
                bg={cardBg}
                shadow="base"
                rounded="lg"
                borderLeft="4px solid"
                borderLeftColor="purple.500"
              >
                <StatLabel fontSize="sm" fontWeight="medium">
                  International Shipments
                </StatLabel>
                <StatNumber>{dashboardData.stats.internationalShipments}</StatNumber>
                <StatHelpText>
                  {((dashboardData.stats.internationalShipments / dashboardData.stats.totalShipments) * 100).toFixed(1)}% of total
                </StatHelpText>
              </Stat>
            </SimpleGrid>
            
            {/* Tabs for different charts */}
            <Tabs isLazy colorScheme="blue" marginBottom={8}>
              <TabList mb={6}>
                <Tab>Overview</Tab>
                <Tab>Status Distribution</Tab>
                <Tab>Country & Provider</Tab>
                <Tab>Real-time Tracking</Tab>
              </TabList>
              
              <TabPanels>
                {/* Shipment Activity Chart */}
                <TabPanel>
                  <Box 
                    bg={cardBg} 
                    p={5} 
                    rounded="lg" 
                    shadow="base" 
                    height="400px"
                  >
                    <Heading size="md" mb={4}>Daily Shipment Activity</Heading>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart
                        data={dashboardData.dailyShipments}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="created" name="Created" fill="#0088FE" />
                        <Bar dataKey="delivered" name="Delivered" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </TabPanel>
                
                {/* Status Distribution Charts */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box 
                      bg={cardBg} 
                      p={5} 
                      rounded="lg" 
                      shadow="base" 
                      height="400px"
                    >
                      <Heading size="md" mb={4}>Shipment Status Distribution</Heading>
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <Pie
                            data={dashboardData.statusBreakdown.map(item => ({
                              name: statusDisplayMap[item.status],
                              value: item.count
                            }))}
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                          >
                            {dashboardData.statusBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} shipments`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box bg={cardBg} p={5} rounded="lg" shadow="base">
                      <Heading size="md" mb={4}>Status Breakdown</Heading>
                      <HStack wrap="wrap" spacing={3}>
                        {dashboardData.statusBreakdown.map((status, index) => (
                          <Badge 
                            key={status.status} 
                            px={3} 
                            py={2} 
                            borderRadius="lg" 
                            colorScheme={getStatusColorScheme(status.status)}
                            variant="subtle"
                            fontSize="sm"
                          >
                            <Text fontWeight="medium">{statusDisplayMap[status.status]}</Text>
                            <Text>{status.count}</Text>
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </TabPanel>
                
                {/* Country & Provider Distribution */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box 
                      bg={cardBg} 
                      p={5} 
                      rounded="lg" 
                      shadow="base" 
                      height="400px"
                    >
                      <Heading size="md" mb={4}>Destination Countries</Heading>
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <Pie
                            data={dashboardData.destinationCountries}
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            dataKey="count"
                            nameKey="country"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                          >
                            {dashboardData.destinationCountries.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} shipments`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box 
                      bg={cardBg} 
                      p={5} 
                      rounded="lg" 
                      shadow="base" 
                      height="400px"
                    >
                      <Heading size="md" mb={4}>Provider Distribution</Heading>
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <Pie
                            data={dashboardData.providerBreakdown}
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            dataKey="count"
                            nameKey="provider"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                          >
                            {dashboardData.providerBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} shipments`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </SimpleGrid>
                </TabPanel>
                
                {/* Real-time Tracking Tab */}
                <TabPanel>
                  <Box mb={6}>
                    <Heading size="md" mb={4}>Real-time Shipment Tracking</Heading>
                    <Text color="gray.600" mb={4}>
                      Track shipments in real-time with live updates as they move through the logistics network.
                    </Text>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                      <Box>
                        <InputGroup size="md" mb={4}>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiSearch} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Enter Shipment ID"
                            value={shipmentIdInput}
                            onChange={(e) => setShipmentIdInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                          />
                        </InputGroup>
                        <Button
                          colorScheme="blue"
                          width="full"
                          leftIcon={<Icon as={FiPackage} />}
                          onClick={handleTrackShipment}
                        >
                          Track Shipment
                        </Button>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="medium" mb={2}>Recent Shipments</Text>
                        {recentShipments.length > 0 ? (
                          <HStack spacing={2} flexWrap="wrap">
                            {recentShipments.map((id) => (
                              <Button
                                key={id}
                                size="sm"
                                variant={activeShipmentId === id ? "solid" : "outline"}
                                colorScheme="blue"
                                onClick={() => setActiveShipmentId(id)}
                              >
                                #{id}
                              </Button>
                            ))}
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">
                            No recent shipments
                          </Text>
                        )}
                      </Box>
                    </SimpleGrid>
                    
                    {activeShipmentId ? (
                      <RealTimeShipmentTracker 
                        shipmentId={activeShipmentId}
                        token={typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined}
                        initialStatus="unknown"
                        maxUpdates={15}
                      />
                    ) : (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        p={8}
                        bg="gray.50"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                      >
                        <Icon as={FiPackage} fontSize="3xl" color="gray.400" mb={3} />
                        <Text fontWeight="medium">No Shipment Selected</Text>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Enter a shipment ID above to start tracking in real-time
                        </Text>
                      </Flex>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Container>
    </Layout>
  );
}

// Helper function to get color scheme based on status
function getStatusColorScheme(status: ShipmentStatus): string {
  switch (status) {
    case ShipmentStatus.CREATED:
    case ShipmentStatus.LABEL_CREATED:
    case ShipmentStatus.PICKUP_SCHEDULED:
      return 'blue';
    case ShipmentStatus.PICKUP_COMPLETE:
      return 'purple';
    case ShipmentStatus.IN_TRANSIT:
      return 'orange';
    case ShipmentStatus.OUT_FOR_DELIVERY:
      return 'teal';
    case ShipmentStatus.DELIVERED:
      return 'green';
    case ShipmentStatus.EXCEPTION:
    case ShipmentStatus.CANCELLED:
      return 'red';
    case ShipmentStatus.RETURNED:
      return 'gray';
    default:
      return 'blue';
  }
}
