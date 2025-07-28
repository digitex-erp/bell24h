import React from 'react';
import { Box, Container, Heading, Text, Flex, Button, Link, Icon } from '@chakra-ui/react';
import { ArrowBackIcon, LockIcon } from '@chakra-ui/icons';
import MilestoneContracts from '../../components/payments/MilestoneContracts.js';
import DashboardLayout from '../../components/common/DashboardLayout.js';
import { GetServerSideProps } from 'next';
import { requireAuthentication } from '../../server/middleware/auth.js';
import Head from 'next/head';
import NextLink from 'next/link';

/**
 * Milestone Contracts page
 * Displays the milestone-based payment contracts management UI
 */
export default function MilestoneContractsPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Milestone Contracts | Bell24H B2B</title>
      </Head>
      <Container maxW="container.xl" py={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <Box>
            <Heading size="lg">Blockchain Milestone Contracts</Heading>
            <Text mt={2} color="gray.600">
              Create and manage milestone-based payment contracts with secure blockchain enforcement
            </Text>
          </Box>
          
          <Button
            as={NextLink}
            href="/blockchain"
            leftIcon={<ArrowBackIcon />}
            variant="outline"
          >
            Back to Blockchain Hub
          </Button>
        </Flex>
        
        <Box
          borderWidth={1}
          borderRadius="lg"
          p={1}
          mb={8}
          bg="blue.50"
        >
          <Flex p={4} alignItems="center">
            <Icon as={LockIcon} color="blue.500" mr={3} boxSize={5} />
            <Box>
              <Text fontWeight="bold">
                Secure Decentralized Contracts
              </Text>
              <Text fontSize="sm">
                All contracts are secured on the Polygon blockchain, ensuring transparency, 
                immutability, and trustless milestone verification.
              </Text>
            </Box>
          </Flex>
        </Box>
        
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
        >
          <MilestoneContracts />
        </Box>
      </Container>
    </DashboardLayout>
  );
}

/**
 * Server-side authentication check
 */
export const getServerSideProps: GetServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {}
  };
});
