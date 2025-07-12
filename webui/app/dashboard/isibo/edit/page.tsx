'use client';

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
import { IsiboMember, getIsiboById, updateIsibo } from '@/lib/api/isibos';
import {
  User,
  getUsers,
  createCitizen,
  CreateCitizenInput,
} from '@/lib/api/users';
import { useUser } from '@/lib/contexts/user-context';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditMyIsiboPage() {
  const router = useRouter();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    villageId: '',
    memberIds: [] as string[],
  });
  const [villageName, setVillageName] = useState<string>('');
  const [currentMembers, setCurrentMembers] = useState<IsiboMember[]>([]);
  const [availableCitizens, setAvailableCitizens] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCitizens, setIsLoadingCitizens] = useState(false);
  const [showCreateCitizenDialog, setShowCreateCitizenDialog] = useState(false);
  const [newCitizenData, setNewCitizenData] = useState<CreateCitizenInput>({
    names: '',
    email: '',
    phone: '',
    cellId: '',
    villageId: '',
  });

  // Fetch isibo data when component mounts
  useEffect(() => {
    // Redirect if user is not an isibo leader or doesn't have an isibo
    if (!user || user.role !== 'ISIBO_LEADER' || !user.isibo?.id) {
      router.push('/dashboard');
      return;
    }

    async function fetchData() {
      if (!user?.isibo?.id) return;

      try {
        setIsLoading(true);

        // Fetch isibo data
        const isibo = await getIsiboById(user.isibo.id);

        // Set the form data
        setFormData({
          name: isibo.name,
          villageId: isibo.village?.id || '',
          memberIds: isibo.members?.map((m: IsiboMember) => m.id) || [],
        });

        setCurrentMembers(isibo.members || []);

        // Store the village name for display
        if (isibo.village) {
          setVillageName(isibo.village.name);
        }

        // Set new citizen data with current location info
        setNewCitizenData((prev) => ({
          ...prev,
          cellId: user.cell?.id || '',
          villageId: isibo.village?.id || '',
        }));

        // Fetch available citizens
        await fetchAvailableCitizens();
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(err.message || 'Failed to fetch isibo data');
        console.error(error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.id, user?.role, user?.isibo?.id, router]); // Only depend on specific user properties

  const fetchAvailableCitizens = async () => {
    try {
      setIsLoadingCitizens(true);
      const response = await getUsers({ role: 'CITIZEN', page: 1, size: 100 });
      // Filter out citizens who are already members of this isibo
      const available = response.items.filter(
        (citizen) => !currentMembers.some((member) => member.id === citizen.id),
      );
      setAvailableCitizens(available);
    } catch (error) {
      console.error('Failed to fetch citizens:', error);
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

  const handleCreateCitizen = async () => {
    if (!newCitizenData.names.trim() || !newCitizenData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await createCitizen(newCitizenData);
      toast.success('Citizen created successfully');
      setShowCreateCitizenDialog(false);
      setNewCitizenData({
        names: '',
        email: '',
        phone: '',
        cellId: user?.cell?.id || '',
        villageId: formData.villageId,
      });
      // Refresh available citizens
      await fetchAvailableCitizens();
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

    if (!user?.isibo?.id) {
      toast.error('No isibo assigned to your account');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Isibo name is required');
      return;
    }

    setIsSaving(true);

    try {
      await updateIsibo(user.isibo.id, {
        name: formData.name,
        memberIds: formData.memberIds,
      });
      toast.success('Isibo updated successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to update isibo');
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
          onClick={() => router.push('/dashboard')}
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Isibo Members</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select existing citizens or create new ones to add to this
                    isibo.
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
                        isibo.
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
                            <p>Email: {member.user.email}</p>
                            <p>Phone: {member.user.phone}</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={formData.memberIds.includes(member.id)}
                          onCheckedChange={(checked) =>
                            handleCitizenSelection(
                              member.id,
                              checked as boolean,
                            )
                          }
                        />
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
                    &quot;Create Citizen&quot; button above.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
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
  );
}
