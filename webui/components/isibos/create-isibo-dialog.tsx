"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { WideDialog, WideDialogContent, WideDialogTrigger, WideDialogForm } from "@/components/ui/wide-dialog";
import { Village } from "@/lib/api/cells";
import { createIsibo, type CreateIsiboInput, type Citizen } from "@/lib/api/isibos";
import { getUsers, type User } from "@/lib/api/users";
import { searchVillages } from "@/lib/api/villages";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateIsiboDialogProps {
  onIsiboCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateIsiboDialog({ onIsiboCreated, trigger }: CreateIsiboDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<User | null>(null);
  const [members, setMembers] = useState<Citizen[]>([]);

  // New member form state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  const resetForm = () => {
    setName("");
    setSelectedVillage(null);
    setSelectedLeader(null);
    setMembers([]);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");
  };

  const addMember = () => {
    if (!newMemberName || !newMemberEmail || !newMemberPhone) {
      toast.error("Please fill in all member details");
      return;
    }

    // Check for duplicate email
    if (members.some(member => member.email === newMemberEmail)) {
      toast.error("A member with this email already exists");
      return;
    }

    const newMember: Citizen = {
      names: newMemberName,
      email: newMemberEmail,
      phone: newMemberPhone,
    };

    setMembers([...members, newMember]);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVillage) {
      toast.error("Please select a village");
      return;
    }

    if (members.length === 0) {
      toast.error("Please add at least one member");
      return;
    }

    setIsLoading(true);

    try {
      const isiboData: CreateIsiboInput = {
        name,
        villageId: selectedVillage.id,
        leaderId: selectedLeader?.id,
        members: members,
      };

      await createIsibo(isiboData);
      toast.success("Isibo created successfully");
      resetForm();
      setOpen(false);
      onIsiboCreated();
    } catch (error) {
      console.error("Create isibo error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create isibo");
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

  const handleLeaderSearch = async (query: string) => {
    try {
      const response = await getUsers({
        role: "CITIZEN",
        q: query,
        size: 20,
      });
      return response.items.map(user => ({
        value: user.id,
        label: `${user.names} (${user.email})`,
        data: user,
      }));
    } catch (error) {
      console.error("Leader search error:", error);
      return [];
    }
  };

  return (
    <WideDialog open={open} onOpenChange={setOpen}>
      <WideDialogTrigger asChild>
        {trigger || (
          <Button>
            <IconPlus className="h-4 w-4 mr-2" />
            Create Isibo
          </Button>
        )}
      </WideDialogTrigger>
      
      <WideDialogContent size="2xl">
        <WideDialogForm
          title="Create New Isibo"
          description="Create a new isibo and assign members from the citizen list"
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
                {isLoading ? "Creating..." : "Create Isibo"}
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="w-2/3">
                <Label htmlFor="name">Isibo Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter isibo name"
                  required
                  className="w-full"
                />
              </div>

              <div className="w-2/3">
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
                  className="w-full"
                />
              </div>

              <div className="w-2/3">
                <Label>Leader (Optional)</Label>
                <SearchableSelect
                  placeholder="Search and select leader..."
                  onSearch={handleLeaderSearch}
                  onSelect={(option) => setSelectedLeader(option.data)}
                  onClear={() => setSelectedLeader(null)}
                  value={selectedLeader ? {
                    value: selectedLeader.id,
                    label: `${selectedLeader.names} (${selectedLeader.email})`,
                    data: selectedLeader,
                  } : null}
                  className="w-full"
                />
              </div>

              {members.length > 0 && (
                <div>
                  <Label>Added Members ({members.length})</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                        <div>
                          <div className="font-medium">{member.names}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Member Creation */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <IconUsers className="h-4 w-4 mr-2" />
                  Add Members *
                </Label>

                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="memberName">Full Name *</Label>
                      <Input
                        id="memberName"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="memberEmail">Email *</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="memberPhone">Phone *</Label>
                      <Input
                        id="memberPhone"
                        type="tel"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={addMember}
                      className="w-full"
                      disabled={!newMemberName || !newMemberEmail || !newMemberPhone}
                    >
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>

                {members.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No members added yet. Add at least one member to create the isibo.
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
