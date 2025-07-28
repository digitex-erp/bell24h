import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGateProps {
  resourceType: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGate resourceType="rfq" action="create">
 *   <Button>Create RFQ</Button>
 * </PermissionGate>
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  resourceType,
  action,
  children,
  fallback = null,
}) => {
  const { hasPermission, loading } = usePermissions();
  
  // If still loading permissions, don't render anything
  if (loading) {
    return null;
  }
  
  // Render children if user has permission, otherwise render fallback
  return hasPermission(resourceType, action) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
