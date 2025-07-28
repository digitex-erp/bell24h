import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Select,
  VStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  organizations: Organization[];
  teams: Team[];
  onSave: (userData: Partial<User> & { password?: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  organizations,
  teams,
  onSave,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    name: '',
    email: '',
    role: 'member',
    organization_id: organizations.length > 0 ? organizations[0].id : undefined,
    team_id: undefined,
    password: '',
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Filtered teams based on selected organization
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  
  // When the modal opens or the user changes, update the form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'member',
        organization_id: user.organization_id,
        team_id: user.team_id,
        // Don't set password when editing - will be a separate flow
      });
    } else {
      resetForm();
    }
  }, [user, isOpen]);
  
  // Filter teams when organization changes
  useEffect(() => {
    if (formData.organization_id) {
      const teamsForOrg = teams.filter(team => team.organization_id === formData.organization_id);
      setFilteredTeams(teamsForOrg);
      
      // If current team is not in the filtered list, reset it
      if (formData.team_id && !teamsForOrg.some(team => team.id === formData.team_id)) {
        setFormData(prev => ({
          ...prev,
          team_id: undefined
        }));
      }
    } else {
      setFilteredTeams([]);
      setFormData(prev => ({
        ...prev,
        team_id: undefined
      }));
    }
  }, [formData.organization_id, teams]);
  
  // Reset the form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'member',
      organization_id: organizations.length > 0 ? organizations[0].id : undefined,
      team_id: undefined,
      password: '',
    });
    setErrors({});
    setShowPassword(false);
  };
  
  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = ['organization_id', 'team_id'].includes(name) && value 
      ? parseInt(value, 10) 
      : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    
    // Clear error on field change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!user && (!formData.password || formData.password.length < 8)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Don't send empty password when editing
      const dataToSend = { ...formData };
      if (user && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      await onSave(dataToSend);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {user ? 'Edit User' : 'Create User'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter user's full name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              {/* Only show password field for new users */}
              {!user && (
                <FormControl isRequired isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={toggleShowPassword}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
              )}
              
              <FormControl isRequired isInvalid={!!errors.role}>
                <FormLabel>Role</FormLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                  <option value="guest">Guest</option>
                </Select>
                <FormErrorMessage>{errors.role}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Organization</FormLabel>
                <Select
                  name="organization_id"
                  value={formData.organization_id || ''}
                  onChange={handleChange}
                  placeholder="Select organization"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Team</FormLabel>
                <Select
                  name="team_id"
                  value={formData.team_id || ''}
                  onChange={handleChange}
                  placeholder="Select team"
                  isDisabled={!formData.organization_id || filteredTeams.length === 0}
                >
                  {filteredTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving"
            >
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;
