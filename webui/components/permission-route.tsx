"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Permission } from "@/lib/permissions";
import { usePermission, useHasAnyPermission, useHasAllPermissions } from "@/hooks/use-permission";
import { useAuth } from "@/contexts/auth-context";

interface PermissionRouteProps {
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * Component that protects routes based on user permissions
 * 
 * @param permission Single permission to check
 * @param anyPermissions Array of permissions where any one is sufficient
 * @param allPermissions Array of permissions where all are required
 * @param children Content to render if permission check passes
 * @param fallbackUrl URL to redirect to if permission check fails (defaults to /dashboard)
 */
export function PermissionRoute({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallbackUrl = "/dashboard",
}: PermissionRouteProps) {
  const router = useRouter();
  const { isLoading } = useAuth();
  
  // Check for a single permission
  const hasPermission = permission ? usePermission(permission) : true;
  
  // Check for any of the permissions
  const hasAnyPermission = anyPermissions ? useHasAnyPermission(anyPermissions) : true;
  
  // Check for all of the permissions
  const hasAllPermissions = allPermissions ? useHasAllPermissions(allPermissions) : true;
  
  // Combine all permission checks
  const isAuthorized = hasPermission && hasAnyPermission && hasAllPermissions;
  
  useEffect(() => {
    // Wait until auth is loaded before redirecting
    if (!isLoading && !isAuthorized) {
      router.push(fallbackUrl);
    }
  }, [isAuthorized, router, fallbackUrl, isLoading]);
  
  // If still loading or not authorized, don't render anything
  if (isLoading || !isAuthorized) {
    return null;
  }
  
  return <>{children}</>;
}
