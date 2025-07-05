'use client';

import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { DashboardPDFButton } from '@/components/pdf-report-button';

import { useAnalytics } from '@/hooks/use-analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RefreshCw,
  Users,
  FileText,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Page() {
  const {
    coreMetrics,
    timeSeriesData,
    isLoading: analyticsLoading,
    error: analyticsError,
    lastUpdated,
    refreshAnalytics,
  } = useAnalytics();

  const handleRefreshAnalytics = async () => {
    try {
      await refreshAnalytics();
      toast.success('Analytics data refreshed successfully');
    } catch {
      toast.error('Failed to refresh analytics data');
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DashboardPDFButton
            data={{
              coreMetrics: coreMetrics,
              timeSeriesData: timeSeriesData,
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAnalytics}
            disabled={analyticsLoading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {analyticsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">Analytics Error</p>
          <p className="text-sm">{analyticsError}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 lg:gap-6">
        <SectionCards />

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Activities</span>
                  <span className="font-medium">
                    {coreMetrics?.activityStats?.activitiesWithReports || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Activities</span>
                  <span className="font-medium">
                    {coreMetrics?.activityStats?.activitiesWithoutReports || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Tasks</span>
                  <span className="font-medium">
                    {coreMetrics?.activityStats?.totalTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Tasks</span>
                  <span className="font-medium">
                    {coreMetrics?.activityStats?.completedTasks || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participation Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expected Participants</span>
                  <span className="font-medium">
                    {coreMetrics?.participationAnalytics
                      ?.totalExpectedParticipants || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Actual Participants</span>
                  <span className="font-medium">
                    {coreMetrics?.participationAnalytics
                      ?.totalActualParticipants || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Participation Rate</span>
                  <span className="font-medium">
                    {coreMetrics?.participationAnalytics?.participationRate ||
                      0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg per Activity</span>
                  <span className="font-medium">
                    {coreMetrics?.participationAnalytics
                      ?.averageParticipantsPerActivity || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}
