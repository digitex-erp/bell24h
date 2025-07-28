import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Select,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaMap, 
  FaFile, 
  FaSort, 
  FaSyncAlt, 
  FaChevronDown,
  FaInfoCircle
} from 'react-icons/fa';
import { format } from 'date-fns';
import Layout from '../../components/Layout';
import ShipmentCreateForm from '../../components/logistics/ShipmentCreateForm';
import { ShipmentStatus, LogisticsProvider } from '../../services/logistics/logistics-tracking-service';

interface Shipment {
  id: number;
  orderId: string;
  trackingNumber: string;
  provider: LogisticsProvider;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string | null;
  origin: string;
  destination: string;
  isInternational: boolean;
}

// Status badge colors
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

// Utility functions for formatting and display
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatStatus = (status: ShipmentStatus) => {
  return status.replace(/_/g, ' ');
};

export default function ShipmentsPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch shipments data
  const {
    data: shipments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shipments', sortField, sortDirection, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (sortField) queryParams.append('sort', sortField);
      if (sortDirection) queryParams.append('order', sortDirection);
      if (statusFilter) queryParams.append('status', statusFilter);

      const res = await fetch(`/api/logistics/shipments?${queryParams}`);
      if (!res.ok) {
        throw new Error('Failed to fetch shipments');
      }
      return res.json() as Promise<Shipment[]>;
    },
  });

  // Create shipment mutation
  const createShipmentMutation = useMutation({
    mutationFn: async (shipmentData: any) => {
      const response = await fetch('/api/logistics/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create shipment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast({
        title: 'Shipment created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating shipment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle shipment creation
  const handleCreateShipment = async (data: any) => {
    await createShipmentMutation.mutateAsync(data);
  };

  // Handle view shipment details
  const handleViewShipment = (id: number) => {
    router.push(`/logistics/shipment/${id}`);
  };

  // Handle sort changes
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter shipments based on search term
  const filteredShipments = shipments
    ? shipments.filter(
        (shipment) =>
          shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <HStack justifyContent="space-between" mb={6}>
          <Heading size="lg">Logistics Shipments</Heading>
          <HStack>
            <Button
              leftIcon={<Icon as={FaSyncAlt} />}
              variant="outline"
              onClick={() => refetch()}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Icon as={FaPlus} />}
              colorScheme="blue"
              onClick={onOpen}
              size="sm"
            >
              Create Shipment
            </Button>
          </HStack>
        </HStack>

        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          mb={6} 
          alignItems={{ base: 'stretch', md: 'center' }}
        >
          <InputGroup maxW={{ base: '100%', md: '320px' }} size="sm">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by order ID, tracking number, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>

          <HStack spacing={4} justifyContent="flex-end" flex={1}>
            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="sm"
              width="auto"
              borderRadius="md"
            >
              {Object.values(ShipmentStatus).map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </Select>
          </HStack>
        </Flex>

        {isLoading ? (
          <Flex justifyContent="center" py={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : isError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error instanceof Error ? error.message : 'An error occurred fetching shipments.'}
          </Alert>
        ) : filteredShipments.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Icon as={FaInfoCircle} fontSize="3xl" color="blue.500" mb={3} />
            <Heading size="md" mb={2}>No Shipments Found</Heading>
            <Text color="gray.500">
              {searchTerm || statusFilter
                ? 'No shipments match your search criteria. Try adjusting your filters.'
                : 'You have not created any shipments yet. Click "Create Shipment" to get started.'}
            </Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th 
                    cursor="pointer" 
                    onClick={() => handleSort('id')}
                  >
                    <HStack spacing={1}>
                      <Text>ID</Text>
                      {sortField === 'id' && (
                        <Icon 
                          as={FaSort} 
                          fontSize="xs" 
                          transform={sortDirection === 'desc' ? 'rotate(180deg)' : undefined} 
                        />
                      )}
                    </HStack>
                  </Th>
                  <Th>Order ID</Th>
                  <Th>Tracking</Th>
                  <Th>Status</Th>
                  <Th 
                    cursor="pointer" 
                    onClick={() => handleSort('createdAt')}
                  >
                    <HStack spacing={1}>
                      <Text>Created</Text>
                      {sortField === 'createdAt' && (
                        <Icon 
                          as={FaSort} 
                          fontSize="xs" 
                          transform={sortDirection === 'desc' ? 'rotate(180deg)' : undefined} 
                        />
                      )}
                    </HStack>
                  </Th>
                  <Th>Route</Th>
                  <Th 
                    cursor="pointer" 
                    onClick={() => handleSort('estimatedDelivery')}
                  >
                    <HStack spacing={1}>
                      <Text>Estimated Delivery</Text>
                      {sortField === 'estimatedDelivery' && (
                        <Icon 
                          as={FaSort} 
                          fontSize="xs" 
                          transform={sortDirection === 'desc' ? 'rotate(180deg)' : undefined} 
                        />
                      )}
                    </HStack>
                  </Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredShipments.map((shipment) => (
                  <Tr key={shipment.id}>
                    <Td>#{shipment.id}</Td>
                    <Td>{shipment.orderId}</Td>
                    <Td>{shipment.trackingNumber || '—'}</Td>
                    <Td>
                      <Badge colorScheme={statusColors[shipment.status]} borderRadius="md" px={2} py={1}>
                        {formatStatus(shipment.status)}
                      </Badge>
                      {shipment.isInternational && (
                        <Badge ml={2} colorScheme="purple" borderRadius="md" px={2} py={1}>
                          International
                        </Badge>
                      )}
                    </Td>
                    <Td>{formatDate(shipment.createdAt)}</Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm">{shipment.origin}</Text>
                        <Text fontSize="sm">→ {shipment.destination}</Text>
                      </VStack>
                    </Td>
                    <Td>{formatDate(shipment.estimatedDelivery)}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Button
                          size="xs"
                          leftIcon={<Icon as={FaEye} />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleViewShipment(shipment.id)}
                        >
                          View
                        </Button>
                        <Menu>
                          <MenuButton 
                            as={Button} 
                            size="xs" 
                            variant="ghost" 
                            rightIcon={<Icon as={FaChevronDown} />}
                          >
                            More
                          </MenuButton>
                          <MenuList>
                            <MenuItem icon={<Icon as={FaMap} />}>Track</MenuItem>
                            <MenuItem icon={<Icon as={FaFile} />}>Documents</MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Create Shipment Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Shipment</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <ShipmentCreateForm 
                onSubmit={handleCreateShipment} 
                isLoading={createShipmentMutation.isPending} 
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
}
