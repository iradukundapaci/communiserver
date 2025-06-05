"use client";

import * as React from "react";
import { IconMapPin, IconTrendingUp, IconTrendingDown, IconUsers, IconClipboardList, IconTarget, IconAward, IconChartBar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface LocationPerformance {
  locationId: string;
  locationName: string;
  locationType: 'village' | 'cell' | 'isibo';
  totalActivities: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  totalReports: number;
}

export function LocationPerformanceTable() {
  const [locationData, setLocationData] = React.useState<LocationPerformance[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLocationPerformance = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/v1/analytics/location-performance?timeRange=30d', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch location performance: ${response.statusText}`);
        }

        const data = await response.json();
        setLocationData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationPerformance();
  }, []);

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 dark:text-green-400";
    if (rate >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return { variant: "default" as const, label: "Excellent", icon: IconTrendingUp };
    if (rate >= 60) return { variant: "secondary" as const, label: "Good", icon: IconTrendingUp };
    return { variant: "destructive" as const, label: "Needs Attention", icon: IconTrendingDown };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            Location Performance
          </CardTitle>
          <CardDescription>Performance metrics by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            Location Performance
          </CardTitle>
          <CardDescription>Error loading location performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Sort locations by completion rate for better visualization
  const sortedLocations = [...locationData].sort((a, b) => b.completionRate - a.completionRate);
  const topPerformer = sortedLocations[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMapPin className="h-5 w-5" />
          Location Performance
        </CardTitle>
        <CardDescription>
          Performance ranking by task completion and activity levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {locationData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <IconMapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No location data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Performer Highlight */}
            {topPerformer && (
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                      <IconAward className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-900 dark:text-green-100">
                        🏆 Top Performer
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {topPerformer.locationName} ({topPerformer.locationType})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {topPerformer.completionRate}%
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      completion rate
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedLocations.map((location, index) => {
                const badge = getPerformanceBadge(location.completionRate);
                const IconComponent = badge.icon;
                const isTopPerformer = index === 0;

                return (
                  <div
                    key={`${location.locationId}-${index}`}
                    className={`relative rounded-lg border p-4 transition-all hover:shadow-md ${
                      isTopPerformer
                        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10'
                        : 'hover:border-primary/20'
                    }`}
                  >
                    {/* Ranking Badge */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                        index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Location Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <IconMapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{location.locationName}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {location.locationType}
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      {/* Completion Rate */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className={`font-bold ${getPerformanceColor(location.completionRate)}`}>
                            {location.completionRate}%
                          </span>
                        </div>
                        <Progress
                          value={location.completionRate}
                          className="h-2"
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <IconClipboardList className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="font-medium">{location.totalActivities}</div>
                          <div className="text-muted-foreground">Activities</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <IconTarget className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="font-medium">{location.completedTasks}/{location.totalTasks}</div>
                          <div className="text-muted-foreground">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <IconUsers className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="font-medium">{location.totalReports}</div>
                          <div className="text-muted-foreground">Reports</div>
                        </div>
                      </div>

                      {/* Performance Badge */}
                      <div className="flex justify-center pt-2">
                        <Badge variant={badge.variant} className="gap-1 text-xs">
                          <IconComponent className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                <IconChartBar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Performance Summary</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {sortedLocations.filter(l => l.completionRate >= 80).length}
                  </div>
                  <div className="text-muted-foreground">Excellent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600 dark:text-yellow-400">
                    {sortedLocations.filter(l => l.completionRate >= 60 && l.completionRate < 80).length}
                  </div>
                  <div className="text-muted-foreground">Good</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {sortedLocations.filter(l => l.completionRate < 60).length}
                  </div>
                  <div className="text-muted-foreground">Needs Attention</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">
                    {Math.round(sortedLocations.reduce((sum, l) => sum + l.completionRate, 0) / sortedLocations.length)}%
                  </div>
                  <div className="text-muted-foreground">Average</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
