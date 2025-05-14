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
import { getCells } from "@/lib/api/cells";
import { getVillages } from "@/lib/api/villages";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    status: ActivityStatus.PENDING,
    cellId: "",
    villageId: "",
  });
  const [cells, setCells] = useState<Array<{ id: string; name: string }>>([]);
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedCellId, setSelectedCellId] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        const activityData = await getActivityById(id);
        setActivity(activityData);

        // Format dates for datetime-local input
        const startDate = new Date(activityData.startDate);
        const endDate = new Date(activityData.endDate);

        const formatDateForInput = (date: Date) => {
          return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
        };

        setFormData({
          title: activityData.title,
          description: activityData.description,
          startDate: formatDateForInput(startDate),
          endDate: formatDateForInput(endDate),
          location: activityData.location || "",
          status: activityData.status,
          cellId: activityData.cell?.id || "",
          villageId: activityData.village?.id || "",
        });

        if (activityData.cell?.id) {
          setSelectedCellId(activityData.cell.id);
        }
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

    const fetchCells = async () => {
      try {
        const response = await getCells(1, 100);
        setCells(response.items);
      } catch (error) {
        console.error("Failed to fetch cells:", error);
      }
    };

    fetchActivity();
    fetchCells();
  }, [id, router]);

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
    setIsSaving(true);

    try {
      // Validate dates
      if (!formData.startDate || !formData.endDate) {
        toast.error("Start date and end date are required");
        setIsSaving(false);
        return;
      }

      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("Invalid date format");
        setIsSaving(false);
        return;
      }

      // Use the string dates directly
      const activityData = {
        ...formData,
        // Keep the organizer ID from the original activity
        organizerId: activity?.organizer.id,
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter activity location"
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
              <Label htmlFor="cellId">Cell</Label>
              <Select
                value={formData.cellId}
                onValueChange={(value) => handleSelectChange("cellId", value)}
              >
                <SelectTrigger>
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
