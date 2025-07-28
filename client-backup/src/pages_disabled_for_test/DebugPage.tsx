import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Divider,
  Code,
  Spinner,
  useClipboard,
  IconButton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useWebSocket } from '../contexts/WebSocketContext.js';
import WebSocketDebugPanel from '../components/debug/WebSocketDebugPanel.js';

const DebugPage: React.FC = () => {
  const { 
    socket, 
    isConnected, 
    connectionStatus, 
    lastMessage, 
    sendPing 
  } = useWebSocket();

  const { onCopy, hasCopied } = useClipboard(JSON.stringify(lastMessage, null, 2));

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'green';
      case 'connecting':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleSendTestMessage = () => {
    if (socket?.connected) {
      const testMessage = {
        type: 'test',
        timestamp: new Date().toISOString(),
        data: 'This is a test message from the debug page',
      };
      socket.emit('test-message', testMessage);
    }
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="2xl" fontWeight="bold">WebSocket Debugger</Text>
            <HStack>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={handleSendTestMessage}
                isDisabled={!isConnected}
              >
                Send Test Message
              </Button>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={sendPing}
                isDisabled={!isConnected}
              >
                Send Ping
              </Button>
            </HStack>
          </HStack>
          
          <Alert status={isConnected ? 'success' : 'error'} mb={4}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>
                WebSocket Status: <Badge colorScheme={getStatusColor()} fontSize="0.8em">
                  {connectionStatus.toUpperCase()}
                </Badge>
              </AlertTitle>
              <AlertDescription display="block">
                {socket?.connected ? (
                  `Connected with ID: ${socket.id}`
                ) : (
                  'Not connected to WebSocket server'
                )}
              </AlertDescription>
            </Box>
            {connectionStatus === 'connecting' && <Spinner size="sm" />}
          </Alert>
        </Box>

        <Divider />

        <HStack align="start" spacing={6}>
          <Box flex={1}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold" fontSize="lg">Connection Details</Text>
                  <Tooltip label={hasCopied ? 'Copied!' : 'Copy to clipboard'}>
                    <IconButton
                      aria-label="Copy connection details"
                      icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                      size="sm"
                      onClick={onCopy}
                    />
                  </Tooltip>
                </HStack>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">Status</Td>
                        <Td>
                          <HStack>
                            <Box w="10px" h="10px" bg={`${getStatusColor()}.500`} borderRadius="full" />
                            <Text>{connectionStatus}</Text>
                          </HStack>
                        </Td>
                      </Tr>
                      {socket?.id && (
                        <Tr>
                          <Td fontWeight="bold">Socket ID</Td>
                          <Td fontFamily="mono">{socket.id}</Td>
                        </Tr>
                      )}
                      <Tr>
                        <Td fontWeight="bold">Connected</Td>
                        <Td>{isConnected ? 'Yes' : 'No'}</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Last Message</Td>
                        <Td>
                          {lastMessage?.timestamp 
                            ? new Date(lastMessage.timestamp).toLocaleString() 
                            : 'N/A'}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2} fontSize="lg">Last Message</Text>
                {lastMessage ? (
                  <Box 
                    p={4} 
                    bg="gray.50" 
                    borderRadius="md" 
                    fontFamily="mono" 
                    fontSize="xs"
                    whiteSpace="pre-wrap"
                    overflowX="auto"
                  >
                    <Code w="full" display="block">
                      {JSON.stringify(lastMessage, null, 2)}
                    </Code>
                  </Box>
                ) : (
                  <Text color="gray.500">No messages received yet</Text>
                )}
              </Box>
            </VStack>
          </Box>

          <Box flex={1}>
            <Text fontWeight="bold" mb={2} fontSize="lg">WebSocket Events</Text>
            <Box 
              borderWidth="1px" 
              borderRadius="md" 
              p={4}
              bg="gray.50"
              h="400px"
              overflowY="auto"
              fontFamily="mono"
              fontSize="sm"
            >
              {lastMessage ? (
                <Box>
                  <Text fontWeight="bold">Event: {lastMessage.type || 'unknown'}</Text>
                  <Text>Path: {lastMessage.path || 'N/A'}</Text>
                  <Text>Timestamp: {new Date(lastMessage.timestamp).toLocaleString()}</Text>
                  <Divider my={2} />
                  <Text>Data:</Text>
                  <Code w="full" display="block" mt={2} p={2}>
                    {JSON.stringify(lastMessage, null, 2)}
                  </Code>
                </Box>
              ) : (
                <Text color="gray.500">No events received yet</Text>
              )}
            </Box>
          </Box>
        </HStack>
      </VStack>
      
      {/* Floating debug panel */}
      <Box position="fixed" bottom={4} right={4}>
        <WebSocketDebugPanel />
      </Box>
    </Box>
  );
};

export default DebugPage;
