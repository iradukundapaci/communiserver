'use client';

import { PermissionRoute } from '@/components/permission-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getHouseById, updateHouse } from '@/lib/api/houses';
import {
  User,
  getUsers,
  createCitizen,
  CreateCitizenInput,
  deleteUser,
} from '@/lib/api/users';
import { useUser } from '@/lib/contexts/user-context';
import { Permission } from '@/lib/permissions';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditHousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { id } = React.use(params);

  const [formData, setFormData] = useState({
    code: '',
    address: '',
    isiboId: '',
    memberIds: [] as string[],
  });
  const [currentMembers, setCurrentMembers] = useState<User[]>([]);
  const [availableCitizens, setAvailableCitizens] = useState<User[]>([]);
  const [isLoadingCitizens, setIsLoadingCitizens] = useState(false);
  const [showCreateCitizenDialog, setShowCreateCitizenDialog] = useState(false);
  const [citizensToRemove, setCitizensToRemove] = useState<string[]>([]);
  const [newCitizenData, setNewCitizenData] = useState<CreateCitizenInput>({
    names: '',
    email: '',
    phone: '',
    cellId: user?.cell?.id || '',
    villageId: user?.village?.id || '',
    isiboId: user?.isibo?.id || '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHouse();
  }, [id]);

  const fetchHouse = async () => {
    try {
      setIsLoading(true);
      const house = await getHouseById(id);
      setFormData({
        code: house.code,
        address: house.address || '',
        isiboId: house.isibo?.id || '',
        memberIds: house.members?.map((m: User) => m.id) || [],
      });
      setCurrentMembers(house.members || []);
      await fetchAvailableCitizens(house.members || []);
    } catch (error: any) {
      // Display a more specific error message if available
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch house');
      }
      console.error(error);
      // Redirect back to the houses list if there's an error
      router.push('/dashboard/locations/houses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableCitizens = async (existingMembers: User[] = []) => {
    try {
      setIsLoadingCitizens(true);
      const response = await getUsers({ role: 'CITIZEN', page: 1, size: 100 });
      // Filter out citizens who are already members of this house
      const available = response.items.filter(
        (citizen) =>
          !existingMembers.some((member) => member.id === citizen.id),
      );
      setAvailableCitizens(available);
    } catch (error) {
      toast.error('Failed to load available citizens');
    } finally {
      setIsLoadingCitizens(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCitizenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCitizenData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCitizenSelection = (citizenId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: checked
        ? [...prev.memberIds, citizenId]
        : prev.memberIds.filter((id) => id !== citizenId),
    }));
  };

  const handleRemoveCurrentMember = (memberId: string, userId: string) => {
    // Add to citizens to remove list (use userId for deletion)
    setCitizensToRemove((prev) => [...prev, userId]);
    // Remove from current members display
    setCurrentMembers((prev) =>
      prev.filter((member) => member.id !== memberId),
    );
    // Remove from memberIds (use profile ID)
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.filter((id) => id !== memberId),
    }));
  };

  const handleCreateCitizen = async () => {
    if (!newCitizenData.names.trim() || !newCitizenData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    try {
      await createCitizen({
        ...newCitizenData,
        cellId: user?.cell?.id || '',
        villageId: user?.village?.id || '',
        isiboId: user?.isibo?.id || '',
      });
      toast.success('Citizen created successfully');
      setShowCreateCitizenDialog(false);
      setNewCitizenData({
        names: '',
        email: '',
        phone: '',
        cellId: user?.cell?.id || '',
        villageId: user?.village?.id || '',
        isiboId: user?.isibo?.id || '',
      });
      await fetchAvailableCitizens(currentMembers);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create citizen');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('House code is required');
      return;
    }
    setIsSaving(true);
    try {
      // First delete citizens that were removed
      for (const citizenId of citizensToRemove) {
        try {
          await deleteUser(citizenId);
          toast.success(`Citizen removed successfully`);
        } catch (error) {
          console.error('Failed to delete citizen:', error);
          toast.error(`Failed to remove citizen`);
        }
      }

      // Then update the house with existing member IDs
      await updateHouse(id, {
        code: formData.code,
        address: formData.address,
        memberIds: formData.memberIds,
      });
      toast.success('House updated successfully');
      router.push('/dashboard/locations/houses');
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update house');
      }
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
    <PermissionRoute permission={Permission.UPDATE_HOUSE}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/locations/houses')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit House</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>House Information</CardTitle>
              <CardDescription>
                Update the details for this house
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">House Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter house code"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter house address"
                />
              </div>

              {/* Hide isibo field from UI */}
              {/* Member management UI */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">House Members</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select existing citizens or create new ones to add to this
                      house.
                    </p>
                  </div>
                  <Dialog
                    open={showCreateCitizenDialog}
                    onOpenChange={setShowCreateCitizenDialog}
                  >
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
                          Create a new citizen account that can be added to this
                          house.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="citizenName">Name*</Label>
                          <Input
                            id="citizenName"
                            name="names"
                            value={newCitizenData.names}
                            onChange={handleCitizenInputChange}
                            placeholder="Enter citizen name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="citizenEmail">Email*</Label>
                          <Input
                            id="citizenEmail"
                            name="email"
                            type="email"
                            value={newCitizenData.email}
                            onChange={handleCitizenInputChange}
                            placeholder="Enter citizen email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="citizenPhone">Phone</Label>
                          <Input
                            id="citizenPhone"
                            name="phone"
                            value={newCitizenData.phone}
                            onChange={handleCitizenInputChange}
                            placeholder="Enter citizen phone"
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
                        <Button onClick={handleCreateCitizen}>
                          Create Citizen
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* Current Members */}
                {currentMembers.length > 0 && (
                  <div className="border rounded-md p-4 mb-4">
                    <h4 className="font-medium mb-2">
                      Current Members ({currentMembers.length})
                    </h4>
                    <div className="space-y-2">
                      {currentMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{member.names}</p>
                            <div className="text-sm text-muted-foreground">
                              <p>Email: {member.email}</p>
                              <p>Phone: {member.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={formData.memberIds.includes(member.id)}
                              onCheckedChange={(checked) =>
                                handleCitizenSelection(
                                  member.id,
                                  checked as boolean,
                                )
                              }
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveCurrentMember(
                                  member.id,
                                  member.userId || member.id,
                                )
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Available Citizens */}
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Available Citizens</h4>
                  {isLoadingCitizens ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : availableCitizens.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableCitizens.map((citizen) => (
                        <div
                          key={citizen.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{citizen.names}</p>
                            <div className="text-sm text-muted-foreground">
                              <p>Email: {citizen.email}</p>
                              <p>Phone: {citizen.phone}</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={formData.memberIds.includes(citizen.id)}
                            onCheckedChange={(checked) =>
                              handleCitizenSelection(
                                citizen.id,
                                checked as boolean,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No available citizens found. Create new citizens using the
                      "Create Citizen" button above.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/locations/houses')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
