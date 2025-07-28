import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  Select,
  Stack,
  Heading,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Flex,
  Text
} from '@chakra-ui/react';
import { useTeams } from '../../hooks/use-teams';
import { useOrganizations } from '../../hooks/use-organizations';

interface TeamFormProps {
  teamId?: number;
  organizationId?: number;
  parentTeamId?: number;
  onSuccess?: (team: any) => void;
  onCancel?: () => void;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  teamId,
  organizationId: defaultOrgId,
  parentTeamId: defaultParentId,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState<number | ''>('');
  const [parentTeamId, setParentTeamId] = useState<number | null | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  
  const { createTeam, updateTeam, fetchTeam, teams } = useTeams();
  const { organizations } = useOrganizations();
  const toast = useToast();
  
  // Load team data if editing
  useEffect(() => {
    const loadTeam = async () => {
      if (teamId) {
        const team = await fetchTeam(teamId);
        if (team) {
          setName(team.name);
          setDescription(team.description || '');
          setOrganizationId(team.organization_id);
          setParentTeamId(team.parent_team_id);
        }
      } else {
        // For new teams, use defaults if provided
        if (defaultOrgId) {
          setOrganizationId(defaultOrgId);
        }
        if (defaultParentId) {
          setParentTeamId(defaultParentId);
        }
      }
    };
    
    loadTeam();
  }, [teamId, fetchTeam, defaultOrgId, defaultParentId]);
  
  // Update available parent teams when organization changes
  useEffect(() => {
    if (organizationId) {
      // Filter teams from the same organization
      const orgTeams = teams.filter(t => t.organization_id === organizationId);
      
      // If editing, exclude current team and its children to prevent circular references
      let availableParents = orgTeams;
      if (teamId) {
        // Simple approach: exclude the team itself
        availableParents = orgTeams.filter(t => t.id !== teamId);
        
        // More complex approach would be to exclude all descendant teams, 
        // but that would require knowing the full hierarchy
      }
      
      setAvailableTeams(availableParents);
    } else {
      setAvailableTeams([]);
    }
  }, [organizationId, teams, teamId]);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    } else if (name.length > 50) {
      newErrors.name = 'Team name must be at most 50 characters';
    }
    
    if (!organizationId) {
      newErrors.organizationId = 'Organization is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const teamData = {
        name,
        description: description || undefined,
        organization_id: Number(organizationId),
        parent_team_id: parentTeamId ? Number(parentTeamId) : undefined
      };
      
      let result;
      
      if (teamId) {
        // Update existing team
        result = await updateTeam(teamId, {
          name,
          description: description || undefined,
          parent_team_id: parentTeamId ? Number(parentTeamId) : null
        });
      } else {
        // Create new team
        result = await createTeam(teamData);
      }
      
      if (result) {
        toast({
          title: teamId ? 'Team updated' : 'Team created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save team',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Heading size="md" mb={6}>
        {teamId ? 'Edit Team' : 'Create New Team'}
      </Heading>
      
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Team Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter team name"
            maxLength={50}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter team description (optional)"
            resize="vertical"
            rows={3}
          />
        </FormControl>
        
        <FormControl isInvalid={!!errors.organizationId} isRequired isDisabled={!!teamId}>
          <FormLabel>Organization</FormLabel>
          <Select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value ? Number(e.target.value) : '')}
            placeholder="Select organization"
            isDisabled={!!teamId} // Can't change organization once created
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.organizationId}</FormErrorMessage>
        </FormControl>
        
        <FormControl>
          <FormLabel>Parent Team (Optional)</FormLabel>
          <Select
            value={parentTeamId === null ? '' : parentTeamId}
            onChange={(e) => setParentTeamId(e.target.value ? Number(e.target.value) : null)}
            placeholder="Select parent team (optional)"
          >
            <option value="">No Parent (Top-Level Team)</option>
            {availableTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Selecting a parent team will place this team in the hierarchy under that team.
          </Text>
        </FormControl>
        
        {parentTeamId && availableTeams.length > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              This team will inherit permissions from its parent team.
            </AlertDescription>
          </Alert>
        )}
      </Stack>
      
      <Flex mt={8} justifyContent="flex-end">
        {onCancel && (
          <Button variant="outline" mr={3} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          colorScheme="blue"
          type="submit"
          isLoading={isSubmitting}
          loadingText={teamId ? 'Updating...' : 'Creating...'}
        >
          {teamId ? 'Update Team' : 'Create Team'}
        </Button>
      </Flex>
    </Box>
  );
};
