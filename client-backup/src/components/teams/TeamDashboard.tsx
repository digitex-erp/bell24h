import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  IconButton,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useTeams } from '../../hooks/use-teams';
import { useAuth } from '../../hooks/use-auth';
import { TeamHierarchyView } from './TeamHierarchyView';
import { TeamMembersTable } from './TeamMembersTable';
import { TeamForm } from './TeamForm';

export const TeamDashboard: React.FC = () => {
  const { teams, loading, error, fetchTeam, deleteTeam } = useTeams();
  const { user } = useAuth();
  const toast = useToast();
  
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [canManage, setCanManage] = useState(false);
  const [hierarchyRoot, setHierarchyRoot] = useState<number | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure();
  
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure();
  
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  
  const {
    isOpen: isHierarchyOpen,
    onOpen: onHierarchyOpen,
    onClose: onHierarchyClose
  } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  
  // Check if the user can manage the selected team
  const checkManagePermission = useCallback(async (teamId: number) => {
    if (!teamId) {
      setCanManage(false);
      return;
    }
    
    try {
      const team = await fetchTeam(teamId);
      if (team) {
        // Simple permission check - team lead or organization admin
        const isLeader = team.lead_id === user?.id;
        // We would normally call the permission API here
        // This is a simplified check assuming the frontend data has the necessary info
        setCanManage(isLeader);
      }
    } catch (err) {
      console.error('Error checking team permissions:', err);
      setCanManage(false);
    }
  }, [fetchTeam, user]);
  
  // Handle team selection
  const handleSelectTeam = useCallback(async (teamId: number) => {
    const team = await fetchTeam(teamId);
    setSelectedTeam(team);
    checkManagePermission(teamId);
  }, [fetchTeam, checkManagePermission]);
  
  // Handle team creation success
  const handleTeamCreateSuccess = (team: any) => {
    onCreateClose();
    handleSelectTeam(team.id);
    toast({
      title: 'Team Created',
      description: `Team "${team.name}" has been created successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Handle team update success
  const handleTeamUpdateSuccess = (team: any) => {
    onEditClose();
    setSelectedTeam(team);
    toast({
      title: 'Team Updated',
      description: `Team "${team.name}" has been updated successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Handle team deletion
  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    
    setIsDeleting(true);
    try {
      await deleteTeam(selectedTeam.id);
      setSelectedTeam(null);
      onDeleteClose();
      toast({
        title: 'Team Deleted',
        description: `Team "${selectedTeam.name}" has been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete team',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Open hierarchy view modal for a specific team
  const openHierarchyView = (teamId: number) => {
    setHierarchyRoot(teamId);
    onHierarchyOpen();
  };
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Team Management</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen}>
          Create New Team
        </Button>
      </Flex>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {loading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : teams.length === 0 ? (
          <Box p={6} textAlign="center" borderWidth="1px" borderRadius="lg">
            <Text>You don't have any teams yet. Create your first team to get started.</Text>
          </Box>
        ) : (
          teams.map(team => (
            <Card 
              key={team.id} 
              borderWidth="1px" 
              borderColor={selectedTeam?.id === team.id ? 'blue.500' : cardBorder}
              bg={cardBg}
              boxShadow="sm"
              cursor="pointer"
              onClick={() => handleSelectTeam(team.id)}
              transition="all 0.2s"
              _hover={{ boxShadow: 'md' }}
            >
              <CardHeader pb={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">{team.name}</Heading>
                  <Flex>
                    <IconButton
                      aria-label="View hierarchy"
                      icon={<ViewIcon />}
                      size="sm"
                      variant="ghost"
                      mr={1}
                      onClick={(e) => {
                        e.stopPropagation();
                        openHierarchyView(team.id);
                      }}
                    />
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                {team.description && (
                  <Text color="gray.600" noOfLines={2} mb={2}>
                    {team.description}
                  </Text>
                )}
                <Flex mt={2} wrap="wrap" gap={2}>
                  {team.parent_team_id && (
                    <Badge colorScheme="purple">Sub-team</Badge>
                  )}
                  {!team.parent_team_id && (
                    <Badge colorScheme="green">Top-level</Badge>
                  )}
                  <Badge colorScheme="blue">Level {team.hierarchy_level}</Badge>
                </Flex>
              </CardBody>
            </Card>
          ))
        )}
      </SimpleGrid>
      
      {selectedTeam && (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb={6}>
          <Flex 
            p={4} 
            justifyContent="space-between" 
            alignItems="center" 
            bg={useColorModeValue('gray.50', 'gray.700')}
          >
            <Box>
              <Heading size="md">{selectedTeam.name}</Heading>
              {selectedTeam.description && (
                <Text color="gray.600" mt={1}>
                  {selectedTeam.description}
                </Text>
              )}
            </Box>
            {canManage && (
              <Flex>
                <Button
                  leftIcon={<EditIcon />}
                  size="sm"
                  onClick={onEditOpen}
                  mr={2}
                >
                  Edit
                </Button>
                <Button
                  leftIcon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={onDeleteOpen}
                >
                  Delete
                </Button>
              </Flex>
            )}
          </Flex>
          
          <Divider />
          
          <Tabs isLazy>
            <TabList px={4}>
              <Tab>Members</Tab>
              <Tab>Sub-Teams</Tab>
              <Tab>Permissions</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <TeamMembersTable teamId={selectedTeam.id} canManage={canManage} />
              </TabPanel>
              <TabPanel>
                <Button
                  leftIcon={<ViewIcon />}
                  mb={4}
                  onClick={() => openHierarchyView(selectedTeam.id)}
                >
                  View Team Hierarchy
                </Button>
                
                {/* Here you can list sub-teams specifically */}
                <Text>Sub-teams management coming soon</Text>
              </TabPanel>
              <TabPanel>
                <Text>Permission management coming soon</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
      
      {/* Create Team Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TeamForm onSuccess={handleTeamCreateSuccess} onCancel={onCreateClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Edit Team Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTeam && (
              <TeamForm 
                teamId={selectedTeam.id}
                organizationId={selectedTeam.organization_id}
                parentTeamId={selectedTeam.parent_team_id}
                onSuccess={handleTeamUpdateSuccess}
                onCancel={onEditClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Delete Team Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Team</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>
              Are you sure you want to delete the team "{selectedTeam?.name}"? This action cannot be undone.
            </Text>
            <Alert status="warning" mt={4}>
              <AlertIcon />
              <Text>
                Deleting a team will remove all team members and related data. Sub-teams will need to be 
                reassigned or deleted first.
              </Text>
            </Alert>
          </ModalBody>
          <Flex justifyContent="flex-end" p={4}>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteTeam} 
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
      
      {/* Hierarchy View Modal */}
      <Modal isOpen={isHierarchyOpen} onClose={onHierarchyClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Team Hierarchy</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {hierarchyRoot && (
              <TeamHierarchyView 
                rootTeamId={hierarchyRoot} 
                onTeamSelect={(teamId) => {
                  onHierarchyClose();
                  handleSelectTeam(teamId);
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
