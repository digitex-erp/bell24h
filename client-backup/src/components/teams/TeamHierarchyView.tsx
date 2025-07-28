import React, { useEffect, useState } from 'react';
import { useTeams } from '../../hooks/use-teams';
import { Spinner, Card, Text, Flex, Box, Heading, Button, Avatar, Badge, useColorModeValue } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface TeamHierarchyProps {
  rootTeamId?: number;
  onTeamSelect?: (teamId: number) => void;
}

interface TeamNodeProps {
  team: any;
  level: number;
  expanded: Record<number, boolean>;
  toggleExpand: (teamId: number) => void;
  onTeamSelect?: (teamId: number) => void;
  teamLeaders?: Record<number, any[]>;
}

// Single team node in the hierarchy
const TeamNode: React.FC<TeamNodeProps> = ({ 
  team, 
  level, 
  expanded, 
  toggleExpand, 
  onTeamSelect,
  teamLeaders
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hasChildren = team.children && team.children.length > 0;
  const isExpanded = expanded[team.id];
  
  // Get team leaders
  const leaders = teamLeaders?.[team.id] || [];
  
  return (
    <Box ml={`${level * 20}px`} mb={2}>
      <Flex 
        p={3} 
        bg={bgColor} 
        borderRadius="md" 
        borderWidth="1px"
        borderColor={borderColor}
        alignItems="center"
        onClick={() => onTeamSelect?.(team.id)}
        cursor={onTeamSelect ? "pointer" : "default"}
        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
      >
        {hasChildren && (
          <Box mr={2} onClick={(e) => { 
            e.stopPropagation();
            toggleExpand(team.id); 
          }}>
            {isExpanded ? <ChevronDownIcon boxSize={5} /> : <ChevronRightIcon boxSize={5} />}
          </Box>
        )}
        <Box flex="1">
          <Text fontWeight="bold">{team.name}</Text>
          {team.description && (
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
              {team.description}
            </Text>
          )}
        </Box>
        <Flex>
          {leaders.length > 0 && (
            <Flex alignItems="center" mr={3}>
              <Avatar 
                size="xs" 
                name={leaders[0].username} 
                mr={1}
              />
              {leaders.length > 1 && (
                <Badge colorScheme="blue" ml={1}>+{leaders.length-1}</Badge>
              )}
            </Flex>
          )}
          <Badge colorScheme="green">
            Level {team.hierarchy_level}
          </Badge>
        </Flex>
      </Flex>
      
      {hasChildren && isExpanded && (
        <Box mt={2}>
          {team.children.map((child: any) => (
            <TeamNode 
              key={child.id}
              team={child}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onTeamSelect={onTeamSelect}
              teamLeaders={teamLeaders}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Main team hierarchy visualization component
export const TeamHierarchyView: React.FC<TeamHierarchyProps> = ({ rootTeamId, onTeamSelect }) => {
  const { 
    fetchTeamHierarchy,
    fetchTeamMembers,
    loading, 
    error, 
    teamHierarchy 
  } = useTeams();
  
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [teamLeaders, setTeamLeaders] = useState<Record<number, any[]>>({});
  
  // Fetch the hierarchy data when the component mounts
  useEffect(() => {
    if (rootTeamId) {
      fetchTeamHierarchy(rootTeamId);
    }
  }, [rootTeamId, fetchTeamHierarchy]);
  
  // Fetch team leaders for each visible team
  useEffect(() => {
    if (!teamHierarchy) return;
    
    const fetchLeaders = async (team: any) => {
      const members = await fetchTeamMembers(team.id);
      if (members) {
        const leaders = members.filter((m: any) => m.role === 'leader');
        setTeamLeaders(prev => ({
          ...prev,
          [team.id]: leaders
        }));
      }
      
      if (team.children && expanded[team.id]) {
        for (const child of team.children) {
          await fetchLeaders(child);
        }
      }
    };
    
    fetchLeaders(teamHierarchy);
  }, [teamHierarchy, expanded, fetchTeamMembers]);
  
  // Toggle expansion of a team to show its children
  const toggleExpand = (teamId: number) => {
    setExpanded(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };
  
  // Expand all teams
  const expandAll = () => {
    if (!teamHierarchy) return;
    
    const allExpanded: Record<number, boolean> = {};
    
    const traverse = (team: any) => {
      allExpanded[team.id] = true;
      if (team.children) {
        team.children.forEach((child: any) => traverse(child));
      }
    };
    
    traverse(teamHierarchy);
    setExpanded(allExpanded);
  };
  
  // Collapse all teams
  const collapseAll = () => {
    setExpanded({});
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Card p={4} bg="red.50" color="red.800" borderRadius="md">
        <Text>Error loading team hierarchy: {error}</Text>
      </Card>
    );
  }
  
  if (!teamHierarchy) {
    return (
      <Card p={4} bg="gray.50" borderRadius="md">
        <Text>No team hierarchy data available.</Text>
      </Card>
    );
  }
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Team Hierarchy</Heading>
        <Flex>
          <Button size="sm" onClick={expandAll} mr={2}>
            Expand All
          </Button>
          <Button size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </Flex>
      </Flex>
      
      <Box overflowX="auto">
        <TeamNode 
          team={teamHierarchy}
          level={0}
          expanded={expanded}
          toggleExpand={toggleExpand}
          onTeamSelect={onTeamSelect}
          teamLeaders={teamLeaders}
        />
      </Box>
    </Box>
  );
};
