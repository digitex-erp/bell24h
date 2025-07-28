import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex, 
  SimpleGrid, 
  Button, 
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  LockIcon, 
  CheckIcon, 
  TimeIcon,
  ViewIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { FaFileContract, FaFileInvoiceDollar, FaCertificate } from 'react-icons/fa';
import DashboardLayout from '../../components/common/DashboardLayout.js';
import { GetServerSideProps } from 'next';
import { requireAuthentication } from '../../server/middleware/auth.js';
import Head from 'next/head';
import NextLink from 'next/link';

/**
 * Blockchain Hub page
 * Central landing page for blockchain features
 */
export default function BlockchainHubPage() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <DashboardLayout>
      <Head>
        <title>Blockchain Hub | Bell24H B2B</title>
      </Head>
      <Container maxW="container.xl" py={8}>
        <Box mb={10}>
          <Heading size="xl" mb={3}>Blockchain Hub</Heading>
          <Text fontSize="lg" color="gray.600">
            Secure and transparent blockchain features for your business
          </Text>
        </Box>
        
        <Box
          borderWidth={1}
          borderRadius="lg"
          p={6}
          mb={10}
          bg="blue.50"
          borderColor="blue.200"
        >
          <Flex alignItems="center" mb={3}>
            <Icon as={LockIcon} color="blue.600" mr={3} boxSize={6} />
            <Heading size="md">Why Blockchain for B2B?</Heading>
          </Flex>
          <Text>
            Our blockchain integration provides unparalleled security, transparency, and trust 
            in your business transactions. With decentralized verification and smart contracts,
            you can conduct business with confidence, knowing that agreements are tamper-proof
            and automatically enforced.
          </Text>
        </Box>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mb={10}>
          {/* Milestone Contracts Card */}
          <Box
            borderWidth={1}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg={cardBg}
            borderColor={cardBorder}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          >
            <Box p={6}>
              <Flex alignItems="center" mb={4}>
                <Icon as={FaFileContract} boxSize={10} color="blue.500" mr={4} />
                <Heading size="md">Milestone Contracts</Heading>
              </Flex>
              <Text color="gray.600" mb={4}>
                Create and manage milestone-based payment contracts with secure blockchain enforcement.
                Set up milestones, verify deliverables, and release payments automatically.
              </Text>
              <Flex flexWrap="wrap" mb={4}>
                <Box mr={2} mb={2} bg="blue.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={TimeIcon} mr={1} />
                    <Text fontSize="sm">Milestone tracking</Text>
                  </Flex>
                </Box>
                <Box mr={2} mb={2} bg="green.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={CheckIcon} mr={1} />
                    <Text fontSize="sm">Automatic payments</Text>
                  </Flex>
                </Box>
                <Box mr={2} mb={2} bg="purple.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={ViewIcon} mr={1} />
                    <Text fontSize="sm">Transparent process</Text>
                  </Flex>
                </Box>
              </Flex>
              <Flex gap={2}>
                <Button
                  as={NextLink}
                  href="/blockchain/milestone-contracts"
                  colorScheme="blue"
                  rightIcon={<ExternalLinkIcon />}
                  flex={1}
                >
                  Manage Contracts
                </Button>
                <Button
                  as={NextLink}
                  href="/blockchain/milestone-contracts-documentation"
                  variant="outline"
                  colorScheme="blue"
                  rightIcon={<Icon as={ViewIcon} />}
                  flex={1}
                >
                  Documentation
                </Button>
              </Flex>
            </Box>
          </Box>
          
          {/* Credential Verification Card */}
          <Box
            borderWidth={1}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg={cardBg}
            borderColor={cardBorder}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          >
            <Box p={6}>
              <Flex alignItems="center" mb={4}>
                <Icon as={FaCertificate} boxSize={10} color="green.500" mr={4} />
                <Heading size="md">Credential Verification</Heading>
              </Flex>
              <Text color="gray.600" mb={4}>
                Verify and store business credentials like GSTIN, ISO certifications, and Udyam registration
                on the blockchain for tamper-proof verification.
              </Text>
              <Flex flexWrap="wrap" mb={4}>
                <Box mr={2} mb={2} bg="green.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={CheckIcon} mr={1} />
                    <Text fontSize="sm">GSTIN</Text>
                  </Flex>
                </Box>
                <Box mr={2} mb={2} bg="green.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={CheckIcon} mr={1} />
                    <Text fontSize="sm">ISO Certifications</Text>
                  </Flex>
                </Box>
                <Box mr={2} mb={2} bg="green.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={CheckIcon} mr={1} />
                    <Text fontSize="sm">Udyam Registration</Text>
                  </Flex>
                </Box>
              </Flex>
              <Button
                as={NextLink}
                href="/blockchain/credential-verification"
                colorScheme="green"
                rightIcon={<ExternalLinkIcon />}
                width="100%"
              >
                Verify Business Credentials
              </Button>
            </Box>
          </Box>
          
          {/* Invoice Financing Card */}
          <Box
            borderWidth={1}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg={cardBg}
            borderColor={cardBorder}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          >
            <Box p={6}>
              <Flex alignItems="center" mb={4}>
                <Icon as={FaFileInvoiceDollar} boxSize={10} color="orange.500" mr={4} />
                <Heading size="md">Invoice Financing</Heading>
              </Flex>
              <Text color="gray.600" mb={4}>
                Tokenize invoices and access financing directly through the blockchain.
                Get better rates and quicker processing with verified credential history.
              </Text>
              <Flex flexWrap="wrap" mb={4}>
                <Box mr={2} mb={2} bg="orange.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={TimeIcon} mr={1} />
                    <Text fontSize="sm">Faster payouts</Text>
                  </Flex>
                </Box>
                <Box mr={2} mb={2} bg="blue.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={LockIcon} mr={1} />
                    <Text fontSize="sm">Tokenized Invoices</Text>
                  </Flex>
                </Box>
                <Box mr={2} mb={2} bg="green.100" px={3} py={1} borderRadius="md">
                  <Flex alignItems="center">
                    <Icon as={CheckIcon} mr={1} />
                    <Text fontSize="sm">Lower rates</Text>
                  </Flex>
                </Box>
              </Flex>
              <Button
                as={NextLink}
                href="/financial-services"
                colorScheme="orange"
                rightIcon={<ExternalLinkIcon />}
                width="100%"
              >
                Explore Invoice Financing
              </Button>
            </Box>
          </Box>
        </SimpleGrid>
        
        <Box
          borderWidth={1}
          borderRadius="lg"
          p={6}
          bg="gray.50"
          borderColor="gray.200"
        >
          <Heading size="md" mb={3}>Getting Started with Blockchain</Heading>
          <Text mb={4}>
            To use our blockchain features, you'll need to connect your Polygon wallet. 
            If you don't have one yet, we recommend setting up MetaMask or another compatible wallet.
          </Text>
          <Button 
            colorScheme="purple" 
            as={NextLink} 
            href="/account/wallet"
          >
            Connect Your Wallet
          </Button>
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
