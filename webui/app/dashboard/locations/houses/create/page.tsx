'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionRoute } from '@/components/permission-route';
import { ProtectedRoute } from '@/components/protected-route';
import { createHouse } from '@/lib/api/houses';
import { getIsibos, Isibo } from '@/lib/api/isibos';
import { useUser } from '@/lib/contexts/user-context';
import { Permission } from '@/lib/permissions';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CreateHousePage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    code: '',
    address: '',
    isiboId: '',
  });
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIsibos, setIsLoadingIsibos] = useState(true);

  useEffect(() => {
    fetchIsibos();
  }, []);

  const fetchIsibos = async () => {
    try {
      setIsLoadingIsibos(true);
      const response = await getIsibos({ page: 1, size: 100 });
      setIsibos(response.items);
      
      // Auto-select user's isibo if they are an isibo leader
      if (user?.role === 'ISIBO_LEADER' && user.isibo) {
        setFormData(prev => ({
          ...prev,
          isiboId: user.isibo.id,
        }));
      }
    } catch (error) {
      toast.error('Failed to load isibos');
    } finally {
      setIsLoadingIsibos(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIsiboChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      isiboId: value,
    }));
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
      await createHouse({
        code: formData.code,
        address: formData.address,
        isiboId: formData.isiboId,
      });

      toast.success('House created successfully');
      router.push('/dashboard/locations/houses');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create house');
    } finally {
      setIsLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold">Create House</h1>
              <p className="text-muted-foreground">
                Create a new house in an isibo. You can add members after creation.
              </p>
            </div>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>House Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <Label htmlFor="code">House Code *</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Enter house code"
                      required
                      className="max-w-sm"
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
                      className="max-w-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="isibo">Isibo *</Label>
                  <Select
                    value={formData.isiboId}
                    onValueChange={handleIsiboChange}
                    disabled={isLoadingIsibos || (user?.role === 'ISIBO_LEADER')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an isibo" />
                    </SelectTrigger>
                    <SelectContent>
                      {isibos.map((isibo) => (
                        <SelectItem key={isibo.id} value={isibo.id}>
                          {isibo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {user?.role === 'ISIBO_LEADER' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      As an Isibo Leader, you can only create houses in your isibo.
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <p className="text-sm text-blue-700">
                    After creating the house, you'll be able to add members by editing the house.
                    You can either add existing citizens or create new citizen accounts.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create House'}
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
        </div>
      </PermissionRoute>
    </ProtectedRoute>
  );
}
