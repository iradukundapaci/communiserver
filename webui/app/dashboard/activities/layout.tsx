"use client";

import { PermissionRoute } from "@/components/permission-route";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  // Helper function to get the default tab based on user role
  const getDefaultTabForRole = (role: string): string => {
    switch (role) {
      case "ADMIN":
      case "CELL_LEADER":
      case "VILLAGE_LEADER":
        return "activities";
      case "ISIBO_LEADER":
        return "tasks";
      default:
        return "activities";
    }
  };

  // Handle initial redirection based on user role
  useEffect(() => {
    if (!user) return;

    // If we're at the root activities path, redirect to the appropriate tab
    if (pathname === "/dashboard/activities") {
      const defaultTab = getDefaultTabForRole(user.role);
      router.replace(`/dashboard/activities?tab=${defaultTab}`);
    }
  }, [user, pathname, router]);

  return (
    <PermissionRoute
      // Allow access to users with appropriate permissions
      anyPermissions={[
        Permission.CREATE_ACTIVITY,
        Permission.VIEW_VILLAGE_ACTIVITY,
        Permission.ADD_TASK_REPORT,
      ]}
    >
      {children}
    </PermissionRoute>
  );
}
