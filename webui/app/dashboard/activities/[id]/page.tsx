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
import { getVillages } from "@/lib/api/villages";
import { ArrowLeft } from "lucide-react";
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
  });
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>(
    []
  );

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

        setFormData({
          title: activityData.title,
          description: activityData.description,
          date: formatDateForInput(date),
          status: activityData.status,
          villageId: activityData.village?.id || "",
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
    const fetchVillages = async () => {
      try {
        // Fetch villages based on user's cell
        if (user?.cell) {
          const response = await getVillages(user.cell.id, 1, 100);
          setVillages(response.items);
        } else {
          // If user doesn't have a cell, show an empty list
          setVillages([]);
          toast.error("You need to be assigned to a cell to edit activities");
        }
      } catch (error) {
        console.error("Failed to fetch villages:", error);
        toast.error("Failed to load villages. Please try again later.");
      }
    };

    if (user) {
      fetchVillages();
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
