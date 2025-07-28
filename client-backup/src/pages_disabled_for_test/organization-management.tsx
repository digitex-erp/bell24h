import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  Divider,
  useToast,
  Flex,
} from '@chakra-ui/react';
import OrganizationList from '../components/organization/OrganizationList';
import TeamList from '../components/team/TeamList';
import UserManagement from '../components/user/UserManagement';
import PermissionGate from '../components/common/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';

// Type definitions
interface Organization {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
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

const OrganizationManagement: React.FC = () => {
  // State management
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Toast notifications
  const toast = useToast();
  
  // Check permissions
  const { hasPermission, userRole } = usePermissions();
  
  // Handle organization selection
  const handleSelectOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setSelectedTeam(null);
    // Switch to team tab
    setActiveTab(1);
  };
  
  // Handle team selection
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    // Switch to users tab
    setActiveTab(2);
  };
  
  // Check if user can access admin panel
  const canAccessAdminPanel = hasPermission('organization', 'read') || 
                             hasPermission('team', 'read') || 
                             hasPermission('user', 'read');
  
  if (!canAccessAdminPanel) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={4}>Organization Management</Heading>
        <Divider mb={8} />
        <Box p={8} textAlign="center">
          <Heading size="md" mb={4} color="red.500">Access Denied</Heading>
          <Text>You don't have permission to access this section.</Text>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={2}>Organization Management</Heading>
      <Text color="gray.600" mb={4}>Manage organizations, teams, and users in your Bell24H marketplace.</Text>
      <Divider mb={8} />
      
      <Tabs index={activeTab} onChange={setActiveTab} isLazy>
        <TabList>
          <PermissionGate resourceType="organization" action="read">
            <Tab>Organizations</Tab>
          </PermissionGate>
          <PermissionGate resourceType="team" action="read">
            <Tab isDisabled={activeTab !== 1 && !selectedOrganization}>Teams</Tab>
          </PermissionGate>
          <PermissionGate resourceType="user" action="read">
            <Tab isDisabled={activeTab !== 2 && !(selectedOrganization || selectedTeam)}>Users</Tab>
          </PermissionGate>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <PermissionGate resourceType="organization" action="read">
              <OrganizationList onSelectOrganization={handleSelectOrganization} />
            </PermissionGate>
          </TabPanel>
          
          <TabPanel>
            <PermissionGate resourceType="team" action="read">
              {selectedOrganization ? (
                <Box mb={4}>
                  <Flex align="center" mb={4}>
                    <Heading size="md" mr={2}>Teams for {selectedOrganization.name}</Heading>
                  </Flex>
                  <TeamList 
                    organizationId={selectedOrganization.id} 
                    onSelectTeam={handleSelectTeam} 
                  />
                </Box>
              ) : (
                <Box textAlign="center" p={8}>
                  <Text>Please select an organization to view its teams.</Text>
                </Box>
              )}
            </PermissionGate>
          </TabPanel>
          
          <TabPanel>
            <PermissionGate resourceType="user" action="read">
              {selectedTeam ? (
                <Box mb={4}>
                  <Heading size="md" mb={4}>Users in {selectedTeam.name}</Heading>
                  <UserManagement teamId={selectedTeam.id} />
                </Box>
              ) : selectedOrganization ? (
                <Box mb={4}>
                  <Heading size="md" mb={4}>Users in {selectedOrganization.name}</Heading>
                  <UserManagement organizationId={selectedOrganization.id} />
                </Box>
              ) : (
                <Box textAlign="center" p={8}>
                  <Text>Please select an organization or team to view its users.</Text>
                </Box>
              )}
            </PermissionGate>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default OrganizationManagement;
