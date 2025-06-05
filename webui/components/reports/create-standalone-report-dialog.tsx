"use client";

import { Button } from "@/components/ui/button";
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
import { FileUpload } from "@/components/ui/file-upload";
import { Activity, getActivities } from "@/lib/api/activities";
import { getIsiboById, IsiboMember } from "@/lib/api/isibos";
import { createReport } from "@/lib/api/reports";
import { Task, getTasks } from "@/lib/api/tasks";
import { useUser } from "@/lib/contexts/user-context";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AttendanceSelector } from "./attendance-selector";

interface CreateStandaloneReportDialogProps {
  onReportCreated: () => void;
}

export function CreateStandaloneReportDialog({
  onReportCreated,
}: CreateStandaloneReportDialogProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
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
    estimatedCost: 0,
    actualCost: 0,
    expectedParticipants: 0,
    actualParticipants: 0,
    expectedFinancialImpact: 0,
    actualFinancialImpact: 0,
    materialsUsed: [] as string[],
    challengesFaced: "",
    suggestions: "",
  });


  // Fetch activities and isibo members when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchActivities();
      if (user?.isibo?.id) {
        fetchIsiboMembers(user.isibo.id);
      }
    }
  }, [isOpen, user]);

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
      const response = await getActivities({
        page: 1,
        size: 100,
        villageId: user?.village?.id
      });
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
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset task when activity changes
    if (name === "activityId") {
      setFormData((prev) => ({
        ...prev,
        taskId: "",
        estimatedCost: 0,
        expectedParticipants: 0,
        expectedFinancialImpact: 0,
      }));
    }

    // Auto-fill estimated values when task is selected
    if (name === "taskId" && value) {
      const selectedTask = tasks.find(task => task.id === value);
      if (selectedTask) {
        setFormData((prev) => ({
          ...prev,
          estimatedCost: selectedTask.estimatedCost || 0,
          expectedParticipants: selectedTask.expectedParticipants || 0,
          expectedFinancialImpact: selectedTask.expectedFinancialImpact || 0,
        }));
      }
    }
  };

  const handleFilesUploaded = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: urls,
    }));
  };

  const handleAttendanceChange = (attendeeIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      attendanceIds: attendeeIds,
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
      // Ensure all numeric fields are properly converted to numbers
      await createReport({
        activityId: formData.activityId,
        taskId: formData.taskId,
        attendanceIds: formData.attendanceIds,
        comment: formData.comment,
        evidenceUrls: formData.evidenceUrls,
        estimatedCost: Number(formData.estimatedCost) || 0,
        actualCost: Number(formData.actualCost) || 0,
        expectedParticipants: Number(formData.expectedParticipants) || 0,
        // actualParticipants will be calculated from attendanceIds in backend
        expectedFinancialImpact: Number(formData.expectedFinancialImpact) || 0,
        actualFinancialImpact: Number(formData.actualFinancialImpact) || 0,
        materialsUsed: formData.materialsUsed,
        challengesFaced: formData.challengesFaced,
        suggestions: formData.suggestions,
      });
      toast.success("Report submitted successfully");
      setIsOpen(false);
      onReportCreated();

      // Reset form
      setFormData({
        taskId: "",
        activityId: "",
        attendanceIds: [],
        comment: "",
        evidenceUrls: [],
        estimatedCost: 0,
        actualCost: 0,
        expectedParticipants: 0,
        actualParticipants: 0,
        expectedFinancialImpact: 0,
        actualFinancialImpact: 0,
        materialsUsed: [],
        challengesFaced: "",
        suggestions: "",
      });
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>
            Submit a report for a task in your isibo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto flex-1">
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
              <Label className="text-right mt-2">
                Attendance
              </Label>
              <div className="col-span-3">
                <AttendanceSelector
                  isiboMembers={isiboMembers}
                  selectedAttendeeIds={formData.attendanceIds}
                  onAttendanceChange={handleAttendanceChange}
                />
              </div>
            </div>



            {/* Financial Data */}
            <div className="col-span-4 border-t pt-4">
              <h4 className="font-medium mb-4">Financial Data</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Cost (RWF)</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.estimatedCost.toLocaleString()} RWF
                    {!formData.taskId && <span className="text-muted-foreground ml-2">(Select task first)</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualCost">Actual Cost (RWF)</Label>
                  <Input
                    id="actualCost"
                    name="actualCost"
                    type="number"
                    min="0"
                    value={formData.actualCost}
                    onChange={handleChange}
                    className="max-w-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Participants</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.expectedParticipants} people
                    {!formData.taskId && <span className="text-muted-foreground ml-2">(Select task first)</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Actual Participants</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.attendanceIds.length} people (from attendance list)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expected Impact (RWF)</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.expectedFinancialImpact.toLocaleString()} RWF
                    {!formData.taskId && <span className="text-muted-foreground ml-2">(Select task first)</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualFinancialImpact">Actual Impact (RWF)</Label>
                  <Input
                    id="actualFinancialImpact"
                    name="actualFinancialImpact"
                    type="number"
                    min="0"
                    value={formData.actualFinancialImpact}
                    onChange={handleChange}
                    className="max-w-lg"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="col-span-4 border-t pt-4">
              <h4 className="font-medium mb-4">Additional Details</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment">Comments</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Provide details about the task completion"
                    rows={3}
                    className="max-w-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challengesFaced">Challenges Faced</Label>
                  <Textarea
                    id="challengesFaced"
                    name="challengesFaced"
                    value={formData.challengesFaced}
                    onChange={handleChange}
                    placeholder="Describe any challenges encountered"
                    rows={3}
                    className="max-w-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestions">Suggestions</Label>
                  <Textarea
                    id="suggestions"
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleChange}
                    placeholder="Provide suggestions for improvement"
                    rows={3}
                    className="max-w-lg"
                  />
                </div>
              </div>
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
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
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
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
