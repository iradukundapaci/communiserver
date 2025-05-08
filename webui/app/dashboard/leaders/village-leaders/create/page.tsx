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
import { createVillageLeader } from "@/lib/api/leaders";
import { getVillages, Village } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateVillageLeaderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    names: "",
    email: "",
    phone: "",
    cellId: "",
    villageId: "",
  });
  const [cells, setCells] = useState<Cell[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCellsLoading, setIsCellsLoading] = useState(true);
  const [isVillagesLoading, setIsVillagesLoading] = useState(true);

  useEffect(() => {
    fetchCells();
  }, []);

  useEffect(() => {
    if (formData.cellId) {
      fetchVillages();
    }
  }, [formData.cellId]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);
      
      // Select the first cell by default
      if (response.items && response.items.length > 0) {
        setFormData((prev) => ({
          ...prev,
          cellId: response.items[0].id,
        }));
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
    if (!formData.cellId) return;
    
    try {
      setIsVillagesLoading(true);
      const response = await getVillages(formData.cellId, 1, 100); // Get all villages for the selected cell
      setVillages(response.items || []);
      
      // Select the first village by default
      if (response.items && response.items.length > 0) {
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
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch villages");
      }
      console.error(error);
      setVillages([]);
      setFormData((prev) => ({
        ...prev,
        villageId: "",
      }));
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
    setFormData((prev) => ({
      ...prev,
      cellId,
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

    if (!formData.names.trim()) {
      toast.error("Leader name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!formData.cellId) {
      toast.error("Please select a cell");
      return;
    }

    if (!formData.villageId) {
      toast.error("Please select a village");
      return;
    }

    setIsLoading(true);

    try {
      await createVillageLeader({
        names: formData.names,
        email: formData.email,
        phone: formData.phone,
        cellId: formData.cellId,
        villageId: formData.villageId,
      });
      toast.success("Village leader created successfully");
      router.push("/dashboard/leaders");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create village leader");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PermissionRoute permission={Permission.CREATE_VILLAGE_LEADER}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/leaders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create Village Leader</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Village Leader Information</CardTitle>
              <CardDescription>
                Enter the details for the new village leader
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="names">Full Name</Label>
                <Input
                  id="names"
                  name="names"
                  value={formData.names}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cellId">Cell</Label>
                <Select
                  value={formData.cellId}
                  onValueChange={handleCellChange}
                  disabled={isCellsLoading}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="villageId">Village</Label>
                <Select
                  value={formData.villageId}
                  onValueChange={handleVillageChange}
                  disabled={isVillagesLoading || villages.length === 0}
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/leaders")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Village Leader"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
