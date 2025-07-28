import { db } from '../db';
import { 
  accessControlLists, 
  aclRules, 
  aclAssignments, 
  teamMembers, 
  organizationMembers,
  teams
} from '../db/schema-acl';
import { eq, and, or, inArray } from 'drizzle-orm';

// Types
interface AccessControlList {
  id: number;
  name: string;
  description?: string;
  organization_id?: number;
  created_at: Date;
  updated_at: Date;
}

interface AclRule {
  id: number;
  acl_id: number;
  resource_type: string;
  resource_id?: number;
  permission: 'full' | 'create' | 'read' | 'update' | 'delete' | 'none';
  conditions?: string;
  created_at: Date;
  updated_at: Date;
}

interface AclAssignment {
  id: number;
  acl_id: number;
  user_id?: number;
  team_id?: number;
  organization_id?: number;
  created_at: Date;
}

// ACL management functions
export async function getAccessControlLists(organizationId?: number): Promise<AccessControlList[]> {
  if (organizationId) {
    return db.select().from(accessControlLists).where(eq(accessControlLists.organizationId, organizationId));
  }
  return db.select().from(accessControlLists);
}

export async function getAccessControlList(id: number): Promise<AccessControlList | undefined> {
  const results = await db.select().from(accessControlLists).where(eq(accessControlLists.id, id));
  return results[0];
}

export async function createAccessControlList(data: Omit<AccessControlList, 'id'>): Promise<AccessControlList> {
  const results = await db.insert(accessControlLists).values(data).returning();
  return results[0];
}

export async function updateAccessControlList(id: number, data: Partial<AccessControlList>): Promise<AccessControlList> {
  const results = await db
    .update(accessControlLists)
    .set(data)
    .where(eq(accessControlLists.id, id))
    .returning();
  return results[0];
}

export async function deleteAccessControlList(id: number): Promise<void> {
  // First delete all rules and assignments for this ACL
  await db.delete(aclRules).where(eq(aclRules.aclId, id));
  await db.delete(aclAssignments).where(eq(aclAssignments.aclId, id));
  
  // Then delete the ACL itself
  await db.delete(accessControlLists).where(eq(accessControlLists.id, id));
}

// ACL Rule management functions
export async function getAclRules(aclId: number): Promise<AclRule[]> {
  return db.select().from(aclRules).where(eq(aclRules.aclId, aclId));
}

export async function getAclRule(id: number): Promise<AclRule | undefined> {
  const results = await db.select().from(aclRules).where(eq(aclRules.id, id));
  return results[0];
}

export async function createAclRule(data: Omit<AclRule, 'id'>): Promise<AclRule> {
  const results = await db.insert(aclRules).values(data).returning();
  return results[0];
}

export async function updateAclRule(id: number, data: Partial<AclRule>): Promise<AclRule> {
  const results = await db
    .update(aclRules)
    .set(data)
    .where(eq(aclRules.id, id))
    .returning();
  return results[0];
}

export async function deleteAclRule(id: number): Promise<void> {
  await db.delete(aclRules).where(eq(aclRules.id, id));
}

// ACL Assignment management functions
export async function getAclAssignments(aclId: number): Promise<AclAssignment[]> {
  return db.select().from(aclAssignments).where(eq(aclAssignments.aclId, aclId));
}

export async function getAclAssignment(id: number): Promise<AclAssignment | undefined> {
  const results = await db.select().from(aclAssignments).where(eq(aclAssignments.id, id));
  return results[0];
}

export async function createAclAssignment(data: Omit<AclAssignment, 'id'>): Promise<AclAssignment> {
  const results = await db.insert(aclAssignments).values(data).returning();
  return results[0];
}

export async function deleteAclAssignment(id: number): Promise<void> {
  await db.delete(aclAssignments).where(eq(aclAssignments.id, id));
}

// Permission check functions
export async function canManageOrganization(organizationId: number, userId: number): Promise<boolean> {
  // Check if user is an admin or owner of the organization
  const member = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    );
  
  if (member.length === 0) return false;
  
  // Check if user's role allows management of the organization
  const managerRoles = ['admin', 'owner', 'manager'];
  return managerRoles.includes(member[0].role);
}

export async function getEffectivePermission(
  userId: number, 
  resourceType: string, 
  resourceId?: number
): Promise<'full' | 'create' | 'read' | 'update' | 'delete' | 'none'> {
  // Step 1: Get all organizations and teams the user belongs to
  const userOrganizations = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId));
  
  const userTeams = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));
  
  const organizationIds = userOrganizations.map(org => org.organizationId);
  const teamIds = userTeams.map(team => team.teamId);
  
  // Step 2: Get all ACLs assigned to the user, their teams, or their organizations
  const assignments = await db
    .select({ aclId: aclAssignments.aclId })
    .from(aclAssignments)
    .where(
      or(
        eq(aclAssignments.userId, userId),
        organizationIds.length > 0 ? inArray(aclAssignments.organizationId, organizationIds) : undefined,
        teamIds.length > 0 ? inArray(aclAssignments.teamId, teamIds) : undefined
      )
    );
  
  const aclIds = assignments.map(assignment => assignment.aclId);
  
  if (aclIds.length === 0) {
    return 'none'; // No ACLs assigned
  }
  
  // Step 3: Get all rules from these ACLs that apply to the resource
  let rulesQuery = db
    .select()
    .from(aclRules)
    .where(
      and(
        inArray(aclRules.aclId, aclIds),
        eq(aclRules.resourceType, resourceType)
      )
    );
  
  if (resourceId) {
    // Add condition to match specific resource or all resources of this type
    rulesQuery = rulesQuery.where(
      or(
        eq(aclRules.resourceId, resourceId),
        eq(aclRules.resourceId, undefined)
      )
    );
  } else {
    // Only get rules for all resources of this type
    rulesQuery = rulesQuery.where(eq(aclRules.resourceId, undefined));
  }
  
  const rules = await rulesQuery;
  
  if (rules.length === 0) {
    return 'none'; // No matching rules
  }
  
  // Step 4: Determine the most permissive permission
  const permissionHierarchy = {
    'full': 5,
    'create': 4,
    'update': 3,
    'delete': 2,
    'read': 1,
    'none': 0
  };
  
  let highestPermissionValue = 0;
  let highestPermission: 'full' | 'create' | 'read' | 'update' | 'delete' | 'none' = 'none';
  
  for (const rule of rules) {
    const permissionValue = permissionHierarchy[rule.permission as keyof typeof permissionHierarchy];
    if (permissionValue > highestPermissionValue) {
      highestPermissionValue = permissionValue;
      highestPermission = rule.permission as 'full' | 'create' | 'read' | 'update' | 'delete' | 'none';
    }
  }
  
  return highestPermission;
}
