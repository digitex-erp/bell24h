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
  Badge,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';
import TeamModal from './TeamModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { usePermissions } from '../../hooks/usePermissions';

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
  organization_name?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

interface TeamListProps {
  organizationId?: number;
  onSelectTeam?: (team: Team) => void;
}

const TeamList: React.FC<TeamListProps> = ({ organizationId, onSelectTeam }) => {
  // State management
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Toast notifications
  const toast = useToast();
  
  // Check permissions
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('team', 'create');
  const canUpdate = hasPermission('team', 'update');
  const canDelete = hasPermission('team', 'delete');
  
  // Fetch teams and organizations on component mount
  useEffect(() => {
    fetchOrganizations();
    fetchTeams();
  }, [organizationId]);
  
  // Fetch organizations from the API
  const fetchOrganizations = async () => {
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
    }
  };
  
  // Fetch teams from the API
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const url = organizationId
        ? `/api/teams?organization_id=${organizationId}`
        : '/api/teams';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle creating a new team
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    onOpen();
  };
  
  // Handle editing an existing team
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    onOpen();
  };
  
  // Handle deleting a team
  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };
  
  // Handle confirming team deletion
  const handleDeleteConfirm = async () => {
    if (!selectedTeam) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      setTeams(teams.filter((team) => team.id !== selectedTeam.id));
      toast({
        title: 'Success',
        description: `Team ${selectedTeam.name} has been deleted.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete team. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTeam(null);
    }
  };
  
  // Handle saving team (create or update)
  const handleSaveTeam = async (teamData: Partial<Team>) => {
    const isEditing = !!selectedTeam;
    const url = isEditing 
      ? `/api/teams/${selectedTeam.id}` 
      : '/api/teams';
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} team`);
      }
      
      const savedTeam = await response.json();
      
      // Find organization name for the team
      const organization = organizations.find(org => org.id === savedTeam.organization_id);
      savedTeam.organization_name = organization?.name;
      
      if (isEditing) {
        setTeams(teams.map((team) => 
          team.id === savedTeam.id ? savedTeam : team
        ));
      } else {
        setTeams([...teams, savedTeam]);
      }
      
      toast({
        title: 'Success',
        description: `Team ${savedTeam.name} has been ${isEditing ? 'updated' : 'created'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} team:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} team. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Get organization name by ID
  const getOrganizationName = (organizationId: number): string => {
    const organization = organizations.find((org) => org.id === organizationId);
    return organization?.name || 'Unknown Organization';
  };
  
  // Handle selecting a team
  const handleSelectTeam = (team: Team) => {
    if (onSelectTeam) {
      onSelectTeam(team);
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Teams</Heading>
        {canCreate && (
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="blue" 
            onClick={handleCreateTeam}
          >
            New Team
          </Button>
        )}
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" my={8}>
          <Spinner size="xl" />
        </Flex>
      ) : teams.length === 0 ? (
        <Text mt={4} textAlign="center">
          No teams found. {canCreate ? 'Create one to get started.' : ''}
        </Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              {!organizationId && <Th>Organization</Th>}
              <Th>Description</Th>
              <Th>Members</Th>
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {teams.map((team) => (
              <Tr
                key={team.id}
                _hover={{ bg: 'gray.50', cursor: onSelectTeam ? 'pointer' : 'default' }}
                onClick={() => handleSelectTeam(team)}
              >
                <Td fontWeight="medium">{team.name}</Td>
                {!organizationId && (
                  <Td>
                    <Badge colorScheme="blue">
                      {team.organization_name || getOrganizationName(team.organization_id)}
                    </Badge>
                  </Td>
                )}
                <Td>{team.description || '-'}</Td>
                <Td>
                  <Flex align="center">
                    <FiUsers style={{ marginRight: '8px' }} />
                    {team.member_count || 0}
                  </Flex>
                </Td>
                <Td isNumeric>
                  <Flex justify="flex-end">
                    {canUpdate && (
                      <IconButton
                        aria-label="Edit team"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        mr={2}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTeam(team);
                        }}
                      />
                    )}
                    {canDelete && (
                      <IconButton
                        aria-label="Delete team"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(team);
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
      
      {/* Team create/edit modal */}
      <TeamModal
        isOpen={isOpen}
        onClose={onClose}
        team={selectedTeam}
        organizations={organizations}
        onSave={handleSaveTeam}
      />
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team"
        message={`Are you sure you want to delete the team "${selectedTeam?.name}"? This will remove all team members and permissions.`}
      />
    </Box>
  );
};

export default TeamList;
