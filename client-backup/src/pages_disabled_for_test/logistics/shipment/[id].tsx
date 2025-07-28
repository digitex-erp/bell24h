import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  Badge,
  Divider,
  Card,
  CardBody,
  Skeleton,
} from '@chakra-ui/react';
import { FaArrowLeft, FaMapMarkedAlt, FaFileAlt, FaHistory, FaSync } from 'react-icons/fa';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../../../components/Layout';
import ShipmentTimeline from '../../../components/logistics/ShipmentTimeline';
import ShipmentTrackingMap from '../../../components/logistics/ShipmentTrackingMap';
import CustomsDocumentList from '../../../components/logistics/CustomsDocumentList';
import { ShipmentStatus } from '../../../services/logistics/logistics-tracking-service';

interface ShipmentDetails {
  id: number;
  trackingNumber: string;
  provider: string;
  status: ShipmentStatus;
  orderId: string;
  createdAt: string;
  estimatedDelivery: string | null;
  pickup: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactName: string;
    contactPhone: string;
  };
  delivery: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactName: string;
    contactPhone: string;
  };
  packages: {
    id: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    description: string;
    value: number;
    currency: string;
  }[];
  updates: {
    id: number;
    status: ShipmentStatus;
    description: string;
    location: string;
    timestamp: string;
  }[];
  documents: {
    id: number;
    shipmentId: number;
    documentType: string;
    documentUrl: string;
    createdAt: string;
  }[];
  isInternational: boolean;
}

const statusColors: Record<ShipmentStatus, string> = {
  [ShipmentStatus.CREATED]: 'blue',
  [ShipmentStatus.LABEL_CREATED]: 'blue',
  [ShipmentStatus.PICKUP_SCHEDULED]: 'blue',
  [ShipmentStatus.PICKUP_COMPLETE]: 'purple',
  [ShipmentStatus.IN_TRANSIT]: 'orange',
  [ShipmentStatus.OUT_FOR_DELIVERY]: 'teal',
  [ShipmentStatus.DELIVERED]: 'green',
  [ShipmentStatus.EXCEPTION]: 'red',
  [ShipmentStatus.CANCELLED]: 'red',
  [ShipmentStatus.RETURNED]: 'gray',
};

function formatDatetime(dateStr: string) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAddress(address: {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}) {
  return `${address.address}, ${address.city}, ${address.state ? address.state + ', ' : ''}${
    address.postalCode
  }, ${address.country}`;
}

export default function ShipmentDetails() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // Fetch shipment details
  const {
    data: shipment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const res = await fetch(`/api/logistics/shipments/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch shipment details');
      }
      return res.json() as Promise<ShipmentDetails>;
    },
    enabled: !!id,
  });

  // Refresh shipment data
  const handleRefresh = async () => {
    try {
      await fetch(`/api/logistics/shipments/${id}/refresh`, {
        method: 'POST',
      });
      
      // Refetch the data
      refetch();
      
      toast({
        title: 'Shipment tracking updated',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Failed to update tracking',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleGoBack = () => {
    router.push('/logistics/shipments');
  };

  // Calculate total value of all packages
  const getTotalValue = () => {
    if (!shipment?.packages || shipment.packages.length === 0) {
      return { value: 0, currency: 'INR' };
    }

    // Group by currency
    const totals: Record<string, number> = {};
    for (const pkg of shipment.packages) {
      totals[pkg.currency] = (totals[pkg.currency] || 0) + pkg.value;
    }

    // Get the most used currency or first one
    const currencies = Object.keys(totals);
    if (currencies.length === 1) {
      return { value: totals[currencies[0]], currency: currencies[0] };
    }

    // Return the first currency (we're simplifying and not handling multi-currency)
    return { value: totals[currencies[0]], currency: currencies[0] };
  };

  const totalValue = getTotalValue();

  // Render loading skeleton
  if (isLoading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Skeleton height="40px" width="200px" mb={6} />
          <Skeleton height="24px" width="300px" mb={4} />
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
            <GridItem colSpan={{ base: 12, md: 12, lg: 8 }}>
              <Skeleton height="400px" mb={6} />
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 12, lg: 4 }}>
              <Skeleton height="400px" />
            </GridItem>
          </Grid>
        </Container>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Button leftIcon={<Icon as={FaArrowLeft} />} onClick={handleGoBack} mb={6}>
            Back to Shipments
          </Button>
          <Box p={8} textAlign="center">
            <Heading size="md" color="red.500" mb={4}>
              Error loading shipment details
            </Heading>
            <Text>{error instanceof Error ? error.message : 'Unknown error occurred'}</Text>
            <Button mt={4} onClick={() => refetch()} colorScheme="blue">
              Try Again
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!shipment) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Button leftIcon={<Icon as={FaArrowLeft} />} onClick={handleGoBack} mb={6}>
            Back to Shipments
          </Button>
          <Box p={8} textAlign="center">
            <Heading size="md" mb={4}>
              Shipment Not Found
            </Heading>
            <Text>The requested shipment could not be found.</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Button 
          leftIcon={<Icon as={FaArrowLeft} />} 
          onClick={handleGoBack}
          mb={6}
          size="sm"
          variant="outline"
        >
          Back to Shipments
        </Button>

        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <VStack align="flex-start" spacing={1}>
            <HStack>
              <Heading size="lg">Shipment #{shipment.id}</Heading>
              <Badge colorScheme={statusColors[shipment.status]} fontSize="0.8em" px={2} py={1} borderRadius="md">
                {shipment.status.replace(/_/g, ' ')}
              </Badge>
              {shipment.isInternational && (
                <Badge colorScheme="purple" fontSize="0.8em" px={2} py={1} borderRadius="md">
                  International
                </Badge>
              )}
            </HStack>
            <HStack spacing={4}>
              <Text color="gray.500">Tracking: {shipment.trackingNumber || 'Pending'}</Text>
              <Text color="gray.500">Order: {shipment.orderId}</Text>
              <Text color="gray.500">Provider: {shipment.provider}</Text>
            </HStack>
          </VStack>
          
          <Button 
            leftIcon={<Icon as={FaSync} />} 
            colorScheme="blue" 
            onClick={handleRefresh}
            size="sm"
          >
            Refresh Tracking
          </Button>
        </Flex>

        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          <GridItem colSpan={{ base: 12, md: 12, lg: 8 }}>
            <Tabs isFitted colorScheme="blue" index={activeTab} onChange={setActiveTab}>
              <TabList mb="1em">
                <Tab><Icon as={FaHistory} mr={2} /> Timeline</Tab>
                <Tab><Icon as={FaMapMarkedAlt} mr={2} /> Map</Tab>
                <Tab><Icon as={FaFileAlt} mr={2} /> Documents</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <ShipmentTimeline updates={shipment.updates} />
                </TabPanel>
                <TabPanel px={0}>
                  <ShipmentTrackingMap 
                    origin={formatAddress(shipment.pickup)}
                    destination={formatAddress(shipment.delivery)}
                    updates={shipment.updates}
                  />
                </TabPanel>
                <TabPanel px={0}>
                  <CustomsDocumentList 
                    shipmentId={shipment.id} 
                    documents={shipment.documents}
                    onRefresh={refetch}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 12, lg: 4 }}>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardBody>
                  <Heading size="sm" mb={3}>Shipment Details</Heading>
                  <VStack spacing={2} align="stretch">
                    <Flex justifyContent="space-between">
                      <Text fontSize="sm" color="gray.500">Created</Text>
                      <Text fontSize="sm">{formatDatetime(shipment.createdAt)}</Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Text fontSize="sm" color="gray.500">Estimated Delivery</Text>
                      <Text fontSize="sm">
                        {shipment.estimatedDelivery ? formatDatetime(shipment.estimatedDelivery) : 'Pending'}
                      </Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Text fontSize="sm" color="gray.500">Total Value</Text>
                      <Text fontSize="sm">{totalValue.value.toFixed(2)} {totalValue.currency}</Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Text fontSize="sm" color="gray.500">Packages</Text>
                      <Text fontSize="sm">{shipment.packages.length}</Text>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="sm" mb={3}>From</Heading>
                  <Text>{shipment.pickup.contactName}</Text>
                  <Text fontSize="sm">{shipment.pickup.contactPhone}</Text>
                  <Text fontSize="sm" mt={2}>{formatAddress(shipment.pickup)}</Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="sm" mb={3}>To</Heading>
                  <Text>{shipment.delivery.contactName}</Text>
                  <Text fontSize="sm">{shipment.delivery.contactPhone}</Text>
                  <Text fontSize="sm" mt={2}>{formatAddress(shipment.delivery)}</Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Heading size="sm" mb={3}>Package Details</Heading>
                  {shipment.packages.map((pkg, index) => (
                    <Box key={pkg.id} mb={index < shipment.packages.length - 1 ? 4 : 0}>
                      {index > 0 && <Divider my={4} />}
                      <Text fontWeight="medium">Package {index + 1}</Text>
                      <Text fontSize="sm">{pkg.description}</Text>
                      <HStack mt={2} fontSize="sm">
                        <Text color="gray.500">Weight:</Text>
                        <Text>{pkg.weight} kg</Text>
                      </HStack>
                      <HStack fontSize="sm">
                        <Text color="gray.500">Dimensions:</Text>
                        <Text>
                          {pkg.dimensions.length}×{pkg.dimensions.width}×{pkg.dimensions.height} cm
                        </Text>
                      </HStack>
                      <HStack fontSize="sm">
                        <Text color="gray.500">Value:</Text>
                        <Text>{pkg.value} {pkg.currency}</Text>
                      </HStack>
                    </Box>
                  ))}
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}, // No initial props needed, data is fetched client-side
  };
};
