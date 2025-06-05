"use client";

import * as React from "react";
import { IconChecklist, IconClock, IconX, IconTrendingUp, IconActivity } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TaskPerformance {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  taskCompletionRate: number;
  averageTasksPerActivity: number;
}

interface EnhancedTaskPerformanceProps {
  className?: string;
}

export function EnhancedTaskPerformance({ className }: EnhancedTaskPerformanceProps) {
  const [taskData, setTaskData] = React.useState<TaskPerformance | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTaskData = async () => {
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
          throw new Error('Failed to fetch task performance data');
        }

        const data = await response.json();
        setTaskData(data.taskPerformance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskData();
  }, []);

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionRateVariant = (rate: number) => {
    if (rate >= 90) return "default";
    if (rate >= 70) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChecklist className="h-5 w-5" />
            Task Performance
          </CardTitle>
          <CardDescription>Task completion and efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChecklist className="h-5 w-5" />
            Task Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!taskData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChecklist className="h-5 w-5" />
            Task Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No task data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconChecklist className="h-5 w-5" />
          Task Performance
        </CardTitle>
        <CardDescription>
          Task completion and efficiency metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Task Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconActivity className="h-4 w-4" />
                Total Tasks
              </div>
              <div className="text-2xl font-bold">
                {taskData.totalTasks.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconTrendingUp className="h-4 w-4" />
                Avg per Activity
              </div>
              <div className="text-2xl font-bold">
                {taskData.averageTasksPerActivity.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconChecklist className="h-4 w-4" />
                Completion Rate
              </div>
              <Badge variant={getCompletionRateVariant(taskData.taskCompletionRate)}>
                {taskData.taskCompletionRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(taskData.taskCompletionRate, 100)} 
              className="h-3"
            />
            <div className="text-xs text-muted-foreground">
              {taskData.completedTasks} of {taskData.totalTasks} tasks completed
            </div>
          </div>

          {/* Task Status Breakdown */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Task Status Breakdown</div>
            
            {/* Completed Tasks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{taskData.completedTasks}</span>
                <span className="text-xs text-muted-foreground">
                  ({((taskData.completedTasks / taskData.totalTasks) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{taskData.pendingTasks}</span>
                <span className="text-xs text-muted-foreground">
                  ({((taskData.pendingTasks / taskData.totalTasks) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Cancelled Tasks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Cancelled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{taskData.cancelledTasks}</span>
                <span className="text-xs text-muted-foreground">
                  ({((taskData.cancelledTasks / taskData.totalTasks) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Performance Insights</div>
            <div className="text-xs text-muted-foreground space-y-1">
              {taskData.taskCompletionRate >= 90 && (
                <div className="flex items-center gap-2 text-green-600">
                  <IconTrendingUp className="h-3 w-3" />
                  Excellent task completion rate indicates strong project execution.
                </div>
              )}
              {taskData.taskCompletionRate >= 70 && taskData.taskCompletionRate < 90 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <IconClock className="h-3 w-3" />
                  Good completion rate with room for improvement in task management.
                </div>
              )}
              {taskData.taskCompletionRate < 70 && (
                <div className="flex items-center gap-2 text-red-600">
                  <IconX className="h-3 w-3" />
                  Low completion rate suggests need for better task planning and execution.
                </div>
              )}
              {taskData.cancelledTasks > 0 && (
                <div className="text-muted-foreground">
                  {taskData.cancelledTasks} cancelled tasks may indicate planning or resource issues.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
