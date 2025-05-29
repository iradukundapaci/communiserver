"use client";

import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers, createCitizen, CreateCitizenInput } from "@/lib/api/users";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { UserRole } from "@/lib/user-roles";
import { RefreshCw, Search, UserPlus } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UsersPDFButton } from "@/components/pdf-report-button";

export default function UsersPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [users, setUsers] = useState<
    Array<{
      id: string;
      names: string;
      email: string;
      phone: string;
      role: string;
      activated: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCitizenData, setNewCitizenData] = useState<CreateCitizenInput>({
    names: "",
    email: "",
    phone: "",
    cellId: "",
    villageId: "",
  });

  const fetchUsers = async (
    query: string = searchQuery,
    role: string = selectedRole,
    page: number = 1,
    resetUsers: boolean = true
  ) => {
    try {
      setIsLoading(true);
      // If role is "ALL_ROLES", pass an empty string to the API
      const roleValue = role === "ALL_ROLES" ? "" : role;
      const response = await getUsers({
        q: query,
        role: roleValue,
        page,
        size: 10,
      });

      if (resetUsers) {
        setUsers(response.items);
      } else {
        setUsers((prevUsers) => [...prevUsers, ...response.items]);
      }

      setTotalPages(response.meta.totalPages);
      setCurrentPage(page);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch users");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers("", "", 1, true);
  }, []);

  useEffect(() => {
    if (user) {
      setNewCitizenData(prev => ({
        ...prev,
        cellId: user.cell?.id || "",
        villageId: user.village?.id || "",
      }));
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchUsers(searchQuery, selectedRole, 1, true);
  };

  const handleRoleChange = (value: string) => {
    // If "ALL_ROLES" is selected, pass an empty string to the API
    const roleValue = value === "ALL_ROLES" ? "" : value;
    setSelectedRole(value);
    fetchUsers(searchQuery, roleValue, 1, true);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchUsers(searchQuery, selectedRole, currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    fetchUsers(searchQuery, selectedRole, 1, true);
  };

  const handleCitizenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCitizenData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCitizen = async () => {
    if (!newCitizenData.names.trim() || !newCitizenData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setIsCreating(true);
      await createCitizen(newCitizenData);
      toast.success("Citizen created successfully");
      setShowCreateDialog(false);
      setNewCitizenData({
        names: "",
        email: "",
        phone: "",
        cellId: user?.cell?.id || "",
        villageId: user?.village?.id || "",
      });
      // Refresh the users list
      handleRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create citizen");
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Admin";
      case UserRole.CELL_LEADER:
        return "Cell Leader";
      case UserRole.VILLAGE_LEADER:
        return "Village Leader";
      case UserRole.ISIBO_LEADER:
        return "Isibo Leader";
      case UserRole.HOUSE_REPRESENTATIVE:
        return "House Representative";
      case UserRole.CITIZEN:
        return "Citizen";
      default:
        return role;
    }
  };

  return (
    <PermissionGate permission={Permission.VIEW_LEADERS}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
          <div className="flex items-center gap-2">
            <PermissionGate permission={Permission.CREATE_CITIZEN}>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Citizen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Citizen</DialogTitle>
                    <DialogDescription>
                      Create a new citizen account. They will receive login credentials via email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="names">Full Name*</Label>
                      <Input
                        id="names"
                        name="names"
                        value={newCitizenData.names}
                        onChange={handleCitizenInputChange}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email*</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newCitizenData.email}
                        onChange={handleCitizenInputChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={newCitizenData.phone}
                        onChange={handleCitizenInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCitizen} disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Citizen"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </PermissionGate>
            <UsersPDFButton data={users} />
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  View and manage all users in the system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-4">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="w-64">
                    <Input
                      placeholder="Search by name or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
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

                <div className="w-[200px]">
                  <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_ROLES">All Roles</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                      <SelectItem value={UserRole.CELL_LEADER}>
                        Cell Leader
                      </SelectItem>
                      <SelectItem value={UserRole.VILLAGE_LEADER}>
                        Village Leader
                      </SelectItem>
                      <SelectItem value={UserRole.ISIBO_LEADER}>
                        Isibo Leader
                      </SelectItem>
                      <SelectItem value={UserRole.HOUSE_REPRESENTATIVE}>
                        House Representative
                      </SelectItem>
                      <SelectItem value={UserRole.CITIZEN}>Citizen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Phone
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Isibo
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-muted-foreground"
                        >
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-4 text-center text-muted-foreground"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="p-4 whitespace-nowrap">
                            {user.names}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {user.phone}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {getRoleDisplayName(user.role)}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {user.isibo ? user.isibo.name : "-"}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.activated
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.activated ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {currentPage < totalPages && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
