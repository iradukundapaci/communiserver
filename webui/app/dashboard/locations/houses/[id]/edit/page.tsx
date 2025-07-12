'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionRoute } from '@/components/permission-route';
import { ProtectedRoute } from '@/components/protected-route';
import { HouseMemberManager } from '@/components/houses/house-member-manager';
import { getHouseById, updateHouse, House } from '@/lib/api/houses';
import { User } from '@/lib/api/users';
import { Permission } from '@/lib/permissions';
import { ArrowLeft } from 'lucide-react';
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
  const { id } = React.use(params);

  const [house, setHouse] = useState<House | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    address: '',
  });
  const [currentMembers, setCurrentMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHouse();
  }, [id]);

  const fetchHouse = async () => {
    try {
      setIsLoading(true);
      const houseData = await getHouseById(id);
      setHouse(houseData);
      setFormData({
        code: houseData.code,
        address: houseData.address || '',
      });
      setCurrentMembers(houseData.members || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch house');
      router.push('/dashboard/locations/houses');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('House code is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateHouse(id, {
        code: formData.code,
        address: formData.address,
      });
      toast.success('House updated successfully');
      router.push('/dashboard/locations/houses');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update house');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMembersChange = (members: User[]) => {
    setCurrentMembers(members);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PermissionRoute
        anyPermissions={[
          Permission.MANAGE_HOUSES,
          Permission.MANAGE_ISIBO_HOUSES,
        ]}
      >
        <div className="container mx-auto py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit House</h1>
              <p className="text-muted-foreground">
                Update house information and manage members
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* House Information */}
            <Card>
              <CardHeader>
                <CardTitle>House Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">House Code *</Label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Enter house code"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter house address"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* House Members */}
            <HouseMemberManager
              houseId={id}
              currentMembers={currentMembers}
              onMembersChange={handleMembersChange}
            />
          </div>
        </div>
      </PermissionRoute>
    </ProtectedRoute>
  );
}
