"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Activity,
  TaskStatus,
  getActivityById,
  updateActivity,
} from "@/lib/api/activities";
import { deleteTask, updateTask } from "@/lib/api/tasks";
import { getIsibos } from "@/lib/api/isibos";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Task Edit Form Component
interface TaskEditFormProps {
  taskData: any;
  isibos: Array<{ id: string; name: string }>;
  onSave: (data: any) => void;
  onCancel: () => void;
}

function TaskEditForm({ taskData, isibos, onSave, onCancel }: TaskEditFormProps) {
  const [formData, setFormData] = useState(taskData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name.includes('Cost') || name.includes('Participants') || name.includes('Impact')
        ? Number(value) || 0
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <h5 className="font-medium text-sm text-gray-700 border-b pb-2">Basic Information</h5>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-isiboId">Isibo</Label>
            <Select
              value={formData.isiboId || ""}
              onValueChange={(value) => handleSelectChange("isiboId", value)}
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

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status || "pending"}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Middle Column - Financial Data */}
        <div className="space-y-4">
          <h5 className="font-medium text-sm text-gray-700 border-b pb-2">Financial Information</h5>

          <div className="space-y-2">
            <Label htmlFor="edit-estimatedCost">Estimated Cost (RWF)</Label>
            <Input
              id="edit-estimatedCost"
              name="estimatedCost"
              type="number"
              min="0"
              value={formData.estimatedCost || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-actualCost">Actual Cost (RWF)</Label>
            <Input
              id="edit-actualCost"
              name="actualCost"
              type="number"
              min="0"
              value={formData.actualCost || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        {/* Third Column - Participation Data */}
        <div className="space-y-4">
          <h5 className="font-medium text-sm text-gray-700 border-b pb-2">Participation</h5>

          <div className="space-y-2">
            <Label htmlFor="edit-expectedParticipants">Expected Participants</Label>
            <Input
              id="edit-expectedParticipants"
              name="expectedParticipants"
              type="number"
              min="0"
              value={formData.expectedParticipants || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-actualParticipants">Actual Participants</Label>
            <Input
              id="edit-actualParticipants"
              name="actualParticipants"
              type="number"
              min="0"
              value={formData.actualParticipants || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        {/* Fourth Column - Impact Data */}
        <div className="space-y-4">
          <h5 className="font-medium text-sm text-gray-700 border-b pb-2">Financial Impact</h5>

          <div className="space-y-2">
            <Label htmlFor="edit-expectedFinancialImpact">Expected Impact (RWF)</Label>
            <Input
              id="edit-expectedFinancialImpact"
              name="expectedFinancialImpact"
              type="number"
              min="0"
              value={formData.expectedFinancialImpact || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-actualFinancialImpact">Actual Impact (RWF)</Label>
            <Input
              id="edit-actualFinancialImpact"
              name="actualFinancialImpact"
              type="number"
              min="0"
              value={formData.actualFinancialImpact || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Description Section - Spans 2 columns */}
      <div className="lg:col-span-2 space-y-2">
        <Label htmlFor="edit-description">Description *</Label>
        <Textarea
          id="edit-description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Enter task description"
          rows={3}
          required
          className="w-full"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ActivityDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    villageId: "",
    tasks: [] as Array<{
      id?: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      isiboId: string;
      estimatedCost?: number;
      actualCost?: number;
      expectedParticipants?: number;
      actualParticipants?: number;
      expectedFinancialImpact?: number;
      actualFinancialImpact?: number;
    }>,
  });

  // State for the current task being added
  const [currentTask, setCurrentTask] = useState({
    title: "",
    description: "",
    isiboId: user?.isibo?.id || "",
    estimatedCost: 0,
    actualCost: 0,
    expectedParticipants: 0,
    actualParticipants: 0,
    expectedFinancialImpact: 0,
    actualFinancialImpact: 0,
  });

  // Removed unused villages state
  const [isibos, setIsibos] = useState<Array<{ id: string; name: string }>>([]);

  // State for confirmation dialogs and task editing
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    taskIndex: number;
    taskId?: string;
  }>({ isOpen: false, taskIndex: -1 });

  const [editingTask, setEditingTask] = useState<{
    isOpen: boolean;
    taskIndex: number;
    taskData: any;
  }>({ isOpen: false, taskIndex: -1, taskData: null });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        const activityData = await getActivityById(id);
        setActivity(activityData);
        const date = new Date(activityData.date);

        const formatDateForInput = (date: Date) => {
          return date.toISOString().slice(0, 10);
        };

        const tasks =
          activityData.tasks?.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description || "",
            status: task.status,
            isiboId: task.isibo?.id || "",
            estimatedCost: task.estimatedCost || 0,
            actualCost: task.actualCost || 0,
            expectedParticipants: task.expectedParticipants || 0,
            actualParticipants: task.actualParticipants || 0,
            expectedFinancialImpact: task.expectedFinancialImpact || 0,
            actualFinancialImpact: task.actualFinancialImpact || 0,
          })) || [];

        setFormData({
          title: activityData.title,
          description: activityData.description,
          date: formatDateForInput(date),
          villageId: activityData.village?.id || "",
          tasks: tasks,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch activity");
        }
        console.error(error);
        router.push("/dashboard/activities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [id, router]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (user?.village) {
          const isibosResponse = await getIsibos(user.village.id, 1, 100);
          setIsibos(isibosResponse.items);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        toast.error("Failed to load locations. Please try again later.");
      }
    };

    if (user) {
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

  // Removed unused handleSelectChange function

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
      actualCost: 0,
      expectedParticipants: 0,
      actualParticipants: 0,
      expectedFinancialImpact: 0,
      actualFinancialImpact: 0,
    });

    toast.success("Task added to activity");
  };

  // Show confirmation dialog for task removal
  const showDeleteConfirmation = (index: number) => {
    const task = formData.tasks[index];
    setDeleteConfirmation({
      isOpen: true,
      taskIndex: index,
      taskId: task.id,
    });
  };

  // Remove a task from the tasks array and database
  const removeTask = async (index: number, taskId?: string) => {
    try {
      // If task has an ID, delete from database
      if (taskId) {
        await deleteTask(taskId);
        toast.success("Task deleted from database");
      }

      // Remove from local state
      setFormData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index),
      }));

      if (!taskId) {
        toast.success("Task removed from activity");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Handle confirmed task deletion
  const handleConfirmedDelete = async () => {
    await removeTask(deleteConfirmation.taskIndex, deleteConfirmation.taskId);
    setDeleteConfirmation({ isOpen: false, taskIndex: -1 });
  };

  // Show edit dialog for task
  const showEditTask = (index: number) => {
    const task = formData.tasks[index];
    setEditingTask({
      isOpen: true,
      taskIndex: index,
      taskData: { ...task },
    });
  };

  // Handle task update
  const handleTaskUpdate = async (updatedTaskData: any) => {
    try {
      const taskIndex = editingTask.taskIndex;
      const task = formData.tasks[taskIndex];

      // If task has an ID, update in database
      if (task.id) {
        await updateTask(task.id, updatedTaskData);
        toast.success("Task updated successfully");
      }

      // Update local state
      setFormData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t, i) =>
          i === taskIndex ? { ...t, ...updatedTaskData } : t
        ),
      }));

      setEditingTask({ isOpen: false, taskIndex: -1, taskData: null });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.date) {
        toast.error("Date is required");
        setIsSaving(false);
        return;
      }
      const date = new Date(formData.date);

      if (isNaN(date.getTime())) {
        toast.error("Invalid date format");
        setIsSaving(false);
        return;
      }

      const activityData = {
        ...formData,
        tasks: formData.tasks.length > 0 ? formData.tasks : undefined,
      };

      await updateActivity(id, activityData);
      toast.success("Activity updated successfully");
      router.push("/dashboard/activities");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update activity");
      }
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/activities")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Activity</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Activity Information</CardTitle>
            <CardDescription>
              Update the details for this activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter activity title"
                required
                className="max-w-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter activity description"
                required
                rows={3}
                className="max-w-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="max-w-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="villageId">Village</Label>
                <Input
                  id="villageId"
                  type="text"
                  value={user?.role === "VILLAGE_LEADER" && user?.village?.name ? user.village.name : ''}
                  placeholder="Enter village name"
                  disabled={true}
                  className="max-w-lg"
                />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Tasks</h4>

              {/* Task list */}
              {formData.tasks.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {formData.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {isibos.find((isibo) => isibo.id === task.isiboId)
                            ?.name || "Unknown Isibo"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status: {(task.status || "pending").charAt(0).toUpperCase() + (task.status || "pending").slice(1)} |
                          Est. Cost: {task.estimatedCost || 0} RWF |
                          Expected: {task.expectedParticipants || 0} participants
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => showEditTask(index)}
                          type="button"
                          title="Edit task"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => showDeleteConfirmation(index)}
                          type="button"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskTitle">Title *</Label>
                      <Input
                        id="taskTitle"
                        name="title"
                        value={currentTask.title}
                        onChange={handleTaskChange}
                        placeholder="Enter task title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taskDescription">Description *</Label>
                      <Textarea
                        id="taskDescription"
                        name="description"
                        value={currentTask.description}
                        onChange={handleTaskChange}
                        placeholder="Enter task description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isiboId">Isibo</Label>
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

                  {/* Right Column - Financial & Participation */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedCost">Estimated Cost (RWF)</Label>
                        <Input
                          id="estimatedCost"
                          name="estimatedCost"
                          type="number"
                          min="0"
                          value={currentTask.estimatedCost}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="actualCost">Actual Cost (RWF)</Label>
                        <Input
                          id="actualCost"
                          name="actualCost"
                          type="number"
                          min="0"
                          value={currentTask.actualCost}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="expectedParticipants">Expected Participants</Label>
                        <Input
                          id="expectedParticipants"
                          name="expectedParticipants"
                          type="number"
                          min="0"
                          value={currentTask.expectedParticipants}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="actualParticipants">Actual Participants</Label>
                        <Input
                          id="actualParticipants"
                          name="actualParticipants"
                          type="number"
                          min="0"
                          value={currentTask.actualParticipants}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                    </div>



                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="expectedFinancialImpact">Expected Impact (RWF)</Label>
                        <Input
                          id="expectedFinancialImpact"
                          name="expectedFinancialImpact"
                          type="number"
                          min="0"
                          value={currentTask.expectedFinancialImpact}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="actualFinancialImpact">Actual Impact (RWF)</Label>
                        <Input
                          id="actualFinancialImpact"
                          name="actualFinancialImpact"
                          type="number"
                          min="0"
                          value={currentTask.actualFinancialImpact}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={addTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/activities")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) =>
        setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
              {deleteConfirmation.taskId && " The task will be permanently removed from the database."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Task Dialog */}
      <Dialog open={editingTask.isOpen} onOpenChange={(open) =>
        setEditingTask(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below.
            </DialogDescription>
          </DialogHeader>

          {editingTask.taskData && (
            <TaskEditForm
              taskData={editingTask.taskData}
              isibos={isibos}
              onSave={handleTaskUpdate}
              onCancel={() => setEditingTask({ isOpen: false, taskIndex: -1, taskData: null })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
