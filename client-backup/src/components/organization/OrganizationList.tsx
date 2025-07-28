import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import OrganizationModal from './OrganizationModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { usePermissions } from '../../hooks/usePermissions';

// Organization type definition
interface Organization {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Props type definition
interface OrganizationListProps {
  onSelectOrganization?: (organization: Organization) => void;
}

const OrganizationList: React.FC<OrganizationListProps> = ({ onSelectOrganization }) => {
  // State management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Toast notifications
  const toast = useToast();
  
  // Check permissions
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('organization', 'create');
  const canUpdate = hasPermission('organization', 'update');
  const canDelete = hasPermission('organization', 'delete');
  
  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  // Fetch organizations from the API
  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organizations. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle creating a new organization
  const handleCreateOrganization = () => {
    setSelectedOrganization(null);
    onOpen();
  };
  
  // Handle editing an existing organization
  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    onOpen();
  };
  
  // Handle deleting an organization
  const handleDeleteClick = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDeleteModalOpen(true);
  };
  
  // Handle confirming organization deletion
  const handleDeleteConfirm = async () => {
    if (!selectedOrganization) return;
    
    try {
      const response = await fetch(`/api/organizations/${selectedOrganization.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }
      
      setOrganizations(organizations.filter((org) => org.id !== selectedOrganization.id));
      toast({
        title: 'Success',
        description: `Organization ${selectedOrganization.name} has been deleted.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete organization. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedOrganization(null);
    }
  };
  
  // Handle saving organization (create or update)
  const handleSaveOrganization = async (organizationData: Partial<Organization>) => {
    const isEditing = !!selectedOrganization;
    const url = isEditing 
      ? `/api/organizations/${selectedOrganization.id}` 
      : '/api/organizations';
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} organization`);
      }
      
      const savedOrganization = await response.json();
      
      if (isEditing) {
        setOrganizations(organizations.map((org) => 
          org.id === savedOrganization.id ? savedOrganization : org
        ));
      } else {
        setOrganizations([...organizations, savedOrganization]);
      }
      
      toast({
        title: 'Success',
        description: `Organization ${savedOrganization.name} has been ${isEditing ? 'updated' : 'created'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} organization:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} organization. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle selecting an organization
  const handleSelectOrganization = (organization: Organization) => {
    if (onSelectOrganization) {
      onSelectOrganization(organization);
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Organizations</Heading>
        {canCreate && (
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="blue" 
            onClick={handleCreateOrganization}
          >
            New Organization
          </Button>
        )}
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" my={8}>
          <Spinner size="xl" />
        </Flex>
      ) : organizations.length === 0 ? (
        <Text mt={4} textAlign="center">No organizations found. Create one to get started.</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Created</Th>
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {organizations.map((org) => (
              <Tr
                key={org.id}
                _hover={{ bg: 'gray.50', cursor: onSelectOrganization ? 'pointer' : 'default' }}
                onClick={() => handleSelectOrganization(org)}
              >
                <Td fontWeight="medium">{org.name}</Td>
                <Td>{org.description || '-'}</Td>
                <Td>{new Date(org.created_at).toLocaleDateString()}</Td>
                <Td isNumeric>
                  <Flex justify="flex-end">
                    {canUpdate && (
                      <IconButton
                        aria-label="Edit organization"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        mr={2}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrganization(org);
                        }}
                      />
                    )}
                    {canDelete && (
                      <IconButton
                        aria-label="Delete organization"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(org);
                        }}
                      />
                    )}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      
      {/* Organization create/edit modal */}
      <OrganizationModal
        isOpen={isOpen}
        onClose={onClose}
        organization={selectedOrganization}
        onSave={handleSaveOrganization}
      />
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
        message={`Are you sure you want to delete ${selectedOrganization?.name}? This action cannot be undone.`}
      />
    </Box>
  );
};

export default OrganizationList;
