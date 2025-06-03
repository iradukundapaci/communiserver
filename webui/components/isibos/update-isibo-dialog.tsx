"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import { WideDialog, WideDialogContent, WideDialogTrigger, WideDialogForm } from "@/components/ui/wide-dialog";
import { updateIsibo, type UpdateIsiboInput, type Isibo, type Citizen } from "@/lib/api/isibos";
import { searchVillages, type Village } from "@/lib/api/locations";
import { getUsers, type User } from "@/lib/api/users";
import { IconEdit, IconUsers, IconSearch } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UpdateIsiboDialogProps {
  isibo: Isibo;
  onIsiboUpdated: () => void;
  trigger?: React.ReactNode;
}

export function UpdateIsiboDialog({ isibo, onIsiboUpdated, trigger }: UpdateIsiboDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState(isibo.name);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(isibo.village || null);
  const [selectedLeader, setSelectedLeader] = useState<User | null>(null);
  const [existingMembers, setExistingMembers] = useState<string[]>([]);
  const [newMembers, setNewMembers] = useState<Citizen[]>([]);

  // New member form state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  const resetForm = () => {
    setName(isibo.name);
    setSelectedVillage(isibo.village || null);
    setSelectedLeader(null);
    setExistingMembers(isibo.members?.map(member => member.id) || []);
    setNewMembers([]);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");
  };

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
      // Find and set the current leader if exists
      if (isibo.leaderId && isibo.members) {
        const leader = isibo.members.find(member => member.id === isibo.leaderId);
        if (leader) {
          setSelectedLeader({
            id: leader.id,
            names: leader.names,
            email: leader.user.email,
            phone: leader.user.phone,
            role: leader.user.role,
            activated: true,
          });
        }
      }
    }
  }, [open, isibo]);

  const addNewMember = () => {
    if (!newMemberName || !newMemberEmail || !newMemberPhone) {
      toast.error("Please fill in all member details");
      return;
    }

    // Check for duplicate email in new members
    if (newMembers.some(member => member.email === newMemberEmail)) {
      toast.error("A member with this email already exists in new members");
      return;
    }

    // Check for duplicate email in existing members
    if (isibo.members?.some(member => member.user.email === newMemberEmail)) {
      toast.error("A member with this email already exists");
      return;
    }

    const newMember: Citizen = {
      names: newMemberName,
      email: newMemberEmail,
      phone: newMemberPhone,
    };

    setNewMembers([...newMembers, newMember]);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");
  };

  const removeNewMember = (index: number) => {
    setNewMembers(newMembers.filter((_, i) => i !== index));
  };

  const removeExistingMember = (memberId: string) => {
    setExistingMembers(existingMembers.filter(id => id !== memberId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingMembers.length === 0 && newMembers.length === 0) {
      toast.error("Please keep at least one existing member or add new members");
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UpdateIsiboInput = {
        name,
        villageId: selectedVillage?.id,
        leaderId: selectedLeader?.id,
        existingMemberIds: existingMembers,
        newMembers: newMembers.length > 0 ? newMembers : undefined,
      };

      await updateIsibo(isibo.id, updateData);
      toast.success("Isibo updated successfully");
      setOpen(false);
      onIsiboUpdated();
    } catch (error) {
      console.error("Update isibo error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update isibo");
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

  const handleMemberToggle = (user: User, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, user]);
    } else {
      setSelectedMembers(selectedMembers.filter(member => member.id !== user.id));
    }
  };

  const filteredCitizens = citizens.filter(citizen =>
    citizen.names.toLowerCase().includes(citizenSearch.toLowerCase()) ||
    citizen.email.toLowerCase().includes(citizenSearch.toLowerCase())
  );

  return (
    <WideDialog open={open} onOpenChange={setOpen}>
      <WideDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <IconEdit className="h-4 w-4 mr-2" />
            Edit Isibo
          </Button>
        )}
      </WideDialogTrigger>
      
      <WideDialogContent size="2xl">
        <WideDialogForm
          title={`Update Isibo: ${isibo.name}`}
          description="Update isibo details and manage members"
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
                {isLoading ? "Updating..." : "Update Isibo"}
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Isibo Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter isibo name"
                  required
                />
              </div>

              <div>
                <Label>Village</Label>
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
                />
              </div>

              <div>
                <Label>Leader</Label>
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
                />
              </div>

              {selectedMembers.length > 0 && (
                <div>
                  <Label>Selected Members ({selectedMembers.length})</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {selectedMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                        <span>{member.names}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMemberToggle(member, false)}
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

            {/* Right Column - Member Selection */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <IconUsers className="h-4 w-4 mr-2" />
                  Manage Members *
                </Label>
                
                <div className="relative mb-3">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search citizens..."
                    value={citizenSearch}
                    onChange={(e) => setCitizenSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="border rounded-lg max-h-80 overflow-y-auto">
                  {citizensLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading citizens...
                    </div>
                  ) : filteredCitizens.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No citizens found
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {filteredCitizens.map((citizen) => {
                        const isSelected = selectedMembers.some(member => member.id === citizen.id);
                        const isLeader = selectedLeader?.id === citizen.id;
                        
                        return (
                          <div
                            key={citizen.id}
                            className={`flex items-center space-x-3 p-2 rounded hover:bg-gray-50 ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleMemberToggle(citizen, checked as boolean)
                              }
                              disabled={isLeader}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm truncate">{citizen.names}</p>
                                {isLeader && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Leader
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{citizen.email}</p>
                              {citizen.phone && (
                                <p className="text-xs text-gray-500">{citizen.phone}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </WideDialogForm>
      </WideDialogContent>
    </WideDialog>
  );
}
