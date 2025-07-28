import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  useToast,
  Skeleton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Button,
  Text,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/tabs';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/modal';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/alert';
import { ChevronRightIcon, AddIcon } from '@chakra-ui/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Import components
import TeamHierarchyTree from '../components/teams/TeamHierarchyTree.js';
import TeamMembersManagement from '../components/teams/TeamMembersManagement.js';
import PermissionDelegation from '../components/teams/PermissionDelegation.js';

// Import services and types
import TeamService from '../services/team-service.js';
import DelegationService from '../services/delegation-service.js';
import { Team, TeamMember } from '../types/teams.js';
import { Delegation, RESOURCE_TYPES, PERMISSION_TYPES } from '../types/permissions.js';

interface TeamManagementPageProps {
  organizationId?: string;
}

/**
 * Team Management Page
 * 
 * Comprehensive interface for managing teams, members, and permission delegations
 */
const TeamManagementPage: React.FC<TeamManagementPageProps> = ({ organizationId: propOrgId }) => {
  const { organizationId: paramOrgId } = useParams<{ organizationId: string }>();
  const organizationId = propOrgId || paramOrgId || '';
  
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Team state
  const [teamHierarchy, setTeamHierarchy] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // Permission delegations state
  const [delegationsFromMe, setDelegationsFromMe] = useState<Delegation[]>([]);
  const [delegationsToMe, setDelegationsToMe] = useState<Delegation[]>([]);
  const [isLoadingDelegations, setIsLoadingDelegations] = useState(false);
  
  // Team creation/editing modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [parentTeam, setParentTeam] = useState<Team | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    parent_team_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user can manage teams
  const [canManage, setCanManage] = useState(false);
  
  // Fetch teams for organization
  useEffect(() => {
    if (!organizationId) return;
    
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        // Get organization teams and hierarchy
        const response = await TeamService.getOrganizationTeams(organizationId);
        setTeamHierarchy(response.hierarchy || []);
        
        // Check if current user can manage teams in this organization
        const hasPermission = await DelegationService.checkPermission(
          'organization',
          'manage_members',
          organizationId
        );
        setCanManage(hasPermission);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team data',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeams();
  }, [organizationId, toast]);
  
  // Fetch team members when a team is selected
  useEffect(() => {
    if (!selectedTeam) {
      setTeamMembers([]);
      return;
    }
    
    const fetchTeamMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const members = await TeamService.getTeamMembers(selectedTeam.id);
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team members',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    fetchTeamMembers();
  }, [selectedTeam, toast]);
  
  // Fetch permission delegations
  useEffect(() => {
    const fetchDelegations = async () => {
      try {
        setIsLoadingDelegations(true);
        
        // Get delegations from and to the current user
        const [fromMe, toMe] = await Promise.all([
          DelegationService.getDelegationsFromMe(),
          DelegationService.getDelegationsToMe()
        ]);
        
        setDelegationsFromMe(fromMe);
        setDelegationsToMe(toMe);
      } catch (error) {
        console.error('Error fetching delegations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load permission delegations',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingDelegations(false);
      }
    };
    
    fetchDelegations();
  }, [toast]);
  
  // Handler for selecting a team
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };
  
  // Handler for adding/editing a team
  const handleAddEditTeam = (parentTeam?: Team) => {
    if (parentTeam) {
      setParentTeam(parentTeam);
      setTeamFormData({
        ...teamFormData,
        parent_team_id: parentTeam.id
      });
    } else {
      setParentTeam(null);
      setTeamFormData({
        ...teamFormData,
        parent_team_id: ''
      });
    }
    
    setIsEditMode(false);
    onOpen();
  };
  
  // Handler for editing an existing team
  const handleEditTeam = (team: Team) => {
    setTeamFormData({
      name: team.name,
      description: team.description || '',
      parent_team_id: team.parent_team_id || ''
    });
    setSelectedTeam(team);
    setIsEditMode(true);
    onOpen();
  };
  
  // Handler for deleting a team
  const handleDeleteTeam = async (team: Team) => {
    if (!confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
      return;
    }
    
    try {
      await TeamService.deleteTeam(team.id);
      
      toast({
        title: 'Team Deleted',
        description: `Team "${team.name}" has been deleted successfully`,
        status: 'success',
        duration: 3000,
      });
      
      // If we deleted the currently selected team, deselect it
      if (selectedTeam?.id === team.id) {
        setSelectedTeam(null);
      }
      
      // Refresh team hierarchy
      const response = await TeamService.getOrganizationTeams(organizationId);
      setTeamHierarchy(response.hierarchy || []);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete team',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Handler for submitting team form
  const handleSubmitTeamForm = async () => {
    if (!teamFormData.name) {
      toast({
        title: 'Validation Error',
        description: 'Team name is required',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && selectedTeam) {
        // Update existing team
        const updatedTeam = await TeamService.updateTeam(selectedTeam.id, {
          name: teamFormData.name,
          description: teamFormData.description,
          parent_team_id: teamFormData.parent_team_id || null
        });
        
        toast({
          title: 'Team Updated',
          description: `Team "${updatedTeam.name}" has been updated successfully`,
          status: 'success',
          duration: 3000,
        });
        
        // Update selected team with new data
        setSelectedTeam(updatedTeam);
      } else {
        // Create new team
        const newTeam = await TeamService.createTeam({
          name: teamFormData.name,
          description: teamFormData.description,
          organization_id: organizationId,
          parent_team_id: teamFormData.parent_team_id || undefined
        });
        
        toast({
          title: 'Team Created',
          description: `Team "${newTeam.name}" has been created successfully`,
          status: 'success',
          duration: 3000,
        });
        
        // Select the newly created team
        setSelectedTeam(newTeam);
      }
      
      // Refresh team hierarchy
      const response = await TeamService.getOrganizationTeams(organizationId);
      setTeamHierarchy(response.hierarchy || []);
      
      // Close the modal
      onClose();
      
      // Reset form data
      setTeamFormData({
        name: '',
        description: '',
        parent_team_id: ''
      });
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: 'Error',
        description: isEditMode ? 'Failed to update team' : 'Failed to create team',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for adding a team member
  const handleAddTeamMember = async (memberData: { user_id: string; role: string; is_team_admin: boolean }) => {
    if (!selectedTeam) return;
    
    const result = await TeamService.addTeamMember(selectedTeam.id, memberData);
    
    // Refresh members list
    const members = await TeamService.getTeamMembers(selectedTeam.id);
    setTeamMembers(members);
    
    return result;
  };
  
  // Handler for updating a team member
  const handleUpdateTeamMember = async (
    userId: string,
    updates: { role: string; is_team_admin: boolean }
  ) => {
    if (!selectedTeam) return;
    
    const result = await TeamService.updateTeamMember(selectedTeam.id, userId, updates);
    
    // Refresh members list
    const members = await TeamService.getTeamMembers(selectedTeam.id);
    setTeamMembers(members);
    
    return result;
  };
  
  // Handler for removing a team member
  const handleRemoveTeamMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    await TeamService.removeTeamMember(selectedTeam.id, userId);
    
    // Refresh members list
    const members = await TeamService.getTeamMembers(selectedTeam.id);
    setTeamMembers(members);
  };
  
  // Handler for searching users
  const handleSearchUsers = async (query: string) => {
    return TeamService.searchUsers(query);
  };
  
  // Handler for creating a new delegation
  const handleCreateDelegation = async (delegationData: {
    to_user_id: string;
    resource_type: string;
    resource_id?: string;
    permission: string;
    expires_at?: string;
  }) => {
    const result = await DelegationService.createDelegation(delegationData);
    
    // Refresh delegations
    const fromMe = await DelegationService.getDelegationsFromMe();
    setDelegationsFromMe(fromMe);
    
    return result;
  };
  
  // Handler for updating a delegation
  const handleUpdateDelegation = async (
    delegationId: string,
    updates: {
      is_active: boolean;
      expires_at?: string | null;
    }
  ) => {
    const result = await DelegationService.updateDelegation(delegationId, updates);
    
    // Refresh delegations
    const fromMe = await DelegationService.getDelegationsFromMe();
    setDelegationsFromMe(fromMe);
    
    return result;
  };
  
  // Handler for deleting a delegation
  const handleDeleteDelegation = async (delegationId: string) => {
    await DelegationService.deleteDelegation(delegationId);
    
    // Refresh delegations
    const fromMe = await DelegationService.getDelegationsFromMe();
    setDelegationsFromMe(fromMe);
  };
  
  return (
    <Container maxW="container.xl" py={6}>
      <Breadcrumb mb={4} spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/organizations">Organizations</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Team Management</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Heading as="h1" size="xl" mb={6}>Team Management</Heading>
      
      <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={6}>
        {/* Team Hierarchy Sidebar */}
        <GridItem>
          <Skeleton isLoaded={!isLoading}>
            <TeamHierarchyTree
              teams={teamHierarchy}
              onSelectTeam={handleSelectTeam}
              selectedTeam={selectedTeam || undefined}
              onAddTeam={handleAddEditTeam}
              onEditTeam={handleEditTeam}
              onDeleteTeam={handleDeleteTeam}
              canManage={canManage}
              isLoading={isLoading}
            />
          </Skeleton>
        </GridItem>
        
        {/* Main Content Area */}
        <GridItem>
          {selectedTeam ? (
            <Box>
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading as="h2" size="lg">
                  {selectedTeam.name}
                </Heading>
                {canManage && (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleEditTeam(selectedTeam)}
                  >
                    Edit Team
                  </Button>
                )}
              </Flex>
              
              {selectedTeam.description && (
                <Text mb={4} color="gray.600">
                  {selectedTeam.description}
                </Text>
              )}
              
              <Tabs mt={4} isLazy>
                <TabList>
                  <Tab>Members</Tab>
                  <Tab>Permissions</Tab>
                  <Tab>Delegations</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Team Members Panel */}
                  <TabPanel pt={4}>
                    <TeamMembersManagement
                      team={selectedTeam}
                      members={teamMembers}
                      isLoading={isLoadingMembers}
                      canManage={canManage}
                      onAddMember={handleAddTeamMember}
                      onUpdateMember={handleUpdateTeamMember}
                      onRemoveMember={handleRemoveTeamMember}
                      onSearch={handleSearchUsers}
                    />
                  </TabPanel>
                  
                  {/* Team Permissions Panel */}
                  <TabPanel pt={4}>
                    {/* Permission management component could go here */}
                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" mb={4}>
                        Team Permissions
                      </Text>
                      <Text>
                        Team permissions determine what resources the team members can access.
                        These permissions are inherited by all team members.
                      </Text>
                      
                      {/* Permission management UI would go here */}
                    </Box>
                  </TabPanel>
                  
                  {/* Delegations Panel */}
                  <TabPanel pt={4}>
                    <PermissionDelegation
                      delegationsFromMe={delegationsFromMe}
                      delegationsToMe={delegationsToMe}
                      isLoading={isLoadingDelegations}
                      onCreateDelegation={handleCreateDelegation}
                      onUpdateDelegation={handleUpdateDelegation}
                      onDeleteDelegation={handleDeleteDelegation}
                      onSearch={handleSearchUsers}
                      resourceTypes={RESOURCE_TYPES}
                      permissionTypes={PERMISSION_TYPES}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          ) : (
            <Box
              p={8}
              borderWidth="1px"
              borderRadius="lg"
              textAlign="center"
              bg="gray.50"
            >
              <Heading as="h3" size="md" mb={2}>
                Select a Team
              </Heading>
              <Text mb={4}>
                Select a team from the sidebar to view and manage its members and permissions
              </Text>
              {canManage && (
                <Button
                  colorScheme="blue"
                  onClick={() => handleAddEditTeam()}
                >
                  Create New Team
                </Button>
              )}
            </Box>
          )}
        </GridItem>
      </Grid>
      
      {/* Team Creation/Editing Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? 'Edit Team' : 'Create New Team'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Team Name</FormLabel>
              <Input
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({
                  ...teamFormData,
                  name: e.target.value
                })}
                placeholder="Enter team name"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={teamFormData.description}
                onChange={(e) => setTeamFormData({
                  ...teamFormData,
                  description: e.target.value
                })}
                placeholder="Enter team description (optional)"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Parent Team</FormLabel>
              <Select
                value={teamFormData.parent_team_id}
                onChange={(e) => setTeamFormData({
                  ...teamFormData,
                  parent_team_id: e.target.value
                })}
                placeholder="Select parent team (optional)"
              >
                {/* Option for no parent team */}
                <option value="">No Parent (Root Team)</option>
                
                {/* Map through all teams except the current team being edited */}
                {teamHierarchy.flatMap(team => {
                  const flattenTeams = (t: Team, depth = 0): { team: Team; depth: number }[] => {
                    return [
                      { team: t, depth },
                      ...(t.children || []).flatMap(child => flattenTeams(child, depth + 1))
                    ];
                  };
                  
                  return flattenTeams(team, 0);
                }).filter(item => !isEditMode || item.team.id !== selectedTeam?.id)
                  .map(item => (
                    <option key={item.team.id} value={item.team.id}>
                      {'│  '.repeat(item.depth)}
                      {item.depth > 0 ? '├─ ' : ''}
                      {item.team.name}
                    </option>
                  ))}
              </Select>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitTeamForm}
              isLoading={isSubmitting}
            >
              {isEditMode ? 'Save Changes' : 'Create Team'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default TeamManagementPage;
