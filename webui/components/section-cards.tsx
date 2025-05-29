"use client";

import * as React from "react";
import { IconTrendingDown, IconTrendingUp, IconUsers, IconMapPin, IconClipboardList, IconFileText } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface CoreMetrics {
  userStats: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  locationStats: {
    totalCells: number;
    totalVillages: number;
    totalIsibos: number;
    villagesWithLeaders: number;
    villagesWithoutLeaders: number;
    leadershipCoveragePercentage: number;
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
    reportsWithEvidence: number;
    evidencePercentage: number;
    averageAttendance: number;
  };
}

export function SectionCards() {
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
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !coreMetrics) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Analytics</CardTitle>
            <CardDescription>
              {error || "Failed to load analytics data. Please try again."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { userStats, locationStats, activityStats, reportStats } = coreMetrics;

  // Calculate total users from userStats array
  const totalUsers = userStats?.reduce((sum: number, stat: UserStat) => sum + (stat.count || 0), 0) || 0;

  interface UserStat {
    count: number;
  }


  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Community members registered <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Across all roles and locations
          </div>
        </CardFooter>
      </Card>

      {/* Location Coverage */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Leadership Coverage</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {locationStats?.leadershipCoveragePercentage || 0}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={(locationStats?.leadershipCoveragePercentage || 0) >= 70 ? "text-green-600" : "text-orange-600"}>
              {(locationStats?.leadershipCoveragePercentage || 0) >= 70 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
              Villages
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {locationStats?.villagesWithLeaders || 0} of {locationStats?.totalVillages || 0} villages have leaders <IconMapPin className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {locationStats?.villagesWithoutLeaders || 0} villages need leaders
          </div>
        </CardFooter>
      </Card>

      {/* Task Completion */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Task Completion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activityStats?.taskCompletionRate || 0}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={(activityStats?.taskCompletionRate || 0) >= 70 ? "text-green-600" : (activityStats?.taskCompletionRate || 0) >= 50 ? "text-orange-600" : "text-red-600"}>
              {(activityStats?.taskCompletionRate || 0) >= 70 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
              {(activityStats?.taskCompletionRate || 0) >= 70 ? "Excellent" : (activityStats?.taskCompletionRate || 0) >= 50 ? "Good" : "Needs Attention"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {activityStats?.completedTasks || 0} of {activityStats?.totalTasks || 0} tasks completed <IconClipboardList className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {activityStats?.pendingTasks || 0} tasks pending completion
          </div>
        </CardFooter>
      </Card>

      {/* Report Engagement */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Report Evidence Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {reportStats?.evidencePercentage || 0}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={(reportStats?.evidencePercentage || 0) >= 60 ? "text-green-600" : "text-orange-600"}>
              {(reportStats?.evidencePercentage || 0) >= 60 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
              Evidence
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {reportStats?.reportsWithEvidence || 0} of {reportStats?.totalReports || 0} reports have evidence <IconFileText className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Average {reportStats?.averageAttendance || 0} attendees per report
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
