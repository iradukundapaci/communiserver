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
import { FileUpload } from "@/components/ui/file-upload";
import { Report, updateReport } from "@/lib/api/reports";
import { prepareEvidenceUrls } from "@/lib/utils/validation";
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
    estimatedCost: report.task?.estimatedCost || 0,
    actualCost: report.task?.actualCost || 0,
    expectedParticipants: report.task?.expectedParticipants || 0,
    actualParticipants: report.task?.actualParticipants || 0,
    expectedFinancialImpact: report.task?.expectedFinancialImpact || 0,
    actualFinancialImpact: report.task?.actualFinancialImpact || 0,
    materialsUsed: report.materialsUsed || [],
    challengesFaced: report.challengesFaced || "",
    suggestions: report.suggestions || "",
  });

  // Update form data when report changes
  useEffect(() => {
    setFormData({
      comment: report.comment || "",
      evidenceUrls: report.evidenceUrls || [],
      estimatedCost: report.task.estimatedCost || 0,
      actualCost: report.task.actualCost || 0,
      expectedParticipants: report.task.expectedParticipants || 0,
      actualParticipants: report.task.actualParticipants || 0,
      expectedFinancialImpact: report.task.expectedFinancialImpact || 0,
      actualFinancialImpact: report.task.actualFinancialImpact || 0,
      materialsUsed: report.materialsUsed || [],
      challengesFaced: report.challengesFaced || "",
      suggestions: report.suggestions || "",
    });
  }, [report]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure all numeric fields are properly converted to numbers
      const sanitizedData = {
        ...formData,
        estimatedCost: Number(formData.estimatedCost) || 0,
        actualCost: Number(formData.actualCost) || 0,
        expectedParticipants: Number(formData.expectedParticipants) || 0,
        actualParticipants: Number(formData.actualParticipants) || 0,
        expectedFinancialImpact: Number(formData.expectedFinancialImpact) || 0,
        actualFinancialImpact: Number(formData.actualFinancialImpact) || 0,
        evidenceUrls: prepareEvidenceUrls(formData.evidenceUrls || []),
      };

      await updateReport(report.id, sanitizedData);
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
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Update Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>
            Update the details of your report
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto flex-1">
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



            {/* Financial Data */}
            <div className="col-span-4 border-t pt-4">
              <h4 className="font-medium mb-4">Financial Data</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Cost (RWF)</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.estimatedCost.toLocaleString()} RWF
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
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Actual Participants</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.actualParticipants} people (calculated from attendance)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expected Impact (RWF)</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {formData.expectedFinancialImpact.toLocaleString()} RWF
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
                  onFilesUploaded={(urls) => setFormData(prev => ({ ...prev, evidenceUrls: urls }))}
                  uploadedFiles={formData.evidenceUrls}
                  maxFiles={10}
                  maxSizeInMB={10}
                  multiple={true}
                  accept="image/*,application/pdf,.doc,.docx,.txt,.mp4,.mp3,.zip,.rar"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
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
