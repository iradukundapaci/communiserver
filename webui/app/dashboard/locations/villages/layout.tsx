"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Permission } from "@/lib/permissions";

export default function VillagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute
      // Only cell leaders and admins can access the villages management page
      anyPermissions={[Permission.VIEW_ALL_VILLAGES, Permission.CREATE_VILLAGE]}
    >
      {children}
    </PermissionRoute>
  );
}
