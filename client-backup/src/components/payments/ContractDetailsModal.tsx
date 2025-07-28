import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  Badge,
  Divider,
  HStack,
  VStack,
  Progress,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { 
  CheckIcon, 
  CloseIcon, 
  WarningIcon,
  TimeIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { 
  Contract, 
  Milestone, 
  MilestoneState, 
  ContractState,
  milestonePaymentsService
} from '../../services/blockchain/milestone-payments-service.js';
import { formatDate, formatCurrency } from '../../utils/formatters.js';
import { CreateDisputeForm } from './CreateDisputeForm.js';
import PermissionGate from '../common/PermissionGate.js';
import MilestoneFinancingIntegration from './MilestoneFinancingIntegration';
import { trackBlockchainEvent } from '../../lib/analytics';

interface ContractDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onUpdate: () => void;
  userAddress: string;
}

export const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  isOpen,
  onClose,
  contract,
  onUpdate,
  userAddress
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedMilestoneForFinancing, setSelectedMilestoneForFinancing] = useState<string | null>(null);
  const [deliverableHash, setDeliverableHash] = useState<string>('');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const toast = useToast();
  
  // Get role of current user (buyer or seller)
  const userRole = getUserRole();
  
  function getUserRole(): 'buyer' | 'seller' | 'other' {
    if (userAddress.toLowerCase() === contract.buyer.toLowerCase()) {
      return 'buyer';
    } else if (userAddress.toLowerCase() === contract.seller.toLowerCase()) {
      return 'seller';
    } else {
      return 'other';
    }
  }
  
  // Load milestones when modal is opened
  useEffect(() => {
    if (isOpen) {
      loadMilestones();
    }
  }, [isOpen, contract]);
  
  // Load milestone details for the contract
  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      const result = await milestonePaymentsService.getContractMilestones(contract.contractId);
      
      if (result.success && result.milestones) {
        setMilestones(result.milestones);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error loading milestones:', error);
      toast({
        title: 'Error',
        description: `Failed to load milestones: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start a milestone
  const handleStartMilestone = async (index: number) => {
    setLoadingAction(`start-${index}`);
    
    try {
      const result = await milestonePaymentsService.startMilestone(contract.contractId, index);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reload milestones and contract data
        await loadMilestones();
        onUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error starting milestone:', error);
      toast({
        title: 'Error',
        description: `Failed to start milestone: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  // Complete a milestone
  const handleCompleteMilestone = async (index: number) => {
    if (!deliverableHash) {
      toast({
        title: 'Error',
        description: 'Please enter a deliverable hash',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLoadingAction(`complete-${index}`);
    
    try {
      const result = await milestonePaymentsService.completeMilestone(
        contract.contractId,
        index,
        deliverableHash
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setDeliverableHash('');
        // Reload milestones and contract data
        await loadMilestones();
        onUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      toast({
        title: 'Error',
        description: `Failed to complete milestone: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  // Approve a milestone
  const handleApproveMilestone = async (index: number) => {
    setLoadingAction(`approve-${index}`);
    
    try {
      const result = await milestonePaymentsService.approveMilestone(contract.contractId, index);
      
      if (result.success) {
        // Track the milestone approval event
        trackBlockchainEvent('approve', 'milestone', {
          contractId: contract.contractId,
          milestoneId: milestones[index]?.id,
          amount: milestones[index]?.amount,
          walletAddress: userAddress,
          transactionHash: result.transactionHash,
          successful: true
        });
        
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reload milestones and contract data
        await loadMilestones();
        onUpdate();
      } else {
        // Track failed approval
        trackBlockchainEvent('approve', 'milestone', {
          contractId: contract.contractId,
          milestoneId: milestones[index]?.id,
          successful: false,
          errorMessage: result.message
        });
        
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error approving milestone:', error);
      
      // Track error
      trackBlockchainEvent('approve', 'milestone', {
        contractId: contract.contractId,
        milestoneId: milestones[index]?.id,
        successful: false,
        errorMessage: error.message
      });
      
      toast({
        title: 'Error',
        description: `Failed to approve milestone: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  // Reject a milestone
  const handleRejectMilestone = async (index: number) => {
    if (!feedbackNotes) {
      toast({
        title: 'Error',
        description: 'Please provide feedback for the rejection',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLoadingAction(`reject-${index}`);
    
    try {
      const result = await milestonePaymentsService.rejectMilestone(
        contract.contractId,
        index,
        feedbackNotes
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setFeedbackNotes('');
        // Reload milestones and contract data
        await loadMilestones();
        onUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error rejecting milestone:', error);
      toast({
        title: 'Error',
        description: `Failed to reject milestone: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  // Cancel the contract
  const handleCancelContract = async () => {
    if (!window.confirm('Are you sure you want to cancel this contract? This action cannot be undone.')) {
      return;
    }
    
    setLoadingAction('cancel');
    
    try {
      const result = await milestonePaymentsService.cancelContract(contract.contractId);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reload contract data and close modal
        onUpdate();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error cancelling contract:', error);
      toast({
        title: 'Error',
        description: `Failed to cancel contract: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  // Handle dispute creation
  const handleDisputeCreated = async () => {
    // Reload contract and milestone data
    await loadMilestones();
    onUpdate();
    
    toast({
      title: 'Success',
      description: 'Dispute created successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Get milestone state badge color and label
  const getMilestoneStateInfo = (state: MilestoneState) => {
    switch (state) {
      case MilestoneState.Pending:
        return { color: 'gray', label: 'Pending', icon: <TimeIcon /> };
      case MilestoneState.InProgress:
        return { color: 'blue', label: 'In Progress', icon: <InfoIcon /> };
      case MilestoneState.Completed:
        return { color: 'yellow', label: 'Completed', icon: <CheckIcon /> };
      case MilestoneState.Approved:
        return { color: 'green', label: 'Approved', icon: <CheckIcon /> };
      case MilestoneState.Rejected:
        return { color: 'red', label: 'Rejected', icon: <CloseIcon /> };
      case MilestoneState.Paid:
        return { color: 'green', label: 'Paid', icon: <CheckIcon /> };
      default:
        return { color: 'gray', label: 'Unknown', icon: <InfoIcon /> };
    }
  };
  
  // Calculate overall contract progress
  const calculateProgress = (): number => {
    if (!milestones || milestones.length === 0) return 0;
    
    const completedMilestones = milestones.filter(
      m => m.state === MilestoneState.Paid || m.state === MilestoneState.Approved
    ).length;
    
    return (completedMilestones / milestones.length) * 100;
  };
  
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contract Details</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
            <TabList mb="1em">
              <Tab>Overview</Tab>
              <Tab>Milestones</Tab>
              <Tab>Financing</Tab>
              {userRole !== 'other' && <Tab>Actions</Tab>}
            </TabList>
            
            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold">Contract ID:</Text>
                      <Text>{contract.contractId}</Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold">Status:</Text>
                      <Badge colorScheme={contract.state === ContractState.Active ? 'green' : 'gray'}>
                        {getContractStateLabel(contract.state)}
                      </Badge>
                    </Flex>
                    
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold">Created:</Text>
                      <Text>{formatDate(contract.createdAt)}</Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold">Total Amount:</Text>
                      <Text fontWeight="bold">{formatCurrency(contract.totalAmount)}</Text>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Paid Amount:</Text>
                      <Text>{formatCurrency(contract.paidAmount)}</Text>
                    </Flex>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Parties</Text>
                    
                    <Box bg="blue.50" p={3} borderRadius="md" mb={2}>
                      <Text fontWeight="medium">Buyer</Text>
                      <Text fontSize="sm" wordBreak="break-all">{contract.buyer}</Text>
                      {userRole === 'buyer' && (
                        <Badge colorScheme="blue" mt={1}>You</Badge>
                      )}
                    </Box>
                    
                    <Box bg="green.50" p={3} borderRadius="md">
                      <Text fontWeight="medium">Seller</Text>
                      <Text fontSize="sm" wordBreak="break-all">{contract.seller}</Text>
                      {userRole === 'seller' && (
                        <Badge colorScheme="green" mt={1}>You</Badge>
                      )}
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Terms Document</Text>
                    <Text fontSize="sm" wordBreak="break-all">{contract.termsHash}</Text>
                    <Button 
                      size="sm" 
                      mt={2} 
                      as="a" 
                      href={`https://ipfs.io/ipfs/${contract.termsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </Button>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontWeight="bold">Completion Progress</Text>
                      <Text>{Math.round(calculateProgress())}%</Text>
                    </Flex>
                    <Progress value={calculateProgress()} colorScheme="green" borderRadius="md" />
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Milestones Tab */}
              <TabPanel>
                {isLoading ? (
                  <Flex justify="center" align="center" height="200px">
                    <Spinner size="xl" />
                  </Flex>
                ) : milestones.length === 0 ? (
                  <Text textAlign="center">No milestones found</Text>
                ) : (
                  <Accordion allowMultiple defaultIndex={[0]}>
                    {milestones.map((milestone, index) => {
                      const stateInfo = getMilestoneStateInfo(milestone.state);
                      
                      return (
                        <AccordionItem key={index}>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Text fontWeight="bold">Milestone {index + 1}:</Text>
                                  <Text noOfLines={1}>{milestone.description}</Text>
                                </HStack>
                              </Box>
                              <Badge colorScheme={stateInfo.color} mr={2}>
                                {stateInfo.label}
                              </Badge>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={3}>
                              <Text>{milestone.description}</Text>
                              
                              <Flex justify="space-between">
                                <Text fontWeight="bold">Amount:</Text>
                                <Text>{formatCurrency(milestone.amount)}</Text>
                              </Flex>
                              
                              <Flex justify="space-between">
                                <Text fontWeight="bold">Due Date:</Text>
                                <Text>{formatDate(milestone.dueDate)}</Text>
                              </Flex>
                              
                              {milestone.completedAt && (
                                <Flex justify="space-between">
                                  <Text fontWeight="bold">Completed:</Text>
                                  <Text>{formatDate(milestone.completedAt)}</Text>
                                </Flex>
                              )}
                              
                              {milestone.paidAt && (
                                <Flex justify="space-between">
                                  <Text fontWeight="bold">Paid:</Text>
                                  <Text>{formatDate(milestone.paidAt)}</Text>
                                </Flex>
                              )}
                              
                              {milestone.deliverableHash && (
                                <Box mt={2}>
                                  <Text fontWeight="bold">Deliverables:</Text>
                                  <Text fontSize="sm" wordBreak="break-all">
                                    {milestone.deliverableHash}
                                  </Text>
                                  <Button 
                                    size="sm" 
                                    mt={1} 
                                    as="a" 
                                    href={`https://ipfs.io/ipfs/${milestone.deliverableHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Deliverables
                                  </Button>
                                </Box>
                              )}
                              
                              {milestone.feedbackNotes && (
                                <Box mt={2}>
                                  <Text fontWeight="bold">Feedback:</Text>
                                  <Text>{milestone.feedbackNotes}</Text>
                                </Box>
                              )}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </TabPanel>
              
              {/* Financing Tab */}
              <TabPanel>
                {isLoading ? (
                  <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" />
                  </Flex>
                ) : (
                  <Box>
                    <Text mb={4}>
                      Use our financing partners to receive early payment for approved milestones.
                    </Text>
                    
                    {milestones.some(m => m.state === MilestoneState.Approved && !m.financed) ? (
                      <>
                        <Alert status="info" mb={4}>
                          <AlertIcon />
                          You have {milestones.filter(m => m.state === MilestoneState.Approved && !m.financed).length} approved milestones eligible for financing
                        </Alert>
                        
                        <MilestoneFinancingIntegration contractId={contract.contractId} />
                      </>
                    ) : (
                      <Alert status="warning">
                        <AlertIcon />
                        No approved milestones are currently available for financing. Milestones must be approved by the buyer before they can be financed.
                      </Alert>
                    )}
                  </Box>
                )}
              </TabPanel>
              
              {/* Actions Tab */}
              {userRole !== 'other' && (
                <TabPanel>
                  {isLoading ? (
                    <Flex justify="center" align="center" height="200px">
                      <Spinner size="xl" />
                    </Flex>
                  ) : milestones.length === 0 ? (
                    <Text textAlign="center">No milestones found</Text>
                  ) : (
                    <VStack align="stretch" spacing={4}>
                      {milestones.map((milestone, index) => {
                        const stateInfo = getMilestoneStateInfo(milestone.state);
                        
                        return (
                          <Box 
                            key={index} 
                            p={4} 
                            borderWidth={1} 
                            borderRadius="md"
                            borderColor={`${stateInfo.color}.200`}
                            bg={`${stateInfo.color}.50`}
                          >
                            <Flex justify="space-between" align="center" mb={3}>
                              <HStack>
                                <Text fontWeight="bold">Milestone {index + 1}:</Text>
                                <Text noOfLines={1}>{milestone.description}</Text>
                              </HStack>
                              <Badge colorScheme={stateInfo.color} mr={2}>
                                {stateInfo.label}
                              </Badge>
                            </Flex>
                            
                            <Text mb={4}>{milestone.description}</Text>
                            
                            {/* Action buttons based on milestone state and user role */}
                            <Box mt={3}>
                              {/* Seller actions */}
                              {userRole === 'seller' && (
                                <>
                                  {milestone.state === MilestoneState.Pending && (
                                    <Button
                                      colorScheme="blue"
                                      size="sm"
                                      onClick={() => handleStartMilestone(index)}
                                      isLoading={loadingAction === `start-${index}`}
                                      width="100%"
                                    >
                                      Start Working
                                    </Button>
                                  )}
                                  
                                  {milestone.state === MilestoneState.InProgress && (
                                    <VStack spacing={3} align="stretch">
                                      <FormControl>
                                        <FormLabel>Deliverable Hash (IPFS)</FormLabel>
                                        <Input
                                          value={deliverableHash}
                                          onChange={(e) => setDeliverableHash(e.target.value)}
                                          placeholder="QmYbT..."
                                        />
                                      </FormControl>
                                      
                                      <Button
                                        colorScheme="green"
                                        onClick={() => handleCompleteMilestone(index)}
                                        isLoading={loadingAction === `complete-${index}`}
                                        width="100%"
                                      >
                                        Mark as Completed
                                      </Button>
                                    </VStack>
                                  )}
                                  
                                  {milestone.state === MilestoneState.Rejected && (
                                    <VStack spacing={3} align="stretch">
                                      <Text color="red.500">
                                        This milestone was rejected. Please address the feedback and resubmit.
                                      </Text>
                                      
                                      <FormControl>
                                        <FormLabel>Updated Deliverable Hash (IPFS)</FormLabel>
                                        <Input
                                          value={deliverableHash}
                                          onChange={(e) => setDeliverableHash(e.target.value)}
                                          placeholder="QmYbT..."
                                        />
                                      </FormControl>
                                      
                                      <Button
                                        colorScheme="green"
                                        onClick={() => handleCompleteMilestone(index)}
                                        isLoading={loadingAction === `complete-${index}`}
                                        width="100%"
                                      >
                                        Resubmit
                                      </Button>
                                    </VStack>
                                  )}
                                </>
                              )}
                              
                              {/* Buyer actions */}
                              {userRole === 'buyer' && (
                                <>
                                  {milestone.state === MilestoneState.Completed && (
                                    <VStack spacing={3} align="stretch">
                                      <Button
                                        colorScheme="green"
                                        onClick={() => handleApproveMilestone(index)}
                                        isLoading={loadingAction === `approve-${index}`}
                                        width="100%"
                                        mb={2}
                                      >
                                        Approve & Release Payment
                                      </Button>
                                      
                                      <FormControl>
                                        <FormLabel>Rejection Feedback</FormLabel>
                                        <Textarea
                                          value={feedbackNotes}
                                          onChange={(e) => setFeedbackNotes(e.target.value)}
                                          placeholder="Provide feedback for rejection..."
                                        />
                                      </FormControl>
                                      
                                      <Button
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() => handleRejectMilestone(index)}
                                        isLoading={loadingAction === `reject-${index}`}
                                        width="100%"
                                      >
                                        Reject Milestone
                                      </Button>
                                    </VStack>
                                  )}
                                </>
                              )}
                              
                              {/* Dispute creation */}
                              {(milestone.state === MilestoneState.Completed || 
                                 milestone.state === MilestoneState.Rejected) && (
                                <Box mt={4}>
                                  <Divider my={3} />
                                  <Accordion allowToggle>
                                    <AccordionItem border="none">
                                      <h2>
                                        <AccordionButton bg="orange.100" borderRadius="md">
                                          <Box flex="1" textAlign="left">
                                            <Flex align="center">
                                              <WarningIcon mr={2} color="orange.500" />
                                              <Text fontWeight="medium">File a Dispute</Text>
                                            </Flex>
                                          </Box>
                                          <AccordionIcon />
                                        </AccordionButton>
                                      </h2>
                                      <AccordionPanel pb={4} pt={4} bg="orange.50">
                                        <CreateDisputeForm
                                          contractId={contract.contractId}
                                          milestoneIndex={index}
                                          onSuccess={handleDisputeCreated}
                                        />
                                      </AccordionPanel>
                                    </AccordionItem>
                                  </Accordion>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                      
                      {/* Contract cancellation */}
                      {(userRole === 'buyer' || userRole === 'seller') && 
                       contract.state !== ContractState.Completed && 
                       contract.state !== ContractState.Cancelled && (
                        <Box mt={6}>
                          <Divider mb={4} />
                          <Box bg="red.50" p={4} borderRadius="md">
                            <Text fontWeight="bold" mb={2}>Danger Zone</Text>
                            <Text fontSize="sm" mb={4}>
                              Cancelling the contract will permanently stop all activities. Any funded but 
                              unreleased payments will be returned to the buyer.
                            </Text>
                            <Button
                              colorScheme="red"
                              onClick={handleCancelContract}
                              isLoading={loadingAction === 'cancel'}
                              width="100%"
                            >
                              Cancel Contract
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </VStack>
                  )}
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
