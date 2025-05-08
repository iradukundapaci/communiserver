"use client";

import { ReactNode } from "react";
import { Permission } from "@/lib/permissions";
import { usePermission, useHasAnyPermission, useHasAllPermissions } from "@/hooks/use-permission";

interface PermissionGateProps {
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders its children based on user permissions
 * 
 * @param permission Single permission to check
 * @param anyPermissions Array of permissions where any one is sufficient
 * @param allPermissions Array of permissions where all are required
 * @param children Content to render if permission check passes
 * @param fallback Optional content to render if permission check fails
 */
export function PermissionGate({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  // Check for a single permission
  if (permission) {
    const hasPermission = usePermission(permission);
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }
  
  // Check for any of the permissions
  if (anyPermissions) {
    const hasAnyPermission = useHasAnyPermission(anyPermissions);
    return hasAnyPermission ? <>{children}</> : <>{fallback}</>;
  }
  
  // Check for all of the permissions
  if (allPermissions) {
    const hasAllPermissions = useHasAllPermissions(allPermissions);
    return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
  }
  
  // If no permission checks are specified, render the children
  return <>{children}</>;
}
