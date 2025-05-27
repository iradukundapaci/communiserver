"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cell, getCells } from "@/lib/api/cells";
import { getVillageById, updateVillage } from "@/lib/api/villages";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditVillagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { id } = React.use(params);

  const [formData, setFormData] = useState({
    name: "",
    cellId: "",
  });
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCells();
    fetchVillage();
  }, [id]);

  const fetchCells = async () => {
    try {
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);
    } catch (error) {
      toast.error("Failed to fetch cells");
      console.error(error);
    }
  };

  const fetchVillage = async () => {
    try {
      setIsLoading(true);
      const village = await getVillageById(id);

      // Verify that the cell leader can edit this village
      if (
        user?.role === "CELL_LEADER" &&
        user?.cell?.id &&
        village.cell?.id !== user.cell.id
      ) {
        toast.error("You can only edit villages in your assigned cell");
        router.push("/dashboard/locations/villages");
        return;
      }

      setFormData({
        name: village.name,
        cellId: village.cell?.id || "",
      });
    } catch (error) {
      toast.error("Failed to fetch village");
      console.error(error);
      router.push("/dashboard/locations/villages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCellChange = (cellId: string) => {
    setFormData((prev) => ({
      ...prev,
      cellId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Village name is required");
      return;
    }

    setIsSaving(true);

    try {
      // Only send the name when updating the village
      await updateVillage(id, { name: formData.name });
      toast.success("Village updated successfully");
      router.push("/dashboard/locations/villages");
    } catch (error) {
      toast.error("Failed to update village");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PermissionRoute permission={Permission.UPDATE_VILLAGE}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/villages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Village</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Village Information</CardTitle>
              <CardDescription>
                Update the details for this village
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Village Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter village name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cellId">Cell</Label>
                <Select
                  value={formData.cellId}
                  onValueChange={handleCellChange}
                  disabled={true} /* Always disabled in edit mode */
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cell" />
                  </SelectTrigger>
                  <SelectContent>
                    {cells.map((cell) => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {user?.role === "CELL_LEADER" && user?.cell?.id ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    This village belongs to your assigned cell
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cell cannot be changed when editing a village
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/locations/villages")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
