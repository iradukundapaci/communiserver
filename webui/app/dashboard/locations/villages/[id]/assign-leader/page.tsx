"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateVillageLeaderInput,
  User,
  createVillageLeader,
} from "@/lib/api/leaders";
import { getUsers } from "@/lib/api/users";
import { assignVillageLeader, getVillageById } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { UserRole } from "@/lib/user-roles";
import { ArrowLeft, PlusCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Create Leader Modal Component
function CreateLeaderModal({
  villageId,
  cellId,
  onLeaderCreated,
}: {
  villageId: string;
  cellId: string;
  onLeaderCreated: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateVillageLeaderInput>({
    names: "",
    email: "",
    phone: "",
    cellId: cellId,
    villageId: villageId,
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.names.trim()) {
      toast.error("Leader name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setIsCreating(true);

    try {
      // Create the village leader - this returns a success message, not the user object
      await createVillageLeader(formData);

      // Refresh the users list to get the newly created user
      onLeaderCreated();

      // Get the latest users after refresh
      const response = await getUsers("", UserRole.VILLAGE_LEADER, 1, 100);

      // Find the newly created user by email (most reliable way to find them)
      const newUser = response.items.find(
        (user) => user.email.toLowerCase() === formData.email.toLowerCase()
      );

      // If we found the user, assign them as the village leader
      if (newUser) {
        try {
          await assignVillageLeader(villageId, newUser.id);
          toast.success("Village leader created and assigned successfully");

          // Close the modal and redirect to the villages page
          setIsOpen(false);
          window.location.href = "/dashboard/locations/villages";
        } catch (assignError) {
          toast.error(
            "Leader created but could not be assigned to the village"
          );
          console.error("Assignment error:", assignError);
        }
      } else {
        toast.success("Village leader created successfully");
        toast.info("Please select the new leader from the list to assign them");
        setIsOpen(false);
      }

      // Reset form
      setFormData({
        names: "",
        email: "",
        phone: "",
        cellId: cellId,
        villageId: villageId,
      });
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create village leader");
      }
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Leader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Village Leader</DialogTitle>
          <DialogDescription>
            Enter the details for the new village leader. The system will
            automatically generate a password and send it to the provided email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="names" className="text-right">
                Full Name
              </Label>
              <Input
                id="names"
                name="names"
                value={formData.names}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Leader"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AssignLeaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [village, setVillage] = useState<{
    id: string;
    name: string;
    cellId?: string;
  }>({
    id: "",
    name: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchVillage = async () => {
      try {
        const villageData = await getVillageById(id);
        setVillage({
          id: villageData.id,
          name: villageData.name,
          cellId: villageData.cell?.id,
        });
      } catch (error) {
        toast.error("Failed to fetch village");
        console.error(error);
      }
    };

    const fetchUsers = async () => {
      try {
        // Get all users without role filter
        const response = await getUsers("", "", 1, 10);

        // Filter users with appropriate role on the client side
        const filteredByRole = response.items.filter(
          (user) => user.role === UserRole.CITIZEN
        );

        setUsers(filteredByRole);
        setFilteredUsers(filteredByRole);
        setTotalPages(response.meta.totalPages);
        setCurrentPage(1);
      } catch (error: any) {
        if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch users");
        }
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const initialize = async () => {
      await fetchVillage();
      await fetchUsers();
    };

    initialize();
  }, [id]);

  // Function to refresh users after creating a new leader
  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      // Get all users without role filter
      const response = await getUsers("", "", 1, 10);

      // Filter users with appropriate role on the client side
      const filteredByRole = response.items.filter(
        (user) => user.role === UserRole.CITIZEN
      );

      setUsers(filteredByRole);
      setFilteredUsers(filteredByRole);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(1);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch users");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      if (!searchQuery.trim()) {
        // If search query is empty, show all users
        setFilteredUsers(users);
      } else {
        // Filter users locally based on search query
        const filtered = users.filter(
          (user) =>
            user.names.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);

        if (filtered.length === 0) {
          toast.info("No users found matching your search");
        }
      }
    } catch (error) {
      toast.error("Failed to search users");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to load more users
  const loadMoreUsers = async () => {
    if (currentPage >= totalPages || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const response = await getUsers("", "", nextPage, 10);

      // Filter users with appropriate role
      const filteredByRole = response.items.filter(
        (user) => user.role === UserRole.CITIZEN
      );

      // Append new users to existing users
      setUsers((prevUsers) => [...prevUsers, ...filteredByRole]);

      // Update filtered users if no search query
      if (!searchQuery.trim()) {
        setFilteredUsers((prevFiltered) => [
          ...prevFiltered,
          ...filteredByRole,
        ]);
      } else {
        // Filter new users based on search query
        const newFilteredUsers = filteredByRole.filter(
          (user) =>
            user.names.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers((prevFiltered) => [
          ...prevFiltered,
          ...newFilteredUsers,
        ]);
      }

      setCurrentPage(nextPage);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load more users");
      }
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAssignLeader = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setIsSaving(true);

    try {
      await assignVillageLeader(id, selectedUserId);
      toast.success("Village leader assigned successfully");
      router.push("/dashboard/locations/villages");
    } catch (error) {
      toast.error("Failed to assign village leader");
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
    <PermissionRoute permission={Permission.ASSIGN_VILLAGE_LEADERS}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/villages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Assign Village Leader</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign Leader to {village.name}</CardTitle>
            <CardDescription>
              Search for a user to assign as the leader of this village
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-1/4">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isSearching ? "..." : "Search"}
                  </Button>
                </form>
              </div>

              <div>
                <CreateLeaderModal
                  villageId={village.id}
                  cellId={village.cellId || ""}
                  onLeaderCreated={refreshUsers}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Select
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-muted-foreground"
                      >
                        <p>No users found with the specified criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-4">
                          <input
                            type="radio"
                            name="userId"
                            value={user.id}
                            checked={selectedUserId === user.id}
                            onChange={() => setSelectedUserId(user.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">{user.names}</td>
                        <td className="p-4">{user.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {currentPage < totalPages && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMoreUsers}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    "Load More Users"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/locations/villages")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignLeader}
              disabled={!selectedUserId || isSaving}
            >
              {isSaving ? "Assigning..." : "Assign Leader"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PermissionRoute>
  );
}
