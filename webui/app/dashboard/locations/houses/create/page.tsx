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
import { createHouse } from "@/lib/api/houses";
import { getIsibos, Isibo } from "@/lib/api/isibos";
import { getVillages, Village } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateHousePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: "",
    street: "",
    isiboId: "",
  });
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIsibosLoading, setIsIsibosLoading] = useState(true);
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

  useEffect(() => {
    if (selectedVillageId) {
      fetchIsibos();
    }
  }, [selectedVillageId]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);

      // Select the first cell by default
      if (response.items && response.items.length > 0) {
        setSelectedCellId(response.items[0].id);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch cells");
      }
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

      // Select the first village by default
      if (response.items && response.items.length > 0) {
        setSelectedVillageId(response.items[0].id);
      } else {
        setSelectedVillageId("");
        setFormData((prev) => ({
          ...prev,
          isiboId: "",
        }));
        setIsibos([]);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch villages");
      }
      console.error(error);
      setVillages([]);
      setSelectedVillageId("");
      setFormData((prev) => ({
        ...prev,
        isiboId: "",
      }));
      setIsibos([]);
    } finally {
      setIsVillagesLoading(false);
    }
  };

  const fetchIsibos = async () => {
    if (!selectedVillageId) return;

    try {
      setIsIsibosLoading(true);
      const response = await getIsibos(selectedVillageId, 1, 100); // Get all isibos for the selected village
      setIsibos(response.items || []);

      // Select the first isibo by default
      if (response.items && response.items.length > 0) {
        setFormData((prev) => ({
          ...prev,
          isiboId: response.items[0].id,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          isiboId: "",
        }));
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch isibos");
      }
      console.error(error);
      setIsibos([]);
      setFormData((prev) => ({
        ...prev,
        isiboId: "",
      }));
    } finally {
      setIsIsibosLoading(false);
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
    setSelectedVillageId(""); // Reset selected village when cell changes
    setFormData((prev) => ({
      ...prev,
      isiboId: "",
    }));
    setIsibos([]);
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    setFormData((prev) => ({
      ...prev,
      isiboId: "",
    }));
    setIsibos([]);
  };

  const handleIsiboChange = (isiboId: string) => {
    setFormData((prev) => ({
      ...prev,
      isiboId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("House code is required");
      return;
    }

    if (!formData.isiboId) {
      toast.error("Please select an isibo");
      return;
    }

    setIsLoading(true);

    try {
      await createHouse(formData);
      toast.success("House created successfully");
      router.push("/dashboard/locations/houses");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create house");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PermissionRoute permission={Permission.CREATE_HOUSE}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/houses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create House</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>House Information</CardTitle>
              <CardDescription>
                Enter the details for the new house
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="code">House Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter house code"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2 max-w-md">
                <Label htmlFor="street">Street (Optional)</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="cellId">Cell</Label>
                <Select
                  value={selectedCellId}
                  onValueChange={handleCellChange}
                  disabled={isCellsLoading}
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
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="villageId">Village</Label>
                <Select
                  value={selectedVillageId}
                  onValueChange={handleVillageChange}
                  disabled={isVillagesLoading || villages.length === 0}
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
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="isiboId">Isibo</Label>
                <Select
                  value={formData.isiboId}
                  onValueChange={handleIsiboChange}
                  disabled={isIsibosLoading || isibos.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an isibo" />
                  </SelectTrigger>
                  <SelectContent>
                    {isibos.map((isibo) => (
                      <SelectItem key={isibo.id} value={isibo.id}>
                        {isibo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/locations/houses")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create House"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
