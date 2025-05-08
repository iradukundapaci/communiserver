"use client";

import { useAuth } from "@/contexts/auth-context";
import { IconLogout, IconSettings, IconUserCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary(
  props: React.ComponentPropsWithoutRef<typeof SidebarGroup>
) {
  // Get the logout function from auth context
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={() => navigateTo("/settings")}>
              <div className="cursor-pointer">
                <IconSettings />
                <span>Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={() => navigateTo("/profile")}>
              <div className="cursor-pointer">
                <IconUserCircle />
                <span>Profile</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={handleLogout}>
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
