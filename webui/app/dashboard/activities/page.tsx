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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  ActivityFilters,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActivitiesPDFButton } from "@/components/pdf-report-button";
import TasksTabComponent from "./tasks-tab";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

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

  // All roles can see both tabs now

  return (
    <PermissionGate
      anyPermissions={[
        Permission.CREATE_ACTIVITY,
        Permission.VIEW_VILLAGE_ACTIVITY,
        Permission.ADD_TASK_REPORT,
      ]}
    >
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
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    date: string;
    villageId: string;
    tasks: Array<{
      title: string;
      description: string;
      isiboId: string;
      estimatedCost?: number;
      expectedParticipants?: number;
      expectedFinancialImpact?: number;
    }>;
  }>({
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
    estimatedCost: 0,
    expectedParticipants: 0,
    expectedFinancialImpact: 0,
  });
  const [, setVillages] = useState<Array<{ id: string; name: string }>>(
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
  }, [user?.id, user?.village?.id, user?.isibo?.id, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      estimatedCost: 0,
      expectedParticipants: 0,
      expectedFinancialImpact: 0,
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
        tasks:
          formData.tasks.length > 0
            ? formData.tasks.map((task) => ({
                ...task,
                activityId: "temp-id", // This will be replaced by the backend
              }))
            : undefined,
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
        estimatedCost: 0,
        expectedParticipants: 0,
        expectedFinancialImpact: 0,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new activity
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto flex-1">
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
                type="date"
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
              <div className="col-span-3">
                <Input
                  id="villageId"
                  type="text"
                  value={user?.role === "VILLAGE_LEADER" && user?.village?.name ? user.village.name : ''}
                  placeholder="Enter village name"
                  disabled={true}
                  className="w-full"
                />
              </div>
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

              {/* Add task form - Scrollable */}
              <div className="border p-4 rounded-md max-h-96 overflow-y-auto">
                <h5 className="font-medium mb-4">Add a Task</h5>

                <div className="space-y-4">
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
                      placeholder="Enter task title"
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
                      placeholder="Enter task description"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isiboId" className="text-right">
                      Isibos
                    </Label>
                    <div className="space-y-2">
                      <Select
                        value={currentTask.isiboId}
                        onValueChange={(value) =>
                          handleTaskSelectChange("isiboId", value)
                        }
                      >
                        <SelectTrigger>
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
                  </div>

                  {/* Financial Fields */}
                  <div className="border-t pt-4">
                    <h6 className="font-medium mb-3 text-sm">Financial Information</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="estimatedCost" className="text-right text-sm">
                          Estimated Cost
                        </Label>
                        <Input
                          id="estimatedCost"
                          name="estimatedCost"
                          type="number"
                          min="0"
                          value={currentTask.estimatedCost}
                          onChange={handleTaskChange}
                          className="col-span-3"
                          placeholder="0"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="expectedFinancialImpact" className="text-right text-sm">
                          Expected Financial Impact
                        </Label>
                        <Input
                          id="expectedFinancialImpact"
                          name="expectedFinancialImpact"
                          type="number"
                          min="0"
                          value={currentTask.expectedFinancialImpact}
                          onChange={handleTaskChange}
                          className="col-span-3"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={addTask}>
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
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
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    activityId: string | null;
    activityTitle: string;
  }>({
    isOpen: false,
    activityId: null,
    activityTitle: "",
  });

  const fetchActivities = async (
    query: string = searchQuery,
    page: number = 1,
    resetActivities: boolean = true
  ) => {
    try {
      setIsLoading(true);

      // Build filters object
      const filters: ActivityFilters = {
        page,
        size: 10,
        q: query || undefined,
      };

      // For isibo leaders, only fetch activities in their village
      if (user?.role === "ISIBO_LEADER" && user?.village?.id) {
        filters.villageId = user.village.id;
      }

      const response = await getActivities(filters);

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
    } catch (error: unknown) {
      if (error instanceof Error) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDelete = (activity: Activity) => {
    setDeleteConfirmation({
      isOpen: true,
      activityId: activity.id,
      activityTitle: activity.title,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.activityId) return;

    try {
      setIsDeleting(deleteConfirmation.activityId);
      await deleteActivity(deleteConfirmation.activityId);
      toast.success("Activity deleted successfully");
      fetchActivities(searchQuery, 1, true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete activity");
      }
      console.error(error);
    } finally {
      setIsDeleting(null);
      setDeleteConfirmation({
        isOpen: false,
        activityId: null,
        activityTitle: "",
      });
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
            <ActivitiesPDFButton data={activities} />
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {user?.role !== "ISIBO_LEADER" && (
              <CreateActivityDialog onActivityCreated={handleRefresh} />
            )}
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
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                          Activity
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {activity.village?.name || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {user?.role !== "ISIBO_LEADER" ? (
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
                              onClick={() => handleDelete(activity)}
                              disabled={isDeleting === activity.id}
                            >
                              {isDeleting === activity.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No actions available
                          </span>
                        )}
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

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({
              isOpen: false,
              activityId: null,
              activityTitle: "",
            });
          }
        }}
        onConfirm={confirmDelete}
        title="Delete Activity"
        description={`Are you sure you want to delete "${deleteConfirmation.activityTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </Card>
  );
}
