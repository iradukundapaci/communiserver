"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { WideDialog, WideDialogContent, WideDialogTrigger, WideDialogForm } from "@/components/ui/wide-dialog";
import { createReport, type CreateReportInput } from "@/lib/api/reports";
import { getIsiboById, IsiboMember } from "@/lib/api/isibos";
import { type Task } from "@/lib/api/activities";
import { AttendanceSelector } from "./attendance-selector";
import { useUser } from "@/lib/contexts/user-context";
import { IconFileText } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CreateReportDialogProps {
  task: Task;
  activityId: string;
  onReportCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateReportDialog({
  task,
  activityId,
  onReportCreated,
  trigger,
}: CreateReportDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isiboMembers, setIsiboMembers] = useState<IsiboMember[]>([]);

  // Form state with new fields
  const [attendanceIds, setAttendanceIds] = useState<string[]>([]);

  // Task financial data (pre-filled from task, can be updated)
  const [estimatedCost, setEstimatedCost] = useState<number>(task.estimatedCost || 0);
  const [actualCost, setActualCost] = useState<number>(task.actualCost || 0);
  const [expectedParticipants, setExpectedParticipants] = useState<number>(task.expectedParticipants || 0);
  const [actualParticipants, setActualParticipants] = useState<number>(task.actualParticipants || 0);
  const [expectedFinancialImpact, setExpectedFinancialImpact] = useState<number>(task.expectedFinancialImpact || 0);
  const [actualFinancialImpact, setActualFinancialImpact] = useState<number>(task.actualFinancialImpact || 0);

  const [comment, setComment] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState<string[]>([]);
  const [challengesFaced, setChallengesFaced] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  // Fetch isibo members when dialog opens
  useEffect(() => {
    if (open && user?.isibo?.id) {
      fetchIsiboMembers(user.isibo.id);
    }
  }, [open, user]);

  const fetchIsiboMembers = async (isiboId: string) => {
    try {
      const isibo = await getIsiboById(isiboId);
      setIsiboMembers(isibo.members || []);
    } catch (error) {
      console.error("Failed to fetch isibo members:", error);
      toast.error("Failed to fetch isibo members");
    }
  };

  const resetForm = () => {
    setAttendanceIds([]);
    setEstimatedCost(task.estimatedCost || 0);
    setActualCost(task.actualCost || 0);
    setExpectedParticipants(task.expectedParticipants || 0);
    setActualParticipants(task.actualParticipants || 0);
    setExpectedFinancialImpact(task.expectedFinancialImpact || 0);
    setActualFinancialImpact(task.actualFinancialImpact || 0);
    setComment("");
    setMaterialsUsed([]);
    setChallengesFaced("");
    setSuggestions("");
    setEvidenceUrls([]);
  };

  const handleMaterialsChange = (value: string) => {
    const materials = value.split('\n').filter(m => m.trim());
    setMaterialsUsed(materials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const reportData: CreateReportInput = {
        activityId,
        taskId: task.id,
        attendanceIds: attendanceIds.length > 0 ? attendanceIds : undefined,
        // Include task financial data
        estimatedCost,
        actualCost,
        expectedParticipants,
        actualParticipants,
        expectedFinancialImpact,
        actualFinancialImpact,
        comment: comment || undefined,
        materialsUsed: materialsUsed.length > 0 ? materialsUsed : undefined,
        challengesFaced: challengesFaced || undefined,
        suggestions: suggestions || undefined,
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      };

      await createReport(reportData);
      toast.success("Report created successfully");
      resetForm();
      setOpen(false);
      onReportCreated();
    } catch (error) {
      console.error("Create report error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WideDialog open={open} onOpenChange={setOpen}>
      <WideDialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <IconFileText className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        )}
      </WideDialogTrigger>

      <WideDialogContent size="2xl">
        <WideDialogForm
          title={`Create Report for: ${task.title}`}
          description={`Submit a report for the task "${task.title}" assigned to ${task.isibo?.names}`}
          onSubmit={handleSubmit}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Report"}
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Participation & Financial Data */}
            <div className="space-y-6">


              <div>
                <h3 className="text-lg font-medium mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedCost">Estimated Cost</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualCost">Actual Cost</Label>
                    <Input
                      id="actualCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={actualCost}
                      onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedParticipants">Expected Participants</Label>
                    <Input
                      id="expectedParticipants"
                      type="number"
                      min="0"
                      value={expectedParticipants}
                      onChange={(e) => setExpectedParticipants(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualParticipants">Actual Participants</Label>
                    <Input
                      id="actualParticipants"
                      type="number"
                      min="0"
                      value={actualParticipants}
                      onChange={(e) => setActualParticipants(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectedFinancialImpact">Expected Financial Impact</Label>
                    <Input
                      id="expectedFinancialImpact"
                      type="number"
                      min="0"
                      step="0.01"
                      value={expectedFinancialImpact}
                      onChange={(e) => setExpectedFinancialImpact(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualFinancialImpact">Actual Financial Impact</Label>
                    <Input
                      id="actualFinancialImpact"
                      type="number"
                      min="0"
                      step="0.01"
                      value={actualFinancialImpact}
                      onChange={(e) => setActualFinancialImpact(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Attendance</h3>
                <AttendanceSelector
                  isiboMembers={isiboMembers}
                  selectedAttendeeIds={attendanceIds}
                  onAttendanceChange={setAttendanceIds}
                />
              </div>
            </div>

            {/* Right Column - Report Details & Files */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Report Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="comment">Comments</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add any comments about the task execution..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="materials">Materials Used</Label>
                    <Textarea
                      id="materials"
                      value={materialsUsed.join('\n')}
                      onChange={(e) => handleMaterialsChange(e.target.value)}
                      placeholder="List materials used (one per line)..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="challenges">Challenges Faced</Label>
                    <Textarea
                      id="challenges"
                      value={challengesFaced}
                      onChange={(e) => setChallengesFaced(e.target.value)}
                      placeholder="Describe any challenges encountered..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="suggestions">Suggestions</Label>
                    <Textarea
                      id="suggestions"
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      placeholder="Provide suggestions for improvement..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Evidence Files</h3>
                <FileUpload
                  onFilesUploaded={setEvidenceUrls}
                  uploadedFiles={evidenceUrls}
                  maxFiles={10}
                  maxSizeInMB={10}
                  multiple={true}
                  accept="image/*,application/pdf,.doc,.docx,.txt,.mp4,.mp3,.zip,.rar"
                />
              </div>
            </div>
          </div>
        </WideDialogForm>
      </WideDialogContent>
    </WideDialog>
  );
}
