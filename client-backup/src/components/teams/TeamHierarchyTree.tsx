import React from 'react';
import { Box, Button, Collapse, Flex, Icon, Text, useDisclosure, useColorModeValue, Badge, Tooltip } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, EditIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaUsers } from 'react-icons/fa';
import { Team } from '../../types/teams.js';

interface TeamNodeProps {
  team: Team;
  level: number;
  onSelect: (team: Team) => void;
  selectedTeam?: Team;
  onAddSubteam?: (parentTeam: Team) => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (team: Team) => void;
  canManage: boolean;
  isLast?: boolean;
}

/**
 * Renders a single team node in the hierarchy tree
 */
const TeamNode: React.FC<TeamNodeProps> = ({
  team,
  level,
  onSelect,
  selectedTeam,
  onAddSubteam,
  onEditTeam,
  onDeleteTeam,
  canManage,
  isLast = false,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: level < 2 });
  const hasChildren = team.children && team.children.length > 0;
  const isSelected = selectedTeam?.id === team.id;
  
  // Visual styles
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  
  return (
    <Box mb={isLast ? 0 : 2}>
      <Flex
        p={3}
        borderRadius="md"
        alignItems="center"
        bg={isSelected ? selectedBgColor : bgColor}
        borderWidth="1px"
        borderColor={isSelected ? 'blue.500' : borderColor}
        _hover={{ bg: hoverBgColor }}
        cursor="pointer"
        onClick={() => onSelect(team)}
        role="group"
      >
        <Flex width="100%" alignItems="center">
          {/* Expand/collapse control */}
          {hasChildren ? (
            <Icon
              as={isOpen ? ChevronDownIcon : ChevronRightIcon}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              cursor="pointer"
              boxSize={5}
              mr={2}
            />
          ) : (
            <Box width={5} mr={2} />
          )}
          
          {/* Team icon and name */}
          <Icon as={FaUsers} mr={2} color="blue.500" />
          <Text fontWeight={isSelected ? 'bold' : 'medium'} flex="1">
            {team.name}
          </Text>
          
          {/* Member count */}
          <Tooltip label="Number of members">
            <Badge colorScheme="blue" mr={2} variant="subtle">
              {team.memberCount || 0} members
            </Badge>
          </Tooltip>
          
          {/* Action buttons */}
          {canManage && (
            <Flex
              opacity={isSelected ? 1 : 0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
            >
              {onEditTeam && (
                <Tooltip label="Edit team">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    icon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTeam(team);
                    }}
                    aria-label="Edit team"
                    mr={1}
                  >
                    <EditIcon />
                  </Button>
                </Tooltip>
              )}
              
              {onAddSubteam && (
                <Tooltip label="Add sub-team">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="green"
                    icon={<AddIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSubteam(team);
                    }}
                    aria-label="Add sub-team"
                    mr={1}
                  >
                    <AddIcon />
                  </Button>
                </Tooltip>
              )}
              
              {onDeleteTeam && !hasChildren && (
                <Tooltip label="Delete team">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    icon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTeam(team);
                    }}
                    aria-label="Delete team"
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
      
      {/* Render children */}
      {hasChildren && (
        <Collapse in={isOpen} animateOpacity>
          <Box pl={6} mt={2} borderLeftWidth="1px" borderColor="gray.200">
            {team.children.map((child, index) => (
              <TeamNode
                key={child.id}
                team={child}
                level={level + 1}
                onSelect={onSelect}
                selectedTeam={selectedTeam}
                onAddSubteam={onAddSubteam}
                onEditTeam={onEditTeam}
                onDeleteTeam={onDeleteTeam}
                canManage={canManage}
                isLast={index === team.children.length - 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

interface TeamHierarchyTreeProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  selectedTeam?: Team;
  onAddTeam?: (parentTeam?: Team) => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (team: Team) => void;
  canManage: boolean;
  isLoading?: boolean;
}

/**
 * Displays a hierarchical tree view of teams
 */
const TeamHierarchyTree: React.FC<TeamHierarchyTreeProps> = ({
  teams,
  onSelectTeam,
  selectedTeam,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
  canManage,
  isLoading = false,
}) => {
  // Style for the container
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  if (isLoading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
        <Text>Loading team hierarchy...</Text>
      </Box>
    );
  }
  
  if (teams.length === 0) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
        <Flex direction="column" alignItems="center" justifyContent="center" py={4}>
          <Icon as={FaUsers} boxSize={10} color="gray.400" mb={3} />
          <Text color="gray.500" mb={4}>No teams found</Text>
          {canManage && onAddTeam && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => onAddTeam()}
            >
              Create Root Team
            </Button>
          )}
        </Flex>
      </Box>
    );
  }
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">Team Structure</Text>
        {canManage && onAddTeam && (
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="sm"
            onClick={() => onAddTeam()}
          >
            Add Root Team
          </Button>
        )}
      </Flex>
      
      {teams.map((team, index) => (
        <TeamNode
          key={team.id}
          team={team}
          level={0}
          onSelect={onSelectTeam}
          selectedTeam={selectedTeam}
          onAddSubteam={onAddTeam}
          onEditTeam={onEditTeam}
          onDeleteTeam={onDeleteTeam}
          canManage={canManage}
          isLast={index === teams.length - 1}
        />
      ))}
    </Box>
  );
};

export default TeamHierarchyTree;
