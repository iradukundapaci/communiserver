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
import { Textarea } from "@/components/ui/textarea";
import { Report, updateReport } from "@/lib/api/reports";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditReportDialogProps {
  report: Report;
  onReportUpdated: () => void;
}

export function EditReportDialog({
  report,
  onReportUpdated,
}: EditReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    comment: report.comment || "",
    evidenceUrls: report.evidenceUrls || [],
  });
  const [evidenceUrl, setEvidenceUrl] = useState("");

  // Update form data when report changes
  useEffect(() => {
    setFormData({
      comment: report.comment || "",
      evidenceUrls: report.evidenceUrls || [],
    });
  }, [report]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      await updateReport(report.id, formData);
      toast.success("Report updated successfully");
      setIsOpen(false);
      onReportUpdated();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>
            Update the details of your report
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
