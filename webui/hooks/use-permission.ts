"use client";

import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/lib/contexts/user-context";
import { Permission, hasPermission } from "@/lib/permissions";

/**
 * Hook to check if the current user has a specific permission
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function usePermission(permission: Permission): boolean {
  const { user: authUser } = useAuth();
  const { user: contextUser } = useUser();

  // Use the user from context if available, otherwise fall back to auth user
  const user = contextUser || authUser;

  if (!user || !user.role) {
    return false;
  }

  return hasPermission(user.role, permission);
}

/**
 * Hook to check if the current user has any of the specified permissions
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has any of the permissions
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { user: authUser } = useAuth();
  const { user: contextUser } = useUser();

  // Use the user from context if available, otherwise fall back to auth user
  const user = contextUser || authUser;

  if (!user || !user.role) {
    return false;
  }

  return permissions.some((permission) => hasPermission(user.role, permission));
}

/**
 * Hook to check if the current user has all of the specified permissions
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has all of the permissions
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { user: authUser } = useAuth();
  const { user: contextUser } = useUser();

  // Use the user from context if available, otherwise fall back to auth user
  const user = contextUser || authUser;

  if (!user || !user.role) {
    return false;
  }

  return permissions.every((permission) =>
    hasPermission(user.role, permission)
  );
}
