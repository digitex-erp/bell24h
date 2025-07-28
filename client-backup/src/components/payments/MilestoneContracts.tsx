import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Text, 
  useDisclosure, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { 
  AddIcon, 
  ViewIcon, 
  EditIcon, 
  DeleteIcon 
} from '@chakra-ui/icons';
import { Contract, ContractState } from '../../services/blockchain/milestone-payments-service.js';
import { NewContractModal } from './NewContractModal.js';
import { ContractDetailsModal } from './ContractDetailsModal.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import PermissionGate from '../common/PermissionGate.js';
import { useUser } from '../../contexts/UserContext.js';

/**
 * Component for managing milestone-based contracts
 */
const MilestoneContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const newContractDisclosure = useDisclosure();
  const contractDetailsDisclosure = useDisclosure();
  
  const toast = useToast();
  const { user } = useUser();
  
  useEffect(() => {
    // Set wallet address from user
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
      loadContracts(user.walletAddress);
    }
  }, [user]);
  
  // Load contracts for the current user
  const loadContracts = async (address: string) => {
    setIsLoading(true);
    try {
      // Fetch user's contracts from the API
      const response = await fetch(`/api/contracts/milestone?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to load contracts');
      }
      
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contracts. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for viewing contract details
  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    contractDetailsDisclosure.onOpen();
  };
  
  // Handler for contract creation success
  const handleContractCreated = () => {
    // Reload contracts after successful creation
    loadContracts(walletAddress);
    newContractDisclosure.onClose();
    
    toast({
      title: 'Success',
      description: 'Contract created successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Get badge color based on contract state
  const getContractStateColor = (state: ContractState) => {
    switch (state) {
      case ContractState.Created:
        return 'gray';
      case ContractState.Active:
        return 'blue';
      case ContractState.Completed:
        return 'green';
      case ContractState.Cancelled:
        return 'red';
      case ContractState.Disputed:
        return 'orange';
      default:
        return 'gray';
    }
  };
  
  // Get contract state label
  const getContractStateLabel = (state: ContractState) => {
    switch (state) {
      case ContractState.Created:
        return 'Created';
      case ContractState.Active:
        return 'Active';
      case ContractState.Completed:
        return 'Completed';
      case ContractState.Cancelled:
        return 'Cancelled';
      case ContractState.Disputed:
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Milestone Contracts</Heading>
        
        <PermissionGate requiredPermission="contracts:create">
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={newContractDisclosure.onOpen}
          >
            New Contract
          </Button>
        </PermissionGate>
      </Flex>
      
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : contracts.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="xl">No contracts found</Text>
          <Text mt={2} color="gray.500">
            Create your first milestone-based contract to get started.
          </Text>
        </Box>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Contract ID</Th>
              <Th>Parties</Th>
              <Th>Amount</Th>
              <Th>Created</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contracts.map((contract) => (
              <Tr key={contract.contractId}>
                <Td>{contract.contractId.substring(0, 8)}...</Td>
                <Td>
                  <Text fontWeight="bold">
                    Buyer: {contract.buyer.substring(0, 6)}...
                  </Text>
                  <Text>
                    Seller: {contract.seller.substring(0, 6)}...
                  </Text>
                </Td>
                <Td>
                  <Text fontWeight="bold">
                    {formatCurrency(contract.totalAmount)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Paid: {formatCurrency(contract.paidAmount)}
                  </Text>
                </Td>
                <Td>{formatDate(contract.createdAt)}</Td>
                <Td>
                  <Badge colorScheme={getContractStateColor(contract.state)}>
                    {getContractStateLabel(contract.state)}
                  </Badge>
                  {contract.hasDispute && (
                    <Badge ml={2} colorScheme="red">
                      Disputed
                    </Badge>
                  )}
                </Td>
                <Td>
                  <IconButton
                    aria-label="View contract"
                    icon={<ViewIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleViewContract(contract)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      
      {/* New Contract Modal */}
      <NewContractModal 
        isOpen={newContractDisclosure.isOpen}
        onClose={newContractDisclosure.onClose}
        onSuccess={handleContractCreated}
        buyerAddress={walletAddress}
      />
      
      {/* Contract Details Modal */}
      {selectedContract && (
        <ContractDetailsModal
          isOpen={contractDetailsDisclosure.isOpen}
          onClose={contractDetailsDisclosure.onClose}
          contract={selectedContract}
          onUpdate={() => loadContracts(walletAddress)}
          userAddress={walletAddress}
        />
      )}
    </Box>
  );
};

export default MilestoneContracts;
