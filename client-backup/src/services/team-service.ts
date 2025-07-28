import axios from 'axios';


const API_URL = '/api/teams';

/**
 * Service for interacting with the team management API
 */
export const TeamService = {
  /**
   * Get all teams for the current user
   */
  async getMyTeams() {
    const response = await axios.get(`${API_URL}/my-teams`);
    return response.data;
  },

  /**
   * Get teams for an organization
   */
  async getOrganizationTeams(organizationId: string) {
    const response = await axios.get(`${API_URL}/organization/${organizationId}`);
    return response.data;
  },

  /**
   * Get a specific team by ID
   */
  async getTeam(teamId: string) {
    const response = await axios.get(`${API_URL}/${teamId}`);
    return response.data;
  },

  /**
   * Create a new team
   */
  async createTeam(teamData: {
    name: string;
    description?: string;
    organization_id: string;
    parent_team_id?: string;
  }) {
    const response = await axios.post(API_URL, teamData);
    return response.data;
  },

  /**
   * Update an existing team
   */
  async updateTeam(
    teamId: string,
    teamData: {
      name?: string;
      description?: string;
      organization_id?: string;
      parent_team_id?: string | null;
    }
  ) {
    const response = await axios.put(`${API_URL}/${teamId}`, teamData);
    return response.data;
  },

  /**
   * Delete a team
   */
  async deleteTeam(teamId: string) {
    await axios.delete(`${API_URL}/${teamId}`);
  },

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string) {
    const response = await axios.get(`${API_URL}/${teamId}/members`);
    return response.data;
  },

  /**
   * Add a member to a team
   */
  async addTeamMember(
    teamId: string,
    memberData: {
      user_id: string;
      role: string;
      is_team_admin: boolean;
    }
  ) {
    const response = await axios.post(`${API_URL}/${teamId}/members`, memberData);
    return response.data;
  },

  /**
   * Update a team member
   */
  async updateTeamMember(
    teamId: string,
    userId: string,
    updates: {
      role: string;
      is_team_admin: boolean;
    }
  ) {
    const response = await axios.put(`${API_URL}/${teamId}/members/${userId}`, updates);
    return response.data;
  },

  /**
   * Remove a member from a team
   */
  async removeTeamMember(teamId: string, userId: string) {
    await axios.delete(`${API_URL}/${teamId}/members/${userId}`);
  },

  /**
   * Add a permission to a team
   */
  async addTeamPermission(
    teamId: string,
    permissionData: {
      resource_type: string;
      resource_id?: string;
      permission: string;
    }
  ) {
    const response = await axios.post(`${API_URL}/${teamId}/permissions`, permissionData);
    return response.data;
  },

  /**
   * Remove a permission from a team
   */
  async removeTeamPermission(
    teamId: string,
    permissionData: {
      resource_type: string;
      resource_id?: string;
      permission: string;
    }
  ) {
    await axios.delete(`${API_URL}/${teamId}/permissions`, { data: permissionData });
  },

  /**
   * Search for users by name or email
   */
  async searchUsers(query: string) {
    const response = await axios.get(`/api/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};

export default TeamService;
