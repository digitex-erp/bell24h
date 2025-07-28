import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Avatar,
  Text,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { FaUserShield, FaUser, FaEye } from 'react-icons/fa';
import { Team, TeamMember, User } from '../../types/teams';

interface TeamMembersManagementProps {
  team?: Team;
  members: TeamMember[];
  isLoading: boolean;
  canManage: boolean;
  onAddMember: (userData: { user_id: string; role: string; is_team_admin: boolean }) => Promise<void>;
  onUpdateMember: (userId: string, updates: { role: string; is_team_admin: boolean }) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onSearch: (query: string) => Promise<User[]>;
}

/**
 * Component for managing team members
 */
const TeamMembersManagement: React.FC<TeamMembersManagementProps> = ({
  team,
  members,
  isLoading,
  canManage,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onSearch,
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('member');
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Function to handle user search
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Failed to search for users',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to handle adding a new member
  const handleAddMember = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await onAddMember({
        user_id: selectedUser.id,
        role,
        is_team_admin: isTeamAdmin,
      });
      
      toast({
        title: 'Member Added',
        description: `${selectedUser.name || selectedUser.email} has been added to the team`,
        status: 'success',
        duration: 5000,
      });
      
      onClose();
      setSelectedUser(null);
      setRole('member');
      setIsTeamAdmin(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle updating a member's role
  const handleUpdateMember = async (userId: string, newRole: string, newIsAdmin: boolean) => {
    try {
      await onUpdateMember(userId, {
        role: newRole,
        is_team_admin: newIsAdmin,
      });
      
      toast({
        title: 'Member Updated',
        description: 'Member role has been updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Function to handle removing a member
  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }
    
    try {
      await onRemoveMember(userId);
      
      toast({
        title: 'Member Removed',
        description: `${userName} has been removed from the team`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <>
      <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold">Team Members</Text>
          {canManage && (
            <Button 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              size="sm"
              onClick={onOpen}
            >
              Add Member
            </Button>
          )}
        </Flex>
        
        {isLoading ? (
          <Flex justify="center" align="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : members.length === 0 ? (
          <Flex direction="column" alignItems="center" justifyContent="center" py={4}>
            <Text color="gray.500" mb={4}>No members in this team yet</Text>
            {canManage && (
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={onOpen}
              >
                Add Member
              </Button>
            )}
          </Flex>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Member</Th>
                <Th>Role</Th>
                <Th>Admin</Th>
                {canManage && <Th width="100px">Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {members.map((member) => (
                <Tr key={member.user_id}>
                  <Td>
                    <Flex align="center">
                      <Avatar size="sm" name={member.user?.name || ''} src={member.user?.avatar || ''} mr={2} />
                      <Box>
                        <Text fontWeight="medium">{member.user?.name || 'Unknown User'}</Text>
                        <Text fontSize="sm" color="gray.500">{member.user?.email}</Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    {canManage ? (
                      <Select
                        value={member.role}
                        size="sm"
                        width="120px"
                        onChange={(e) => handleUpdateMember(
                          member.user_id,
                          e.target.value,
                          member.is_team_admin
                        )}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </Select>
                    ) : (
                      <Badge colorScheme={
                        member.role === 'admin' ? 'purple' :
                        member.role === 'member' ? 'blue' : 'gray'
                      }>
                        {member.role}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {canManage ? (
                      <Menu>
                        <MenuButton
                          as={Button}
                          size="sm"
                          rightIcon={<ChevronDownIcon />}
                          colorScheme={member.is_team_admin ? "purple" : "gray"}
                        >
                          {member.is_team_admin ? 'Yes' : 'No'}
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            icon={<FaUserShield />}
                            onClick={() => handleUpdateMember(
                              member.user_id,
                              member.role,
                              true
                            )}
                            color={member.is_team_admin ? "purple.500" : undefined}
                            fontWeight={member.is_team_admin ? "bold" : "normal"}
                          >
                            Team Administrator
                          </MenuItem>
                          <MenuItem
                            icon={<FaUser />}
                            onClick={() => handleUpdateMember(
                              member.user_id,
                              member.role,
                              false
                            )}
                            color={!member.is_team_admin ? "gray.500" : undefined}
                            fontWeight={!member.is_team_admin ? "bold" : "normal"}
                          >
                            Regular Member
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    ) : (
                      <Badge colorScheme={member.is_team_admin ? "purple" : "gray"}>
                        {member.is_team_admin ? 'Admin' : 'No'}
                      </Badge>
                    )}
                  </Td>
                  {canManage && (
                    <Td>
                      <IconButton
                        aria-label="Remove member"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveMember(
                          member.user_id,
                          member.user?.name || member.user?.email || 'this member'
                        )}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
      
      {/* Add member modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Team Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Search User</FormLabel>
              <Flex>
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  mr={2}
                />
                <Button
                  onClick={handleSearch}
                  isLoading={isSearching}
                >
                  Search
                </Button>
              </Flex>
            </FormControl>
            
            {searchResults.length > 0 && (
              <Box mb={4} borderWidth="1px" borderRadius="md" maxHeight="200px" overflowY="auto">
                {searchResults.map((user) => (
                  <Flex
                    key={user.id}
                    p={2}
                    alignItems="center"
                    cursor="pointer"
                    bg={selectedUser?.id === user.id ? 'blue.50' : undefined}
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar size="sm" name={user.name || ''} src={user.avatar || ''} mr={2} />
                    <Box>
                      <Text fontWeight="medium">{user.name || 'Unnamed User'}</Text>
                      <Text fontSize="sm" color="gray.500">{user.email}</Text>
                    </Box>
                  </Flex>
                ))}
              </Box>
            )}
            
            {selectedUser && (
              <Box p={3} mb={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                <Text fontWeight="bold">Selected User:</Text>
                <Flex alignItems="center" mt={1}>
                  <Avatar size="sm" name={selectedUser.name || ''} src={selectedUser.avatar || ''} mr={2} />
                  <Box>
                    <Text>{selectedUser.name || 'Unnamed User'}</Text>
                    <Text fontSize="sm">{selectedUser.email}</Text>
                  </Box>
                </Flex>
              </Box>
            )}
            
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </Select>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Team Administrator</FormLabel>
              <Select
                value={isTeamAdmin ? 'yes' : 'no'}
                onChange={(e) => setIsTeamAdmin(e.target.value === 'yes')}
              >
                <option value="yes">Yes - Can manage team and members</option>
                <option value="no">No - Regular role permissions only</option>
              </Select>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAddMember}
              isLoading={isSubmitting}
              isDisabled={!selectedUser}
            >
              Add Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeamMembersManagement;
