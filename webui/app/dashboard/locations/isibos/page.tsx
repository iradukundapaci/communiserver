"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cell, getCells } from "@/lib/api/cells";
import {
  Isibo,
  deleteIsibo,
  getIsibos,
  removeIsiboLeader,
} from "@/lib/api/isibos";
import { Village, getVillages } from "@/lib/api/villages";
import { useUser } from "@/lib/contexts/user-context";
import { Permission } from "@/lib/permissions";
import { Pencil, PlusCircle, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function IsibosPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVillagesLoading, setIsVillagesLoading] = useState(true);
  const [isCellsLoading, setIsCellsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Confirmation dialog state
  const [isRemoveLeaderDialogOpen, setIsRemoveLeaderDialogOpen] =
    useState(false);
  const [selectedIsiboId, setSelectedIsiboId] = useState<string>("");

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
  }, [selectedVillageId, currentPage, searchQuery]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);

      // If user has a cell assigned, use it directly without fetching all cells
      if (user?.cell?.id) {
        // For all roles with a cell, pre-select their cell
        setSelectedCellId(user.cell.id);

        // If the user is a location leader, we don't need to fetch all cells
        if (
          user.role === "CELL_LEADER" ||
          user.role === "VILLAGE_LEADER" ||
          user.role === "ISIBO_LEADER"
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
        toast.error("Failed to fetch cells");
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
        if (user.role === "VILLAGE_LEADER" || user.role === "ISIBO_LEADER") {
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
        setSelectedVillageId("");
        setSelectedIsiboId("");
        setIsibos([]);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch villages");
      }
      console.error(error);
      setVillages([]);
      setSelectedVillageId("");
      setSelectedIsiboId("");
      setIsibos([]);
    } finally {
      setIsVillagesLoading(false);
    }
  };

  const fetchIsibos = async () => {
    if (!selectedVillageId) return;

    try {
      setIsLoading(true);
      const response = await getIsibos(
        selectedVillageId,
        currentPage,
        itemsPerPage,
        searchQuery
      );
      setIsibos(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
      setItemsPerPage(response.meta?.itemsPerPage || 10);
    } catch (error: any) {
      // Display a more specific error message if available
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch isibos");
      }
      console.error(error);
      setIsibos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchIsibos();
  };

  const handleDeleteIsibo = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this isibo?")) {
      try {
        await deleteIsibo(id);
        toast.success("Isibo deleted successfully");
        fetchIsibos();
      } catch (error) {
        toast.error("Failed to delete isibo");
        console.error(error);
      }
    }
  };

  const handleEditIsibo = (id: string) => {
    router.push(`/dashboard/locations/isibos/${id}/edit`);
  };

  const handleAssignLeader = (id: string) => {
    router.push(`/dashboard/locations/isibos/${id}/assign-leader`);
  };

  const handleRemoveLeader = (id: string) => {
    setSelectedIsiboId(id);
    setIsRemoveLeaderDialogOpen(true);
  };

  const confirmRemoveLeader = async () => {
    try {
      await removeIsiboLeader(selectedIsiboId);
      toast.success("Isibo leader removed successfully");
      fetchIsibos();
      setIsRemoveLeaderDialogOpen(false);
    } catch (error) {
      toast.error("Failed to remove isibo leader");
      console.error(error);
    }
  };

  const handleCellChange = (cellId: string) => {
    setSelectedCellId(cellId);
    setSelectedVillageId(""); // Reset selected village when cell changes
    setIsibos([]); // Clear isibos when cell changes
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    setCurrentPage(1); // Reset to first page when changing village
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Confirmation Dialog for removing leader */}
      <ConfirmationDialog
        isOpen={isRemoveLeaderDialogOpen}
        onOpenChange={setIsRemoveLeaderDialogOpen}
        onConfirm={confirmRemoveLeader}
        title="Remove Isibo Leader"
        description="Are you sure you want to remove the leader from this isibo? This action cannot be undone."
        confirmText="Remove Leader"
        confirmVariant="destructive"
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Isibos Management</h1>

        <PermissionGate permission={Permission.CREATE_ISIBO}>
          <Button
            onClick={() => router.push("/dashboard/locations/isibos/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Isibo
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Isibos</CardTitle>
          <CardDescription>
            Manage isibos in your administrative area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="text-sm font-medium mb-2 block">
                  Select Cell
                </label>
                <Select
                  value={selectedCellId}
                  onValueChange={handleCellChange}
                  disabled={isCellsLoading || Boolean(user?.cell?.id)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cell" />
                  </SelectTrigger>
                  <SelectContent>
                    {cells.map((cell) => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/3">
                <label className="text-sm font-medium mb-2 block">
                  Select Village
                </label>
                <Select
                  value={selectedVillageId}
                  onValueChange={handleVillageChange}
                  disabled={
                    isVillagesLoading ||
                    villages.length === 0 ||
                    Boolean(user?.village?.id)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village.id} value={village.id}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/3">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Search
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search isibos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      <Button type="submit" className="shrink-0">
                        Search
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : !selectedVillageId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a village to view isibos
              </div>
            ) : isibos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No isibos found
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Leader Status</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isibos.map((isibo) => (
                        <TableRow key={isibo.id}>
                          <TableCell className="font-medium">
                            {isibo.name}
                          </TableCell>
                          <TableCell>
                            {isibo.hasLeader ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Has Leader
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                No Leader
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PermissionGate
                                permission={Permission.UPDATE_ISIBO}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditIsibo(isibo.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </PermissionGate>

                              {!isibo.hasLeader ? (
                                <PermissionGate
                                  permission={Permission.ASSIGN_ISIBO_LEADERS}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssignLeader(isibo.id)}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                    <span className="sr-only">
                                      Assign Leader
                                    </span>
                                  </Button>
                                </PermissionGate>
                              ) : (
                                <PermissionGate
                                  permission={Permission.DEASSIGN_ISIBO_LEADERS}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveLeader(isibo.id)}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                    <span className="sr-only">
                                      Remove Leader
                                    </span>
                                  </Button>
                                </PermissionGate>
                              )}

                              <PermissionGate
                                permission={Permission.DELETE_ISIBO}
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteIsibo(isibo.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            size="default"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNumber =
                              currentPage <= 3
                                ? i + 1
                                : currentPage >= totalPages - 2
                                ? totalPages - 4 + i
                                : currentPage - 2 + i;

                            if (pageNumber <= 0 || pageNumber > totalPages)
                              return null;

                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  size="icon"
                                  isActive={currentPage === pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}

                        <PaginationItem>
                          <PaginationNext
                            size="default"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
