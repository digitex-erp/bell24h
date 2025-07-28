import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  HStack,
  Box,
  Text,
  Divider,
  useToast,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftElement,
  Textarea
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { milestonePaymentsService } from '../../services/blockchain/milestone-payments-service.js';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  buyerAddress: string;
}

interface Milestone {
  description: string;
  amount: number;
  dueDate: Date;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  buyerAddress
}) => {
  const [contractId, setContractId] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');
  const [termsHash, setTermsHash] = useState<string>('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { description: '', amount: 0, dueDate: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useToast();
  
  // Reset form when modal is opened
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  // Reset form to initial state
  const resetForm = () => {
    setContractId('');
    setSellerAddress('');
    setTermsHash('');
    setMilestones([{ description: '', amount: 0, dueDate: new Date() }]);
    setErrors({});
  };
  
  // Validate form input
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!contractId) {
      newErrors.contractId = 'Contract ID is required';
    }
    
    if (!sellerAddress) {
      newErrors.sellerAddress = 'Seller address is required';
    } else if (!ethers.isAddress(sellerAddress)) {
      newErrors.sellerAddress = 'Invalid Ethereum address';
    }
    
    if (!termsHash) {
      newErrors.termsHash = 'Terms document hash is required';
    }
    
    // Validate milestones
    milestones.forEach((milestone, index) => {
      if (!milestone.description) {
        newErrors[`milestone_${index}_description`] = 'Description is required';
      }
      
      if (milestone.amount <= 0) {
        newErrors[`milestone_${index}_amount`] = 'Amount must be greater than 0';
      }
      
      const dueDateObj = new Date(milestone.dueDate);
      if (isNaN(dueDateObj.getTime())) {
        newErrors[`milestone_${index}_dueDate`] = 'Valid due date is required';
      } else if (dueDateObj < new Date()) {
        newErrors[`milestone_${index}_dueDate`] = 'Due date must be in the future';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Add a new milestone
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { description: '', amount: 0, dueDate: new Date() }
    ]);
  };
  
  // Remove a milestone
  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) {
      toast({
        title: 'Cannot remove',
        description: 'At least one milestone is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setMilestones(milestones.filter((_, i) => i !== index));
  };
  
  // Update milestone property
  const updateMilestone = (index: number, key: keyof Milestone, value: any) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [key]: value
    };
    
    setMilestones(updatedMilestones);
  };
  
  // Calculate total contract amount
  const calculateTotal = (): number => {
    return milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format dates for blockchain (UNIX timestamp in seconds)
      const formattedMilestones = milestones.map(milestone => ({
        ...milestone,
        dueDate: milestone.dueDate instanceof Date ? milestone.dueDate : new Date(milestone.dueDate)
      }));
      
      // Calculate total amount
      const totalAmount = calculateTotal();
      
      // Create contract using the milestone payments service
      const result = await milestonePaymentsService.createContract(
        contractId,
        sellerAddress,
        termsHash,
        formattedMilestones,
        totalAmount
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onSuccess();
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
      console.error('Error creating contract:', error);
      toast({
        title: 'Error',
        description: `Failed to create contract: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Milestone Contract</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.contractId}>
              <FormLabel>Contract ID</FormLabel>
              <Input
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="Unique contract identifier"
              />
              <FormErrorMessage>{errors.contractId}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.sellerAddress}>
              <FormLabel>Seller Address</FormLabel>
              <Input
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="0x..."
              />
              <FormErrorMessage>{errors.sellerAddress}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.termsHash}>
              <FormLabel>Terms Document Hash (IPFS)</FormLabel>
              <Input
                value={termsHash}
                onChange={(e) => setTermsHash(e.target.value)}
                placeholder="QmYbT..."
              />
              <FormErrorMessage>{errors.termsHash}</FormErrorMessage>
            </FormControl>
            
            <Divider my={2} />
            
            <Box>
              <Text fontWeight="bold" mb={2}>
                Milestones
              </Text>
              
              {milestones.map((milestone, index) => (
                <Box 
                  key={index} 
                  p={3} 
                  borderWidth={1} 
                  borderRadius="md" 
                  mb={3}
                  borderColor="gray.200"
                >
                  <HStack justifyContent="space-between" mb={2}>
                    <Text fontWeight="medium">Milestone {index + 1}</Text>
                    <IconButton
                      aria-label="Remove milestone"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeMilestone(index)}
                    />
                  </HStack>
                  
                  <VStack spacing={3}>
                    <FormControl isInvalid={!!errors[`milestone_${index}_description`]}>
                      <FormLabel fontSize="sm">Description</FormLabel>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Describe the deliverable"
                        size="sm"
                      />
                      <FormErrorMessage>{errors[`milestone_${index}_description`]}</FormErrorMessage>
                    </FormControl>
                    
                    <HStack width="100%">
                      <FormControl isInvalid={!!errors[`milestone_${index}_amount`]}>
                        <FormLabel fontSize="sm">Amount (ETH)</FormLabel>
                        <InputGroup size="sm">
                          <InputLeftElement pointerEvents="none">Ξ</InputLeftElement>
                          <NumberInput
                            min={0}
                            precision={4}
                            value={milestone.amount}
                            onChange={(value) => updateMilestone(index, 'amount', parseFloat(value))}
                            width="100%"
                          >
                            <NumberInputField pl={7} />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                        <FormErrorMessage>{errors[`milestone_${index}_amount`]}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={!!errors[`milestone_${index}_dueDate`]}>
                        <FormLabel fontSize="sm">Due Date</FormLabel>
                        <Input
                          type="date"
                          size="sm"
                          value={milestone.dueDate instanceof Date 
                            ? milestone.dueDate.toISOString().split('T')[0]
                            : milestone.dueDate as unknown as string}
                          onChange={(e) => updateMilestone(index, 'dueDate', new Date(e.target.value))}
                        />
                        <FormErrorMessage>{errors[`milestone_${index}_dueDate`]}</FormErrorMessage>
                      </FormControl>
                    </HStack>
                  </VStack>
                </Box>
              ))}
              
              <Button
                leftIcon={<AddIcon />}
                variant="outline"
                size="sm"
                onClick={addMilestone}
                width="100%"
                mt={2}
              >
                Add Milestone
              </Button>
              
              <Box mt={4} p={3} borderWidth={1} borderRadius="md" bg="gray.50">
                <Text fontWeight="bold">Total Contract Value:</Text>
                <Text fontSize="xl">Ξ {calculateTotal()}</Text>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating"
          >
            Create Contract
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
