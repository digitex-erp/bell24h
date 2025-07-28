export type UserRole = 'admin' | 'user';

export interface Permission {
  action: 'view' | 'edit' | 'delete' | 'export';
  resource: string;
}

// Define permissions for each role
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'view', resource: 'dashboard' },
    { action: 'edit', resource: 'dashboard' },
    { action: 'delete', resource: 'dashboard' },
    { action: 'export', resource: 'dashboard' },
    { action: 'view', resource: 'analytics' },
    { action: 'edit', resource: 'analytics' },
    { action: 'export', resource: 'analytics' },
    { action: 'view', resource: 'supplier-risk' },
    { action: 'edit', resource: 'supplier-risk' },
    { action: 'export', resource: 'supplier-risk' },
    { action: 'view', resource: 'transactions' },
    { action: 'edit', resource: 'transactions' },
    { action: 'export', resource: 'transactions' },
    { action: 'view', resource: 'performance' },
    { action: 'edit', resource: 'performance' },
    { action: 'export', resource: 'performance' },
  ],
  user: [
    { action: 'view', resource: 'dashboard' },
    { action: 'view', resource: 'analytics' },
    { action: 'view', resource: 'supplier-risk' },
    { action: 'view', resource: 'transactions' },
    { action: 'view', resource: 'performance' },
    { action: 'export', resource: 'dashboard' },
    { action: 'export', resource: 'analytics' },
    { action: 'export', resource: 'supplier-risk' },
    { action: 'export', resource: 'transactions' },
    { action: 'export', resource: 'performance' },
  ],
};

export const hasPermission = (
  role: UserRole | undefined,
  action: Permission['action'],
  resource: Permission['resource']
): boolean => {
  if (!role) return false;
  const permissions = rolePermissions[role];
  return permissions?.some(
    (permission) =>
      permission.action === action && permission.resource === resource
  ) || false;
};

export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role];
};