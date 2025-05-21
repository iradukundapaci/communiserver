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
import { Activity, getActivities, TaskStatus } from "@/lib/api/activities";
import { getIsibos } from "@/lib/api/isibos";
import { getTaskById, Task, updateTask } from "@/lib/api/tasks";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activityId: "",
    isiboId: "",
    status: TaskStatus.PENDING,
  });
  const [isibos, setIsibos] = useState<any[]>([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const taskData = await getTaskById(id);
        setTask(taskData);

        setFormData({
          title: taskData.title,
          description: taskData.description,
          activityId: taskData.activity.id,
          isiboId: taskData.isibo?.id || "",
          status: taskData.status,
        });
      } catch (error: any) {
        if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch task");
        }
        console.error(error);
        router.push("/dashboard/activities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch activities
        const activitiesResponse = await getActivities(1, 100);
        setActivities(activitiesResponse.items);

        // Fetch isibos based on user's village
        if (user?.village) {
          const isibosResponse = await getIsibos(user.village.id, 1, 100);
          setIsibos(isibosResponse.items);
        } else {
          // If user doesn't have a village, show an empty list
          setIsibos([]);
          toast.error("You need to be assigned to a village to edit tasks");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data. Please try again later.");
      }
    };

    if (user) {
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
    setIsSaving(true);

    try {
      const taskData = {
        ...formData,
      };

      await updateTask(id, taskData);
      toast.success("Task updated successfully");
      router.push("/dashboard/activities?tab=tasks");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update task");
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
          onClick={() => router.push("/dashboard/activities?tab=tasks")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Task</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
            <CardDescription>Update the details for this task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
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
                placeholder="Enter task description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityId">Activity</Label>
              <Select
                value={formData.activityId}
                onValueChange={(value) =>
                  handleSelectChange("activityId", value)
                }
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="isiboId">Isibo</Label>
              <Select
                value={formData.isiboId}
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/activities?tab=tasks")}
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
