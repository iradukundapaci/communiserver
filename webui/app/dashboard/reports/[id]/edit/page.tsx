"use client";

import { AttendanceSelector } from "@/components/reports/attendance-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getIsiboById } from "@/lib/api/isibos";
import {
  Citizen,
  Report,
  getReportById,
  updateReport,
} from "@/lib/api/reports";
import { useUser } from "@/lib/contexts/user-context";
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
  const [isiboMembers, setIsiboMembers] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIsibo, setIsLoadingIsibo] = useState(false);
  const [formData, setFormData] = useState({
    attendance: [] as Citizen[],
    comment: "",
    evidenceUrls: [] as string[],
  });
  const [evidenceUrl, setEvidenceUrl] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const data = await getReportById(reportId);
        setReport(data);

        // Initialize form data
        setFormData({
          attendance: data.attendance || [],
          comment: data.comment || "",
          evidenceUrls: data.evidenceUrls || [],
        });

        // Fetch isibo members if user is isibo leader
        if (user?.isibo?.id) {
          fetchIsiboMembers(user.isibo.id);
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

  const handleAttendanceChange = (attendees: Citizen[]) => {
    setFormData((prev) => ({
      ...prev,
      attendance: attendees,
    }));
  };

  const handleAddEvidenceUrl = () => {
    if (evidenceUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        evidenceUrls: [...prev.evidenceUrls, evidenceUrl.trim()],
      }));
      setEvidenceUrl("");
    }
  };

  const handleRemoveEvidenceUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateReport(reportId, formData);
      toast.success("Report updated successfully");
      router.push("/dashboard/reports");
    } catch (error: any) {
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
                  isiboMembers={isiboMembers}
                  selectedAttendees={formData.attendance}
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

            {/* Evidence URLs */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="evidenceUrl" className="text-right mt-2">
                Evidence URLs
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="evidenceUrl"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://example.com/evidence"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddEvidenceUrl}
                  >
                    Add
                  </Button>
                </div>
                {formData.evidenceUrls.length > 0 && (
                  <div className="space-y-1">
                    {formData.evidenceUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="text-sm truncate flex-1">{url}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEvidenceUrl(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                    Updating...
                  </>
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
