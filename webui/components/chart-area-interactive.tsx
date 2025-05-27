"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useAnalytics } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export const description = "An interactive area chart showing community activities and tasks";

const chartConfig = {
  activities: {
    label: "Activities",
    color: "hsl(var(--chart-1))",
  },
  tasks: {
    label: "Tasks",
    color: "hsl(var(--chart-2))",
  },
  reports: {
    label: "Reports",
    color: "hsl(var(--chart-3))",
  },
  completedTasks: {
    label: "Completed Tasks",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const [timeSeriesData, setTimeSeriesData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const fetchTimeSeriesData = React.useCallback(async (range: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/analytics/time-series?timeRange=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch time series data: ${response.statusText}`);
      }

      const data = await response.json();
      setTimeSeriesData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setTimeSeriesData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTimeSeriesData(timeRange);
  }, [timeRange, fetchTimeSeriesData]);

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !timeSeriesData) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Error Loading Chart Data</CardTitle>
          <CardDescription>
            {error || "Failed to load time series data. Please try again."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 3 months";
      default: return "Last 30 days";
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Community Activity Trends</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Activities, tasks, and reports over time
          </span>
          <span className="@[540px]/card:hidden">Activity trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value as "7d" | "30d" | "90d")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d")}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder={getTimeRangeLabel(timeRange)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="fillActivities" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-activities)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-activities)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tasks)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tasks)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-reports)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-reports)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="activities"
              type="natural"
              fill="url(#fillActivities)"
              stroke="var(--color-activities)"
              stackId="a"
            />
            <Area
              dataKey="tasks"
              type="natural"
              fill="url(#fillTasks)"
              stroke="var(--color-tasks)"
              stackId="a"
            />
            <Area
              dataKey="reports"
              type="natural"
              fill="url(#fillReports)"
              stroke="var(--color-reports)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
