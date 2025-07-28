import React from 'react';
import BlockchainInteractionUI from '../components/BlockchainInteractionUI';

// Example ABI and contract address (replace with your actual contract)
const contractAddress = '0xYourContractAddress';
const abi = [
  // Example ABI fragment
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const userAddress = '0xYourUserAddress';

const BlockchainDemoPage: React.FC = () => (
  <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 40 }}>
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.09)', padding: 32, marginBottom: 32 }}>
        <h1 style={{ textAlign: 'center', fontSize: 30, color: '#3b3b3b', marginBottom: 20 }}>Smart Contract Interaction Demo</h1>
        <BlockchainInteractionUI contractAddress={contractAddress} abi={abi} userAddress={userAddress} />
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(60,60,60,0.05)' }}>
        <h2 style={{ fontSize: 22, color: '#4b5563', marginBottom: 12 }}>Milestone Contracts: User Guide</h2>
        <p style={{ color: '#334155', marginBottom: 8 }}>Learn how milestone-based smart contracts work and how to use them securely for project payments.</p>
        <a href={require('../../docs/milestone-contracts.md')} download style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'underline' }}>Download Milestone Contracts Documentation (Markdown)</a>
      </div>
    </div>
  </div>
);

export default BlockchainDemoPage;
// client/src/pages/BlockchainDemoPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  useToast,
  Container,
  Heading,
  Divider,
  Code
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, TimeIcon, CopyIcon } from '@chakra-ui/icons';
import { useBlockchain } from '../contexts/BlockchainContext';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../components/WalletConnector';

const BlockchainDemoPage = () => {
  const { account, activate, active } = useWeb3React();
  const {
    isSupplierVerified,
    verifySupplier,
    verificationStatus,
    verificationError
  } = useBlockchain();
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      await activate(injected);
      toast({
        title: 'Wallet connected',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error connecting wallet',
        description: 'Please check your wallet and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerifySupplier = async () => {
    try {
      await verifySupplier();
      toast({
        title: 'Verification successful!',
        description: 'Your supplier status has been verified on the blockchain.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Verification error:', error);
      // Error toast will be shown by the context
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={4}>Blockchain Integration Demo</Heading>
          <Text fontSize="lg">
            This page demonstrates the blockchain verification system for suppliers.
          </Text>
        </Box>

        <Divider />

        <Box p={6} borderWidth="1px" borderRadius="lg">
          <VStack spacing={6} align="stretch">
            {/* Wallet Connection */}
            <Box>
              <Heading size="md" mb={4}>1. Connect Your Wallet</Heading>
              {!active ? (
                <Button
                  colorScheme="blue"
                  onClick={handleConnectWallet}
                  isLoading={isConnecting}
                  loadingText="Connecting..."
                >
                  Connect Wallet
                </Button>
              ) : (
                <Box>
                  <Text mb={2}>Connected Wallet:</Text>
                  <Code
                    p={2}
                    borderRadius="md"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                  >
                    {account}
                    <Button
                      size="xs"
                      ml={2}
                      leftIcon={<CopyIcon />}
                      onClick={() => copyToClipboard(account || '')}
                    >
                      Copy
                    </Button>
                  </Code>
                </Box>
              )}
            </Box>

            {/* Verification Status */}
            <Box>
              <Heading size="md" mb={4}>2. Supplier Verification</Heading>
              <HStack spacing={4} alignItems="center" mb={4}>
                <Text>Status:</Text>
                {isSupplierVerified ? (
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    <HStack spacing={1}>
                      <CheckCircleIcon boxSize={4} />
                      <Text>Verified Supplier</Text>
                    </HStack>
                  </Badge>
                ) : (
                  <Badge colorScheme="yellow" px={2} py={1} borderRadius="full">
                    <HStack spacing={1}>
                      <WarningIcon boxSize={4} />
                      <Text>Not Verified</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>

              {!isSupplierVerified && active && (
                <Button
                  colorScheme="blue"
                  onClick={handleVerifySupplier}
                  isLoading={verificationStatus === 'verifying'}
                  loadingText="Verifying..."
                  leftIcon={verificationStatus === 'verifying' ? <TimeIcon /> : undefined}
                >
                  Verify Supplier
                </Button>
              )}

              {verificationStatus === 'error' && (
                <Text color="red.500" mt={2}>
                  {verificationError}
                </Text>
              )}
            </Box>

            {/* Transaction Information */}
            <Box>
              <Heading size="md" mb={4}>3. Transaction Information</Heading>
              <VStack align="stretch" spacing={2} p={4} bg="gray.50" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Network:</Text>
                  <Text>Mumbai Testnet</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="medium">Contract Address:</Text>
                  <HStack>
                    <Text fontFamily="mono" fontSize="sm">
                      {process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS?.substring(0, 12)}...
                      {process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS?.substring(34)}
                    </Text>
                    <Button
                      size="xs"
                      leftIcon={<CopyIcon />}
                      onClick={() => copyToClipboard(process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS || '')}
                    />
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Instructions */}
        <Box mt={8} p={6} bg="blue.50" borderRadius="lg">
          <Heading size="md" mb={4}>How It Works</Heading>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold">1. Connect Your Wallet</Text>
              <Text>Use MetaMask or another Web3 wallet to connect to the application.</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">2. Verify Supplier Status</Text>
              <Text>
                Click the "Verify Supplier" button to create a transaction that will verify your
                supplier status on the blockchain.
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold">3. View Transaction</Text>
              <Text>
                Once verified, your supplier status will be permanently recorded on the blockchain.
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default BlockchainDemoPage;