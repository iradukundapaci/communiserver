"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { LocationPerformanceTable } from "@/components/analytics/location-performance-table";
import { UserRoleDistribution } from "@/components/analytics/user-role-distribution";
import { ActivityStatusOverview } from "@/components/analytics/activity-status-overview";
import { EngagementMetrics } from "@/components/analytics/engagement-metrics";
import { RecentActivitiesTimeline } from "@/components/analytics/recent-activities-timeline";
import { DashboardPDFButton } from "@/components/pdf-report-button";
import { useLoadUser } from "@/hooks/use-load-user";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Page() {
  // Load the user data when the dashboard page mounts
  useLoadUser();

  const {
    coreMetrics,
    locationPerformance,
    engagementMetrics,
    timeSeriesData,
    isLoading: analyticsLoading,
    error: analyticsError,
    lastUpdated,
    refreshAnalytics
  } = useAnalytics();

  const handleRefreshAnalytics = async () => {
    try {
      await refreshAnalytics();
      toast.success("Analytics data refreshed successfully");
    } catch {
      toast.error("Failed to refresh analytics data");
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
              locationPerformance: locationPerformance,
              engagementMetrics: engagementMetrics,
              timeSeriesData: timeSeriesData
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAnalytics}
            disabled={analyticsLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
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

        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-6">
          <UserRoleDistribution />
          <ActivityStatusOverview />
          <EngagementMetrics />
          <div className="lg:col-span-2 xl:col-span-1">
            <RecentActivitiesTimeline />
          </div>
        </div>

        {/* Location Performance Table */}
        <div className="px-4 lg:px-6">
          <LocationPerformanceTable />
        </div>
      </div>
    </div>
  );
}
