"use client";

import * as React from "react";
import { IconClipboardList, IconCircleCheck, IconClock, IconAlertCircle, IconTrendingUp } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ActivityStats {
  totalActivities: number;
  activeActivities: number;
  completedActivities: number;
  pendingActivities: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  taskCompletionRate: number;
}

interface CoreMetrics {
  userStats: Array<{
    role: string;
    count: number;
  }>;
  locationStats: {
    totalCells: number;
    totalVillages: number;
    totalIsibos: number;
  };
  activityStats: ActivityStats;
  reportStats: {
    totalReports: number;
    recentReports: number;
  };
}

export function ActivityStatusOverview() {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClipboardList className="h-5 w-5" />
            Activity & Task Overview
          </CardTitle>
          <CardDescription>Current status of activities and tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
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
            <IconClipboardList className="h-5 w-5" />
            Activity & Task Overview
          </CardTitle>
          <CardDescription>Error loading activity data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const { activityStats } = coreMetrics;

  const activityData = [
    {
      label: "Completed",
      count: activityStats.completedActivities,
      total: activityStats.totalActivities,
      icon: IconCircleCheck,
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "Active",
      count: activityStats.activeActivities,
      total: activityStats.totalActivities,
      icon: IconTrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Pending",
      count: activityStats.pendingActivities,
      total: activityStats.totalActivities,
      icon: IconClock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  const taskData = [
    {
      label: "Completed",
      count: activityStats.completedTasks,
      total: activityStats.totalTasks,
      icon: IconCircleCheck,
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "Active",
      count: activityStats.activeTasks,
      total: activityStats.totalTasks,
      icon: IconTrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Pending",
      count: activityStats.pendingTasks,
      total: activityStats.totalTasks,
      icon: IconClock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconClipboardList className="h-5 w-5" />
          Activity & Task Overview
        </CardTitle>
        <CardDescription>
          Current status breakdown of all activities and tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Activities Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Activities</h4>
              <Badge variant="outline">
                {activityStats.totalActivities} Total
              </Badge>
            </div>
            <div className="space-y-3">
              {activityData.map((item) => {
                const IconComponent = item.icon;
                const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;

                return (
                  <div key={item.label} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${item.textColor}`}>
                            {item.count}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Tasks</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activityStats.totalTasks} Total
                </Badge>
                <Badge variant={activityStats.taskCompletionRate >= 70 ? "default" : "secondary"}>
                  {activityStats.taskCompletionRate}% Complete
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              {taskData.map((item) => {
                const IconComponent = item.icon;
                const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;

                return (
                  <div key={item.label} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${item.textColor}`}>
                            {item.count}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Performance Indicator */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Task Performance</span>
              <div className="flex items-center gap-2">
                {activityStats.taskCompletionRate >= 70 ? (
                  <IconCircleCheck className="h-4 w-4 text-green-500" />
                ) : activityStats.taskCompletionRate >= 50 ? (
                  <IconClock className="h-4 w-4 text-yellow-500" />
                ) : (
                  <IconAlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  activityStats.taskCompletionRate >= 70 ? 'text-green-600 dark:text-green-400' :
                  activityStats.taskCompletionRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {activityStats.taskCompletionRate >= 70 ? 'Excellent' :
                   activityStats.taskCompletionRate >= 50 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
