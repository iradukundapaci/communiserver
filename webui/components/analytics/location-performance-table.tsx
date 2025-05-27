"use client";

import * as React from "react";
import { IconMapPin, IconTrendingUp, IconTrendingDown, IconUsers, IconClipboardList } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMapPin className="h-5 w-5" />
          Location Performance
        </CardTitle>
        <CardDescription>
          Top performing locations by activity and task completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Activities</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-center">Completion Rate</TableHead>
                <TableHead className="text-center">Reports</TableHead>
                <TableHead className="text-center">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No location data available
                  </TableCell>
                </TableRow>
              ) : (
                locationData.map((location, index) => {
                  const badge = getPerformanceBadge(location.completionRate);
                  const IconComponent = badge.icon;

                  return (
                    <TableRow key={`${location.locationId}-${index}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{location.locationName}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {location.locationType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.totalActivities}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{location.completedTasks}</span>
                            <span className="text-muted-foreground">/{location.totalTasks}</span>
                          </div>
                          <Progress
                            value={location.totalTasks > 0 ? (location.completedTasks / location.totalTasks) * 100 : 0}
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${getPerformanceColor(location.completionRate)}`}>
                          {location.completionRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <IconUsers className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.totalReports}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={badge.variant} className="gap-1">
                          <IconComponent className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
