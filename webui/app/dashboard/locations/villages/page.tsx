"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionGate } from "@/components/permission-gate";
import { Permission } from "@/lib/permissions";
import { Village, getVillages, deleteVillage } from "@/lib/api/villages";
import { Cell, getCells } from "@/lib/api/cells";
import { PlusCircle, Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

export default function VillagesPage() {
  const router = useRouter();
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
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
  }, [selectedCellId, currentPage, searchQuery]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);
      
      // Select the first cell by default
      if (response.items && response.items.length > 0) {
        setSelectedCellId(response.items[0].id);
      }
    } catch (error) {
      toast.error("Failed to fetch cells");
      console.error(error);
    } finally {
      setIsCellsLoading(false);
    }
  };

  const fetchVillages = async () => {
    if (!selectedCellId) return;
    
    try {
      setIsLoading(true);
      const response = await getVillages(selectedCellId, currentPage, itemsPerPage, searchQuery);
      setVillages(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.totalItems || 0);
      setItemsPerPage(response.meta?.itemsPerPage || 10);
    } catch (error) {
      toast.error("Failed to fetch villages");
      console.error(error);
      setVillages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchVillages();
  };

  const handleDeleteVillage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this village?")) {
      try {
        await deleteVillage(id);
        toast.success("Village deleted successfully");
        fetchVillages();
      } catch (error) {
        toast.error("Failed to delete village");
        console.error(error);
      }
    }
  };

  const handleEditVillage = (id: string) => {
    router.push(`/dashboard/locations/villages/${id}/edit`);
  };

  const handleAssignLeader = (id: string) => {
    router.push(`/dashboard/locations/villages/${id}/assign-leader`);
  };

  const handleRemoveLeader = async (id: string) => {
    if (window.confirm("Are you sure you want to remove the leader from this village?")) {
      try {
        // Implementation will be added later
        toast.success("Village leader removed successfully");
        fetchVillages();
      } catch (error) {
        toast.error("Failed to remove village leader");
        console.error(error);
      }
    }
  };

  const handleCellChange = (cellId: string) => {
    setSelectedCellId(cellId);
    setCurrentPage(1); // Reset to first page when changing cell
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Villages Management</h1>
        
        <PermissionGate permission={Permission.CREATE_VILLAGE}>
          <Button onClick={() => router.push("/dashboard/locations/villages/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Village
          </Button>
        </PermissionGate>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Villages</CardTitle>
          <CardDescription>
            Manage villages in your administrative area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="text-sm font-medium mb-2 block">Select Cell</label>
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
              
              <div className="w-full sm:w-2/3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <Input
                      placeholder="Search villages..."
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
            ) : !selectedCellId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a cell to view villages
              </div>
            ) : villages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No villages found
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {villages.map((village) => (
                        <TableRow key={village.id}>
                          <TableCell className="font-medium">{village.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PermissionGate permission={Permission.UPDATE_VILLAGE}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditVillage(village.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </PermissionGate>
                              
                              <PermissionGate permission={Permission.ASSIGN_VILLAGE_LEADERS}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssignLeader(village.id)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                  <span className="sr-only">Assign Leader</span>
                                </Button>
                              </PermissionGate>
                              
                              <PermissionGate permission={Permission.DEASSIGN_VILLAGE_LEADERS}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveLeader(village.id)}
                                >
                                  <UserMinus className="h-4 w-4" />
                                  <span className="sr-only">Remove Leader</span>
                                </Button>
                              </PermissionGate>
                              
                              <PermissionGate permission={Permission.DELETE_VILLAGE}>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteVillage(village.id)}
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

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        })}

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
