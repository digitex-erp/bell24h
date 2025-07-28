import React, { useEffect, useState } from 'react';

import { usePermissionCheck } from '../hooks/use-acl.ts';

interface PermissionCheckProps {
  resourceType: string;
  resourceId?: number;
  requiredPermission: 'view' | 'create' | 'update' | 'delete' | 'manage' | 'full';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionCheck Component
 * 
 * This component conditionally renders its children based on whether the current user
 * has the required permissions for the specified resource.
 * 
 * @param resourceType - The type of resource to check permissions for (e.g., 'rfq', 'bid', 'organization')
 * @param resourceId - Optional ID of the specific resource instance
 * @param requiredPermission - The permission level required to render children
 * @param children - Content to render if the user has required permissions
 * @param fallback - Optional content to render if the user lacks permissions
 */
export default function PermissionCheck({
  resourceType,
  resourceId,
  requiredPermission,
  children,
  fallback = null
}: PermissionCheckProps) {
  const { checkPermission } = usePermissionCheck();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUserPermission = async () => {
      setIsLoading(true);
      const permissions = await checkPermission(resourceType, resourceId);
      
      // Determine if user has required permission level
      let permitted = false;
      switch (requiredPermission) {
        case 'view':
          permitted = permissions.canView === true;
          break;
        case 'create':
          permitted = permissions.canCreate === true;
          break;
        case 'update':
          permitted = permissions.canUpdate === true;
          break;
        case 'delete':
          permitted = permissions.canDelete === true;
          break;
        case 'manage':
          permitted = permissions.canManage === true;
          break;
        case 'full':
          permitted = permissions.permission === 'full';
          break;
      }
      
      setHasPermission(permitted);
      setIsLoading(false);
    };

    checkUserPermission();
  }, [resourceType, resourceId, requiredPermission, checkPermission]);

  if (isLoading) {
    return null;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component version of PermissionCheck
 * 
 * This HOC can be used to wrap components that require specific permissions,
 * hiding them completely from users without appropriate access.
 */
export function withPermissionCheck<P extends object>(
  Component: React.ComponentType<P>,
  resourceType: string,
  requiredPermission: 'view' | 'create' | 'update' | 'delete' | 'manage' | 'full',
  fallback?: React.ReactNode
) {
  return function PermissionCheckedComponent(props: P & { resourceId?: number }) {
    const { resourceId, ...rest } = props;
    
    return (
      <PermissionCheck 
        resourceType={resourceType} 
        resourceId={resourceId} 
        requiredPermission={requiredPermission}
        fallback={fallback}
      >
        <Component {...rest as P} />
      </PermissionCheck>
    );
  };
}

/**
 * Buttons that are conditionally rendered based on permissions
 */

interface PermissionButtonProps {
  resourceType: string;
  resourceId?: number;
  requiredPermission: 'view' | 'create' | 'update' | 'delete' | 'manage' | 'full';
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function PermissionButton({
  resourceType,
  resourceId,
  requiredPermission,
  children,
  onClick,
  className = '',
  disabled = false
}: PermissionButtonProps) {
  return (
    <PermissionCheck 
      resourceType={resourceType} 
      resourceId={resourceId} 
      requiredPermission={requiredPermission}
    >
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
      >
        {children}
      </button>
    </PermissionCheck>
  );
}

/**
 * Permission-aware links that are conditionally rendered
 */
interface PermissionLinkProps {
  resourceType: string;
  resourceId?: number;
  requiredPermission: 'view' | 'create' | 'update' | 'delete' | 'manage' | 'full';
  children: React.ReactNode;
  href: string;
  className?: string;
}

export function PermissionLink({
  resourceType,
  resourceId,
  requiredPermission,
  children,
  href,
  className = ''
}: PermissionLinkProps) {
  return (
    <PermissionCheck 
      resourceType={resourceType} 
      resourceId={resourceId} 
      requiredPermission={requiredPermission}
    >
      <a href={href} className={className}>
        {children}
      </a>
    </PermissionCheck>
  );
}