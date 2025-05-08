"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGate } from "@/components/permission-gate";
import { Permission } from "@/lib/permissions";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeadersPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaders Management</h1>
      </div>

      <Tabs defaultValue="cell-leaders" className="space-y-4">
        <TabsList>
          <PermissionGate permission={Permission.VIEW_LEADERS}>
            <TabsTrigger value="cell-leaders">Cell Leaders</TabsTrigger>
          </PermissionGate>
          <PermissionGate permission={Permission.VIEW_LEADERS}>
            <TabsTrigger value="village-leaders">Village Leaders</TabsTrigger>
          </PermissionGate>
          <PermissionGate permission={Permission.VIEW_LEADERS}>
            <TabsTrigger value="isibo-leaders">Isibo Leaders</TabsTrigger>
          </PermissionGate>
        </TabsList>

        <TabsContent value="cell-leaders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cell Leaders</CardTitle>
                  <CardDescription>
                    Manage cell leaders in your administrative area
                  </CardDescription>
                </div>
                <PermissionGate permission={Permission.CREATE_CELL_LEADER}>
                  <Button onClick={() => router.push("/dashboard/leaders/cell-leaders/create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Cell Leader
                  </Button>
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Cell leaders list will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="village-leaders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Village Leaders</CardTitle>
                  <CardDescription>
                    Manage village leaders in your administrative area
                  </CardDescription>
                </div>
                <PermissionGate permission={Permission.CREATE_VILLAGE_LEADER}>
                  <Button onClick={() => router.push("/dashboard/leaders/village-leaders/create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Village Leader
                  </Button>
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Village leaders list will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isibo-leaders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Isibo Leaders</CardTitle>
                  <CardDescription>
                    Manage isibo leaders in your administrative area
                  </CardDescription>
                </div>
                <PermissionGate permission={Permission.CREATE_ISIBO_LEADER}>
                  <Button onClick={() => router.push("/dashboard/leaders/isibo-leaders/create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Isibo Leader
                  </Button>
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Isibo leaders list will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
