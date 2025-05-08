"use client";

import { PermissionGate } from "@/components/permission-gate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Permission } from "@/lib/permissions";
import { usePathname, useRouter } from "next/navigation";

export default function LocationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes("/cells")) return "cells";
    if (pathname.includes("/villages")) return "villages";
    if (pathname.includes("/isibos")) return "isibos";
    if (pathname.includes("/houses")) return "houses";
    return "cells";
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "cells":
        router.push("/dashboard/locations/cells");
        break;
      case "villages":
        router.push("/dashboard/locations/villages");
        break;
      case "isibos":
        router.push("/dashboard/locations/isibos");
        break;
      case "houses":
        router.push("/dashboard/locations/houses");
        break;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Locations</h1>
        <p className="text-muted-foreground">
          Manage administrative locations in the system
        </p>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
        <TabsList>
          <PermissionGate
            anyPermissions={[Permission.VIEW_ALL_CELLS, Permission.CREATE_CELL]}
          >
            <TabsTrigger value="cells">Cells</TabsTrigger>
          </PermissionGate>

          <PermissionGate
            anyPermissions={[
              Permission.VIEW_ALL_VILLAGES,
              Permission.CREATE_VILLAGE,
              Permission.UPDATE_VILLAGE,
            ]}
          >
            <TabsTrigger value="villages">Villages</TabsTrigger>
          </PermissionGate>

          <PermissionGate
            anyPermissions={[
              Permission.VIEW_ALL_ISIBOS,
              Permission.CREATE_ISIBO,
              Permission.UPDATE_ISIBO,
            ]}
          >
            <TabsTrigger value="isibos">Isibos</TabsTrigger>
          </PermissionGate>

          <PermissionGate
            anyPermissions={[
              Permission.VIEW_ALL_HOUSES,
              Permission.CREATE_HOUSE,
              Permission.UPDATE_HOUSE,
            ]}
          >
            <TabsTrigger value="houses">Houses</TabsTrigger>
          </PermissionGate>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
