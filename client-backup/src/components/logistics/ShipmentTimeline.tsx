import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Badge,
  Icon,
  useColorModeValue 
} from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa';
import { ShipmentStatus } from '../../services/logistics/logistics-tracking-service';
import { format } from 'date-fns';

interface ShipmentTimelineProps {
  history: Array<{
    status: ShipmentStatus;
    location: {
      name: string;
      city: string;
      country: string;
      timestamp: string;
    };
    description: string;
  }>;
  statusColors: Record<ShipmentStatus, string>;
}

// Formatting function for dates
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
  } catch (e) {
    return 'Invalid Date';
  }
};

// Get status display name
const getStatusDisplayName = (status: ShipmentStatus) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({ history, statusColors }) => {
  const lineColor = useColorModeValue('gray.200', 'gray.600');
  
  // Order history items by timestamp (most recent first)
  const orderedHistory = [...history].sort((a, b) => {
    return new Date(b.location.timestamp).getTime() - new Date(a.location.timestamp).getTime();
  });
  
  return (
    <Box>
      {orderedHistory.length === 0 ? (
        <Text color="gray.500">No tracking history available</Text>
      ) : (
        orderedHistory.map((event, index) => (
          <Flex key={index} mb={index === orderedHistory.length - 1 ? 0 : 6}>
            {/* Timeline dot and line */}
            <Flex direction="column" alignItems="center" mr={4}>
              <Icon 
                as={FaCircle} 
                color={`${statusColors[event.status]}.500`} 
                boxSize={3} 
              />
              {index !== orderedHistory.length - 1 && (
                <Box 
                  height="100%" 
                  width="1px" 
                  bg={lineColor} 
                  my={1} 
                  ml="1.5px"
                />
              )}
            </Flex>
            
            {/* Event details */}
            <Box flex={1} pb={4}>
              <Flex 
                justifyContent="space-between" 
                alignItems="flex-start"
                flexDir={{ base: 'column', sm: 'row' }}
                gap={{ base: 2, sm: 0 }}
                mb={1}
              >
                <Box>
                  <Badge colorScheme={statusColors[event.status]} mb={1}>
                    {getStatusDisplayName(event.status)}
                  </Badge>
                  <Text fontWeight="medium">{event.location.name}</Text>
                </Box>
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                  {formatDate(event.location.timestamp)}
                </Text>
              </Flex>
              
              <Text fontSize="sm" color="gray.700">
                {`${event.location.city}, ${event.location.country}`}
              </Text>
              
              {event.description && (
                <Text mt={1} fontSize="sm" color="gray.600">
                  {event.description}
                </Text>
              )}
            </Box>
          </Flex>
        ))
      )}
    </Box>
  );
};

export default ShipmentTimeline;
