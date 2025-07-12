"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Activity, getActivities } from "@/lib/api/activities";
import { Report, getReports } from "@/lib/api/reports";
import { useUser } from "@/lib/contexts/user-context";
import { FileText, RefreshCw, Search, Filter, Calendar, DollarSign, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";

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

interface Isibo {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<GroupedReport[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    activityId: "all_activities",
    searchQuery: "",
    dateRange: undefined as DateRange | undefined,
    hasEvidence: "all" as "all" | "yes" | "no",
    minCost: "",
    maxCost: "",
    minParticipants: "",
    maxParticipants: "",
    isiboId: "all_isibos",
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
      applyFilters(grouped);
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

  const applyFilters = (reports: GroupedReport[]) => {
    let filtered = [...reports];

    // Text search
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(group =>
        group.activity.title.toLowerCase().includes(query) ||
        group.activity.description?.toLowerCase().includes(query) ||
        group.reports.some(report =>
          report.task?.title?.toLowerCase().includes(query) ||
          report.task?.description?.toLowerCase().includes(query)
        )
      );
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(group => {
        const activityDate = new Date(group.activity.date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;

        if (fromDate && activityDate < fromDate) return false;
        if (toDate && activityDate > toDate) return false;
        return true;
      });
    }

    // Evidence filter
    if (filters.hasEvidence !== "all") {
      filtered = filtered.filter(group => {
        const hasEvidence = filters.hasEvidence === "yes";
        return group.reports.some(report =>
          hasEvidence ? (report.evidenceUrls && report.evidenceUrls.length > 0) :
                       (!report.evidenceUrls || report.evidenceUrls.length === 0)
        );
      });
    }

    // Cost range filter
    if (filters.minCost || filters.maxCost) {
      const minCost = parseFloat(filters.minCost) || 0;
      const maxCost = parseFloat(filters.maxCost) || Infinity;

      filtered = filtered.filter(group =>
        group.totalActualCost >= minCost && group.totalActualCost <= maxCost
      );
    }

    // Participants range filter
    if (filters.minParticipants || filters.maxParticipants) {
      const minParticipants = parseInt(filters.minParticipants) || 0;
      const maxParticipants = parseInt(filters.maxParticipants) || Infinity;

      filtered = filtered.filter(group =>
        group.totalActualParticipants >= minParticipants &&
        group.totalActualParticipants <= maxParticipants
      );
    }

    // Isibo filter
    if (filters.isiboId !== "all_isibos") {
      filtered = filtered.filter(group =>
        group.reports.some(report => report.task?.isibo?.id === filters.isiboId)
      );
    }

    setFilteredReports(filtered);
  };

  const fetchActivities = async () => {
    try {
      const response = await getActivities({ page: 1, size: 100 });
      setActivities(response.items);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  const fetchIsibos = async () => {
    try {
      // Import getIsibos function
      const { getIsibos } = await import("@/lib/api/isibos");
      // Get all isibos by using "all" as villageId or fetch from all villages
      const response = await getIsibos("all", 1, 100);
      setIsibos(response.items);
    } catch (error) {
      console.error("Failed to fetch isibos:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroupedReports();
      fetchActivities();
      fetchIsibos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.activityId]);

  useEffect(() => {
    applyFilters(groupedReports);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, groupedReports]);

  const handleFilterChange = (field: string, value: string | DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      activityId: "all_activities",
      searchQuery: "",
      dateRange: undefined,
      hasEvidence: "all",
      minCost: "",
      maxCost: "",
      minParticipants: "",
      maxParticipants: "",
      isiboId: "all_isibos",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.hasEvidence !== "all") count++;
    if (filters.minCost || filters.maxCost) count++;
    if (filters.minParticipants || filters.maxParticipants) count++;
    if (filters.isiboId !== "all_isibos") count++;
    if (filters.activityId !== "all_activities") count++;
    return count;
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
        <CardContent className="space-y-6">
          {/* Search and Quick Filters */}
          <div className="space-y-4">
            {/* Main search bar with integrated actions */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports, activities, or tasks..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                className="pl-10 pr-4 h-11 text-base"
              />
            </div>

            {/* Quick filters row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Activity quick filter */}
              <Select
                value={filters.activityId}
                onValueChange={(value) => handleFilterChange("activityId", value)}
              >
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="All Activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_activities">All Activities</SelectItem>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Evidence quick filter */}
              <Select
                value={filters.hasEvidence}
                onValueChange={(value) => handleFilterChange("hasEvidence", value)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Evidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="yes">With Evidence</SelectItem>
                  <SelectItem value="no">No Evidence</SelectItem>
                </SelectContent>
              </Select>

              {/* More filters toggle */}
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-9"
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
                {getActiveFiltersCount() > 2 && (
                  <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                    +{getActiveFiltersCount() - 2}
                  </Badge>
                )}
              </Button>

              {/* Reset button - only show if filters are active */}
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Advanced filters - improved design */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Date and Location Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Date & Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Activity Date Range</Label>
                      <DatePickerWithRange
                        date={filters.dateRange}
                        onDateChange={(dateRange) => handleFilterChange("dateRange", dateRange)}
                        placeholder="Select date range..."
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Isibo</Label>
                      <Select
                        value={filters.isiboId}
                        onValueChange={(value) => handleFilterChange("isiboId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Isibos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_isibos">All Isibos</SelectItem>
                          {isibos.map((isibo) => (
                            <SelectItem key={isibo.id} value={isibo.id}>
                              {isibo.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="h-3 w-3" />
                    Financial Filters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Cost Range</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minCost}
                          onChange={(e) => handleFilterChange("minCost", e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-gray-400">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxCost}
                          onChange={(e) => handleFilterChange("maxCost", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Participants Range</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minParticipants}
                          onChange={(e) => handleFilterChange("minParticipants", e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-gray-400">to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxParticipants}
                          onChange={(e) => handleFilterChange("maxParticipants", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active filters summary - improved design */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Filter className="h-4 w-4" />
                <span className="font-medium">{getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {filters.searchQuery && (
                  <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100">
                    Search: "{filters.searchQuery.length > 20 ? filters.searchQuery.substring(0, 20) + '...' : filters.searchQuery}"
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-900"
                      onClick={() => handleFilterChange("searchQuery", "")}
                    />
                  </Badge>
                )}
                {filters.activityId !== "all_activities" && (
                  <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100">
                    Activity: {activities.find(a => a.id === filters.activityId)?.title?.substring(0, 15) || 'Selected'}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-900"
                      onClick={() => handleFilterChange("activityId", "all_activities")}
                    />
                  </Badge>
                )}
                {filters.hasEvidence !== "all" && (
                  <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100">
                    {filters.hasEvidence === "yes" ? "With Evidence" : "No Evidence"}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-900"
                      onClick={() => handleFilterChange("hasEvidence", "all")}
                    />
                  </Badge>
                )}
                {filters.dateRange?.from && (
                  <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date Range
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-900"
                      onClick={() => handleFilterChange("dateRange", undefined)}
                    />
                  </Badge>
                )}
                </div>
              </div>
            )}

          {/* Results summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredReports.length} of {groupedReports.length} activity reports
            </p>
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
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-muted-foreground"
                      >
                        {groupedReports.length === 0 ? "No reports found" : "No reports match your filters"}
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((group) => (
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
                              {group.reports.map(r => r.task?.isibo?.name).filter((name, index, arr) => name && arr.indexOf(name) === index).join(", ")}
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
