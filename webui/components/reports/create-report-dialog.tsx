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
import { createReport } from "@/lib/api/reports";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    taskId,
    activityId,
    comment: "",
    evidenceUrls: [] as string[],
  });
  const [evidenceUrl, setEvidenceUrl] = useState("");

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
      await createReport(formData);
      toast.success("Report submitted successfully");
      setIsOpen(false);
      onReportCreated();

      // Reset form
      setFormData({
        taskId,
        activityId,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Task Report</DialogTitle>
          <DialogDescription>
            Provide details about the task completion
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="evidenceUrl" className="text-right mt-2">
                Evidence URLs
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="evidenceUrl"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="Add URL to photos, documents, etc."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddEvidenceUrl}
                  >
                    Add
                  </Button>
                </div>
                {formData.evidenceUrls.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-sm font-medium">Added URLs:</p>
                    <ul className="space-y-1">
                      {formData.evidenceUrls.map((url, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                        >
                          <span className="truncate flex-1">{url}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEvidenceUrl(index)}
                            className="h-6 w-6 p-0"
                          >
                            &times;
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                  Submitting...
                </>
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
