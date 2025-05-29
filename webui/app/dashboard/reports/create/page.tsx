"use client";

import { AttendanceSelector } from "@/components/reports/attendance-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Activity, getActivities } from "@/lib/api/activities";
import { getIsiboById, IsiboMember } from "@/lib/api/isibos";
import { createReport } from "@/lib/api/reports";
import { Task, getTasks } from "@/lib/api/tasks";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateReportPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isiboMembers, setIsiboMembers] = useState<IsiboMember[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [, setIsLoadingIsibo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadErrors, setHasUploadErrors] = useState(false);
  const [formData, setFormData] = useState({
    taskId: "",
    activityId: "",
    attendanceIds: [] as string[],
    comment: "",
    evidenceUrls: [] as string[],
  });


  // Fetch activities and isibo members on page load
  useEffect(() => {
    fetchActivities();
    if (user?.isibo?.id) {
      fetchIsiboMembers(user.isibo.id);
    }
  }, [user]);

  // Fetch tasks when activity is selected
  useEffect(() => {
    if (formData.activityId) {
      fetchTasks(formData.activityId);
    }
  }, [formData.activityId]);

  const fetchActivities = async () => {
    try {
      setIsLoadingActivities(true);
      // For isibo leaders, fetch activities for their village
      const response = await getActivities(1, 100, "", user?.village?.id);
      setActivities(response.items);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      toast.error("Failed to fetch activities");
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const fetchTasks = async (activityId: string) => {
    try {
      setIsLoadingTasks(true);
      // For isibo leaders, fetch tasks for their isibo
      const response = await getTasks(activityId, 1, 100, user?.isibo?.id);
      setTasks(response.items);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchIsiboMembers = async (isiboId: string) => {
    try {
      setIsLoadingIsibo(true);
      const isibo = await getIsiboById(isiboId);
      setIsiboMembers(isibo.members || []);
    } catch (error) {
      console.error("Failed to fetch isibo members:", error);
      toast.error("Failed to fetch isibo members");
    } finally {
      setIsLoadingIsibo(false);
    }
  };

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

  const handleAttendanceChange = (attendeeIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      attendanceIds: attendeeIds,
    }));
  };

  const handleFilesUploaded = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: urls,
    }));
  };

  const handleUploadStatusChange = (uploading: boolean, hasErrors: boolean) => {
    setIsUploading(uploading);
    setHasUploadErrors(hasErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.activityId) {
      toast.error("Please select an activity");
      return;
    }

    if (!formData.taskId) {
      toast.error("Please select a task");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReport({
        activityId: formData.activityId,
        taskId: formData.taskId,
        attendanceIds: formData.attendanceIds,
        comment: formData.comment,
        evidenceUrls: formData.evidenceUrls,
      });
      toast.success("Report submitted successfully");
      router.push("/dashboard/reports");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit report");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/reports")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create Report</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activity" className="text-right">
                Activity
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.activityId}
                  onValueChange={(value) =>
                    handleSelectChange("activityId", value)
                  }
                  disabled={isLoadingActivities}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an activity" />
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
            </div>

            {/* Task Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task" className="text-right">
                Task
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.taskId}
                  onValueChange={(value) => handleSelectChange("taskId", value)}
                  disabled={isLoadingTasks || !formData.activityId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attendance */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Attendance</Label>
              <div className="col-span-3">
                <AttendanceSelector
                  isiboMembers={isiboMembers}
                  selectedAttendeeIds={formData.attendanceIds}
                  onAttendanceChange={handleAttendanceChange}
                />
              </div>
            </div>

            {/* Comment */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="comment" className="text-right mt-2">
                Comments
              </Label>
              <Textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Provide details about the task completion"
              />
            </div>

            {/* Evidence Files */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                Evidence Files
              </Label>
              <div className="col-span-3">
                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  uploadedFiles={formData.evidenceUrls}
                  maxFiles={10}
                  maxSizeInMB={10}
                  accept="image/*,application/pdf,.doc,.docx,.txt,.mp4,.mp3,.zip,.rar"
                  onUploadStatusChange={handleUploadStatusChange}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isUploading || hasUploadErrors}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                    Submitting...
                  </>
                ) : isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                    Uploading files...
                  </>
                ) : hasUploadErrors ? (
                  "Fix upload errors first"
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
