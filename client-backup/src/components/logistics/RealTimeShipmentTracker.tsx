import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Icon,
  Text,
  Badge,
  Stack,
  Divider,
  useToast,
  Tooltip,
  HStack,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import { 
  FiCheck, 
  FiAlertTriangle, 
  FiTruck, 
  FiPackage, 
  FiMapPin,
  FiRadio,
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiClock,
  FiInfo
} from 'react-icons/fi';
import { createShipmentTrackingClient, ConnectionState } from '../../websocket/client';
import { formatDistance } from 'date-fns';

// Connection state badge colors
const connectionStateColors = {
  [ConnectionState.CONNECTED]: 'green',
  [ConnectionState.CONNECTING]: 'orange',
  [ConnectionState.RECONNECTING]: 'orange',
  [ConnectionState.DISCONNECTED]: 'red',
  [ConnectionState.FAILED]: 'red',
};

// Connection state icons
const connectionStateIcons = {
  [ConnectionState.CONNECTED]: FiWifi,
  [ConnectionState.CONNECTING]: FiRefreshCw,
  [ConnectionState.RECONNECTING]: FiRefreshCw,
  [ConnectionState.DISCONNECTED]: FiWifiOff,
  [ConnectionState.FAILED]: FiAlertTriangle,
};

// Shipment update types
interface ShipmentUpdate {
  id: number;
  status: string;
  description: string;
  timestamp: string;
  location?: string;
}

interface ShipmentStatusChange {
  shipmentId: number;
  previousStatus: string;
  newStatus: string;
  description: string;
  timestamp: string;
}

interface ShipmentLocationUpdate {
  shipmentId: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  timestamp: string;
}

interface ShipmentUpdateMessage {
  type: 'shipment_update';
  shipmentId: number;
  update: ShipmentUpdate;
  timestamp: string;
}

interface ShipmentStatusChangeMessage {
  type: 'shipment_status_change';
  shipmentId: number;
  previousStatus: string;
  newStatus: string;
  description: string;
  timestamp: string;
}

interface ShipmentLocationUpdateMessage {
  type: 'shipment_location_update';
  shipmentId: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  timestamp: string;
}

type ShipmentMessage = 
  | ShipmentUpdateMessage 
  | ShipmentStatusChangeMessage 
  | ShipmentLocationUpdateMessage;

// Props for the component
interface RealTimeShipmentTrackerProps {
  shipmentId: number;
  token?: string;
  initialStatus?: string;
  onStatusChange?: (status: string) => void;
  onLocationUpdate?: (location: { latitude: number; longitude: number; address?: string }) => void;
  showMap?: boolean;
  maxUpdates?: number;
}

/**
 * Real-time shipment tracker component using WebSockets
 */
const RealTimeShipmentTracker: React.FC<RealTimeShipmentTrackerProps> = ({
  shipmentId,
  token,
  initialStatus = 'unknown',
  onStatusChange,
  onLocationUpdate,
  showMap = false,
  maxUpdates = 10,
}) => {
  // State
  const [updates, setUpdates] = useState<ShipmentUpdate[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  } | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  
  // Refs
  const clientRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Toast for notifications
  const toast = useToast();
  
  // Initialize WebSocket client
  useEffect(() => {
    // Create client
    const baseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
      (window.location.protocol === 'https:' 
        ? `wss://${window.location.host}/ws`
        : `ws://${window.location.host}/ws`);
    
    clientRef.current = createShipmentTrackingClient(baseUrl, token);
    
    // Set up event handlers
    clientRef.current.on('stateChange', (state: ConnectionState) => {
      setConnectionState(state);
      
      if (state === ConnectionState.CONNECTED && subscriptionId === null) {
        subscribeToShipment();
      }
    });
    
    // Connect to WebSocket server
    clientRef.current.connect().catch((error: Error) => {
      console.error('Failed to connect to WebSocket server:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to tracking server. Retrying...',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });
    
    // Cleanup function
    return () => {
      if (subscriptionId) {
        clientRef.current.unsubscribeFromShipment(subscriptionId).catch(console.error);
      }
      clientRef.current.disconnect();
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [token]);
  
  // Subscribe to shipment updates
  const subscribeToShipment = useCallback(async () => {
    if (!clientRef.current || connectionState !== ConnectionState.CONNECTED) {
      return;
    }
    
    try {
      const subId = await clientRef.current.subscribeToShipment(shipmentId, {
        onMessage: handleShipmentMessage,
        onError: (error: Error) => {
          console.error(`Error in shipment subscription ${shipmentId}:`, error);
          toast({
            title: 'Subscription Error',
            description: `Failed to receive shipment updates: ${error.message}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
        autoResubscribe: true,
      });
      
      setSubscriptionId(subId);
      setIsSubscribed(true);
      
      toast({
        title: 'Tracking Active',
        description: `Now tracking shipment #${shipmentId} in real-time`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to subscribe to shipment:', error);
      toast({
        title: 'Subscription Error',
        description: 'Failed to subscribe to shipment updates. Retrying...',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Try again after a delay
      reconnectTimeoutRef.current = setTimeout(subscribeToShipment, 5000);
    }
  }, [shipmentId, connectionState, toast]);
  
  // Handle shipment messages
  const handleShipmentMessage = useCallback((message: ShipmentMessage) => {
    setLastUpdateTime(new Date());
    
    switch (message.type) {
      case 'shipment_update':
        setUpdates(prevUpdates => {
          // Avoid duplicate updates
          if (prevUpdates.some(u => u.id === message.update.id)) {
            return prevUpdates;
          }
          
          // Add new update at the beginning and limit to maxUpdates
          return [message.update, ...prevUpdates].slice(0, maxUpdates);
        });
        break;
        
      case 'shipment_status_change':
        // Update current status
        setCurrentStatus(message.newStatus);
        
        // Call onStatusChange callback if provided
        if (onStatusChange) {
          onStatusChange(message.newStatus);
        }
        
        // Add as an update
        setUpdates(prevUpdates => {
          const newUpdate: ShipmentUpdate = {
            id: Date.now(), // Use timestamp as ID for status changes
            status: message.newStatus,
            description: message.description,
            timestamp: message.timestamp,
          };
          
          return [newUpdate, ...prevUpdates].slice(0, maxUpdates);
        });
        
        // Show toast for status change
        toast({
          title: 'Shipment Status Updated',
          description: `Status changed from ${message.previousStatus} to ${message.newStatus}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        break;
        
      case 'shipment_location_update':
        // Update current location
        setCurrentLocation(message.location);
        
        // Call onLocationUpdate callback if provided
        if (onLocationUpdate) {
          onLocationUpdate(message.location);
        }
        
        // Add as an update
        setUpdates(prevUpdates => {
          const newUpdate: ShipmentUpdate = {
            id: Date.now(), // Use timestamp as ID for location updates
            status: currentStatus,
            description: `Location updated to ${message.location.address || 'new coordinates'}`,
            timestamp: message.timestamp,
            location: message.location.address,
          };
          
          return [newUpdate, ...prevUpdates].slice(0, maxUpdates);
        });
        break;
    }
  }, [currentStatus, maxUpdates, onLocationUpdate, onStatusChange, toast]);
  
  // Handle manual reconnect
  const handleManualReconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      
      setTimeout(() => {
        clientRef.current.connect().catch(console.error);
      }, 1000);
    }
  }, []);
  
  // Render status badge
  const renderStatusBadge = useCallback((status: string) => {
    let color = 'gray';
    let icon = FiPackage;
    
    switch (status.toLowerCase()) {
      case 'pending':
        color = 'yellow';
        icon = FiClock;
        break;
      case 'processing':
        color = 'blue';
        icon = FiPackage;
        break;
      case 'shipped':
        color = 'purple';
        icon = FiTruck;
        break;
      case 'in_transit':
        color = 'cyan';
        icon = FiTruck;
        break;
      case 'out_for_delivery':
        color = 'orange';
        icon = FiTruck;
        break;
      case 'delivered':
        color = 'green';
        icon = FiCheck;
        break;
      case 'delayed':
        color = 'red';
        icon = FiAlertTriangle;
        break;
      case 'exception':
        color = 'red';
        icon = FiAlertTriangle;
        break;
    }
    
    return (
      <Badge 
        colorScheme={color} 
        fontSize="sm" 
        px={2} 
        py={1} 
        borderRadius="full"
      >
        <Flex align="center" gap={1}>
          <Icon as={icon} />
          <Text>{status.replace('_', ' ')}</Text>
        </Flex>
      </Badge>
    );
  }, []);
  
  return (
    <Card boxShadow="md" borderRadius="md">
      <CardHeader bg="gray.50" borderTopRadius="md">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">
            <Flex align="center" gap={2}>
              <Icon as={FiTruck} />
              <Text>Shipment #{shipmentId}</Text>
            </Flex>
          </Heading>
          
          <HStack spacing={2}>
            {/* Connection state indicator */}
            <Tooltip label={`Connection: ${connectionState}`}>
              <Badge 
                colorScheme={connectionStateColors[connectionState]} 
                borderRadius="full" 
                px={2} 
                py={1}
              >
                <Flex align="center" gap={1}>
                  <Icon as={connectionStateIcons[connectionState]} />
                  <Text fontSize="xs">{connectionState}</Text>
                </Flex>
              </Badge>
            </Tooltip>
            
            {/* Current status */}
            {renderStatusBadge(currentStatus)}
            
            {/* Manual reconnect button */}
            <Tooltip label="Reconnect">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleManualReconnect}
                isDisabled={connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING}
                aria-label="Reconnect"
              >
                <Icon as={FiRefreshCw} />
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Connection status */}
          <Box>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="gray.500">
                <Flex align="center" gap={1}>
                  <Icon as={FiRadio} />
                  <Text>Tracking Feed</Text>
                </Flex>
              </Text>
              
              <Text fontSize="xs" color="gray.500">
                {lastUpdateTime 
                  ? `Last update: ${formatDistance(lastUpdateTime, new Date(), { addSuffix: true })}` 
                  : 'No updates yet'}
              </Text>
            </Flex>
          </Box>
          
          <Divider />
          
          {/* Updates list */}
          {connectionState === ConnectionState.CONNECTED ? (
            updates.length > 0 ? (
              <Stack spacing={3} maxH="300px" overflowY="auto" pr={2}>
                {updates.map((update) => (
                  <Box 
                    key={update.id} 
                    p={3} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="gray.200"
                    bg="white"
                  >
                    <Flex justify="space-between" mb={1}>
                      <Text fontWeight="bold">{update.status.replace('_', ' ')}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(update.timestamp).toLocaleString()}
                      </Text>
                    </Flex>
                    
                    <Text fontSize="sm">{update.description}</Text>
                    
                    {update.location && (
                      <Flex align="center" mt={1} gap={1} fontSize="sm" color="gray.600">
                        <Icon as={FiMapPin} />
                        <Text>{update.location}</Text>
                      </Flex>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                p={4} 
                bg="gray.50" 
                borderRadius="md"
                minH="100px"
              >
                <Icon as={FiInfo} fontSize="2xl" color="gray.400" mb={2} />
                <Text color="gray.500">No shipment updates available</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Updates will appear here as they arrive
                </Text>
              </Flex>
            )
          ) : (
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              p={4} 
              bg="gray.50" 
              borderRadius="md"
              minH="100px"
            >
              {connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING ? (
                <>
                  <Spinner size="md" color="blue.500" mb={3} />
                  <Text color="gray.500">Connecting to tracking server...</Text>
                </>
              ) : (
                <>
                  <Icon as={FiWifiOff} fontSize="2xl" color="gray.400" mb={2} />
                  <Text color="gray.500">Not connected to tracking server</Text>
                  <Button 
                    mt={3} 
                    size="sm" 
                    colorScheme="blue" 
                    leftIcon={<Icon as={FiRefreshCw} />}
                    onClick={handleManualReconnect}
                  >
                    Reconnect
                  </Button>
                </>
              )}
            </Flex>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default RealTimeShipmentTracker;
