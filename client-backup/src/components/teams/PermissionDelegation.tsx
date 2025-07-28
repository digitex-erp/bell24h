import React, { useState, useEffect } from 'react';
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
  Checkbox,
  useToast,
  useColorModeValue,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon, AddIcon, TimeIcon } from '@chakra-ui/icons';
import { FaUserShield, FaUser, FaExchangeAlt, FaCalendarAlt } from 'react-icons/fa';
import { Delegation, ResourceType, PermissionType, User } from '../../types/permissions';
import { format } from 'date-fns';

interface PermissionDelegationProps {
  delegationsFromMe: Delegation[];
  delegationsToMe: Delegation[];
  isLoading: boolean;
  onCreateDelegation: (data: {
    to_user_id: string;
    resource_type: string;
    resource_id?: string;
    permission: string;
    expires_at?: string;
  }) => Promise<void>;
  onUpdateDelegation: (
    delegationId: string,
    updates: {
      is_active: boolean;
      expires_at?: string | null;
    }
  ) => Promise<void>;
  onDeleteDelegation: (delegationId: string) => Promise<void>;
  onSearch: (query: string) => Promise<User[]>;
  resourceTypes: ResourceType[];
  permissionTypes: PermissionType[];
}

/**
 * Component for managing permission delegations
 */
const PermissionDelegation: React.FC<PermissionDelegationProps> = ({
  delegationsFromMe,
  delegationsToMe,
  isLoading,
  onCreateDelegation,
  onUpdateDelegation,
  onDeleteDelegation,
  onSearch,
  resourceTypes,
  permissionTypes,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState<'fromMe' | 'toMe'>('fromMe');
  
  // Form state for creating a new delegation
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resourceType, setResourceType] = useState<string>('');
  const [resourceId, setResourceId] = useState<string>('');
  const [permission, setPermission] = useState<string>('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get tomorrow's date formatted for date input
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpiryDate(tomorrow.toISOString().split('T')[0]);
  }, []);
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tabBg = useColorModeValue('gray.50', 'gray.700');
  const tabActiveBg = useColorModeValue('white', 'gray.800');
  
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
  
  // Function to handle creating a new delegation
  const handleCreateDelegation = async () => {
    if (!selectedUser || !resourceType || !permission) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onCreateDelegation({
        to_user_id: selectedUser.id,
        resource_type: resourceType,
        resource_id: resourceId || undefined,
        permission,
        expires_at: hasExpiry ? expiryDate : undefined,
      });
      
      toast({
        title: 'Delegation Created',
        description: `Permission delegated to ${selectedUser.name || selectedUser.email}`,
        status: 'success',
        duration: 5000,
      });
      
      onClose();
      setSelectedUser(null);
      setResourceType('');
      setResourceId('');
      setPermission('');
      setHasExpiry(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create delegation',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to toggle a delegation's active status
  const handleToggleActive = async (delegation: Delegation) => {
    try {
      await onUpdateDelegation(delegation.id, {
        is_active: !delegation.is_active,
      });
      
      toast({
        title: delegation.is_active ? 'Delegation Deactivated' : 'Delegation Activated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update delegation',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Function to remove a delegation
  const handleRemoveDelegation = async (delegationId: string) => {
    if (!confirm('Are you sure you want to remove this delegation?')) {
      return;
    }
    
    try {
      await onDeleteDelegation(delegationId);
      
      toast({
        title: 'Delegation Removed',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove delegation',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Helper to format dates
  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'Never';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get the currently active delegations
  const activeDelegations = activeTab === 'fromMe' ? delegationsFromMe : delegationsToMe;
  
  return (
    <>
      <Box>
        <Flex mb={4}>
          <Button
            flex={1}
            bg={activeTab === 'fromMe' ? tabActiveBg : tabBg}
            borderTopLeftRadius="md"
            borderBottomLeftRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRightWidth={activeTab === 'fromMe' ? '1px' : '0'}
            py={3}
            fontWeight={activeTab === 'fromMe' ? 'bold' : 'normal'}
            onClick={() => setActiveTab('fromMe')}
            leftIcon={<FaExchangeAlt />}
          >
            Delegated By Me
          </Button>
          <Button
            flex={1}
            bg={activeTab === 'toMe' ? tabActiveBg : tabBg}
            borderTopRightRadius="md"
            borderBottomRightRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderLeftWidth={activeTab === 'toMe' ? '1px' : '0'}
            py={3}
            fontWeight={activeTab === 'toMe' ? 'bold' : 'normal'}
            onClick={() => setActiveTab('toMe')}
            leftIcon={<FaUser />}
          >
            Delegated To Me
          </Button>
        </Flex>
        
        <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              {activeTab === 'fromMe' ? 'Permissions I Delegated' : 'Permissions Delegated To Me'}
            </Text>
            {activeTab === 'fromMe' && (
              <Button 
                leftIcon={<AddIcon />} 
                colorScheme="blue" 
                size="sm"
                onClick={onOpen}
              >
                Delegate Permission
              </Button>
            )}
          </Flex>
          
          {isLoading ? (
            <Flex justify="center" align="center" p={8}>
              <Spinner size="lg" />
            </Flex>
          ) : activeDelegations.length === 0 ? (
            <Flex direction="column" alignItems="center" justifyContent="center" py={4}>
              <Text color="gray.500" mb={4}>
                {activeTab === 'fromMe' 
                  ? 'You have not delegated any permissions yet'
                  : 'No permissions have been delegated to you'}
              </Text>
              {activeTab === 'fromMe' && (
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={onOpen}
                >
                  Delegate Permission
                </Button>
              )}
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>{activeTab === 'fromMe' ? 'Delegated To' : 'Delegated By'}</Th>
                  <Th>Resource Type</Th>
                  <Th>Resource ID</Th>
                  <Th>Permission</Th>
                  <Th>Status</Th>
                  <Th>Expires</Th>
                  {activeTab === 'fromMe' && <Th width="100px">Actions</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {activeDelegations.map((delegation) => (
                  <Tr key={delegation.id}>
                    <Td>
                      <Flex align="center">
                        <Avatar 
                          size="sm" 
                          name={
                            activeTab === 'fromMe'
                              ? delegation.to_user?.name || ''
                              : delegation.from_user?.name || ''
                          } 
                          src={
                            activeTab === 'fromMe'
                              ? delegation.to_user?.avatar || ''
                              : delegation.from_user?.avatar || ''
                          }
                          mr={2} 
                        />
                        <Box>
                          <Text fontWeight="medium">
                            {activeTab === 'fromMe'
                              ? delegation.to_user?.name || 'Unknown User'
                              : delegation.from_user?.name || 'Unknown User'
                            }
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {activeTab === 'fromMe'
                              ? delegation.to_user?.email
                              : delegation.from_user?.email
                            }
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple">
                        {delegation.resource_type}
                      </Badge>
                    </Td>
                    <Td>
                      {delegation.resource_id || (
                        <Text fontSize="sm" fontStyle="italic" color="gray.500">
                          All resources
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">
                        {delegation.permission}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={delegation.is_active ? 'green' : 'red'}
                      >
                        {delegation.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <Tooltip label={delegation.expires_at ? format(new Date(delegation.expires_at), 'PPP') : 'Never expires'}>
                        <Flex align="center">
                          {delegation.expires_at && <TimeIcon mr={1} />}
                          <Text>{formatDate(delegation.expires_at)}</Text>
                        </Flex>
                      </Tooltip>
                    </Td>
                    {activeTab === 'fromMe' && (
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Actions"
                            icon={<ChevronDownIcon />}
                            variant="outline"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={delegation.is_active ? <DeleteIcon /> : <AddIcon />}
                              onClick={() => handleToggleActive(delegation)}
                            >
                              {delegation.is_active ? 'Deactivate' : 'Activate'}
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon />}
                              color="red.500"
                              onClick={() => handleRemoveDelegation(delegation.id)}
                            >
                              Remove Delegation
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Box>
      
      {/* New delegation modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delegate Permission</ModalHeader>
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
            
            <FormControl mb={4} isRequired>
              <FormLabel>Resource Type</FormLabel>
              <Select
                placeholder="Select resource type"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Resource ID (Optional)</FormLabel>
              <Input
                placeholder="Leave empty to apply to all resources of this type"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Leave empty to delegate permission for all resources of the selected type
              </Text>
            </FormControl>
            
            <FormControl mb={4} isRequired>
              <FormLabel>Permission</FormLabel>
              <Select
                placeholder="Select permission"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                {permissionTypes.map((perm) => (
                  <option key={perm.id} value={perm.id}>
                    {perm.name} - {perm.description}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl mb={4}>
              <Checkbox
                isChecked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
              >
                Set expiration date
              </Checkbox>
            </FormControl>
            
            {hasExpiry && (
              <FormControl mb={4}>
                <FormLabel>Expires On</FormLabel>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </FormControl>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateDelegation}
              isLoading={isSubmitting}
              isDisabled={!selectedUser || !resourceType || !permission}
            >
              Create Delegation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PermissionDelegation;
