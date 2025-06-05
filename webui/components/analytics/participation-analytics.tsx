"use client";

import * as React from "react";
import { IconUsers, IconUserCheck, IconPercentage, IconChartBar } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ParticipationAnalytics {
  totalExpectedParticipants: number;
  totalActualParticipants: number;
  participationRate: number;
  averageParticipantsPerActivity: number;
  averageParticipantsPerTask: number;
}

interface ParticipationAnalyticsProps {
  className?: string;
}

export function ParticipationAnalytics({ className }: ParticipationAnalyticsProps) {
  const [participationData, setParticipationData] = React.useState<ParticipationAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchParticipationData = async () => {
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
          throw new Error('Failed to fetch participation analytics');
        }

        const data = await response.json();
        setParticipationData(data.participationAnalytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipationData();
  }, []);

  const getParticipationRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getParticipationRateVariant = (rate: number) => {
    if (rate >= 90) return "default";
    if (rate >= 70) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Participation Analytics
          </CardTitle>
          <CardDescription>Community engagement and participation metrics</CardDescription>
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
            <IconUsers className="h-5 w-5" />
            Participation Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!participationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Participation Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No participation data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          Participation Analytics
        </CardTitle>
        <CardDescription>
          Community engagement and participation metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Participation Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconUsers className="h-4 w-4" />
                Expected Participants
              </div>
              <div className="text-2xl font-bold">
                {participationData.totalExpectedParticipants.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconUserCheck className="h-4 w-4" />
                Actual Participants
              </div>
              <div className="text-2xl font-bold">
                {participationData.totalActualParticipants.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Participation Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconPercentage className="h-4 w-4" />
                Participation Rate
              </div>
              <Badge variant={getParticipationRateVariant(participationData.participationRate)}>
                {participationData.participationRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(participationData.participationRate, 100)} 
              className="h-3"
            />
            <div className="text-xs text-muted-foreground">
              {participationData.totalActualParticipants} of {participationData.totalExpectedParticipants} expected participants attended
            </div>
          </div>

          {/* Participation Gap */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Participation Gap</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Missing Participants</span>
              <span className={`font-medium ${participationData.totalExpectedParticipants > participationData.totalActualParticipants ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(participationData.totalExpectedParticipants - participationData.totalActualParticipants).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Average Participation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IconChartBar className="h-4 w-4" />
              Average Participation
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Per Activity</div>
                <div className="font-medium text-lg">
                  {participationData.averageParticipantsPerActivity.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Per Task</div>
                <div className="font-medium text-lg">
                  {participationData.averageParticipantsPerTask.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Level */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Engagement Level</div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                participationData.participationRate >= 90 ? 'bg-green-500' :
                participationData.participationRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${getParticipationRateColor(participationData.participationRate)}`}>
                {participationData.participationRate >= 90 ? 'Excellent' :
                 participationData.participationRate >= 70 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {participationData.participationRate >= 90 
                ? 'Community engagement is excellent with high participation rates.'
                : participationData.participationRate >= 70
                ? 'Good community engagement with room for improvement.'
                : 'Low participation rates indicate need for better community engagement strategies.'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
