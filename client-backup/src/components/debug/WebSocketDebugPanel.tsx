import React, { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  useDisclosure,
  IconButton,
  Collapse,
  Code,
  useClipboard,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { CloseIcon, CopyIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useWebSocket } from '../../contexts/WebSocketContext.js';

const WebSocketDebugPanel: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const { socket, isConnected, connectionStatus, lastMessage, sendPing } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { hasCopied, onCopy } = useClipboard(JSON.stringify(lastMessage, null, 2));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastMessage]);

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

  const formatMessage = (msg: any) => {
    if (!msg) return null;

    try {
      if (typeof msg === 'string') {
        return msg;
      }
      return JSON.stringify(msg, null, 2);
    } catch (e) {
      return 'Unable to parse message';
    }
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      right="0"
      width="500px"
      maxH="60vh"
      bg="white"
      boxShadow="lg"
      borderTopLeftRadius="md"
      borderWidth="1px"
      zIndex="tooltip"
      overflow="hidden"
    >
      <Box
        bg="gray.50"
        px={4}
        py={2}
        borderBottomWidth="1px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        onClick={onToggle}
      >
        <HStack spacing={3}>
          <Text fontWeight="bold">WebSocket Debug</Text>
          <Badge colorScheme={getStatusColor()}>
            {connectionStatus.toUpperCase()}
          </Badge>
          {connectionStatus === 'connecting' && <Spinner size="xs" />}
          {socket?.id && (
            <Text fontSize="xs" color="gray.500">
              ID: {socket.id}
            </Text>
          )}
        </HStack>
        <IconButton
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          icon={isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
          size="sm"
          variant="ghost"
        />
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={0} align="stretch" maxH="50vh" overflowY="auto">
          <HStack p={2} bg="gray.50" borderBottomWidth="1px">
            <Button size="xs" onClick={sendPing} isDisabled={!isConnected}>
              Send Ping
            </Button>
            <Button
              size="xs"
              leftIcon={<CopyIcon />}
              onClick={onCopy}
              isDisabled={!lastMessage}
              variant="outline"
            >
              {hasCopied ? 'Copied!' : 'Copy Last Message'}
            </Button>
          </HStack>

          {lastMessage ? (
            <Box p={3} fontFamily="mono" fontSize="xs" whiteSpace="pre-wrap">
              <Text fontWeight="bold" mb={2}>
                {new Date(lastMessage.timestamp || Date.now()).toLocaleTimeString()}
                {lastMessage.type && (
                  <Badge ml={2} colorScheme="blue">
                    {lastMessage.type}
                  </Badge>
                )}
              </Text>
              <Code p={2} w="full" display="block" overflowX="auto">
                {formatMessage(lastMessage)}
              </Code>
            </Box>
          ) : (
            <Box p={3} textAlign="center" color="gray.500">
              <Text>No messages received yet</Text>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </VStack>
      </Collapse>
    </Box>
  );
};

export default WebSocketDebugPanel;
