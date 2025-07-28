import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  FormErrorMessage,
  useToast,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { milestonePaymentsService } from '../../services/blockchain/milestone-payments-service.js';

interface CreateDisputeFormProps {
  contractId: string;
  milestoneIndex: number;
  onSuccess: () => void;
}

export const CreateDisputeForm: React.FC<CreateDisputeFormProps> = ({
  contractId,
  milestoneIndex,
  onSuccess
}) => {
  const [reason, setReason] = useState<string>('');
  const [evidenceHash, setEvidenceHash] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useToast();
  
  // Validate form input
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    
    if (!evidenceHash.trim()) {
      newErrors.evidenceHash = 'Evidence hash is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await milestonePaymentsService.createDispute(
        contractId,
        milestoneIndex,
        reason,
        evidenceHash
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Dispute created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Call success callback
        onSuccess();
        
        // Reset form
        setReason('');
        setEvidenceHash('');
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
      console.error('Error creating dispute:', error);
      toast({
        title: 'Error',
        description: `Failed to create dispute: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <VStack spacing={4} as="form" onSubmit={handleSubmit}>
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Filing a dispute will escalate this matter to an arbitrator. Disputes can take time to resolve.
          Make sure you've tried to resolve the issue directly with the other party first.
        </AlertDescription>
      </Alert>
      
      <FormControl isInvalid={!!errors.reason}>
        <FormLabel>Reason for Dispute</FormLabel>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why you are filing this dispute..."
          rows={4}
        />
        <FormErrorMessage>{errors.reason}</FormErrorMessage>
      </FormControl>
      
      <FormControl isInvalid={!!errors.evidenceHash}>
        <FormLabel>Evidence Hash (IPFS)</FormLabel>
        <Input
          value={evidenceHash}
          onChange={(e) => setEvidenceHash(e.target.value)}
          placeholder="QmYbT..."
        />
        <Text fontSize="sm" color="gray.500" mt={1}>
          Upload relevant evidence to IPFS and paste the hash here.
          This can include screenshots, communications, or other documentation.
        </Text>
        <FormErrorMessage>{errors.evidenceHash}</FormErrorMessage>
      </FormControl>
      
      <Button
        colorScheme="orange"
        type="submit"
        isLoading={isLoading}
        loadingText="Submitting"
        width="100%"
        mt={2}
      >
        File Dispute
      </Button>
    </VStack>
  );
};
