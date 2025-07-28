/**
 * Team and member type definitions
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  parent_team_id?: string;
  hierarchy_path?: string;
  created_at?: string;
  updated_at?: string;
  memberCount?: number;
  children?: Team[];
}

export interface TeamMember {
  id?: string;
  team_id: string;
  user_id: string;
  role: string;
  is_team_admin: boolean;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface TeamPermission {
  id: string;
  team_id: string;
  resource_type: string;
  resource_id?: string;
  permission: string;
  created_at?: string;
  updated_at?: string;
}

export interface EffectivePermission {
  user_id: string;
  team_id: string;
  resource_type: string;
  resource_id?: string;
  permission: string;
  inheritance_level: number;
}
