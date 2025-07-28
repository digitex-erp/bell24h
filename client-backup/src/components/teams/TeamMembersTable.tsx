import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Button,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Avatar,
  Text,
  Badge,
  IconButton,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useTeams } from '../../hooks/use-teams';
import { useOrganizations } from '../../hooks/use-organizations';
import { format } from 'date-fns';

interface TeamMembersTableProps {
  teamId: number;
  canManage: boolean;
}

export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({ teamId, canManage }) => {
  const {
    teamMembers,
    fetchTeamMembers,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember
  } = useTeams();
  
  const { fetchOrganizationMembers } = useOrganizations();
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newMemberId, setNewMemberId] = useState<number | ''>('');
  const [newMemberRole, setNewMemberRole] = useState<'leader' | 'member'>('member');
  const [editRole, setEditRole] = useState<'leader' | 'member'>('member');
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onClose: onRemoveClose } = useDisclosure();
  
  const toast = useToast();
  const tableBackground = useColorModeValue('white', 'gray.800');
  const headerBackground = useColorModeValue('gray.50', 'gray.700');
  
  // Load team members
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const data = await fetchTeamMembers(teamId);
        if (data) {
          setMembers(data);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load team members');
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId) {
      loadMembers();
    }
  }, [teamId, fetchTeamMembers]);
  
  // Load available organization members for adding to the team
  useEffect(() => {
    const loadOrganizationMembers = async () => {
      if (!teamId) return;
      
      try {
        // Get the first member's data to find the organization ID
        if (members.length > 0) {
          const orgId = members[0].organization_id;
          const orgMembers = await fetchOrganizationMembers(orgId);
          
          // Filter out members who are already in the team
          const teamMemberIds = members.map(m => m.user_id);
          const availableMembers = orgMembers.filter(
            m => !teamMemberIds.includes(m.user_id)
          );
          
          setOrganizationMembers(availableMembers);
        }
      } catch (err: any) {
        console.error('Failed to load organization members:', err);
      }
    };
    
    loadOrganizationMembers();
  }, [members, teamId, fetchOrganizationMembers]);
  
  // Handle adding a new member
  const handleAddMember = async () => {
    if (!newMemberId) {
      toast({
        title: 'Error',
        description: 'Please select a member to add',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      await addTeamMember(teamId, {
        user_id: Number(newMemberId),
        role: newMemberRole
      });
      
      // Refresh the members list
      const updatedMembers = await fetchTeamMembers(teamId);
      if (updatedMembers) {
        setMembers(updatedMembers);
      }
      
      onAddClose();
      setNewMemberId('');
      setNewMemberRole('member');
      
      toast({
        title: 'Success',
        description: 'Member added to the team',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add member',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle updating a member's role
  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    
    try {
      await updateTeamMemberRole(teamId, selectedMember.user_id, editRole);
      
      // Refresh the members list
      const updatedMembers = await fetchTeamMembers(teamId);
      if (updatedMembers) {
        setMembers(updatedMembers);
      }
      
      onEditClose();
      setSelectedMember(null);
      
      toast({
        title: 'Success',
        description: 'Member role updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update member role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle removing a member
  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    try {
      await removeTeamMember(teamId, selectedMember.user_id);
      
      // Refresh the members list
      const updatedMembers = await fetchTeamMembers(teamId);
      if (updatedMembers) {
        setMembers(updatedMembers);
      }
      
      onRemoveClose();
      setSelectedMember(null);
      
      toast({
        title: 'Success',
        description: 'Member removed from the team',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove member',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Open edit modal with selected member data
  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setEditRole(member.role);
    onEditOpen();
  };
  
  // Open remove modal with selected member data
  const openRemoveModal = (member: any) => {
    setSelectedMember(member);
    onRemoveOpen();
  };
  
  if (loading) {
    return (
      <Flex justify="center" p={4}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" mb={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      {canManage && (
        <HStack mb={4} justifyContent="flex-end">
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onAddOpen}>
            Add Member
          </Button>
        </HStack>
      )}
      
      <Box boxShadow="sm" borderRadius="md" overflow="hidden">
        <Table variant="simple" bg={tableBackground}>
          <Thead bg={headerBackground}>
            <Tr>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th>Joined</Th>
              {canManage && <Th width="100px">Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {members.length === 0 ? (
              <Tr>
                <Td colSpan={canManage ? 4 : 3} textAlign="center" py={4}>
                  No members found
                </Td>
              </Tr>
            ) : (
              members.map(member => (
                <Tr key={member.id}>
                  <Td>
                    <Flex alignItems="center">
                      <Avatar size="sm" name={member.username} mr={2} />
                      <Box>
                        <Text fontWeight="medium">{member.username}</Text>
                        <Text fontSize="sm" color="gray.500">{member.email}</Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Badge colorScheme={member.role === 'leader' ? 'green' : 'blue'}>
                      {member.role}
                    </Badge>
                    {member.inherited_from_team_id && (
                      <Badge ml={2} colorScheme="purple" fontSize="xs">
                        Inherited
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {format(new Date(member.joined_at), 'MMM d, yyyy')}
                  </Td>
                  {canManage && (
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Edit role"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(member)}
                          isDisabled={!!member.inherited_from_team_id}
                        />
                        <IconButton
                          aria-label="Remove member"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openRemoveModal(member)}
                          isDisabled={!!member.inherited_from_team_id}
                        />
                      </HStack>
                    </Td>
                  )}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Add Member Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Team Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Member</FormLabel>
              <Select 
                placeholder="Select member" 
                value={newMemberId} 
                onChange={(e) => setNewMemberId(e.target.value ? Number(e.target.value) : '')}
              >
                {organizationMembers.map(member => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.username} ({member.email})
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select 
                value={newMemberRole} 
                onChange={(e) => setNewMemberRole(e.target.value as 'leader' | 'member')}
              >
                <option value="member">Member</option>
                <option value="leader">Leader</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddMember}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Edit Role Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Member Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMember && (
              <>
                <Text mb={4}>
                  Change role for <strong>{selectedMember.username}</strong>
                </Text>
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value as 'leader' | 'member')}
                  >
                    <option value="member">Member</option>
                    <option value="leader">Leader</option>
                  </Select>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateRole}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Remove Member Modal */}
      <Modal isOpen={isRemoveOpen} onClose={onRemoveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remove Team Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMember && (
              <Text>
                Are you sure you want to remove <strong>{selectedMember.username}</strong> from this team?
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRemoveClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRemoveMember}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
