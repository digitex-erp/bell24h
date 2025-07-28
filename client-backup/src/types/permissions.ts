/**
 * Permission delegation type definitions
 */

import { User } from './teams.js';

export interface ResourceType {
  id: string;
  name: string;
  description: string;
}

export interface PermissionType {
  id: string;
  name: string;
  description: string;
  resource_types: string[]; // Resource type IDs this permission applies to
}

export interface Delegation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  resource_type: string;
  resource_id?: string;
  permission: string;
  is_active: boolean;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  
  // Populated user references
  from_user?: User;
  to_user?: User;
}

// Available resource types in the system
export const RESOURCE_TYPES: ResourceType[] = [
  {
    id: 'organization',
    name: 'Organization',
    description: 'Company or organization entity'
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Team within an organization'
  },
  {
    id: 'rfq',
    name: 'RFQ',
    description: 'Request for quotation'
  },
  {
    id: 'bid',
    name: 'Bid',
    description: 'Bid response to an RFQ'
  },
  {
    id: 'contract',
    name: 'Contract',
    description: 'Contract between organizations'
  },
  {
    id: 'product_showcase',
    name: 'Product Showcase',
    description: 'Product listings and showcases'
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Video content (RFQs, products, etc.)'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analytics data and reports'
  }
];

// Available permission types in the system
export const PERMISSION_TYPES: PermissionType[] = [
  {
    id: 'view',
    name: 'View',
    description: 'Permission to view/read the resource',
    resource_types: ['organization', 'team', 'rfq', 'bid', 'contract', 'product_showcase', 'video', 'analytics']
  },
  {
    id: 'edit',
    name: 'Edit',
    description: 'Permission to edit/update the resource',
    resource_types: ['organization', 'team', 'rfq', 'bid', 'contract', 'product_showcase', 'video']
  },
  {
    id: 'delete',
    name: 'Delete',
    description: 'Permission to delete the resource',
    resource_types: ['organization', 'team', 'rfq', 'bid', 'contract', 'product_showcase', 'video']
  },
  {
    id: 'create',
    name: 'Create',
    description: 'Permission to create new resources of this type',
    resource_types: ['team', 'rfq', 'bid', 'contract', 'product_showcase', 'video']
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full administrative access to the resource',
    resource_types: ['organization', 'team']
  },
  {
    id: 'manage_members',
    name: 'Manage Members',
    description: 'Permission to add/remove members',
    resource_types: ['organization', 'team']
  },
  {
    id: 'approve',
    name: 'Approve',
    description: 'Permission to approve/reject items',
    resource_types: ['rfq', 'bid', 'contract']
  },
  {
    id: 'export',
    name: 'Export',
    description: 'Permission to export data',
    resource_types: ['analytics', 'rfq', 'bid', 'contract']
  }
];
