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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { createReport, Citizen } from "@/lib/api/reports";
import { getIsiboById } from "@/lib/api/isibos";
import { AttendanceSelector } from "./attendance-selector";
import { useUser } from "@/lib/contexts/user-context";
import { ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CreateReportDialogProps {
  taskId: string;
  activityId: string;
  onReportCreated: () => void;
}

export function CreateReportDialog({
  taskId,
  activityId,
  onReportCreated,
}: CreateReportDialogProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIsibo, setIsLoadingIsibo] = useState(false);
  const [isiboMembers, setIsiboMembers] = useState<Citizen[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadErrors, setHasUploadErrors] = useState(false);
  const [formData, setFormData] = useState({
    taskId,
    activityId,
    attendance: [] as Citizen[],
    comment: "",
    evidenceUrls: [] as string[],
  });
  // Fetch isibo members when dialog opens
  useEffect(() => {
    if (isOpen && user?.isibo?.id) {
      fetchIsiboMembers(user.isibo.id);
    }
  }, [isOpen, user]);

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

  const handleFilesUploaded = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: urls,
    }));
  };

  const handleAttendanceChange = (attendees: Citizen[]) => {
    setFormData((prev) => ({
      ...prev,
      attendance: attendees,
    }));
  };

  const handleUploadStatusChange = (uploading: boolean, hasErrors: boolean) => {
    setIsUploading(uploading);
    setHasUploadErrors(hasErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createReport(formData);
      toast.success("Report submitted successfully");
      setIsOpen(false);
      onReportCreated();

      // Reset form
      setFormData({
        taskId,
        activityId,
        attendance: [],
        comment: "",
        evidenceUrls: [],
      });
    } catch (error: any) {
      if (error.message) {
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
        <Button variant="outline" size="sm">
          <ClipboardList className="h-4 w-4 mr-2" />
          Submit Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Submit Task Report</DialogTitle>
          <DialogDescription>
            Provide details about the task completion
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto flex-1">
            {/* Attendance */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                Attendance
              </Label>
              <div className="col-span-3">
                <AttendanceSelector
                  isiboMembers={isiboMembers}
                  selectedAttendees={formData.attendance}
                  onAttendanceChange={handleAttendanceChange}
                />
              </div>
            </div>

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
                rows={4}
              />
            </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
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
