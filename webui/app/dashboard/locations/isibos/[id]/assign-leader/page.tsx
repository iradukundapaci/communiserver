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
import { assignIsiboLeader, getIsiboById } from "@/lib/api/isibos";
import { User } from "@/lib/api/leaders";
import { getUsers } from "@/lib/api/users";
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

  const [isibo, setIsibo] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchIsibo = async () => {
      try {
        const isiboData = await getIsiboById(id);
        setIsibo({
          id: isiboData.id,
          name: isiboData.name,
        });
      } catch (error) {
        toast.error("Failed to fetch isibo");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIsibo();
  }, [id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);

    try {
      // Search for users who can be assigned as isibo leaders
      const response = await getUsers(searchQuery, UserRole.ISIBO_LEADER);
      setUsers(response.items || []);

      if (response.items.length === 0) {
        toast.info("No users found matching your search");
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to search users");
      }
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignLeader = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setIsSaving(true);

    try {
      await assignIsiboLeader(id, selectedUserId);
      toast.success("Isibo leader assigned successfully");
      router.push("/dashboard/locations/isibos");
    } catch (error) {
      toast.error("Failed to assign isibo leader");
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
    <PermissionRoute permission={Permission.ASSIGN_ISIBO_LEADERS}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/isibos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Assign Isibo Leader</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign Leader to {isibo.name}</CardTitle>
            <CardDescription>
              Search for a user to assign as the leader of this isibo
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
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
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
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/locations/isibos")}
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
