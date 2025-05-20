"use client";

import { PermissionGate } from "@/components/permission-gate";
import { useAuth } from "@/contexts/auth-context";
import { Permission } from "@/lib/permissions";
import {
  IconBuilding,
  IconCalendarEvent,
  IconChartBar,
  IconClipboardList,
  IconDashboard,
  IconLogout,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function DashboardSidebar(
  props: React.ComponentPropsWithoutRef<typeof SidebarGroup>
) {
  const { logout } = useAuth();
  const router = useRouter();

  // Handle navigation
  const navigateTo = (url: string) => {
    router.push(url);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Dashboard - Available to all users */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigateTo("/dashboard")}>
              <div className="cursor-pointer">
                <IconDashboard />
                <span>Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Admin Section */}
          <PermissionGate permission={Permission.ASSIGN_CELL_LEADERS}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/cell-leaders")}
              >
                <div className="cursor-pointer">
                  <IconUsers />
                  <span>Cell Leaders</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          {/* Cell Leader Section */}
          <PermissionGate permission={Permission.VIEW_CELL}>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigateTo("/dashboard/cell")}>
                <div className="cursor-pointer">
                  <IconBuilding />
                  <span>My Cell</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.VIEW_CELL_ANALYTICS}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/cell-analytics")}
              >
                <div className="cursor-pointer">
                  <IconChartBar />
                  <span>Cell Analytics</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.ASSIGN_VILLAGE_LEADERS}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/village-leaders")}
              >
                <div className="cursor-pointer">
                  <IconUsers />
                  <span>Village Leaders</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          {/* Village Leader Section */}
          <PermissionGate permission={Permission.VIEW_VILLAGE}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/village")}
              >
                <div className="cursor-pointer">
                  <IconBuilding />
                  <span>My Village</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.VIEW_VILLAGE_ANALYTICS}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/village-analytics")}
              >
                <div className="cursor-pointer">
                  <IconChartBar />
                  <span>Village Analytics</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.CREATE_ISIBO}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/isibos")}
              >
                <div className="cursor-pointer">
                  <IconBuilding />
                  <span>Manage Isibos</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.CREATE_ACTIVITY}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/activities")}
              >
                <div className="cursor-pointer">
                  <IconCalendarEvent />
                  <span>Activities</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          {/* Isibo Leader Section */}
          <PermissionGate permission={Permission.VIEW_ISIBO}>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigateTo("/dashboard/isibo")}>
                <div className="cursor-pointer">
                  <IconBuilding />
                  <span>My Isibo</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.VIEW_ISIBO_ANALYTICS}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/isibo-analytics")}
              >
                <div className="cursor-pointer">
                  <IconChartBar />
                  <span>Isibo Analytics</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.ADD_CITIZENS}>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateTo("/dashboard/citizens")}
              >
                <div className="cursor-pointer">
                  <IconUsers />
                  <span>Manage Citizens</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          <PermissionGate permission={Permission.VIEW_VILLAGE_ACTIVITY}>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigateTo("/dashboard/tasks")}>
                <div className="cursor-pointer">
                  <IconClipboardList />
                  <span>Tasks</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGate>

          {/* Common Items for All Users */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigateTo("/profile")}>
              <div className="cursor-pointer">
                <IconUserCircle />
                <span>Profile</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigateTo("/settings")}>
              <div className="cursor-pointer">
                <IconSettings />
                <span>Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <div className="cursor-pointer">
                <IconLogout />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
