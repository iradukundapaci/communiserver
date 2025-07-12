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
import { createIsibo } from "@/lib/api/isibos";
import { getVillages, Village } from "@/lib/api/villages";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateIsiboPage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    villageId: "",
  });
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVillagesLoading, setIsVillagesLoading] = useState(true);
  const [isCellsLoading, setIsCellsLoading] = useState(true);

  useEffect(() => {
    fetchCells();
  }, []);

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

      // If user is a village leader, pre-select their cell
      if (user?.role === "VILLAGE_LEADER" && user?.cell?.id) {
        setSelectedCellId(user.cell.id);
      }
      // Otherwise, select the first cell by default
      else if (response.items && response.items.length > 0) {
        setSelectedCellId(response.items[0].id);
      }
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
      setIsVillagesLoading(true);
      const response = await getVillages(selectedCellId, 1, 100); // Get all villages for the selected cell
      setVillages(response.items || []);

      // If user is a village leader, pre-select their village
      if (
        user?.role === "VILLAGE_LEADER" &&
        user?.village?.id &&
        response.items.some((village) => village.id === user.village?.id)
      ) {
        setFormData((prev) => ({
          ...prev,
          villageId: user?.village?.id || "",
        }));
      }
      // Otherwise, select the first village by default
      else if (response.items && response.items.length > 0) {
        setFormData((prev) => ({
          ...prev,
          villageId: response.items[0].id,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          villageId: "",
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch villages");
      console.error(error);
      setVillages([]);
    } finally {
      setIsVillagesLoading(false);
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
    setSelectedCellId(cellId);
    setFormData((prev) => ({
      ...prev,
      villageId: "",
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

    if (!formData.villageId) {
      toast.error("Please select a village");
      return;
    }

    setIsLoading(true);

    try {
      await createIsibo(formData);
      toast.success("Isibo created successfully");
      router.push("/dashboard/locations/isibos");
    } catch (error) {
      toast.error("Failed to create isibo");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PermissionRoute permission={Permission.CREATE_ISIBO}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/isibos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create Isibo</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Isibo Information</CardTitle>
              <CardDescription>
                Enter the details for the new isibo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 w-1/3">
                <Label htmlFor="name">Isibo Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter isibo name"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="cellId">Cell</Label>
                <Select
                  value={selectedCellId}
                  onValueChange={handleCellChange}
                  disabled={
                    isCellsLoading ||
                    (user?.role === "VILLAGE_LEADER" && Boolean(user?.cell?.id))
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
                {user?.role === "VILLAGE_LEADER" && user?.cell?.id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cell is locked to your assigned cell
                  </p>
                )}
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="villageId">Village</Label>
                <Select
                  value={formData.villageId}
                  onValueChange={handleVillageChange}
                  disabled={
                    isVillagesLoading ||
                    villages.length === 0 ||
                    (user?.role === "VILLAGE_LEADER" &&
                      Boolean(user?.village?.id))
                  }
                >
                  <SelectTrigger className="w-full">
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
                {user?.role === "VILLAGE_LEADER" && user?.village?.id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Village is locked to your assigned village
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/locations/isibos")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Isibo"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
