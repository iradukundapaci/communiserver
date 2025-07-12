"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, getActivities } from "@/lib/api/activities";
import { Report, getReports } from "@/lib/api/reports";
import { useUser } from "@/lib/contexts/user-context";
import { FileText, RefreshCw, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GroupedReport {
  activity: Activity;
  reports: Report[];
  totalEstimatedCost: number;
  totalActualCost: number;
  totalExpectedParticipants: number;
  totalActualParticipants: number;
  totalExpectedFinancialImpact: number;
  totalActualFinancialImpact: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    activityId: "all_activities",
  });

  const fetchGroupedReports = async () => {
    try {
      setIsLoading(true);

      // Fetch all reports (with pagination if needed)
      let allReports: Report[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getReports(
          page,
          100, // Fetch more per page to reduce API calls
          filters.activityId === "all_activities" ? undefined : filters.activityId,
          undefined,
          user?.role === "ISIBO_LEADER" && user?.isibo?.id ? user.isibo.id : undefined
        );

        allReports = [...allReports, ...response.items];
        hasMore = page < response.meta.totalPages;
        page++;
      }

      // Group reports by activity
      const grouped = groupReportsByActivity(allReports);
      setGroupedReports(grouped);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch reports");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupReportsByActivity = (reports: Report[]): GroupedReport[] => {
    const activityMap = new Map<string, GroupedReport>();

    reports.forEach((report) => {
      const activityId = report.activity.id;

      if (!activityMap.has(activityId)) {
        activityMap.set(activityId, {
          activity: report.activity,
          reports: [],
          totalEstimatedCost: 0,
          totalActualCost: 0,
          totalExpectedParticipants: 0,
          totalActualParticipants: 0,
          totalExpectedFinancialImpact: 0,
          totalActualFinancialImpact: 0,
        });
      }

      const group = activityMap.get(activityId)!;
      group.reports.push(report);

      // Calculate totals - ensure numbers are properly converted and handle potential string values
      const estimatedCost = parseFloat(String(report.task?.estimatedCost)) || 0;
      const actualCost = parseFloat(String(report.task?.actualCost)) || 0;
      const expectedParticipants = parseInt(String(report.task?.expectedParticipants)) || 0;
      const actualParticipants = parseInt(String(report.task?.actualParticipants)) || 0;
      const expectedFinancialImpact = parseFloat(String(report.task?.expectedFinancialImpact)) || 0;
      const actualFinancialImpact = parseFloat(String(report.task?.actualFinancialImpact)) || 0;

      group.totalEstimatedCost += estimatedCost;
      group.totalActualCost += actualCost;
      group.totalExpectedParticipants += expectedParticipants;
      group.totalActualParticipants += actualParticipants;
      group.totalExpectedFinancialImpact += expectedFinancialImpact;
      group.totalActualFinancialImpact += actualFinancialImpact;
    });

    return Array.from(activityMap.values()).sort((a, b) =>
      new Date(b.activity.date).getTime() - new Date(a.activity.date).getTime()
    );
  };

  const fetchActivities = async () => {
    try {
      const response = await getActivities({ page: 1, size: 100 });
      setActivities(response.items);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroupedReports();
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.activityId]);

  const handleFilterChange = (value: string) => {
    setFilters({ activityId: value });
  };

  const handleRefresh = () => {
    fetchGroupedReports();
  };

  const handleViewActivityReport = (activityId: string) => {
    router.push(`/dashboard/reports/activity/${activityId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Activity Reports</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Reports Summary</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              {/* Activity filter */}
              <div className="w-[250px]">
                <Select
                  value={filters.activityId}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_activities">
                      All Activities
                    </SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Grouped Reports table */}
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Activity
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Tasks
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Total Cost
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Participants
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Financial Impact
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-muted-foreground"
                      >
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      </td>
                    </tr>
                  ) : groupedReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    groupedReports.map((group) => (
                      <tr key={group.activity.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{group.activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.activity.village?.name || "No village"}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {formatDate(group.activity.date.toString())}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="font-medium">{group.reports.length} tasks completed</div>
                            <div className="text-muted-foreground">
                              {group.reports.map(r => r.task.isibo?.names).filter((name, index, arr) => arr.indexOf(name) === index).join(", ")}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>Est: {group.totalEstimatedCost.toLocaleString()} RWF</div>
                            <div className="font-medium">Act: {group.totalActualCost.toLocaleString()} RWF</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>Est: {group.totalExpectedParticipants}</div>
                            <div className="font-medium">Act: {group.totalActualParticipants}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>Est: {group.totalExpectedFinancialImpact.toLocaleString()} RWF</div>
                            <div className="font-medium">Act: {group.totalActualFinancialImpact.toLocaleString()} RWF</div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewActivityReport(group.activity.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Report
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
