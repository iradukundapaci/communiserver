"use client";

import * as React from "react";
import { IconUsers, IconShield, IconMapPin, IconHome, IconUser } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface UserRoleStats {
  role: string;
  count: number;
  percentage: number;
}

interface CoreMetrics {
  userStats: UserRoleStats[];
  locationStats: {
    totalCells: number;
    totalVillages: number;
    totalIsibos: number;
  };
  activityStats: {
    totalActivities: number;
    completedActivities: number;
    activeActivities: number;
    pendingActivities: number;
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    pendingTasks: number;
    taskCompletionRate: number;
  };
  reportStats: {
    totalReports: number;
    recentReports: number;
  };
}

export function UserRoleDistribution() {
  const [coreMetrics, setCoreMetrics] = React.useState<CoreMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCoreMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/v1/analytics/core-metrics?timeRange=30d', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch core metrics: ${response.statusText}`);
        }

        const data = await response.json();
        setCoreMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoreMetrics();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return IconShield;
      case 'cell_leader':
        return IconMapPin;
      case 'village_leader':
        return IconHome;
      case 'isibo_leader':
        return IconUsers;
      default:
        return IconUser;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return "bg-red-500";
      case 'cell_leader':
        return "bg-blue-500";
      case 'village_leader':
        return "bg-green-500";
      case 'isibo_leader':
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            User Role Distribution
          </CardTitle>
          <CardDescription>Breakdown of users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !coreMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            User Role Distribution
          </CardTitle>
          <CardDescription>Error loading user role data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = coreMetrics.userStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          User Role Distribution
        </CardTitle>
        <CardDescription>
          {totalUsers.toLocaleString()} total users across all roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coreMetrics.userStats.map((roleStats) => {
            const IconComponent = getRoleIcon(roleStats.role);
            const colorClass = getRoleColor(roleStats.role);

            return (
              <div key={roleStats.role} className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {formatRoleName(roleStats.role)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {roleStats.count.toLocaleString()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {roleStats.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={roleStats.percentage}
                    className="h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {coreMetrics.userStats.filter(s => s.role.includes('LEADER')).reduce((sum, s) => sum + s.count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Leaders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {coreMetrics.userStats.find(s => s.role === 'CITIZEN')?.count || 0}
              </div>
              <div className="text-xs text-muted-foreground">Citizens</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
