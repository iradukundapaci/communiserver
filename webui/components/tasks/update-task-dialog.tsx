"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WideDialog, WideDialogContent, WideDialogTrigger, WideDialogForm } from "@/components/ui/wide-dialog";
import { updateTask, type UpdateTaskInput, type Task, TaskStatus } from "@/lib/api/activities";
import { IconEdit, IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateTaskDialogProps {
  task: Task;
  onTaskUpdated: () => void;
  trigger?: React.ReactNode;
}

export function UpdateTaskDialog({ task, onTaskUpdated, trigger }: UpdateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  
  // Financial data - estimated values from task, actual can be updated
  const [estimatedCost, setEstimatedCost] = useState(task.estimatedCost || 0);
  const [actualCost, setActualCost] = useState(task.actualCost || 0);
  const [expectedParticipants, setExpectedParticipants] = useState(task.expectedParticipants || 0);
  const [actualParticipants, setActualParticipants] = useState(task.actualParticipants || 0);
  const [expectedFinancialImpact, setExpectedFinancialImpact] = useState(task.expectedFinancialImpact || 0);
  const [actualFinancialImpact, setActualFinancialImpact] = useState(task.actualFinancialImpact || 0);

  const resetForm = () => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setEstimatedCost(task.estimatedCost || 0);
    setActualCost(task.actualCost || 0);
    setExpectedParticipants(task.expectedParticipants || 0);
    setActualParticipants(task.actualParticipants || 0);
    setExpectedFinancialImpact(task.expectedFinancialImpact || 0);
    setActualFinancialImpact(task.actualFinancialImpact || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: UpdateTaskInput = {
        title,
        description,
        status,
        estimatedCost,
        actualCost,
        expectedParticipants,
        actualParticipants,
        expectedFinancialImpact,
        actualFinancialImpact,
      };

      await updateTask(task.id, updateData);
      toast.success("Task updated successfully");
      setOpen(false);
      onTaskUpdated();
    } catch (error) {
      console.error("Update task error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <IconCheck className="h-4 w-4 text-green-600" />;
      case TaskStatus.ONGOING:
        return <IconClock className="h-4 w-4 text-blue-600" />;
      case TaskStatus.CANCELLED:
        return <IconX className="h-4 w-4 text-red-600" />;
      default:
        return <IconClock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "text-green-600";
      case TaskStatus.ONGOING:
        return "text-blue-600";
      case TaskStatus.CANCELLED:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <WideDialog open={open} onOpenChange={setOpen}>
      <WideDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <IconEdit className="h-4 w-4 mr-2" />
            Update Task
          </Button>
        )}
      </WideDialogTrigger>
      
      <WideDialogContent size="xl">
        <WideDialogForm
          title="Update Task"
          description={`Update task details and add actual values for "${task.title}"`}
          onSubmit={handleSubmit}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Task"}
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className={getStatusColor(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatus).map((statusOption) => (
                      <SelectItem key={statusOption} value={statusOption}>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(statusOption)}
                          <span className={getStatusColor(statusOption)}>
                            {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Task Assignment</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Activity:</strong> {task.activity.title}</p>
                  <p><strong>Assigned to:</strong> {task.isibo?.names}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Financial Data */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                    className="max-w-lg"
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
                    className="max-w-lg border-green-300 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedParticipants">Expected Participants</Label>
                  <Input
                    id="expectedParticipants"
                    type="number"
                    min="0"
                    value={expectedParticipants}
                    onChange={(e) => setExpectedParticipants(parseInt(e.target.value) || 0)}
                    className="max-w-lg"
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
                    className="max-w-lg border-green-300 focus:border-green-500"
                  />
                </div>
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedFinancialImpact">Expected Financial Impact</Label>
                  <Input
                    id="expectedFinancialImpact"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expectedFinancialImpact}
                    onChange={(e) => setExpectedFinancialImpact(parseFloat(e.target.value) || 0)}
                    className="max-w-lg"
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
                    className="max-w-lg border-green-300 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Update Guidelines</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Green-bordered fields are for actual values</li>
                  <li>• Update actual values when task is completed</li>
                  <li>• Estimated values can be adjusted if needed</li>
                  <li>• Change status to "Completed" when task is done</li>
                </ul>
              </div>
            </div>
          </div>
        </WideDialogForm>
      </WideDialogContent>
    </WideDialog>
  );
}
