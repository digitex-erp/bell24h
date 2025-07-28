import React from 'react';
import { Box, Heading, Text, VStack, Container } from '@chakra-ui/react';

/**
 * Admin Dashboard with embedded n8n workflow editor
 * This component embeds the n8n workflow editor in an iframe
 * to allow administrators to create and manage workflows
 */
export default function AdminPage() {
  return (
    <Container maxW="container.xl" py={5}>
      <VStack spacing={4} align="stretch" mb={4}>
        <Heading size="lg">Bell24H Admin Dashboard</Heading>
        <Text>Use the workflow editor below to manage automation workflows</Text>
      </Box>
      
      <Box 
        height="80vh" 
        width="100%" 
        border="1px solid" 
        borderColor="gray.200" 
        borderRadius="md"
        overflow="hidden"
        shadow="md"
      >
        <iframe 
          src="http://localhost:3000/api/workflow"
          title="n8n Dashboard"
          style={{ 
            border: 'none', 
            width: '100%', 
            height: '100%' 
          }}
        />
      </Box>
    </Container>
  );
}
