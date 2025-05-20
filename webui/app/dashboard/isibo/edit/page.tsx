"use client";

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
import { Citizen, getIsiboById, updateIsibo } from "@/lib/api/isibos";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditMyIsiboPage() {
  const router = useRouter();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    villageId: "",
    members: [] as Citizen[],
  });
  const [villageName, setVillageName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch isibo data when component mounts
  useEffect(() => {
    // Redirect if user is not an isibo leader or doesn't have an isibo
    if (!user || user.role !== "ISIBO_LEADER" || !user.isibo?.id) {
      router.push("/dashboard");
      return;
    }

    async function fetchIsibo() {
      if (!user?.isibo?.id) return;

      try {
        setIsLoading(true);
        const isibo = await getIsiboById(user.isibo.id);

        // Check if the isibo has members property
        if (!isibo.members) {
          // If members property is missing, initialize it as an empty array
          isibo.members = [];
        }

        // Set the form data
        setFormData({
          name: isibo.name,
          villageId: isibo.village?.id || "",
          members: isibo.members || [],
        });

        // Store the village name for display
        if (isibo.village) {
          setVillageName(isibo.village.name);
        }
      } catch (error: unknown) {
        // Check if the error is related to the houses property
        const err = error as { message?: string };
        if (err.message && err.message.includes("houses")) {
          toast.error(
            "The backend needs to be updated to remove house references. Please contact the administrator."
          );
        } else if (err.message) {
          toast.error(err.message);
        } else {
          toast.error("Failed to fetch isibo");
        }
        console.error(error);
        // Redirect back to the dashboard if there's an error
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    fetchIsibo();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // New member state
  const [newMember, setNewMember] = useState<Citizen>({
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

    if (!user?.isibo?.id) {
      toast.error("No isibo assigned to your account");
      return;
    }

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
      await updateIsibo(user.isibo.id, {
        name: formData.name,
        members: formData.members,
      });
      toast.success("Isibo updated successfully");
      router.push("/dashboard");
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit My Isibo</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Isibo Information</CardTitle>
            <CardDescription>Update the details for your isibo</CardDescription>
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
                className="max-w-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="villageId">Village</Label>
              <div className="flex items-center space-x-2 max-w-md">
                <Input
                  id="villageId"
                  value={villageName}
                  disabled={true}
                  className="bg-muted"
                />
              </div>
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
              onClick={() => router.push("/dashboard")}
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
