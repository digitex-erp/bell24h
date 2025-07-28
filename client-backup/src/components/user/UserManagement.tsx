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
  useDisclosure,
  useToast,
  Spinner,
  Text,
  Badge,
  Select,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiPlus, FiUserCheck } from 'react-icons/fi';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../common/PermissionGate';
import RoleBasedMenu from '../common/RoleBasedMenu';
import UserModal from './UserModal';

// Type definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id?: number;
  team_id?: number;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  organization_id: number;
}

interface UserManagementProps {
  organizationId?: number;
  teamId?: number;
  onSelectUser?: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  organizationId, 
  teamId, 
  onSelectUser 
}) => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Toast notifications
  const toast = useToast();

  // Check permissions
  const { hasPermission, userRole } = usePermissions();
  const canCreate = hasPermission('user', 'create');
  const canUpdate = hasPermission('user', 'update');
  const canDelete = hasPermission('user', 'delete');
  const canAssignRoles = hasPermission('user', 'manage');

  // Fetch data on component mount
  useEffect(() => {
    fetchOrganizations();
    fetchTeams();
    fetchUsers();
  }, [organizationId, teamId]);

  // Fetch organizations from the API
  const fetchOrganizations = async () => {
    if (!hasPermission('organization', 'read')) return;
    
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
        description: 'Failed to load organizations.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch teams from the API
  const fetchTeams = async () => {
    if (!hasPermission('team', 'read')) return;
    
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
        description: 'Failed to load teams.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch users from the API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let url = '/api/users';
      
      if (organizationId) {
        url += `?organization_id=${organizationId}`;
      } else if (teamId) {
        url += `?team_id=${teamId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    onOpen();
  };

  // Handle editing a user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  // Handle deleting a user
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle confirming user deletion
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      toast({
        title: 'Success',
        description: `User ${selectedUser.name} has been deleted.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Handle saving user (create or update)
  const handleSaveUser = async (userData: Partial<User>) => {
    const isEditing = !!selectedUser;
    const url = isEditing 
      ? `/api/users/${selectedUser.id}` 
      : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} user`);
      }
      
      const savedUser = await response.json();
      
      if (isEditing) {
        setUsers(users.map((user) => 
          user.id === savedUser.id ? savedUser : user
        ));
      } else {
        setUsers([...users, savedUser]);
      }
      
      toast({
        title: 'Success',
        description: `User ${savedUser.name} has been ${isEditing ? 'updated' : 'created'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} user. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      // Update the user in the list
      setUsers(users.map((user) => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Get organization name by ID
  const getOrganizationName = (organizationId?: number): string => {
    if (!organizationId) return '-';
    const organization = organizations.find((org) => org.id === organizationId);
    return organization?.name || '-';
  };

  // Get team name by ID
  const getTeamName = (teamId?: number): string => {
    if (!teamId) return '-';
    const team = teams.find((team) => team.id === teamId);
    return team?.name || '-';
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'purple';
      case 'member':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Handle selecting a user
  const handleSelectUser = (user: User) => {
    if (onSelectUser) {
      onSelectUser(user);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Users</Heading>
        <PermissionGate resourceType="user" action="create">
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="blue" 
            onClick={handleCreateUser}
          >
            New User
          </Button>
        </PermissionGate>
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" my={8}>
          <Spinner size="xl" />
        </Flex>
      ) : users.length === 0 ? (
        <Text mt={4} textAlign="center">
          No users found. {canCreate ? 'Create one to get started.' : ''}
        </Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              {!organizationId && <Th>Organization</Th>}
              {!teamId && <Th>Team</Th>}
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr
                key={user.id}
                _hover={{ bg: 'gray.50', cursor: onSelectUser ? 'pointer' : 'default' }}
                onClick={() => handleSelectUser(user)}
              >
                <Td fontWeight="medium">{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  {canAssignRoles ? (
                    <Select
                      value={user.role}
                      size="sm"
                      width="120px"
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRoleChange(user.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="guest">Guest</option>
                    </Select>
                  ) : (
                    <Badge colorScheme={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  )}
                </Td>
                {!organizationId && (
                  <Td>{getOrganizationName(user.organization_id)}</Td>
                )}
                {!teamId && (
                  <Td>{getTeamName(user.team_id)}</Td>
                )}
                <Td isNumeric>
                  <HStack justify="flex-end">
                    <PermissionGate resourceType="user" action="update">
                      <IconButton
                        aria-label="Edit user"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUser(user);
                        }}
                      />
                    </PermissionGate>
                    <PermissionGate resourceType="user" action="delete">
                      <IconButton
                        aria-label="Delete user"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(user);
                        }}
                      />
                    </PermissionGate>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      
      {/* User create/edit modal */}
      <UserModal
        isOpen={isOpen}
        onClose={onClose}
        user={selectedUser}
        organizations={organizations}
        teams={teams}
        onSave={handleSaveUser}
      />
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
      />
    </Box>
  );
};

export default UserManagement;
