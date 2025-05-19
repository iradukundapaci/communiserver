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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cell, deleteCell, getCells, removeCellLeader } from "@/lib/api/cells";
import { Permission } from "@/lib/permissions";
import { Pencil, PlusCircle, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CellsPage() {
  const router = useRouter();
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Confirmation dialog state
  const [isRemoveLeaderDialogOpen, setIsRemoveLeaderDialogOpen] =
    useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string>("");

  useEffect(() => {
    fetchCells();
  }, [currentPage, searchQuery]);

  const fetchCells = async () => {
    try {
      setIsLoading(true);
      const response = await getCells(currentPage, itemsPerPage, searchQuery);
      setCells(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.totalItems || 0);
      setItemsPerPage(response.meta?.itemsPerPage || 10);
    } catch (error) {
      toast.error("Failed to fetch cells");
      console.error(error);
      setCells([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchCells();
  };

  const handleDeleteCell = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this cell?")) {
      try {
        await deleteCell(id);
        toast.success("Cell deleted successfully");
        fetchCells();
      } catch (error) {
        toast.error("Failed to delete cell");
        console.error(error);
      }
    }
  };

  const handleEditCell = (id: string) => {
    router.push(`/dashboard/locations/cells/${id}/edit`);
  };

  const handleAssignLeader = (id: string) => {
    router.push(`/dashboard/locations/cells/${id}/assign-leader`);
  };

  const handleRemoveLeader = (id: string) => {
    setSelectedCellId(id);
    setIsRemoveLeaderDialogOpen(true);
  };

  const confirmRemoveLeader = async () => {
    try {
      await removeCellLeader(selectedCellId);
      toast.success("Cell leader removed successfully");
      fetchCells();
      setIsRemoveLeaderDialogOpen(false);
    } catch (error) {
      toast.error("Failed to remove cell leader");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Confirmation Dialog for removing leader */}
      <ConfirmationDialog
        isOpen={isRemoveLeaderDialogOpen}
        onOpenChange={setIsRemoveLeaderDialogOpen}
        onConfirm={confirmRemoveLeader}
        title="Remove Cell Leader"
        description="Are you sure you want to remove the leader from this cell? This action cannot be undone."
        confirmText="Remove Leader"
        confirmVariant="destructive"
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cells Management</h1>

        <PermissionGate permission={Permission.CREATE_CELL}>
          <Button
            onClick={() => router.push("/dashboard/locations/cells/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Cell
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cells</CardTitle>
          <CardDescription>
            Manage cells in your administrative area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 mb-4 w-1/3"
          >
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search cells..."
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

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : cells.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cells found
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
                    {cells.map((cell) => (
                      <TableRow key={cell.id}>
                        <TableCell className="font-medium">
                          {cell.name}
                        </TableCell>
                        <TableCell>
                          {cell.hasLeader ? (
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
                            <PermissionGate permission={Permission.UPDATE_CELL}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCell(cell.id)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </PermissionGate>

                            {!cell.hasLeader ? (
                              <PermissionGate
                                permission={Permission.ASSIGN_CELL_LEADERS}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAssignLeader(cell.id)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                  <span className="sr-only">Assign Leader</span>
                                </Button>
                              </PermissionGate>
                            ) : (
                              <PermissionGate
                                permission={Permission.DEASSIGN_CELL_LEADERS}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveLeader(cell.id)}
                                >
                                  <UserMinus className="h-4 w-4" />
                                  <span className="sr-only">Remove Leader</span>
                                </Button>
                              </PermissionGate>
                            )}

                            <PermissionGate permission={Permission.DELETE_CELL}>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCell(cell.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
