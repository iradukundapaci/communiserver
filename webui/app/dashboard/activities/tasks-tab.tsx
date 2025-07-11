"use client";

import { CreateReportDialog } from "@/components/reports/create-report-dialog";
import { EditReportDialog } from "@/components/reports/edit-report-dialog";
import { getTaskReport, type Report } from "@/lib/api/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Activity, getActivities } from "@/lib/api/activities";
import { getIsibos } from "@/lib/api/isibos";
import { Task, createTask, deleteTask, getTasks } from "@/lib/api/tasks";
import { useUser } from "@/lib/contexts/user-context";
import { Pencil, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
// import { AdvancedSearchForm, SearchFilter, SearchFormData } from "@/components/search/advanced-search-form";
// import { searchAPI, TaskSearchParams } from "@/lib/api/search";

interface CreateTaskDialogProps {
  onTaskCreated: () => void;
}

function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activityId: "",
    isiboId: user?.isibo?.id || "",
    estimatedCost: 0,
    expectedFinancialImpact: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isibos, setIsibos] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesResponse = await getActivities({ page: 1, size: 100 });
        setActivities(activitiesResponse.items);

        if (user?.village) {
          const isibosResponse = await getIsibos(user.village.id, 1, 100);
          setIsibos(isibosResponse.items);
        } else {
          setIsibos([]);
          toast.error("You need to be assigned to a village to create tasks");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data. Please try again later.");
      }
    };

    if (user) {
      setFormData((prev) => ({
        ...prev,
        isiboId: user.isibo?.id || "",
      }));

      fetchData();
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.activityId) {
        toast.error("Activity is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.isiboId) {
        toast.error("Isibo is required");
        setIsSubmitting(false);
        return;
      }

      await createTask(formData);
      toast.success("Task created successfully");
      setIsOpen(false);
      onTaskCreated();

      setFormData({
        title: "",
        description: "",
        activityId: "",
        isiboId: "",
        estimatedCost: 0,
        expectedFinancialImpact: 0,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create task");
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
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new task
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
              <Label htmlFor="activityId" className="text-right">
                Activity
              </Label>
              <Select
                value={formData.activityId}
                onValueChange={(value) =>
                  handleSelectChange("activityId", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isiboId" className="text-right">
                Isibo
              </Label>
              <Select
                value={formData.isiboId}
                onValueChange={(value) => handleSelectChange("isiboId", value)}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimatedCost" className="text-right">
                Estimated Cost
              </Label>
              <Input
                id="estimatedCost"
                name="estimatedCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedFinancialImpact" className="text-right">
                Expected Financial Impact
              </Label>
              <Input
                id="expectedFinancialImpact"
                name="expectedFinancialImpact"
                type="number"
                min="0"
                step="0.01"
                value={formData.expectedFinancialImpact}
                onChange={handleChange}
                className="col-span-3"
              />
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
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksTab() {
  const router = useRouter();
  const user = useUser();
  const [selectedActivityId, setSelectedActivityId] =
    useState("ALL_ACTIVITIES");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [taskReports, setTaskReports] = useState<Record<string, Report | null>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    taskId: string | null;
    taskTitle: string;
  }>({
    isOpen: false,
    taskId: null,
    taskTitle: "",
  });
  // const [searchFilters, setSearchFilters] = useState<TaskSearchParams>({});
  // const [isibos, setIsibos] = useState<any[]>([]);

  const fetchTasks = useCallback(async (
    activityId: string = selectedActivityId,
    page: number = 1,
    resetTasks: boolean = true
  ) => {
    try {
      setIsLoading(true);

      let response;
      if (user.user?.role === "ISIBO_LEADER" && user?.user.isibo?.id) {
        response = await getTasks(activityId, page, 10, user.user.isibo.id);
      } else {
        response = await getTasks(activityId, page, 10);
      }

      const fetchedTasks = response.items;

      if (resetTasks) {
        setTasks(fetchedTasks);
      } else {
        setTasks((prevTasks) => [...prevTasks, ...fetchedTasks]);
      }

      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);

      // Check for existing reports for each task
      await checkTaskReports(fetchedTasks);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch tasks");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, [selectedActivityId, user.user?.role, user.user?.isibo?.id]);

  const checkTaskReports = async (tasksToCheck: Task[]) => {
    const reportChecks = tasksToCheck.map(async (task) => {
      try {
        const report = await getTaskReport(task.id);
        return { taskId: task.id, report };
      } catch (error) {
        console.error(`Failed to check report for task ${task.id}:`, error);
        return { taskId: task.id, report: null };
      }
    });

    const results = await Promise.all(reportChecks);
    const reportsMap: Record<string, Report | null> = {};

    results.forEach(({ taskId, report }) => {
      reportsMap[taskId] = report;
    });

    setTaskReports(prev => ({ ...prev, ...reportsMap }));
  };

  const fetchActivities = useCallback(async () => {
    try {
      const response = await getActivities({ page: 1, size: 100 });
      setActivities(response.items);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks("", 1, true);
    fetchActivities();
  }, [fetchTasks, fetchActivities]);

  // Function to handle search if needed in the future

  const handleActivityChange = (value: string) => {
    setSelectedActivityId(value);
    // If "ALL_ACTIVITIES" is selected, pass an empty string to fetch all tasks
    const activityIdParam = value === "ALL_ACTIVITIES" ? "" : value;
    fetchTasks(activityIdParam, 1, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      // If "ALL_ACTIVITIES" is selected, pass an empty string to fetch all tasks
      const activityIdParam =
        selectedActivityId === "ALL_ACTIVITIES" ? "" : selectedActivityId;
      fetchTasks(activityIdParam, currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    // If "ALL_ACTIVITIES" is selected, pass an empty string to fetch all tasks
    const activityIdParam =
      selectedActivityId === "ALL_ACTIVITIES" ? "" : selectedActivityId;
    fetchTasks(activityIdParam, 1, true);
    // Clear task reports cache to force refresh
    setTaskReports({});
  };

  const handleDelete = (task: Task) => {
    setDeleteConfirmation({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.taskId) return;

    try {
      setIsDeleting(deleteConfirmation.taskId);
      await deleteTask(deleteConfirmation.taskId);
      toast.success("Task deleted successfully");
      // If "ALL_ACTIVITIES" is selected, pass an empty string to fetch all tasks
      const activityIdParam =
        selectedActivityId === "ALL_ACTIVITIES" ? "" : selectedActivityId;
      fetchTasks(activityIdParam, 1, true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete task");
      }
      console.error(error);
    } finally {
      setIsDeleting(null);
      setDeleteConfirmation({
        isOpen: false,
        taskId: null,
        taskTitle: "",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
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
            {/* Only show create button for admin, cell leader, and village leader */}
            {user.user?.role !== "ISIBO_LEADER" && (
              <CreateTaskDialog onTaskCreated={handleRefresh} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-[250px]">
              <Select
                value={selectedActivityId}
                onValueChange={handleActivityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_ACTIVITIES">All Activities</SelectItem>
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

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Activity
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Isibo
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-muted-foreground"
                    >
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b">
                      <td className="p-4 whitespace-nowrap">{task.title}</td>
                      <td className="p-4 whitespace-nowrap">
                        {task.description}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {task.activity?.title || ""}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {task.isibo?.names}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "ongoing"
                              ? "bg-blue-100 text-blue-800"
                              : task.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.user?.role === "ISIBO_LEADER" ? (
                            // For isibo leaders, show report button based on whether report exists
                            taskReports[task.id] ? (
                              <EditReportDialog
                                report={taskReports[task.id]!}
                                onReportUpdated={handleRefresh}
                              />
                            ) : (
                              <CreateReportDialog
                                task={task}
                                activityId={task.activity.id}
                                onReportCreated={handleRefresh}
                              />
                            )
                          ) : (
                            // For other roles, show edit and delete buttons
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/activities/tasks/${task.id}`
                                  )
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(task)}
                                disabled={isDeleting === task.id}
                              >
                                {isDeleting === task.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </>
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
              taskId: null,
              taskTitle: "",
            });
          }
        }}
        onConfirm={confirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteConfirmation.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </Card>
  );
}
