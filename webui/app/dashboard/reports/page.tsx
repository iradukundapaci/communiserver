"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, getActivities } from "@/lib/api/activities";
import { getIsibos } from "@/lib/api/isibos";
import { Report, deleteReport, getReports } from "@/lib/api/reports";
import { useUser } from "@/lib/contexts/user-context";
import { PermissionGate } from "@/components/permission-gate";
import { Permission } from "@/lib/permissions";
import { ClipboardList, Eye, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isibos, setIsibos] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    activityId: "",
    isiboId: "",
  });

  const fetchReports = async (
    page: number = 1,
    resetReports: boolean = true
  ) => {
    try {
      setIsLoading(true);
      
      // For isibo leaders, only fetch reports for their isibo
      let response;
      if (user?.role === "ISIBO_LEADER" && user?.isibo?.id) {
        response = await getReports(
          page, 
          10, 
          filters.activityId || undefined, 
          undefined, 
          user.isibo.id
        );
      } else {
        // For other roles, fetch reports based on filters
        response = await getReports(
          page, 
          10, 
          filters.activityId || undefined, 
          undefined, 
          filters.isiboId || undefined
        );
      }

      if (resetReports) {
        setReports(response.items);
      } else {
        setReports((prevReports) => [...prevReports, ...response.items]);
      }

      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch reports");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await getActivities(1, 100);
      setActivities(response.items);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  const fetchIsibos = async () => {
    try {
      // If user is a village leader, fetch isibos for their village
      if (user?.village?.id) {
        const response = await getIsibos(user.village.id, 1, 100);
        setIsibos(response.items);
      } else if (user?.role === "ADMIN" || user?.role === "CELL_LEADER") {
        // For admin and cell leaders, fetch all isibos (this would need to be implemented)
        // For now, we'll just show a message
        toast.info("Filtering by isibo is only available for village leaders");
      }
    } catch (error) {
      console.error("Failed to fetch isibos:", error);
    }
  };

  useEffect(() => {
    fetchReports(1, true);
    fetchActivities();
    fetchIsibos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Fetch reports with new filters
    fetchReports(1, true);
  };

  const handleRefresh = () => {
    fetchReports(1, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchReports(currentPage + 1, false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        setIsDeleting(id);
        await deleteReport(id);
        toast.success("Report deleted successfully");
        fetchReports(1, true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to delete report");
        }
        console.error(error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <PermissionGate anyPermissions={[Permission.ADD_TASK_REPORT, Permission.VIEW_VILLAGE_ACTIVITY]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Task Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reports</CardTitle>
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
                    onValueChange={(value) => handleFilterChange("activityId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Activities</SelectItem>
                      {activities.map((activity) => (
                        <SelectItem key={activity.id} value={activity.id}>
                          {activity.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Isibo filter - only for admin, cell leaders, and village leaders */}
                {user?.role !== "ISIBO_LEADER" && (
                  <div className="w-[250px]">
                    <Select
                      value={filters.isiboId}
                      onValueChange={(value) => handleFilterChange("isiboId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by isibo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Isibos</SelectItem>
                        {isibos.map((isibo) => (
                          <SelectItem key={isibo.id} value={isibo.id}>
                            {isibo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Reports table */}
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Activity
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Task
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Comment
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Submitted At
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && reports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-muted-foreground"
                        >
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        </td>
                      </tr>
                    ) : reports.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No reports found
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id} className="border-b">
                          <td className="p-4 whitespace-nowrap">
                            {report.activity.title}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {report.task.title}
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs truncate">
                              {report.comment || "No comment"}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {formatDate(report.createdAt.toString())}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  router.push(`/dashboard/reports/${report.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {/* Only cell leaders and village leaders can delete reports */}
                              {(user?.role === "CELL_LEADER" || 
                                user?.role === "VILLAGE_LEADER" || 
                                user?.role === "ADMIN") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(report.id)}
                                  disabled={isDeleting === report.id}
                                >
                                  {isDeleting === report.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Load more button */}
            {currentPage < totalPages && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
