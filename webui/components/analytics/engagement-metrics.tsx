"use client";

import * as React from "react";
import { IconUsers, IconFileText, IconCalendar, IconTrendingUp, IconMapPin } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EngagementMetrics {
  averageCitizensPerIsibo: number;
  mostActiveVillages: Array<{
    locationId: string;
    locationName: string;
    locationType: string;
    totalActivities: number;
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
    totalReports: number;
  }>;
  reportSubmissionFrequency: number;
  totalCitizens: number;
}

interface ReportStats {
  totalReports: number;
  reportsWithEvidence: number;
  reportsWithoutEvidence: number;
  evidencePercentage: number;
  averageAttendance: number;
  totalAttendees: number;
}

export function EngagementMetrics() {
  const [engagementData, setEngagementData] = React.useState<EngagementMetrics | null>(null);
  const [reportStats, setReportStats] = React.useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        // Fetch engagement metrics
        const engagementResponse = await fetch('/api/v1/analytics/engagement-metrics?timeRange=30d', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch core metrics for report stats
        const coreResponse = await fetch('/api/v1/analytics/core-metrics?timeRange=30d', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!engagementResponse.ok || !coreResponse.ok) {
          throw new Error('Failed to fetch engagement data');
        }

        const engagement = await engagementResponse.json();
        const core = await coreResponse.json();

        setEngagementData(engagement);
        setReportStats(core.reportStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngagementData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Community Engagement
          </CardTitle>
          <CardDescription>Community participation and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !engagementData || !reportStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Community Engagement
          </CardTitle>
          <CardDescription>Error loading engagement data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          Community Engagement
        </CardTitle>
        <CardDescription>
          Community participation and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Engagement Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconUsers className="h-4 w-4" />
                Avg Citizens per Isibo
              </div>
              <div className="text-2xl font-bold">
                {engagementData.averageCitizensPerIsibo.toFixed(1)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCalendar className="h-4 w-4" />
                Reports per Day
              </div>
              <div className="text-2xl font-bold">
                {engagementData.reportSubmissionFrequency.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Report Quality Metrics */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <IconFileText className="h-4 w-4" />
              Report Quality
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Evidence Submission Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {reportStats.reportsWithEvidence}/{reportStats.totalReports}
                  </span>
                  <Badge variant={reportStats.evidencePercentage >= 60 ? "default" : "secondary"}>
                    {reportStats.evidencePercentage}%
                  </Badge>
                </div>
              </div>
              <Progress value={reportStats.evidencePercentage} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm">Average Attendance</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {reportStats.averageAttendance.toFixed(1)} people
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({reportStats.totalAttendees} total)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Most Active Villages */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4" />
              Most Active Villages
            </h4>
            <div className="space-y-2">
              {engagementData.mostActiveVillages.slice(0, 3).map((village, index) => (
                <div key={`${village.locationId}-${index}`} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{village.locationName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconMapPin className="h-3 w-3" />
                        {village.totalActivities} activities
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{village.completionRate}%</div>
                    <div className="text-xs text-muted-foreground">completion</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Overview */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">
                  {engagementData.totalCitizens.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Citizens</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {reportStats.totalReports}
                </div>
                <div className="text-xs text-muted-foreground">Total Reports</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">
                  {engagementData.mostActiveVillages.length}
                </div>
                <div className="text-xs text-muted-foreground">Active Villages</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
