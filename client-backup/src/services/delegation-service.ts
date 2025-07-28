import axios from 'axios';
import { Delegation } from '../types/permissions.ts';

const API_URL = '/api/delegations';

/**
 * Service for interacting with the permission delegation API
 */
export const DelegationService = {
  /**
   * Get delegations created by the current user
   */
  async getDelegationsFromMe() {
    const response = await axios.get(`${API_URL}/from-me`);
    return response.data;
  },

  /**
   * Get delegations to the current user
   */
  async getDelegationsToMe() {
    const response = await axios.get(`${API_URL}/to-me`);
    return response.data;
  },

  /**
   * Create a new permission delegation
   */
  async createDelegation(delegationData: {
    to_user_id: string;
    resource_type: string;
    resource_id?: string;
    permission: string;
    expires_at?: string;
  }) {
    const response = await axios.post(API_URL, delegationData);
    return response.data;
  },

  /**
   * Update a delegation (e.g., activate/deactivate, change expiry)
   */
  async updateDelegation(
    delegationId: string,
    updates: {
      is_active?: boolean;
      expires_at?: string | null;
    }
  ) {
    const response = await axios.put(`${API_URL}/${delegationId}`, updates);
    return response.data;
  },

  /**
   * Delete a delegation
   */
  async deleteDelegation(delegationId: string) {
    await axios.delete(`${API_URL}/${delegationId}`);
  },

  /**
   * Check if the current user has a specific permission
   */
  async checkPermission(
    resourceType: string,
    permission: string,
    resourceId?: string
  ) {
    const url = `${API_URL}/check-permission/${resourceType}/${permission}${
      resourceId ? `?resourceId=${resourceId}` : ''
    }`;
    const response = await axios.get(url);
    return response.data.hasPermission;
  },

  /**
   * Get all effective permissions for the current user
   */
  async getMyPermissions() {
    const response = await axios.get(`${API_URL}/my-permissions`);
    return response.data;
  }
};

export default DelegationService;
