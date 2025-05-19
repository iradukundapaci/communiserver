"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { House, Isibo, getHouses, getIsibos } from "@/lib/api/locations";
import { changePassword, updateUserProfile } from "@/lib/api/user";
import { useUser } from "@/lib/contexts/user-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoadingIsibos, setIsLoadingIsibos] = useState(false);
  const [isLoadingHouses, setIsLoadingHouses] = useState(false);

  const [formData, setFormData] = useState({
    names: user?.names || "",
    email: user?.email || "",
    phone: user?.phone || "",
    isiboId: user?.isibo?.id || "",
    houseId: user?.house?.id || "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      console.log("User object:", user);
      setFormData({
        names: user.names || "",
        email: user.email || "",
        phone: user.phone || "",
        isiboId: user?.isibo?.id || "",
        houseId: user?.house?.id || "",
      });
    }
  }, [user]);

  // Fetch isibos when user's village changes or on component mount
  useEffect(() => {
    if (user?.village?.id) {
      console.log("Fetching isibos for village:", user.village.id);
      fetchIsibos(user.village.id);
    }
  }, [user?.village?.id]);

  // Fetch houses when selected isibo changes
  useEffect(() => {
    if (formData.isiboId) {
      console.log("Fetching houses for isibo:", formData.isiboId);
      fetchHouses(formData.isiboId);
    } else {
      // Clear houses when no isibo is selected
      setHouses([]);
    }
  }, [formData.isiboId]);

  const fetchIsibos = async (villageId: string) => {
    try {
      setIsLoadingIsibos(true);
      const response = await getIsibos(villageId);
      console.log("Isibos response:", response);
      setIsibos(response.items || []);
    } catch (error) {
      console.error("Error fetching isibos:", error);
      toast.error("Failed to fetch isibos");
    } finally {
      setIsLoadingIsibos(false);
    }
  };

  const fetchHouses = async (isiboId: string) => {
    try {
      setIsLoadingHouses(true);
      const response = await getHouses(isiboId);
      console.log("Houses response:", response);
      setHouses(response.items || []);
    } catch (error) {
      console.error("Error fetching houses:", error);
      toast.error("Failed to fetch houses");
    } finally {
      setIsLoadingHouses(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear house selection when isibo changes
      ...(name === "isiboId" ? { houseId: "" } : {}),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form data:", formData);

    try {
      setIsLoading(true);
      await updateUserProfile(formData);
      await refreshUser(); // Refresh the user context
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(passwordData.newPassword);
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="names">Full Name</Label>
                    <Input
                      id="names"
                      name="names"
                      value={formData.names}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={user.role} disabled />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Administrative Area
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cell">Cell</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="cell"
                          value={user.cell?.name || "Not assigned"}
                          disabled
                        />
                        {user.isCellLeader && (
                          <Badge
                            variant="outline"
                            className="bg-blue-500 text-white"
                          >
                            Cell Leader
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="village">Village</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="village"
                          value={user.village?.name || "Not assigned"}
                          disabled
                        />
                        {user.isVillageLeader && (
                          <Badge
                            variant="outline"
                            className="bg-green-500 text-white"
                          >
                            Village Leader
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isiboId">Isibo</Label>
                      {user.isIsiboLeader ? (
                        <div className="flex items-center gap-2">
                          <Input
                            id="isibo"
                            value={user.isibo?.name || "Not assigned"}
                            disabled
                          />
                          <Badge
                            variant="outline"
                            className="bg-purple-500 text-white"
                          >
                            Isibo Leader
                          </Badge>
                        </div>
                      ) : (
                        <Select
                          value={formData.isiboId}
                          onValueChange={(value) =>
                            handleSelectChange("isiboId", value)
                          }
                          disabled={isLoadingIsibos || !user.village?.id}
                        >
                          <SelectTrigger className="w-full">
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
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="houseId">House</Label>
                      <Select
                        value={formData.houseId}
                        onValueChange={(value) =>
                          handleSelectChange("houseId", value)
                        }
                        disabled={isLoadingHouses || !formData.isiboId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a house" />
                        </SelectTrigger>
                        <SelectContent>
                          {houses.map((house) => (
                            <SelectItem key={house.id} value={house.id}>
                              {house.street + " " + house.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
