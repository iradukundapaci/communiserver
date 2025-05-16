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
import { getIsibos } from "@/lib/api/isibos";
import { getVillages } from "@/lib/api/villages";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { format } from "date-fns";
import { Pencil, PlusCircle, RefreshCw, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TasksTabComponent from "./tasks-tab";

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams?.get("tab") === "tasks" ? "tasks" : "activities";
  const [, setActiveTab] = useState(initialTab);

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
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    villageId: user?.village?.id || "",
    tasks: [],
  });

  // State for the current task being added
  const [currentTask, setCurrentTask] = useState({
    title: "",
    description: "",
    isiboId: user?.isibo?.id || "",
  });
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [isibos, setIsibos] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // If we have a user with a cell, fetch villages
        if (user?.cell) {
          const villagesResponse = await getVillages(user.cell.id, 1, 100);
          setVillages(villagesResponse.items);

          // If user has a village, fetch isibos for that village
          if (user.village) {
            const isibosResponse = await getIsibos(user.village.id, 1, 100);
            setIsibos(isibosResponse.items);
          }
        } else {
          // If user doesn't have a cell, show empty lists
          setVillages([]);
          setIsibos([]);
          toast.error("You need to be assigned to a cell to create activities");
        }
      } catch (error) {
        console.error("Failed to fetch villages or isibos:", error);
        toast.error("Failed to load locations. Please try again later.");
      }
    };

    // Update form data when user changes
    if (user) {
      setFormData((prev) => ({
        ...prev,
        villageId: user.village?.id || "",
      }));

      setCurrentTask((prev) => ({
        ...prev,
        isiboId: user.isibo?.id || "",
      }));

      fetchLocations();
    }
  }, [user]);

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
    // If "NONE" is selected, set the form value to empty string
    const formValue = value === "NONE" ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [name]: formValue,
    }));
  };

  // Handle changes to the current task form
  const handleTaskChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes for the current task
  const handleTaskSelectChange = (name: string, value: string) => {
    const formValue = value === "NONE" ? "" : value;
    setCurrentTask((prev) => ({
      ...prev,
      [name]: formValue,
    }));
  };

  // Add the current task to the tasks array
  const addTask = () => {
    // Validate task fields
    if (!currentTask.title) {
      toast.error("Task title is required");
      return;
    }

    if (!currentTask.description) {
      toast.error("Task description is required");
      return;
    }

    if (!currentTask.isiboId) {
      toast.error("Isibo is required for the task");
      return;
    }

    // Add the task to the formData
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { ...currentTask }],
    }));

    // Reset the current task form
    setCurrentTask({
      title: "",
      description: "",
      isiboId: "",
    });

    toast.success("Task added to activity");
  };

  // Remove a task from the tasks array
  const removeTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));

    toast.success("Task removed from activity");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate date
      if (!formData.date) {
        toast.error("Date is required");
        setIsSubmitting(false);
        return;
      }

      // Validate date
      const date = new Date(formData.date);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        toast.error("Invalid date format");
        setIsSubmitting(false);
        return;
      }

      // Validate village
      if (!formData.villageId) {
        toast.error("Village is required");
        setIsSubmitting(false);
        return;
      }

      // Use the string date directly
      const activityData = {
        ...formData,
        // If there are no tasks, don't include an empty array
        tasks: formData.tasks.length > 0 ? formData.tasks : undefined,
      };

      await createActivity(activityData);
      toast.success("Activity created successfully");
      setIsOpen(false);
      onActivityCreated();

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        villageId: "",
        tasks: [],
      });

      // Reset current task
      setCurrentTask({
        title: "",
        description: "",
        isiboId: "",
      });
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
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
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
                  {villages.map((village) => (
                    <SelectItem key={village.id} value={village.id}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Tasks</h4>

              {/* Task list */}
              {formData.tasks.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {formData.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {isibos.find((isibo) => isibo.id === task.isiboId)
                            ?.name || "Unknown Isibo"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(index)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  No tasks added yet. Add tasks below.
                </p>
              )}

              {/* Add task form */}
              <div className="space-y-4 border p-4 rounded-md">
                <h5 className="font-medium">Add a Task</h5>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskTitle" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="taskTitle"
                    name="title"
                    value={currentTask.title}
                    onChange={handleTaskChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskDescription" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="taskDescription"
                    name="description"
                    value={currentTask.description}
                    onChange={handleTaskChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isiboId" className="text-right">
                    Isibo
                  </Label>
                  <Select
                    value={currentTask.isiboId}
                    onValueChange={(value) =>
                      handleTaskSelectChange("isiboId", value)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select isibo" />
                    </SelectTrigger>
                    <SelectContent>
                      {isibos.map((isibo) => (
                        <SelectItem key={isibo.id} value={isibo.id}>
                          {isibo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="secondary" onClick={addTask}>
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
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
      case ActivityStatus.IN_PROGRESS:
        return "bg-green-100 text-green-800";
      case ActivityStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      case ActivityStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      case ActivityStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
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
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="w-56">
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
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
                    Date
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Village
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
                      colSpan={5}
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
                      colSpan={5}
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
                        {format(new Date(activity.date), "PPP")}
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
                        {activity.village?.name || "-"}
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
