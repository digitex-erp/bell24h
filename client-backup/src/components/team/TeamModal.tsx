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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  Select,
  VStack,
} from '@chakra-ui/react';

// Type definitions
interface Organization {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  organizations: Organization[];
  onSave: (teamData: Partial<Team>) => void;
}

const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  team,
  organizations,
  onSave,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    description: '',
    organization_id: organizations.length > 0 ? organizations[0].id : undefined,
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // When the modal opens or the team changes, update the form
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        organization_id: team.organization_id,
      });
    } else {
      resetForm();
    }
  }, [team, isOpen]);
  
  // Reset the form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      organization_id: organizations.length > 0 ? organizations[0].id : undefined,
    });
    setErrors({});
  };
  
  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === 'organization_id' ? parseInt(value, 10) : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    
    // Clear error on field change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.organization_id) {
      newErrors.organization_id = 'Please select an organization';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {team ? 'Edit Team' : 'Create Team'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Team Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter team name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.organization_id}>
                <FormLabel>Organization</FormLabel>
                <Select
                  name="organization_id"
                  value={formData.organization_id}
                  onChange={handleChange}
                  placeholder="Select organization"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.organization_id}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Enter team description"
                  resize="vertical"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving"
            >
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TeamModal;
