"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMemberToHouse, removeMemberFromHouse } from "@/lib/api/houses";
import { createCitizen, CreateCitizenInput, getUsers, User } from "@/lib/api/users";
import { useUser } from "@/lib/contexts/user-context";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface HouseMemberManagerProps {
  houseId: string;
  currentMembers: User[];
  onMembersChange: (members: User[]) => void;
}

export function HouseMemberManager({
  houseId,
  currentMembers,
  onMembersChange,
}: HouseMemberManagerProps) {
  const { user } = useUser();
  const [availableCitizens, setAvailableCitizens] = useState<User[]>([]);
  const [isLoadingCitizens, setIsLoadingCitizens] = useState(false);
  const [showCreateCitizenDialog, setShowCreateCitizenDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedCitizens, setSelectedCitizens] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newCitizenData, setNewCitizenData] = useState<CreateCitizenInput>({
    names: "",
    email: "",
    phone: "",
    cellId: user?.cell?.id || "",
    villageId: user?.village?.id || "",
    isiboId: user?.isibo?.id || "",
  });

  useEffect(() => {
    fetchAvailableCitizens();
  }, [currentMembers]);

  const fetchAvailableCitizens = async () => {
    try {
      setIsLoadingCitizens(true);
      const response = await getUsers({ role: "CITIZEN", page: 1, size: 100 });
      // Filter out citizens who are already members of this house
      const available = response.items.filter(
        (citizen) =>
          !currentMembers.some((member) => member.id === citizen.id)
      );
      setAvailableCitizens(available);
    } catch (error) {
      toast.error("Failed to load available citizens");
    } finally {
      setIsLoadingCitizens(false);
    }
  };

  const handleCreateCitizen = async () => {
    if (!newCitizenData.names.trim() || !newCitizenData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setIsProcessing(true);
      const createdCitizen = await createCitizen(newCitizenData);
      
      // Add the new citizen to the house
      await addMemberToHouse(houseId, createdCitizen.id);
      
      // Update the current members list
      const updatedMembers = [...currentMembers, createdCitizen];
      onMembersChange(updatedMembers);
      
      toast.success("Citizen created and added to house successfully");
      setShowCreateCitizenDialog(false);
      setNewCitizenData({
        names: "",
        email: "",
        phone: "",
        cellId: user?.cell?.id || "",
        villageId: user?.village?.id || "",
        isiboId: user?.isibo?.id || "",
      });
      
      // Refresh available citizens
      await fetchAvailableCitizens();
    } catch (error: any) {
      toast.error(error.message || "Failed to create citizen");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSelectedMembers = async () => {
    if (selectedCitizens.length === 0) {
      toast.error("Please select at least one citizen to add");
      return;
    }

    try {
      setIsProcessing(true);
      const addedMembers: User[] = [];

      for (const citizenId of selectedCitizens) {
        try {
          await addMemberToHouse(houseId, citizenId);
          const citizen = availableCitizens.find(c => c.id === citizenId);
          if (citizen) {
            addedMembers.push(citizen);
          }
        } catch (error: any) {
          toast.error(`Failed to add ${availableCitizens.find(c => c.id === citizenId)?.names}: ${error.message}`);
        }
      }

      if (addedMembers.length > 0) {
        const updatedMembers = [...currentMembers, ...addedMembers];
        onMembersChange(updatedMembers);
        toast.success(`${addedMembers.length} member(s) added successfully`);
      }

      setSelectedCitizens([]);
      setShowAddMemberDialog(false);
      await fetchAvailableCitizens();
    } catch (error: any) {
      toast.error("Failed to add members");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      setIsProcessing(true);
      await removeMemberFromHouse(houseId, memberId);
      
      const updatedMembers = currentMembers.filter(member => member.id !== memberId);
      onMembersChange(updatedMembers);
      
      toast.success(`${memberName} removed from house successfully`);
      await fetchAvailableCitizens();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCitizenSelection = (citizenId: string, checked: boolean) => {
    if (checked) {
      setSelectedCitizens(prev => [...prev, citizenId]);
    } else {
      setSelectedCitizens(prev => prev.filter(id => id !== citizenId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Members ({currentMembers.length})
              </CardTitle>
              <CardDescription>
                Members currently assigned to this house
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreateCitizenDialog} onOpenChange={setShowCreateCitizenDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Citizen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Citizen</DialogTitle>
                    <DialogDescription>
                      Create a new citizen and add them to this house.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="names">Full Name *</Label>
                      <Input
                        id="names"
                        value={newCitizenData.names}
                        onChange={(e) =>
                          setNewCitizenData(prev => ({ ...prev, names: e.target.value }))
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCitizenData.email}
                        onChange={(e) =>
                          setNewCitizenData(prev => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newCitizenData.phone}
                        onChange={(e) =>
                          setNewCitizenData(prev => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateCitizenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCitizen} disabled={isProcessing}>
                      {isProcessing ? "Creating..." : "Create & Add"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Existing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Existing Citizens</DialogTitle>
                    <DialogDescription>
                      Select citizens to add to this house.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingCitizens ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : availableCitizens.length > 0 ? (
                      <div className="space-y-2">
                        {availableCitizens.map((citizen) => (
                          <div
                            key={citizen.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg"
                          >
                            <Checkbox
                              checked={selectedCitizens.includes(citizen.id)}
                              onCheckedChange={(checked) =>
                                handleCitizenSelection(citizen.id, checked as boolean)
                              }
                            />
                            <div className="flex-1">
                              <p className="font-medium">{citizen.names}</p>
                              <p className="text-sm text-muted-foreground">{citizen.email}</p>
                              {citizen.phone && (
                                <p className="text-sm text-muted-foreground">{citizen.phone}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        No available citizens to add
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddMemberDialog(false);
                        setSelectedCitizens([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSelectedMembers}
                      disabled={selectedCitizens.length === 0 || isProcessing}
                    >
                      {isProcessing ? "Adding..." : `Add ${selectedCitizens.length} Member(s)`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentMembers.length > 0 ? (
            <div className="space-y-3">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{member.names}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.phone && (
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.names)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No members assigned to this house yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
