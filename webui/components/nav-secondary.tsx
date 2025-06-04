"use client";

import { useUser } from "@/lib/contexts/user-context";
import { clearAuthTokens } from "@/lib/api/auth";
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
  // Get the clearUser function from user context
  const { clearUser } = useUser();
  const router = useRouter();

  // Handle navigation
  const navigateTo = (url: string) => {
    router.push(url);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear auth tokens and user data
    clearAuthTokens();
    clearUser();

    // Redirect to home page
    router.push("/auth/login");

    // Show success message
    import("sonner").then(({ toast }) => {
      toast.success("Logged out successfully");
    });
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
