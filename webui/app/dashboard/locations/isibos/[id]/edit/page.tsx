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
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
    members: [] as import("@/lib/api/users").User[],
  });
  const [villages, setVillages] = useState<Village[]>([]);
  const [, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setIsCellsLoading] = useState(true);

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

      // Check if the isibo has members property
      if (!isibo.members) {
        // If members property is missing, initialize it as an empty array
        isibo.members = [];
      }

      // Convert IsiboMember[] to User[] for form compatibility
      const convertedMembers = (isibo.members || []).map(member => ({
        id: member.user.id,
        names: member.names,
        email: member.user.email,
        phone: member.user.phone,
        role: member.user.role,
        activated: true, // Assume activated for existing members
      }));

      // Set the form data
      setFormData({
        name: isibo.name,
        villageId: isibo.village?.id || "",
        members: convertedMembers,
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
    } catch (error: unknown) {
      // Check if the error is related to the houses property
      if (error instanceof Error && error.message.includes("houses")) {
        toast.error(
          "The backend needs to be updated to remove house references. Please contact the administrator."
        );
      } else if (error instanceof Error) {
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

  // New member state
  const [newMember, setNewMember] = useState<{
    names: string;
    email: string;
    phone: string;
  }>({
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

    // Add member to the list with required User properties
    const newUserMember: import("@/lib/api/users").User = {
      id: `temp-${Date.now()}`, // Temporary ID for new members
      names: newMember.names,
      email: newMember.email,
      phone: newMember.phone,
      role: "CITIZEN",
      activated: false, // New members start as inactive
    };

    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, newUserMember],
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

    if (formData.members.length === 0) {
      toast.error("Please add at least one member to the isibo");
      return;
    }

    setIsSaving(true);

    try {
      // Send the name and members when updating the isibo
      await updateIsibo(id, {
        name: formData.name,
        existingMemberIds: formData.members.map(member => member.id),
      });
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

  // Check if the user is an isibo leader and this is their isibo
  const isUserOwnIsibo =
    user?.role === "ISIBO_LEADER" && user?.isibo?.id === id;

  // If this is the user's own isibo, we don't need to check permissions
  if (isUserOwnIsibo) {
    return (
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
