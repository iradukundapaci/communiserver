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
import { Input } from "@/components/ui/input";
import { User } from "@/lib/api/leaders";
import { getUsers } from "@/lib/api/users";
import { assignVillageLeader, getVillageById } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { UserRole } from "@/lib/user-roles";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AssignLeaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [village, setVillage] = useState<{ id: string; name: string }>({
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
          (user) => user.role === UserRole.VILLAGE_LEADER
        );

        setUsers(filteredByRole);
        setFilteredUsers(filteredByRole);
        setTotalPages(response.meta.totalPages);
        setCurrentPage(1);
      } catch (error: unknown) {
        if (error && typeof error === "object" && "message" in error) {
          toast.error(error.message as string);
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
        (user) => user.role === UserRole.VILLAGE_LEADER
      );

      // Append new users to existing users
      setUsers((prevUsers) => [...prevUsers, ...filteredByRole]);

      // Update filtered users if no search query
      if (!searchQuery.trim()) {
        setFilteredUsers((prevFiltered) => [
          ...prevFiltered,
          ...response.items,
        ]);
      } else {
        // Filter new users based on search query
        const newFilteredUsers = response.items.filter(
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
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        toast.error(error.message as string);
      } else {
        toast.error("Failed to fetch users");
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
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name or email"
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
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>

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
                        No users found
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
