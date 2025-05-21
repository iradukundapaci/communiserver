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
  ActivityStatus,
  getActivityById,
  updateActivity,
} from "@/lib/api/activities";
import { getIsibos } from "@/lib/api/isibos";
import { getVillages } from "@/lib/api/villages";
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
  const [activity, setActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    status: ActivityStatus.PENDING,
    villageId: "",
    tasks: [] as Array<{
      id?: string;
      title: string;
      description: string;
      status?: string;
      isiboId: string;
    }>,
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
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        const activityData = await getActivityById(id);
        setActivity(activityData);

        // Format date for datetime-local input
        const date = new Date(activityData.date);

        const formatDateForInput = (date: Date) => {
          return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
        };

        // Map tasks to the format expected by the form
        const tasks =
          activityData.tasks?.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            isiboId: task.isibo?.id || "",
          })) || [];

        setFormData({
          title: activityData.title,
          description: activityData.description,
          date: formatDateForInput(date),
          status: activityData.status,
          villageId: activityData.village?.id || "",
          tasks: tasks,
        });
      } catch (error: any) {
        if (error.message) {
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
        // Fetch villages based on user's cell
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
          toast.error("You need to be assigned to a cell to edit activities");
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
    setIsSaving(true);

    try {
      // Validate date
      if (!formData.date) {
        toast.error("Date is required");
        setIsSaving(false);
        return;
      }

      // Validate date
      const date = new Date(formData.date);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        toast.error("Invalid date format");
        setIsSaving(false);
        return;
      }

      // Validate village
      if (!formData.villageId) {
        toast.error("Village is required");
        setIsSaving(false);
        return;
      }

      // Use the string date directly
      const activityData = {
        ...formData,
        // If there are no tasks, don't include an empty array
        tasks: formData.tasks.length > 0 ? formData.tasks : undefined,
      };

      await updateActivity(id, activityData);
      toast.success("Activity updated successfully");
      router.push("/dashboard/activities");
    } catch (error: any) {
      if (error.message) {
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
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="villageId">Village</Label>
              <Select
                value={formData.villageId}
                onValueChange={(value) =>
                  handleSelectChange("villageId", value)
                }
              >
                <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Title</Label>
                  <Input
                    id="taskTitle"
                    name="title"
                    value={currentTask.title}
                    onChange={handleTaskChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    name="description"
                    value={currentTask.description}
                    onChange={handleTaskChange}
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

                <div className="flex justify-end">
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
