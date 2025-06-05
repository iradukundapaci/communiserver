"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { WideDialog, WideDialogContent, WideDialogTrigger, WideDialogForm } from "@/components/ui/wide-dialog";
import { createActivity, type CreateActivityInput, type CreateTaskInput } from "@/lib/api/activities";
import { searchVillages, type Village } from "@/lib/api/villages";
import { getIsibos, type Isibo } from "@/lib/api/isibos";
import { IconPlus, IconTrash, IconCalendar } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateActivityDialogProps {
  onActivityCreated: () => void;
  trigger?: React.ReactNode;
}

interface TaskFormData extends Omit<CreateTaskInput, 'activityId'> {
  tempId: string;
}

export function CreateActivityDialog({ onActivityCreated, trigger }: CreateActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [tasks, setTasks] = useState<TaskFormData[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setSelectedVillage(null);
    setTasks([]);
  };

  const addTask = () => {
    const newTask: TaskFormData = {
      tempId: `temp-${Date.now()}`,
      title: "",
      description: "",
      isiboId: "",
      estimatedCost: 0,
      expectedParticipants: 0,
      totalEstimatedCost: 0,
      expectedFinancialImpact: 0,
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (tempId: string) => {
    setTasks(tasks.filter(task => task.tempId !== tempId));
  };

  const updateTask = (tempId: string, updates: Partial<TaskFormData>) => {
    setTasks(tasks.map(task => 
      task.tempId === tempId ? { ...task, ...updates } : task
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVillage) {
      toast.error("Please select a village");
      return;
    }

    setIsLoading(true);

    try {
      const activityData: CreateActivityInput = {
        title,
        description,
        date,
        villageId: selectedVillage.id,
        tasks: tasks.map(({ tempId, ...task }) => task),
      };

      await createActivity(activityData);
      toast.success("Activity created successfully");
      resetForm();
      setOpen(false);
      onActivityCreated();
    } catch (error) {
      console.error("Create activity error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create activity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVillageSearch = async (query: string) => {
    try {
      const villages = await searchVillages(query);
      return villages.map(village => ({
        value: village.id,
        label: `${village.name} (${village.cell?.name})`,
        data: village,
      }));
    } catch (error) {
      console.error("Village search error:", error);
      return [];
    }
  };

  const handleIsiboSearch = async (query: string, villageId?: string) => {
    try {
      if (!villageId) return [];

      const response = await getIsibos(villageId, 1, 50, query);
      return response.items.map(isibo => ({
        value: isibo.id,
        label: isibo.name,
        data: isibo,
      }));
    } catch (error) {
      console.error("Isibo search error:", error);
      return [];
    }
  };

  return (
    <WideDialog open={open} onOpenChange={setOpen}>
      <WideDialogTrigger asChild>
        {trigger || (
          <Button>
            <IconPlus className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        )}
      </WideDialogTrigger>
      
      <WideDialogContent size="2xl">
        <WideDialogForm
          title="Create New Activity"
          description="Create a new activity with tasks assigned to different isibos"
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
                {isLoading ? "Creating..." : "Create Activity"}
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Activity Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter activity title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <IconCalendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <Label>Village *</Label>
                <SearchableSelect
                  placeholder="Search and select village..."
                  onSearch={handleVillageSearch}
                  onSelect={(option) => setSelectedVillage(option.data)}
                  onClear={() => setSelectedVillage(null)}
                  value={selectedVillage ? {
                    value: selectedVillage.id,
                    label: `${selectedVillage.name} (${selectedVillage.cell?.name})`,
                    data: selectedVillage,
                  } : null}
                />
              </div>
            </div>

            {/* Right Column - Tasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tasks</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTask}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <TaskForm
                    key={task.tempId}
                    task={task}
                    villageId={selectedVillage?.id}
                    onUpdate={(updates) => updateTask(task.tempId, updates)}
                    onRemove={() => removeTask(task.tempId)}
                    onIsiboSearch={handleIsiboSearch}
                  />
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks added yet</p>
                    <p className="text-sm">Click &quot;Add Task&quot; to create tasks for this activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </WideDialogForm>
      </WideDialogContent>
    </WideDialog>
  );
}

// Task form component
interface TaskFormProps {
  task: TaskFormData;
  villageId?: string;
  onUpdate: (updates: Partial<TaskFormData>) => void;
  onRemove: () => void;
  onIsiboSearch: (query: string, villageId?: string) => Promise<Array<{value: string; label: string; data: Isibo}>>;
}

function TaskForm({ task, villageId, onUpdate, onRemove, onIsiboSearch }: TaskFormProps) {
  const [selectedIsibo, setSelectedIsibo] = useState<Isibo | null>(null);

  const handleIsiboSearchWrapper = async (query: string) => {
    return onIsiboSearch(query, villageId);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Task</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Label>Task Title *</Label>
          <Input
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <Label>Assigned Isibo *</Label>
          <SearchableSelect
            placeholder="Search isibo..."
            onSearch={handleIsiboSearchWrapper}
            onSelect={(option) => {
              setSelectedIsibo(option.data);
              onUpdate({ isiboId: option.value });
            }}
            onClear={() => {
              setSelectedIsibo(null);
              onUpdate({ isiboId: "" });
            }}
            value={selectedIsibo ? {
              value: selectedIsibo.id,
              label: selectedIsibo.name,
              data: selectedIsibo,
            } : null}
            disabled={!villageId}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <Label>Description</Label>
          <Textarea
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe the task"
            rows={2}
          />
        </div>

        <div>
          <Label>Estimated Cost (RWF)</Label>
          <Input
            type="number"
            min="0"
            value={task.estimatedCost || ""}
            onChange={(e) => onUpdate({ estimatedCost: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Expected Participants</Label>
          <Input
            type="number"
            min="0"
            value={task.expectedParticipants || ""}
            onChange={(e) => onUpdate({ expectedParticipants: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Total Estimated Cost (RWF)</Label>
          <Input
            type="number"
            min="0"
            value={task.totalEstimatedCost || ""}
            onChange={(e) => onUpdate({ totalEstimatedCost: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Expected Financial Impact (RWF)</Label>
          <Input
            type="number"
            min="0"
            value={task.expectedFinancialImpact || ""}
            onChange={(e) => onUpdate({ expectedFinancialImpact: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
