'use client';

import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/lib/contexts/user-context';
import { usePathname, useRouter } from 'next/navigation';

export default function LocationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  // Helper function to get the default tab based on user role
  const getDefaultTabForRole = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'cells';
      case 'CELL_LEADER':
        return 'villages';
      case 'VILLAGE_LEADER':
        return 'isibos';
      case 'ISIBO_LEADER':
        return 'houses';
      default:
        return 'cells';
    }
  };

  // Handle initial redirection based on user role
  useEffect(() => {
    if (!user) return;

    // If we're at the root locations path, redirect to the appropriate tab
    if (pathname === '/dashboard/locations') {
      const defaultTab = getDefaultTabForRole(user.role);
      router.replace(`/dashboard/locations/${defaultTab}`);
    }
  }, [user, pathname, router]);

  const getActiveTab = () => {
    if (pathname.includes('/cells')) return 'cells';
    if (pathname.includes('/villages')) return 'villages';
    if (pathname.includes('/isibos')) return 'isibos';
    if (pathname.includes('/houses')) return 'houses';
    return 'cells';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'cells':
        router.push('/dashboard/locations/cells');
        break;
      case 'villages':
        router.push('/dashboard/locations/villages');
        break;
      case 'isibos':
        router.push('/dashboard/locations/isibos');
        break;
      case 'houses':
        router.push('/dashboard/locations/houses');
        break;
    }
  };

  // Function to determine if a tab should be shown based on user role
  const shouldShowTab = (tab: string): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'ADMIN':
        // Admin can see all tabs
        return true;
      case 'CELL_LEADER':
        // Cell leader can see villages, isibos, and houses
        return tab !== 'cells';
      case 'VILLAGE_LEADER':
        // Village leader can see isibos and houses
        return tab === 'isibos' || tab === 'houses';
      case 'ISIBO_LEADER':
        // Isibo leader can see only houses
        return tab === 'houses';
      default:
        return false;
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
          {/* Only show cells tab to admins */}
          {shouldShowTab('cells') && (
            <TabsTrigger value="cells">Cells</TabsTrigger>
          )}

          {/* Show villages tab to admins and cell leaders */}
          {shouldShowTab('villages') && (
            <TabsTrigger value="villages">Villages</TabsTrigger>
          )}

          {/* Show isibos tab to admins, cell leaders, and village leaders */}
          {shouldShowTab('isibos') && (
            <TabsTrigger value="isibos">Isibos</TabsTrigger>
          )}

          {/* Show houses tab to all roles */}
          {shouldShowTab('houses') && (
            <TabsTrigger value="houses">Houses</TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
