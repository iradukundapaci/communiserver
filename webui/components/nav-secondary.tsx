"use client";

import { useAuth } from "@/contexts/auth-context";
import { type Icon } from "@tabler/icons-react";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  // Get the logout function from auth context
  const { logout } = useAuth();

  // Handle item click
  const handleItemClick = (item: { title: string; url: string }) => {
    if (item.title === "Logout") {
      logout();
      return;
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={item.title !== "Logout"}
                onClick={
                  item.title === "Logout"
                    ? () => handleItemClick(item)
                    : undefined
                }
              >
                {item.title !== "Logout" ? (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <div className="cursor-pointer">
                    <item.icon />
                    <span>{item.title}</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
