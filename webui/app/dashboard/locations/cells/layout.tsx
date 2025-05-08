"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Permission } from "@/lib/permissions";

export default function CellsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute
      // Only admins can access the cells management page
      anyPermissions={[Permission.VIEW_ALL_CELLS, Permission.CREATE_CELL]}
    >
      {children}
    </PermissionRoute>
  );
}
