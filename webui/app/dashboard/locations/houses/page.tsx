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
import { House, deleteHouse, getHouses } from "@/lib/api/houses";
import { Isibo, getIsibos } from "@/lib/api/isibos";
import { Village, getVillages } from "@/lib/api/villages";
import { Permission } from "@/lib/permissions";
import { Pencil, PlusCircle, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function HousesPage() {
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>([]);
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [selectedIsiboId, setSelectedIsiboId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isIsibosLoading, setIsIsibosLoading] = useState(true);
  const [isVillagesLoading, setIsVillagesLoading] = useState(true);
  const [isCellsLoading, setIsCellsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

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

  useEffect(() => {
    if (selectedIsiboId) {
      fetchHouses();
    }
  }, [selectedIsiboId, currentPage, searchQuery]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);

      // Select the first cell by default
      if (response.items && response.items.length > 0) {
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
      const response = await getVillages(selectedCellId, 1, 100); // Get all villages for the selected cell
      setVillages(response.items || []);

      // Select the first village by default
      if (response.items && response.items.length > 0) {
        setSelectedVillageId(response.items[0].id);
      } else {
        setSelectedVillageId("");
        setSelectedIsiboId("");
        setIsibos([]);
        setHouses([]);
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
      setHouses([]);
    } finally {
      setIsVillagesLoading(false);
    }
  };

  const fetchIsibos = async () => {
    if (!selectedVillageId) return;

    try {
      setIsIsibosLoading(true);
      const response = await getIsibos(selectedVillageId, 1, 100); // Get all isibos for the selected village
      setIsibos(response.items || []);

      // Select the first isibo by default
      if (response.items && response.items.length > 0) {
        setSelectedIsiboId(response.items[0].id);
      } else {
        setSelectedIsiboId("");
        setHouses([]);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch isibos");
      }
      console.error(error);
      setIsibos([]);
      setSelectedIsiboId("");
      setHouses([]);
    } finally {
      setIsIsibosLoading(false);
    }
  };

  const fetchHouses = async () => {
    if (!selectedIsiboId) return;

    try {
      setIsLoading(true);
      const response = await getHouses(
        selectedIsiboId,
        currentPage,
        itemsPerPage,
        searchQuery
      );
      setHouses(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.totalItems || 0);
      setItemsPerPage(response.meta?.itemsPerPage || 10);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch houses");
      }
      console.error(error);
      setHouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchHouses();
  };

  const handleDeleteHouse = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this house?")) {
      try {
        await deleteHouse(id);
        toast.success("House deleted successfully");
        fetchHouses();
      } catch (error: any) {
        if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to delete house");
        }
        console.error(error);
      }
    }
  };

  const handleEditHouse = (id: string) => {
    router.push(`/dashboard/locations/houses/${id}/edit`);
  };

  const handleAssignRepresentative = (id: string) => {
    router.push(`/dashboard/locations/houses/${id}/assign-representative`);
  };

  const handleRemoveRepresentative = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove the representative from this house?"
      )
    ) {
      try {
        // Implementation will be added later
        toast.success("House representative removed successfully");
        fetchHouses();
      } catch (error: any) {
        if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to remove house representative");
        }
        console.error(error);
      }
    }
  };

  const handleCellChange = (cellId: string) => {
    setSelectedCellId(cellId);
    setSelectedVillageId(""); // Reset selected village when cell changes
    setSelectedIsiboId(""); // Reset selected isibo when cell changes
    setIsibos([]); // Clear isibos when cell changes
    setHouses([]); // Clear houses when cell changes
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    setSelectedIsiboId(""); // Reset selected isibo when village changes
    setIsibos([]); // Clear isibos when village changes
    setHouses([]); // Clear houses when village changes
  };

  const handleIsiboChange = (isiboId: string) => {
    setSelectedIsiboId(isiboId);
    setCurrentPage(1); // Reset to first page when changing isibo
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Houses Management</h1>

        <PermissionGate permission={Permission.CREATE_HOUSE}>
          <Button
            onClick={() => router.push("/dashboard/locations/houses/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create House
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Houses</CardTitle>
          <CardDescription>
            Manage houses in your administrative area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/4">
                <label className="text-sm font-medium mb-2 block">
                  Select Cell
                </label>
                <Select
                  value={selectedCellId}
                  onValueChange={handleCellChange}
                  disabled={isCellsLoading}
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

              <div className="w-full sm:w-1/4">
                <label className="text-sm font-medium mb-2 block">
                  Select Village
                </label>
                <Select
                  value={selectedVillageId}
                  onValueChange={handleVillageChange}
                  disabled={isVillagesLoading || villages.length === 0}
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

              <div className="w-full sm:w-1/4">
                <label className="text-sm font-medium mb-2 block">
                  Select Isibo
                </label>
                <Select
                  value={selectedIsiboId}
                  onValueChange={handleIsiboChange}
                  disabled={isIsibosLoading || isibos.length === 0}
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
              </div>

              <div className="w-full sm:w-1/4">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Search
                    </label>
                    <Input
                      placeholder="Search houses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="mt-auto">
                    <Button type="submit">Search</Button>
                  </div>
                </form>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : !selectedIsiboId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select an isibo to view houses
              </div>
            ) : houses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No houses found
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>House Code</TableHead>
                        <TableHead>Street</TableHead>
                        <TableHead>Representative</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {houses.map((house) => (
                        <TableRow key={house.id}>
                          <TableCell className="font-medium">
                            {house.code}
                          </TableCell>
                          <TableCell>{house.street || "N/A"}</TableCell>
                          <TableCell>
                            {house.representative
                              ? house.representative.names
                              : "None"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PermissionGate
                                permission={Permission.UPDATE_HOUSE}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditHouse(house.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </PermissionGate>

                              <PermissionGate
                                permission={
                                  Permission.ASSIGN_HOUSE_REPRESENTATIVES
                                }
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleAssignRepresentative(house.id)
                                  }
                                >
                                  <UserPlus className="h-4 w-4" />
                                  <span className="sr-only">
                                    Assign Representative
                                  </span>
                                </Button>
                              </PermissionGate>

                              <PermissionGate
                                permission={
                                  Permission.DEASSIGN_HOUSE_REPRESENTATIVES
                                }
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveRepresentative(house.id)
                                  }
                                >
                                  <UserMinus className="h-4 w-4" />
                                  <span className="sr-only">
                                    Remove Representative
                                  </span>
                                </Button>
                              </PermissionGate>

                              <PermissionGate
                                permission={Permission.DELETE_HOUSE}
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteHouse(house.id)}
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
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
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
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
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
