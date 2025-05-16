"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Permission } from "@/lib/permissions";

export default function HousesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute
      // All roles can access the houses management page
      anyPermissions={[
        Permission.VIEW_ALL_HOUSES, 
        Permission.CREATE_HOUSE,
        Permission.UPDATE_HOUSE
      ]}
      fallbackUrl="/dashboard/locations"
    >
      {children}
    </PermissionRoute>
  );
}
