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
  Activity,
  TaskStatus,
  getActivityById,
  updateActivity,
} from "@/lib/api/activities";
import { getIsibos } from "@/lib/api/isibos";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
      totalEstimatedCost?: number;
      totalActualCost?: number;
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
    totalEstimatedCost: 0,
    totalActualCost: 0,
    expectedFinancialImpact: 0,
    actualFinancialImpact: 0,
  });

  // Removed unused villages state
  const [isibos, setIsibos] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        const activityData = await getActivityById(id);
        setActivity(activityData);
        const date = new Date(activityData.date);

        const formatDateForInput = (date: Date) => {
          return date.toISOString().slice(0, 16);
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
            totalEstimatedCost: task.totalEstimatedCost || 0,
            totalActualCost: task.totalActualCost || 0,
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
      totalEstimatedCost: 0,
      totalActualCost: 0,
      expectedFinancialImpact: 0,
      actualFinancialImpact: 0,
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
                  className="w-full"
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
                        <Label htmlFor="totalEstimatedCost">Total Est. Cost (RWF)</Label>
                        <Input
                          id="totalEstimatedCost"
                          name="totalEstimatedCost"
                          type="number"
                          min="0"
                          value={currentTask.totalEstimatedCost}
                          onChange={handleTaskChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalActualCost">Total Actual Cost (RWF)</Label>
                        <Input
                          id="totalActualCost"
                          name="totalActualCost"
                          type="number"
                          min="0"
                          value={currentTask.totalActualCost}
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
    </div>
  );
}
