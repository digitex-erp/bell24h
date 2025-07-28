// Import zod directly - this works with CommonJS style imports
const zod = require('zod');
const z = zod;

// Permission enum - valid ACL permission types
export const permissionEnum = z.enum(['full', 'create', 'read', 'update', 'delete', 'none']);

// Schema for creating a new ACL
export const insertAccessControlListSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  organization_id: z.number().optional(),
});

// Schema for creating a new ACL rule
export const insertAclRuleSchema = z.object({
  acl_id: z.number(),
  resource_type: z.string().min(1, { message: 'Resource type is required' }),
  resource_id: z.number().optional(),
  permission: permissionEnum,
  conditions: z.string().optional(),
});

// Schema for creating a new ACL assignment
export const insertAclAssignmentSchema = z.object({
  acl_id: z.number(),
  user_id: z.number().optional(),
  team_id: z.number().optional(),
  organization_id: z.number().optional(),
}).refine(
  (data: {user_id?: number, team_id?: number, organization_id?: number}) => 
    data.user_id !== undefined || data.team_id !== undefined || data.organization_id !== undefined,
  {
    message: "At least one of user_id, team_id, or organization_id must be provided",
    path: ["Assignment Target"] 
  }
);

// Schema for ACL permission response
export const aclPermissionResponseSchema = z.object({
  permission: permissionEnum,
  canView: z.boolean(),
  canCreate: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  canManage: z.boolean(),
});
