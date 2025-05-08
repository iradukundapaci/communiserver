"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Permission } from "@/lib/permissions";

export default function IsibosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute
      // Only village leaders and admins can access the isibos management page
      anyPermissions={[Permission.VIEW_ALL_ISIBOS, Permission.CREATE_ISIBO]}
    >
      {children}
    </PermissionRoute>
  );
}
