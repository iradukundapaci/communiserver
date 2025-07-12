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
import { Cell, getCells } from '@/lib/api/cells';
import { createHouse } from '@/lib/api/houses';
import { getIsibos, Isibo } from '@/lib/api/isibos';
import { getVillages, Village } from '@/lib/api/villages';
import { useUser } from '@/lib/contexts/user-context';
import { Permission } from '@/lib/permissions';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  User,
  getUsers,
  createCitizen,
  CreateCitizenInput,
} from '@/lib/api/users';
import { UserPlus } from 'lucide-react';

export default function CreateHousePage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    code: '',
    address: '',
    isiboId: '',
    memberIds: [] as string[],
  });
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [, setVillages] = useState<Village[]>([]);
  const [, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIsibosLoading, setIsIsibosLoading] = useState(true);
  const [, setIsVillagesLoading] = useState(true);
  const [, setIsCellsLoading] = useState(true);
  const [citizensToCreate, setCitizensToCreate] = useState<
    CreateCitizenInput[]
  >([]);
  const [showCreateCitizenDialog, setShowCreateCitizenDialog] = useState(false);
  const [newCitizenData, setNewCitizenData] = useState<CreateCitizenInput>({
    names: '',
    email: '',
    phone: '',
    cellId: user?.cell?.id || '',
    villageId: user?.village?.id || '',
    isiboId: user?.isibo?.id || '',
  });

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

      // If user has a cell assigned, use it directly without fetching all cells
      if (user?.cell?.id) {
        // For all roles with a cell, pre-select their cell
        setSelectedCellId(user.cell.id);

        // If the user is a location leader, we don't need to fetch all cells
        if (
          user.role === 'CELL_LEADER' ||
          user.role === 'VILLAGE_LEADER' ||
          user.role === 'ISIBO_LEADER'
        ) {
          // Just add the user's cell to the cells array
          setCells([
            {
              id: user.cell.id,
              name: user.cell.name,
              hasLeader: false, // These values don't matter for the dropdown
              leaderId: null,
            } as Cell,
          ]);
          setIsCellsLoading(false);
          return;
        }
      }

      // Otherwise fetch cells from the database
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);

      // If user doesn't have a cell, select the first one by default
      if (!user?.cell?.id && response.items && response.items.length > 0) {
        setSelectedCellId(response.items[0].id);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch cells');
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

      // If user has a village assigned and we're in the correct cell, use it directly
      if (user?.village?.id && user?.cell?.id === selectedCellId) {
        // For village leaders and isibo leaders, pre-select their village
        setSelectedVillageId(user.village.id);

        // If the user is a location leader, we don't need to fetch all villages
        if (user.role === 'VILLAGE_LEADER' || user.role === 'ISIBO_LEADER') {
          // Just add the user's village to the villages array
          setVillages([
            {
              id: user.village.id,
              name: user.village.name,
              hasLeader: false, // These values don't matter for the dropdown
              leaderId: null,
            } as Village,
          ]);
          setIsVillagesLoading(false);
          return;
        }
      }

      // Otherwise fetch villages from the database
      const response = await getVillages(selectedCellId, 1, 100); // Get all villages for the selected cell
      setVillages(response.items || []);

      // If user has a village in this cell, pre-select it
      if (
        user?.village?.id &&
        response.items.some((village) => village.id === user.village?.id)
      ) {
        setSelectedVillageId(user.village.id);
      } else if (response.items && response.items.length > 0) {
        // Otherwise, select the first village by default
        setSelectedVillageId(response.items[0].id);
      } else {
        setSelectedVillageId('');
        setFormData((prev) => ({
          ...prev,
          isiboId: '',
        }));
        setIsibos([]);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch villages');
      }
      console.error(error);
      setVillages([]);
      setSelectedVillageId('');
      setFormData((prev) => ({
        ...prev,
        isiboId: '',
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

      // If user has an isibo assigned and we're in the correct village, use it directly
      if (user?.isibo?.id && user?.village?.id === selectedVillageId) {
        // For isibo leaders, pre-select their isibo
        setFormData((prev) => ({
          ...prev,
          isiboId: user.isibo?.id || '',
        }));

        // If the user is an isibo leader, we don't need to fetch all isibos
        if (user.role === 'ISIBO_LEADER') {
          // Just add the user's isibo to the isibos array
          setIsibos([
            {
              id: user.isibo.id,
              name: user.isibo.name,
              hasLeader: false, // These values don't matter for the dropdown
              leaderId: null,
            } as Isibo,
          ]);
          setIsIsibosLoading(false);
          return;
        }
      }

      // Otherwise fetch isibos from the database
      const response = await getIsibos(selectedVillageId, 1, 100); // Get all isibos for the selected village
      setIsibos(response.items || []);

      // If user has an isibo in this village, pre-select it
      if (
        user?.isibo?.id &&
        response.items.some((isibo) => isibo.id === user.isibo?.id)
      ) {
        setFormData((prev) => ({
          ...prev,
          isiboId: user.isibo?.id || '',
        }));
      } else if (response.items && response.items.length > 0) {
        // Otherwise, select the first isibo by default
        setFormData((prev) => ({
          ...prev,
          isiboId: response.items[0].id,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          isiboId: '',
        }));
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch isibos');
      }
      console.error(error);
      setIsibos([]);
      setFormData((prev) => ({
        ...prev,
        isiboId: '',
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
    setSelectedVillageId(''); // Reset selected village when cell changes
    setFormData((prev) => ({
      ...prev,
      isiboId: '',
    }));
    setIsibos([]);
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    setFormData((prev) => ({
      ...prev,
      isiboId: '',
    }));
    setIsibos([]);
  };

  const handleIsiboChange = (isiboId: string) => {
    setFormData((prev) => ({
      ...prev,
      isiboId,
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

    // Add the citizen to the list of citizens to create
    setCitizensToCreate((prev) => [...prev, { ...newCitizenData }]);

    // Add a temporary ID to memberIds (we'll replace this with real IDs when creating the house)
    const tempId = `temp_${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      memberIds: [...prev.memberIds, tempId],
    }));

    toast.success('Citizen added to house');
    setShowCreateCitizenDialog(false);
    setNewCitizenData({
      names: '',
      email: '',
      phone: '',
      cellId: user?.cell?.id || '',
      villageId: user?.village?.id || '',
      isiboId: user?.isibo?.id || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('House code is required');
      return;
    }
    if (!formData.isiboId) {
      toast.error('Please select an isibo');
      return;
    }
    setIsLoading(true);
    try {
      // Create the house with members
      await createHouse({
        code: formData.code,
        address: formData.address,
        isiboId: formData.isiboId,
        members: citizensToCreate.map((citizen) => ({
          names: citizen.names,
          email: citizen.email,
          phone: citizen.phone,
        })),
      });

      toast.success('House created successfully');
      router.push('/dashboard/locations/houses');
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create house');
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
            onClick={() => router.push('/dashboard/locations/houses')}
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
                <Label htmlFor="address">House Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter house address"
                  className="w-full"
                />
              </div>

              {/* Hide isibo field from UI */}
              {/* Member management UI */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">House Members</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create new citizens to add to this house.
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
                {/* Show created citizens that will be added to the house */}
                {citizensToCreate.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">
                      Citizens to be created ({citizensToCreate.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {citizensToCreate.map((citizen, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{citizen.names}</p>
                            <div className="text-sm text-muted-foreground">
                              <p>Email: {citizen.email}</p>
                              <p>Phone: {citizen.phone}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCitizensToCreate((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                              setFormData((prev) => ({
                                ...prev,
                                memberIds: prev.memberIds.filter(
                                  (_, i) => i !== index,
                                ),
                              }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/locations/houses')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create House'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
