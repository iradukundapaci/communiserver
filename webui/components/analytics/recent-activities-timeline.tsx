"use client";

import * as React from "react";
import { IconClock, IconClipboardList, IconCircleCheck, IconAlertCircle, IconCalendar, IconTrendingUp, IconTrendingDown, IconMinus, IconActivity, IconFileText, IconTarget } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface TimeSeriesData {
  date: string;
  activities: number;
  tasks: number;
  reports: number;
  completedTasks: number;
}

export function RecentActivitiesTimeline() {
  const [timeSeriesData, setTimeSeriesData] = React.useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTimeSeriesData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/v1/analytics/time-series?timeRange=7d', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch time series data: ${response.statusText}`);
        }

        const data = await response.json();
        // Sort by date descending to show most recent first
        const sortedData = data.sort((a: TimeSeriesData, b: TimeSeriesData) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTimeSeriesData(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSeriesData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getActivityLevel = (activities: number, tasks: number, reports: number) => {
    const total = activities + tasks + reports;
    if (total >= 10) return {
      level: "High",
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      icon: IconTrendingUp
    };
    if (total >= 5) return {
      level: "Medium",
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      icon: IconMinus
    };
    if (total > 0) return {
      level: "Low",
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      icon: IconTrendingDown
    };
    return {
      level: "None",
      color: "bg-gray-500",
      textColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      icon: IconMinus
    };
  };

  const getTrendIcon = (currentDay: TimeSeriesData, previousDay?: TimeSeriesData) => {
    if (!previousDay) return null;

    const currentTotal = currentDay.activities + currentDay.tasks + currentDay.reports;
    const previousTotal = previousDay.activities + previousDay.tasks + previousDay.reports;

    if (currentTotal > previousTotal) return { icon: IconTrendingUp, color: "text-green-500" };
    if (currentTotal < previousTotal) return { icon: IconTrendingDown, color: "text-red-500" };
    return { icon: IconMinus, color: "text-gray-500" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="h-5 w-5" />
            Recent Activity Timeline
          </CardTitle>
          <CardDescription>Daily activity summary for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-6 w-16" />
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
            <IconClock className="h-5 w-5" />
            Recent Activity Timeline
          </CardTitle>
          <CardDescription>Error loading timeline data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const totalActivities = timeSeriesData.reduce((sum, day) => sum + day.activities, 0);
  const totalTasks = timeSeriesData.reduce((sum, day) => sum + day.tasks, 0);
  const totalReports = timeSeriesData.reduce((sum, day) => sum + day.reports, 0);
  const totalCompleted = timeSeriesData.reduce((sum, day) => sum + day.completedTasks, 0);
  const overallCompletionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconClock className="h-5 w-5" />
          Activity Timeline & Trends
        </CardTitle>
        <CardDescription>
          Daily activity patterns and performance trends over the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {timeSeriesData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <IconCalendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IconActivity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalActivities}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Activities</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IconTarget className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{totalTasks}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Tasks</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IconFileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalReports}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Reports</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IconCircleCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{overallCompletionRate}%</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Completion</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <IconClock className="h-4 w-4" />
                Daily Activity Breakdown
              </h4>

              <div className="space-y-3">
                {timeSeriesData.map((day, index) => {
                  const activityLevel = getActivityLevel(day.activities, day.tasks, day.reports);
                  const completionRate = day.tasks > 0 ? Math.round((day.completedTasks / day.tasks) * 100) : 0;
                  const trend = getTrendIcon(day, timeSeriesData[index + 1]);
                  const ActivityIcon = activityLevel.icon;
                  const totalDayActivity = day.activities + day.tasks + day.reports;

                  return (
                    <div
                      key={day.date}
                      className={`relative rounded-lg border p-4 transition-all hover:shadow-sm ${activityLevel.bgColor} ${activityLevel.borderColor}`}
                    >
                      {/* Timeline connector */}
                      {index < timeSeriesData.length - 1 && (
                        <div className="absolute left-6 top-16 w-px h-6 bg-border" />
                      )}

                      <div className="flex items-start gap-4">
                        {/* Activity indicator */}
                        <div className={`w-12 h-12 rounded-full ${activityLevel.color} flex items-center justify-center text-white relative z-10 shadow-sm`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{formatDate(day.date)}</h4>
                              {trend && (
                                <div className={`flex items-center gap-1 ${trend.color}`}>
                                  <trend.icon className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${activityLevel.textColor} text-xs`}>
                                {activityLevel.level} Activity
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {totalDayActivity} total
                              </div>
                            </div>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <IconActivity className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Activities</span>
                              </div>
                              <div className="text-lg font-bold">{day.activities}</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <IconTarget className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Tasks</span>
                              </div>
                              <div className="text-lg font-bold">{day.tasks}</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <IconFileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Reports</span>
                              </div>
                              <div className="text-lg font-bold">{day.reports}</div>
                            </div>
                          </div>

                          {/* Task Completion */}
                          {day.tasks > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Task Completion</span>
                                <span className="font-medium">
                                  {day.completedTasks}/{day.tasks} ({completionRate}%)
                                </span>
                              </div>
                              <Progress value={completionRate} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
