"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, calculatePercentage } from "@/lib/utils";
import { 
  IconActivity, 
  IconUsers, 
  IconCurrencyDollar, 
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconTarget,
  IconCheckCircle,
  IconClock,
  IconAlertTriangle
} from "@tabler/icons-react";

interface AnalyticsData {
  activities: {
    total: number;
    withReports: number; // Activities that have at least one report
    withoutReports: number; // Activities without any reports
    totalTasks: number; // Total tasks across all activities
  };
  tasks: {
    total: number;
    completed: number;
    ongoing: number;
    pending: number;
    cancelled: number;
  };
  financial: {
    totalEstimatedCost: number;
    totalActualCost: number;
    totalEstimatedImpact: number;
    totalActualImpact: number;
    costVariance: number;
    impactVariance: number;
  };
  participation: {
    totalExpectedParticipants: number;
    totalActualParticipants: number;
    totalYouthParticipants: number;
    participationRate: number;
  };
  reports: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
}

interface AnalyticsCardsProps {
  data: AnalyticsData;
  className?: string;
}

export function AnalyticsCards({ data, className = "" }: AnalyticsCardsProps) {
  const getVarianceIcon = (variance: number) => {
    if (variance > 5) return <IconTrendingUp className="h-4 w-4 text-red-500" />;
    if (variance < -5) return <IconTrendingDown className="h-4 w-4 text-green-500" />;
    return <IconMinus className="h-4 w-4 text-gray-500" />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 10) return "text-red-600";
    if (variance > 5) return "text-orange-600";
    if (variance < -10) return "text-green-600";
    if (variance < -5) return "text-blue-600";
    return "text-gray-600";
  };

  const activityReportRate = calculatePercentage(data.activities.withReports, data.activities.total);
  const taskCompletionRate = calculatePercentage(data.tasks.completed, data.tasks.total);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Activities Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activities</CardTitle>
          <IconActivity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activities.total}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={activityReportRate} className="flex-1" />
            <span className="text-sm text-muted-foreground">{activityReportRate}%</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="flex items-center">
              <IconCheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {data.activities.withReports} with reports
            </span>
            <span className="flex items-center">
              <IconTarget className="h-3 w-3 mr-1 text-blue-500" />
              {data.activities.totalTasks} tasks
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          <IconTarget className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.tasks.total}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={taskCompletionRate} className="flex-1" />
            <span className="text-sm text-muted-foreground">{taskCompletionRate}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
            <span className="text-center">
              <div className="font-medium text-green-600">{data.tasks.completed}</div>
              <div>Completed</div>
            </span>
            <span className="text-center">
              <div className="font-medium text-blue-600">{data.tasks.ongoing}</div>
              <div>Ongoing</div>
            </span>
            <span className="text-center">
              <div className="font-medium text-gray-600">{data.tasks.pending}</div>
              <div>Pending</div>
            </span>
            <span className="text-center">
              <div className="font-medium text-red-600">{data.tasks.cancelled}</div>
              <div>Cancelled</div>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial</CardTitle>
          <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.financial.totalActualCost)}
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated: {formatCurrency(data.financial.totalEstimatedCost)}
          </p>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">Cost Variance:</span>
            <div className="flex items-center space-x-1">
              {getVarianceIcon(data.financial.costVariance)}
              <span className={`text-xs font-medium ${getVarianceColor(data.financial.costVariance)}`}>
                {data.financial.costVariance > 0 ? "+" : ""}{data.financial.costVariance.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t">
            <div className="text-sm font-medium text-purple-600">
              {formatCurrency(data.financial.totalActualImpact)}
            </div>
            <p className="text-xs text-muted-foreground">Financial Impact</p>
          </div>
        </CardContent>
      </Card>

      {/* Participation Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Participation</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.participation.totalActualParticipants)}</div>
          <p className="text-xs text-muted-foreground">
            Expected: {formatNumber(data.participation.totalExpectedParticipants)}
          </p>
          
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={data.participation.participationRate} className="flex-1" />
            <span className="text-sm text-muted-foreground">{data.participation.participationRate}%</span>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-muted-foreground">Youth:</span>
            <Badge variant="secondary" className="text-xs">
              {formatNumber(data.participation.totalYouthParticipants)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reports Overview */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reports</CardTitle>
          <IconTarget className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.reports.total}</div>
          <p className="text-xs text-muted-foreground">Total reports submitted</p>
          
          <div className="flex justify-between items-center mt-3">
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">{data.reports.thisMonth}</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">{data.reports.lastMonth}</div>
              <div className="text-xs text-muted-foreground">Last month</div>
            </div>
          </div>

          {data.reports.thisMonth > data.reports.lastMonth ? (
            <div className="flex items-center justify-center mt-2 text-xs text-green-600">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              Increasing trend
            </div>
          ) : data.reports.thisMonth < data.reports.lastMonth ? (
            <div className="flex items-center justify-center mt-2 text-xs text-red-600">
              <IconTrendingDown className="h-3 w-3 mr-1" />
              Decreasing trend
            </div>
          ) : (
            <div className="flex items-center justify-center mt-2 text-xs text-gray-600">
              <IconMinus className="h-3 w-3 mr-1" />
              Stable
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <IconAlertTriangle className="h-4 w-4 mr-2" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.financial.costVariance > 15 && (
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                <IconTrendingUp className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">
                  High cost variance: {data.financial.costVariance.toFixed(1)}% over budget
                </span>
              </div>
            )}
            
            {data.participation.participationRate < 70 && (
              <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                <IconUsers className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700">
                  Low participation rate: {data.participation.participationRate}%
                </span>
              </div>
            )}

            {taskCompletionRate < 60 && (
              <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                <IconTarget className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  Task completion rate below target: {taskCompletionRate}%
                </span>
              </div>
            )}

            {activityReportRate < 50 && (
              <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                <IconActivity className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-700">
                  Low activity reporting rate: {activityReportRate}%
                </span>
              </div>
            )}

            {data.financial.costVariance <= 15 &&
             data.participation.participationRate >= 70 &&
             taskCompletionRate >= 60 &&
             activityReportRate >= 50 && (
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <IconCheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">
                  All performance indicators are within target ranges
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
