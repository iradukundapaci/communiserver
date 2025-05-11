"use client";

import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  ActivityStatus,
  createActivity,
  deleteActivity,
  getActivities,
} from "@/lib/api/activities";
import { getCells } from "@/lib/api/cells";
import { getProfile } from "@/lib/api/users";
import { getVillages } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { format } from "date-fns";
import { Pencil, PlusCircle, RefreshCw, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TasksTabComponent from "./tasks-tab";

export default function ActivitiesPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  // Unwrap searchParams with React.use() as recommended by Next.js
  const unwrappedSearchParams = React.use(searchParams || {});
  const router = useRouter();
  const initialTab =
    unwrappedSearchParams.tab === "tasks" ? "tasks" : "activities";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL with tab parameter without full page reload
    const url = new URL(window.location.href);
    if (value === "activities") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", value);
    }
    window.history.pushState({}, "", url.toString());
  };

  return (
    <PermissionGate permission={Permission.CREATE_ACTIVITY}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Activities Management</h1>
        </div>

        <Tabs
          defaultValue={initialTab}
          className="space-y-4"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <ActivitiesTab />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTabComponent />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
}

interface CreateActivityDialogProps {
  onActivityCreated: () => void;
}

function CreateActivityDialog({
  onActivityCreated,
}: CreateActivityDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    status: ActivityStatus.PENDING,
    organizerId: "",
    cellId: "",
    villageId: "",
  });
  const [cells, setCells] = useState<Array<{ id: string; name: string }>>([]);
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedCellId, setSelectedCellId] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getProfile();
        setFormData((prev) => ({
          ...prev,
          organizerId: profile.id,
        }));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    const fetchCells = async () => {
      try {
        const response = await getCells(1, 100);
        setCells(response.items);
      } catch (error) {
        console.error("Failed to fetch cells:", error);
      }
    };

    fetchUserProfile();
    fetchCells();
  }, []);

  useEffect(() => {
    const fetchVillages = async () => {
      if (selectedCellId) {
        try {
          const response = await getVillages(selectedCellId, 1, 100);
          setVillages(response.items);
        } catch (error) {
          console.error("Failed to fetch villages:", error);
        }
      } else {
        setVillages([]);
        setFormData((prev) => ({
          ...prev,
          villageId: "",
        }));
      }
    };

    fetchVillages();
  }, [selectedCellId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "cellId") {
      // If "NONE" is selected, set selectedCellId to empty string
      setSelectedCellId(value === "NONE" ? "" : value);
    }

    // If "NONE" is selected, set the form value to empty string
    const formValue = value === "NONE" ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [name]: formValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate dates
      if (!formData.startDate || !formData.endDate) {
        toast.error("Start date and end date are required");
        setIsSubmitting(false);
        return;
      }

      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("Invalid date format");
        setIsSubmitting(false);
        return;
      }

      // Use the string dates directly
      const activityData = {
        ...formData,
        // No need to convert to Date objects anymore
      };

      await createActivity(activityData);
      toast.success("Activity created successfully");
      setIsOpen(false);
      onActivityCreated();

      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        status: ActivityStatus.PENDING,
        organizerId: formData.organizerId, // Keep the organizer ID
        cellId: "",
        villageId: "",
      });
      setSelectedCellId("");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create activity");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new activity
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ActivityStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cellId" className="text-right">
                Cell
              </Label>
              <Select
                value={formData.cellId}
                onValueChange={(value) => handleSelectChange("cellId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select cell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {cells.map((cell) => (
                    <SelectItem key={cell.id} value={cell.id}>
                      {cell.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCellId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="villageId" className="text-right">
                  Village
                </Label>
                <Select
                  value={formData.villageId}
                  onValueChange={(value) =>
                    handleSelectChange("villageId", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select village" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {villages.map((village) => (
                      <SelectItem key={village.id} value={village.id}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Activity"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActivitiesTab() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchActivities = async (
    query: string = searchQuery,
    page: number = 1,
    resetActivities: boolean = true
  ) => {
    try {
      setIsLoading(true);
      const response = await getActivities(page, 10, query);

      if (resetActivities) {
        setActivities(response.items);
      } else {
        setActivities((prevActivities) => [
          ...prevActivities,
          ...response.items,
        ]);
      }

      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch activities");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchActivities("", 1, true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchActivities(searchQuery, 1, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchActivities(searchQuery, currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    fetchActivities(searchQuery, 1, true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      try {
        setIsDeleting(id);
        await deleteActivity(id);
        toast.success("Activity deleted successfully");
        fetchActivities(searchQuery, 1, true);
      } catch (error: any) {
        if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to delete activity");
        }
        console.error(error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const getStatusBadgeClass = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.ACTIVE:
      case ActivityStatus.ONGOING:
        return "bg-green-100 text-green-800";
      case ActivityStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      case ActivityStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      case ActivityStatus.PENDING:
      case ActivityStatus.UPCOMING:
        return "bg-yellow-100 text-yellow-800";
      case ActivityStatus.POSTPONED:
      case ActivityStatus.RESCHEDULED:
        return "bg-orange-100 text-orange-800";
      case ActivityStatus.INACTIVE:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activities</CardTitle>
            <CardDescription>
              Manage activities in your administrative area
            </CardDescription>
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
            <CreateActivityDialog onActivityCreated={handleRefresh} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 w-1/4"
          >
            <div className="flex-1">
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isSearching ? "..." : "Search"}
            </Button>
          </form>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Start Date
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    End Date
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Location
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Organizer
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && activities.length === 0 ? (
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
                ) : activities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No activities found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id} className="border-b">
                      <td className="p-4 whitespace-nowrap">
                        {activity.title}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {format(new Date(activity.startDate), "PPP")}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {format(new Date(activity.endDate), "PPP")}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {activity.location || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {activity.organizer.names}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(
                                `/dashboard/activities/${activity.id}`
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(activity.id)}
                            disabled={isDeleting === activity.id}
                          >
                            {isDeleting === activity.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
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
  );
}
