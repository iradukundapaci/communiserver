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
import { createVillage } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateVillagePage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    cellId: "",
  });
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCellsLoading, setIsCellsLoading] = useState(true);

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);

      // If user is a cell leader, pre-select their cell
      if (user?.role === "CELL_LEADER" && user?.cell?.id) {
        setFormData((prev) => ({
          ...prev,
          cellId: user.cell.id,
        }));
      }
      // Otherwise, select the first cell by default
      else if (response.items && response.items.length > 0) {
        setFormData((prev) => ({
          ...prev,
          cellId: response.items[0].id,
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch cells");
      console.error(error);
    } finally {
      setIsCellsLoading(false);
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

    if (!formData.cellId) {
      toast.error("Please select a cell");
      return;
    }

    setIsLoading(true);

    try {
      await createVillage(formData);
      toast.success("Village created successfully");
      router.push("/dashboard/locations/villages");
    } catch (error) {
      toast.error("Failed to create village");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PermissionRoute permission={Permission.CREATE_VILLAGE}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/villages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create Village</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Village Information</CardTitle>
              <CardDescription>
                Enter the details for the new village
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="name">Village Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter village name"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="cellId">Cell</Label>
                <Select
                  value={formData.cellId}
                  onValueChange={handleCellChange}
                  disabled={
                    isCellsLoading ||
                    (user?.role === "CELL_LEADER" && Boolean(user?.cell?.id))
                  }
                >
                  <SelectTrigger className="w-full">
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
                {user?.role === "CELL_LEADER" && user?.cell?.id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cell is locked to your assigned cell
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/locations/villages")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Village"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
