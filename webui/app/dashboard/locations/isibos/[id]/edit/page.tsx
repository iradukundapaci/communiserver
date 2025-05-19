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
import { getIsiboById, updateIsibo } from "@/lib/api/isibos";
import { getVillages, Village } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditIsiboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { id } = React.use(params);

  const [formData, setFormData] = useState({
    name: "",
    villageId: "",
  });
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCellsLoading, setIsCellsLoading] = useState(true);

  useEffect(() => {
    fetchCells();
    fetchIsibo();
  }, [id]);

  useEffect(() => {
    if (selectedCellId) {
      fetchVillages();
    }
  }, [selectedCellId]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);
    } catch (error) {
      toast.error("Failed to fetch cells");
      console.error(error);
    } finally {
      setIsCellsLoading(false);
    }
  };

  const fetchVillages = async () => {
    if (!selectedCellId) return;

    try {
      const response = await getVillages(selectedCellId, 1, 100); // Get all villages for the selected cell
      setVillages(response.items || []);
    } catch (error) {
      toast.error("Failed to fetch villages");
      console.error(error);
      setVillages([]);
    }
  };

  const fetchIsibo = async () => {
    try {
      setIsLoading(true);
      const isibo = await getIsiboById(id);

      // Set the form data
      setFormData({
        name: isibo.name,
        villageId: isibo.village?.id || "",
      });

      // If the isibo has a village, set the cell ID
      if (isibo.village?.id) {
        try {
          // For village leaders, use their cell ID
          if (user?.role === "VILLAGE_LEADER" && user?.cell?.id) {
            setSelectedCellId(user.cell.id);
          } else {
            // For other users, find the cell that contains this village
            // For now, we'll use the first cell since we don't have a direct way to get the cell ID
            const cellsResponse = await getCells(1, 100);
            if (cellsResponse.items && cellsResponse.items.length > 0) {
              setSelectedCellId(cellsResponse.items[0].id);
            }
          }
        } catch (cellError) {
          console.error("Failed to fetch cells:", cellError);
          // Continue with the isibo data even if we can't get the cells
        }
      }
    } catch (error: any) {
      // Display a more specific error message if available
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch isibo");
      }
      console.error(error);
      // Redirect back to the isibos list if there's an error
      router.push("/dashboard/locations/isibos");
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

  const handleVillageChange = (villageId: string) => {
    setFormData((prev) => ({
      ...prev,
      villageId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Isibo name is required");
      return;
    }

    setIsSaving(true);

    try {
      // Only send the name when updating the isibo
      await updateIsibo(id, { name: formData.name });
      toast.success("Isibo updated successfully");
      router.push("/dashboard/locations/isibos");
    } catch (error) {
      toast.error("Failed to update isibo");
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
    <PermissionRoute permission={Permission.UPDATE_ISIBO}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/isibos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Isibo</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Isibo Information</CardTitle>
              <CardDescription>
                Update the details for this isibo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Isibo Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter isibo name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="villageId">Village</Label>
                <Select
                  value={formData.villageId}
                  onValueChange={handleVillageChange}
                  disabled={true} /* Always disabled in edit mode */
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village.id} value={village.id}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Village cannot be changed when editing an isibo
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/locations/isibos")}
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
