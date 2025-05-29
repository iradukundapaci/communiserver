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
  // Call all hooks unconditionally to follow Rules of Hooks
  // Use a default permission that exists when no permission is provided
  const hasPermission = usePermission(permission || Permission.VIEW_PROFILE);
  const hasAnyPermission = useHasAnyPermission(anyPermissions || []);
  const hasAllPermissions = useHasAllPermissions(allPermissions || []);

  // Check for a single permission
  if (permission) {
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Check for any of the permissions
  if (anyPermissions) {
    return hasAnyPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Check for all of the permissions
  if (allPermissions) {
    return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
  }

  // If no permission checks are specified, render the children
  return <>{children}</>;
}
