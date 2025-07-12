"use client";

import { AttendanceSelector } from "@/components/reports/attendance-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Report,
  getReportById,
  updateReport,
} from "@/lib/api/reports";
import { getTaskEligibleAttendees, TaskAttendee } from "@/lib/api/tasks";
import { useUser } from "@/lib/contexts/user-context";
import { prepareEvidenceUrls } from "@/lib/utils/validation";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const reportId = resolvedParams.id;

  const router = useRouter();
  const { user } = useUser();
  const [report, setReport] = useState<Report | null>(null);
  const [houseMembers, setHouseMembers] = useState<TaskAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsLoadingIsibo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploadErrors, setHasUploadErrors] = useState(false);
  const [formData, setFormData] = useState({
    attendanceIds: [] as string[],
    comment: "",
    evidenceUrls: [] as string[],
  });


  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const data = await getReportById(reportId);
        setReport(data);

        // Initialize form data
        setFormData({
          attendanceIds: data.attendance?.map(attendee => attendee.id) || [],
          comment: data.comment || "",
          evidenceUrls: data.evidenceUrls || [],
        });

        // Fetch house members for the task
        if (data.task?.id) {
          fetchHouseMembers(data.task.id);
        }

        // Check if user is authorized to edit this report
        if (
          user?.role !== "ADMIN" &&
          user?.role !== "CELL_LEADER" &&
          user?.role !== "VILLAGE_LEADER" &&
          !(
            user?.role === "ISIBO_LEADER" &&
            user?.isibo?.id === data.task?.isibo?.id
          )
        ) {
          toast.error("You are not authorized to edit this report");
          router.push("/dashboard/reports");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch report");
        }
        console.error(error);
        router.push("/dashboard/reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId, router, user]);

  const fetchHouseMembers = async (taskId: string) => {
    try {
      const members = await getTaskEligibleAttendees(taskId);
      setHouseMembers(members);
    } catch (error) {
      console.error("Failed to fetch house members:", error);
      toast.error("Failed to fetch house members for attendance");
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
    setIsSubmitting(true);

    try {
      await updateReport(reportId, {
        attendanceIds: formData.attendanceIds,
        comment: formData.comment,
        evidenceUrls: prepareEvidenceUrls(formData.evidenceUrls),
      });
      toast.success("Report updated successfully");
      router.push("/dashboard/reports");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update report");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-8">Report not found</div>;
  }

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
          <h1 className="text-3xl font-bold">Edit Report</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity and Task Info (Read-only) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Activity</Label>
              <div className="col-span-3">
                <div className="p-2 bg-muted rounded-md text-sm">
                  {report.activity.title}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Task</Label>
              <div className="col-span-3">
                <div className="p-2 bg-muted rounded-md text-sm">
                  {report.task.title}
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Attendance</Label>
              <div className="col-span-3">
                <AttendanceSelector
                  houseMembers={houseMembers}
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
                    Updating...
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
                    <Save className="h-4 w-4 mr-2" />
                    Update Report
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
