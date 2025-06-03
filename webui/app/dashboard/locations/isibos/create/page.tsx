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
import { Cell, getCells } from "@/lib/api/cells";
import { createIsibo } from "@/lib/api/isibos";

interface MemberData {
  names: string;
  email: string;
  phone: string;
}
import { getVillages, Village } from "@/lib/api/villages";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateIsiboPage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    villageId: "",
    members: [] as MemberData[],
  });
  const [, setVillages] = useState<Village[]>([]);
  const [, setCells] = useState<Cell[]>([]);
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
      const response = await getCells(1, 100);
      setCells(response.items || []);

      if (user?.role === "VILLAGE_LEADER" && user?.cell?.id) {
        setSelectedCellId(user.cell.id);
      }

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
      const response = await getVillages(selectedCellId, 1, 100);
      setVillages(response.items || []);

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

  // New member state
  const [newMember, setNewMember] = useState<MemberData>({
    names: "",
    email: "",
    phone: "",
  });

  // Handle new member input changes
  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new member
  const handleAddMember = () => {
    // Validate member data
    if (!newMember.names.trim()) {
      toast.error("Member name is required");
      return;
    }

    // Add member to the list
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { ...newMember }],
    }));

    // Reset the form
    setNewMember({
      names: "",
      email: "",
      phone: "",
    });
  };

  // Remove a member
  const handleRemoveMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
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

    if (formData.members.length === 0) {
      toast.error("Please add at least one member to the isibo");
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
              <div className="space-y-2 max-w-md">
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
                <Input
                  id="cellId"
                  type="text"
                  value={user?.role === "VILLAGE_LEADER" && user?.cell?.name ? user.cell.name : ''}
                  onChange={(e) => handleCellChange(e.target.value)}
                  placeholder="Enter cell name"
                  disabled={
                    isCellsLoading ||
                    (user?.role === "VILLAGE_LEADER" && Boolean(user?.cell?.id))
                  }
                  className="w-full"
                />
                {user?.role === "VILLAGE_LEADER" && user?.cell?.id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cell is locked to your assigned cell
                  </p>
                )}
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="villageId">Village</Label>
                <Input
                  id="villageId"
                  type="text"
                  value={user?.role === "VILLAGE_LEADER" && user?.village?.name ? user.village.name : ''}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  placeholder="Enter village name"
                  disabled={
                    isVillagesLoading ||
                    (user?.role === "VILLAGE_LEADER" && Boolean(user?.village?.id))
                  }
                  className="w-full"
                />
                {user?.role === "VILLAGE_LEADER" && user?.village?.id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Village is locked to your assigned village
                  </p>
                )}
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Isibo Members</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add members to this isibo. At least one member is required.
                  </p>
                </div>

                {/* Members list */}
                {formData.members.length > 0 && (
                  <div className="border rounded-md p-4 mb-4">
                    <h4 className="font-medium mb-2">
                      Added Members ({formData.members.length})
                    </h4>
                    <div className="space-y-2">
                      {formData.members.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{member.names}</p>
                            <div className="text-sm text-muted-foreground">
                              {member.email && <p>Email: {member.email}</p>}
                              {member.phone && <p>Phone: {member.phone}</p>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new member form */}
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Add New Member</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="memberName">Name*</Label>
                      <Input
                        id="memberName"
                        name="names"
                        value={newMember.names}
                        onChange={handleMemberInputChange}
                        placeholder="Enter member name"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        name="email"
                        type="email"
                        value={newMember.email}
                        onChange={handleMemberInputChange}
                        placeholder="Enter member email"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="memberPhone">Phone</Label>
                      <Input
                        id="memberPhone"
                        name="phone"
                        value={newMember.phone}
                        onChange={handleMemberInputChange}
                        placeholder="Enter member phone"
                        className="max-w-md"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddMember}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>
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
